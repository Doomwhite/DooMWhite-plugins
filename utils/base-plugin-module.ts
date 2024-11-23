import DooMWhitePlugins from 'main';
import { Editor, EditorSuggest, EventRef, FileSystemAdapter, MarkdownFileInfo, MarkdownPostProcessorContext, MarkdownView, Menu, Notice, Plugin, TAbstractFile } from 'obsidian';
import { LogLevel } from 'settings/settings';

export interface ErrorWrappingSettings {
	enableErrorWrapping: boolean;
}

const logStyles = {
	[LogLevel.Trace]: 'color: #00BFFF; font-weight: normal',
	[LogLevel.Log]: 'color: #32CD32; font-weight: normal',
	[LogLevel.Debug]: 'color: #FFD700; font-weight: normal',
	[LogLevel.Warn]: 'color: #FFA500; font-weight: bold',
	[LogLevel.Error]: 'color: #FF6347; font-weight: bold'
}

export default abstract class BasePluginModule<T extends ErrorWrappingSettings> {
	readonly name!: string;
	readonly plugin: Plugin;

	settings!: T;
	loaded: boolean = false;

	private readonly originalMethods: Map<string, Function> = new Map();
	private registeredContextMenuHandlers: ((...data: unknown[]) => unknown)[] = [];
	private registeredCommands: string[] = [];
	private registers: string[] = []


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
				this.trace(`Initializing plugin module...`, true, 500);

				this.toggleErrorWrapping(this.settings.enableErrorWrapping);

				this.loaded = true;
				this.onLoad();
			}
		} catch (error) {
			this.error('load', error);
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
			this.error('unload', error);
		}
	}

	toggleErrorWrapping(enable: boolean) {
		try {
			this.trace(`Error wrapping ${enable ? 'enabled' : 'disabled'}.`, true, 500);

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
			this.error('toggleErrorWrapping', error);
		}
	}

	getVaultPath() {
		try {
			let adapter = this.plugin.app.vault.adapter;
			if (adapter instanceof FileSystemAdapter) {
				return adapter.getBasePath();
			}
			return '';
		} catch (error) {
			this.error('getVaultPath', error);
			return '';
		}
	}

	private getErrorMessage(error: any, fnName: string) {
		const errorMessage = error instanceof Error ? `${error.message}\n${error.stack}` : String(error);
		return `Error in ${fnName}: ${errorMessage}`;
	}

	toast(message: string, duration?: number) {
		console.log('DooMWhitePlugins.logLevel', DooMWhitePlugins.logLevel);
		// Create a DocumentFragment to allow custom HTML
		const fragment = document.createDocumentFragment();

		// Create a styled span element for the plugin name
		const pluginNameElement = document.createElement('span');
		pluginNameElement.style.color = '#FF6347'; // Change to desired color
		pluginNameElement.style.fontWeight = 'bold'; // Apply bold font style
		pluginNameElement.textContent = `[${this.name}]`;

		// Create another span for the rest of the message
		const messageElement = document.createElement('span');
		messageElement.textContent = ` \n${message}`;

		// Append the plugin name and message elements to the fragment
		fragment.appendChild(pluginNameElement);
		fragment.appendChild(messageElement);

		// Create the Notice with the DocumentFragment
		new Notice(fragment, duration);
	}

	// Trace log function
	trace(message: string, showToast: boolean = false, duration?: number) {
		if (DooMWhitePlugins.logLevel > LogLevel.Trace) return;

		const pluginName = `[${this.name}]`;
		const traceStyle = logStyles[LogLevel.Trace]
		console.trace(`%c${pluginName}`, traceStyle, message);

		if (showToast) {
			this.toast(message, duration);
		}
	}

	// Regular log function
	log(message: string, showToast: boolean = false, duration?: number) {
		if (DooMWhitePlugins.logLevel > LogLevel.Log) return;

		const pluginName = `[${this.name}]`;
		const logStyle = logStyles[LogLevel.Log];
		console.log(`%c${pluginName}`, logStyle, message);

		if (showToast) {
			this.toast(message, duration);
		}
	}

	// Debug log function
	debug(message: string, showToast: boolean = false, duration?: number) {
		if (DooMWhitePlugins.logLevel > LogLevel.Debug) return;

		const pluginName = `[${this.name}]`;
		const debugStyle = logStyles[LogLevel.Debug];
		console.debug(`%c${pluginName}`, debugStyle, message);

		if (showToast) {
			this.toast(message, duration);
		}
	}

	// Error log function
	warn(methodName: string, error: unknown) {
		if (DooMWhitePlugins.logLevel > LogLevel.Warn) return;

		const errorStyle = logStyles[LogLevel.Warn];

		const errorMessage = this.getErrorMessage(error, methodName);
		const pluginName = `[${this.name}]`;
		console.warn(`%c${pluginName}`, errorStyle, errorMessage);  // Error uses console.error
		this.toast(errorMessage, 5000);
	}

	// Error log function
	error(methodName: string, error: unknown) {
		if (DooMWhitePlugins.logLevel > LogLevel.Error) return;

		const errorStyle = logStyles[LogLevel.Error];
		const errorMessage = this.getErrorMessage(error, methodName);
		const pluginName = `[${this.name}]`;
		console.error(`%c${pluginName}`, errorStyle, errorMessage);  // Error uses console.error
		this.toast(errorMessage, 0);
	}

	wrapWithErrorHandling<TArgs extends unknown[], TResult>(
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
	addContexMenuItemToFileMenu(
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
			this.error('addContexMenuItemToFileMenu', error);
		}
	}

	addContexMenuItemToFilesMenu(
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
			this.error('addContexMenuItemToFilesMenu', error);
		}
	}

	// Adds a command to the plugin and stores the command ID for cleanup
	addCommand(
		id: string,
		name: string,
		callback: () => void | Promise<void>
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
			this.error('addCommand', error);
		}
	}

	addEditorCommand(
		id: string,
		name: string,
		callback: (editor: Editor, ctx: MarkdownView | MarkdownFileInfo) => any
	) {
		try {
			// Register the command
			const command = this.plugin.addCommand({
				id,
				name,
				editorCallback: this.wrapWithErrorHandling(callback, id), // Wrap the callback
			});

			// Store the command ID for cleanup
			this.registeredCommands.push(command.id);
		} catch (error) {
			this.error('addCommand', error);
		}
		this.plugin.registerMarkdownCodeBlockProcessor
	}

	registerEditorSuggest(id: string, editorSuggest: EditorSuggest<any>) {
		this.log(`editorSuggest ${editorSuggest}`)

		const register = `registerEditorSuggest-${id}`
		if (this.registers.contains(register)) return;
		this.registers.push(register);

		this.plugin.registerEditorSuggest(editorSuggest)
	}

	registerEvent(id: 'editor-paste', eventRef: EventRef) {
		this.log(`eventRef ${eventRef}`)

		const register = `registerEvent-${id}`
		if (this.registers.contains(register)) return;
		this.registers.push(register);

		this.plugin.registerEvent(eventRef)
	}

	registerMarkdownCodeBlockProcessor(
		language: string,
		handler: (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => Promise<any> | void,
		sortOrder?: number
	) {
		this.log(`language ${language} handler ${handler} sortOrder ${sortOrder}`)

		const register = `registerMarkdownCodeBlockProcessor-${language}`
		if (this.registers.contains(register)) return;
		this.registers.push(register);

		this.plugin.registerMarkdownCodeBlockProcessor(language, handler, sortOrder);
	}


}