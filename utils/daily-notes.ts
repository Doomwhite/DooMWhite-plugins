import { PluginModule } from 'main';
import { Menu, Notice, Plugin, TFolder, TAbstractFile } from 'obsidian';

export class DailyNotesPlugin implements PluginModule {

	loaded: boolean = false;

	private readonly plugin: Plugin

	constructor(plugin: Plugin) {
		this.plugin = plugin;
	}

	load() {
		this.loaded = true;
		this.plugin.app.workspace.on('file-menu', (menu: Menu, file: TAbstractFile) => {
			if (!this.loaded) return;

			if (file instanceof TFolder) {
				menu.addItem((item) => {
					item.setTitle("Create daily note in this folder")
						.setIcon("calendar")
						.onClick(() => this.createDailyNoteInFolder(file));
				});
			}
		});
	}

	unload() {
		this.loaded = false;
	}

	async createDailyNoteInFolder(folder: TFolder) {
		const today = new Date().toISOString().split("T")[0];
		const fileName = `${today}.md`;
		const dailyNotePath = `${folder.path}/${fileName}`;
		const content = `---
related_notes:
  - "[[Daily notes/${today}]]"
---`;

		const existingFile = this.plugin.app.vault.getAbstractFileByPath(dailyNotePath);
		if (!existingFile) {
			await this.plugin.app.vault.create(dailyNotePath, content);
			new Notice(`Created daily note at '${dailyNotePath}'.`, 3500);
		} else {
			new Notice("Daily note already exists in this folder.");
		}
	}

}
