import { FileSystemAdapter, Menu, Notice, Plugin, TAbstractFile } from 'obsidian';

export interface ErrorWrappingSettings {
	enableErrorWrapping: boolean;
}

export default abstract class BasePluginModule<T extends ErrorWrappingSettings> {
	protected readonly name!: string;
	protected settings!: T;
	protected loaded: boolean = false;
	protected readonly plugin: Plugin;

	private readonly originalMethods: Map<string, Function> = new Map();
	private registeredContextMenuHandlers: ((...data: unknown[]) => unknown)[] = [];
	private registeredCommands: string[] = [];

	protected constructor(name: string, plugin: Plugin) {
		this.name = name;
		this.plugin = plugin;
	}

	abstract onLoad(): void;
	abstract onUnload(): void;

	load(settings: T) {
		try {
			this.settings = settings;

			if (!this.loaded) {
				this.log(`[${this.name}] Initializing plugin module...`, true, 500);

				this.toggleErrorWrapping(this.settings.enableErrorWrapping);

				this.loaded = true;
				this.onLoad();
			}
		} catch (error) {
			this.logError('load', error);
		}
	}

	unload() {
		try {
			if (this.loaded) {
				this.loaded = false;
				this.onUnload();

				// Remove all registered context menu handlers
				for (const handler of this.registeredContextMenuHandlers) {
					this.plugin.app.workspace.off('file-menu', handler);
				}
				this.registeredContextMenuHandlers = [];

				// Remove all registered commands
				for (const commandId of this.registeredCommands) {
					this.plugin.removeCommand(commandId);
				}
				this.registeredCommands = [];
			}
		} catch (error) {
			this.logError('unload', error);
		}
	}

	protected toggleErrorWrapping(enable: boolean) {
		try {
			this.log(`Error wrapping ${enable ? 'enabled' : 'disabled'}.`, true, 500);

			const methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(this));

			if (enable) {
				// Apply error wrapping
				for (const methodName of methodNames) {
					if (methodName === 'constructor' || typeof (this as any)[methodName] !== 'function') {
						continue;
					}

					// Store the original method if not already stored
					if (!this.originalMethods.has(methodName)) {
						this.originalMethods.set(methodName, (this as any)[methodName]);
					}

					const originalMethod = this.originalMethods.get(methodName)!;
					(this as any)[methodName] = this.wrapWithErrorHandling(
						originalMethod.bind(this),
						methodName
					);
				}
			} else {
				// Remove error wrapping by restoring original methods
				for (const methodName of methodNames) {
					if (this.originalMethods.has(methodName)) {
						(this as any)[methodName] = this.originalMethods.get(methodName)!;
					}
				}
			}
		} catch (error) {
			this.logError('toggleErrorWrapping', error);
		}
	}

	protected getVaultPath() {
		try {
			let adapter = this.plugin.app.vault.adapter;
			if (adapter instanceof FileSystemAdapter) {
				return adapter.getBasePath();
			}
			return '';
		} catch (error) {
			this.logError('getVaultPath', error);
			return '';
		}
	}

	private getErrorMessage(error: any, fnName: string) {
		const errorMessage = error instanceof Error ? `${error.message}\n${error.stack}` : String(error);
		return `Error in ${fnName}: ${errorMessage}`;
	}

	protected toast(message: string, duration?: number) {
		new Notice(message, duration);
	}

	protected log(message: string, showToast: boolean = false, duration?: number) {
		console.log(`${this.name} \n${message}`);
		if (showToast) {
			this.toast(`${this.name}: \n${message}`, duration)
		}
	}

	protected logError(methodName: string, error: unknown) {
		const errorMessage = this.getErrorMessage(error, methodName);
		this.log(errorMessage, true, 0);
		console.error(error);
	}

	protected wrapWithErrorHandling<TArgs extends unknown[], TResult>(
		fn: (...args: TArgs) => TResult | Promise<TResult>,
		fnName: string
	): (...args: TArgs) => TResult | Promise<TResult> {
		return (...args: TArgs) => {
			if (this.settings.enableErrorWrapping) {
				try {
					const result = fn(...args);

					// Handle async functions (i.e., Promises)
					if (result instanceof Promise) {
						return result.catch((error) => {
							const errorMessage = this.getErrorMessage(error, fnName);
							this.toast(errorMessage, 0);
							throw error; // Rethrow to propagate the error
						});
					}

					// Handle sync functions
					return result;
				} catch (error) {
					const errorMessage = this.getErrorMessage(error, fnName);
					this.toast(errorMessage, 0);
					throw error; // Rethrow to propagate the error
				}
			}

			return fn(...args); // If wrapping is disabled, just call the function directly
		};
	}

	// Adds a context menu item with specific conditions and actions
	protected addContexMenuItemToFileMenu(
		condition: (file: TAbstractFile) => boolean,
		title: string,
		icon: string,
		action: (file: TAbstractFile) => void
	) {
		try {
			const handler = (menu: Menu, file: TAbstractFile) => {
				// Ensure the plugin is loaded and the condition is met
				if (!this.loaded || !condition(file)) return;

				menu.addItem((item) => {
					item.setTitle(title)
						.setIcon(icon)
						.onClick(() => action(file));
				});
			};

			// Register the event and store the handler reference
			this.plugin.app.workspace.on('file-menu', handler);
			this.registeredContextMenuHandlers.push(handler);
		} catch (error) {
			this.logError('addContexMenuItemToFileMenu', error);
		}
	}

	protected addContexMenuItemToFilesMenu(
		condition: (files: TAbstractFile[]) => boolean,
		title: string,
		icon: string,
		action: (files: TAbstractFile[]) => void
	) {
		try {
			const handler = (menu: Menu, files: TAbstractFile[]) => {
				// Ensure the plugin is loaded and the condition is met
				if (!this.loaded || !condition(files)) return;

				menu.addItem((item) => {
					item.setTitle(title)
						.setIcon(icon)
						.onClick(() => action(files));
				});
			};

			// Register the event and store the handler reference
			this.plugin.app.workspace.on('files-menu', handler);
			this.registeredContextMenuHandlers.push(handler);
		} catch (error) {
			this.logError('addContexMenuItemToFilesMenu', error);
		}
	}

	// Adds a command to the plugin and stores the command ID for cleanup
	protected addCommand(
		id: string,
		name: string,
		callback: () => void
	) {
		try {
			// Register the command
			const command = this.plugin.addCommand({
				id,
				name,
				callback: this.wrapWithErrorHandling(callback, id), // Wrap the callback
			});

			// Store the command ID for cleanup
			this.registeredCommands.push(command.id);
		} catch (error) {
			this.logError('addCommand', error);
		}
	}
}