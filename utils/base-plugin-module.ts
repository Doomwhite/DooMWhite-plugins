import { FileSystemAdapter, Menu, Notice, Plugin, TAbstractFile } from 'obsidian';

export abstract class BasePluginModule<T> {
	protected settings!: T;
	protected loaded: boolean = false;
	protected readonly plugin: Plugin;
	private registeredContextMenuHandlers: ((...data: unknown[]) => unknown)[] = [];
	private registeredCommands: string[] = [];

	constructor(plugin: Plugin) {
		this.plugin = plugin;
	}

	abstract onLoad(): void;
	abstract onUnload(): void;

	getVaultPath() {
		let adapter = this.plugin.app.vault.adapter;
		if (adapter instanceof FileSystemAdapter) {
			return adapter.getBasePath();
		}
		return '';
	}

	log(message: string, showToast: boolean = false) {
		console.log(message)
		if (showToast) {
			new Notice(message);
		}
	}

	load(settings: T) {
		this.settings = settings;

		if (!this.loaded) {
			this.loaded = true;
			this.onLoad();
		}
	}

	unload() {
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
	}

	// Adds a context menu item with specific conditions and actions
	protected addContexMenuItemToFileMenu(
		condition: (file: TAbstractFile) => boolean,
		title: string,
		icon: string,
		action: (file: TAbstractFile) => void
	) {
		const handler = (menu: Menu, file: TAbstractFile) => {
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
	}

	protected addContexMenuItemToFilesMenu(
		condition: (file: TAbstractFile[]) => boolean,
		title: string,
		icon: string,
		action: (file: TAbstractFile[]) => void
	) {
		const handler = (menu: Menu, files: TAbstractFile[]) => {
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
	}

	// Adds a command to the plugin and stores the command ID for cleanup
	protected addCommand(
		id: string,
		name: string,
		callback: () => void
	) {
		// Register the command
		const command = this.plugin.addCommand({
			id,
			name,
			callback
		});

		// Store the command ID for cleanup
		this.registeredCommands.push(command.id);
	}
}
