import { Plugin } from 'obsidian';
import { TFolder } from 'obsidian';
import BasePluginModule from 'utils/base-plugin-module';
import DailyNotesPluginSettings from './settings.ts';

export default class DailyNotesPlugin extends BasePluginModule<DailyNotesPluginSettings> {

	constructor(plugin: Plugin) {
		super('DailyNotesPlugin', plugin)
	}

	onLoad(): void {
		this.addContexMenuItemToFileMenu(
			(file) => file instanceof TFolder, // Condition: only for folders
			"Create daily note in this folder", // Title
			"calendar", // Icon
			(file) => this.createDailyNoteInFolder(file as TFolder) // Action
		);
	}

	onUnload(): void {
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
			this.log(`Created daily note at '${dailyNotePath}'.`, true, 3500);
		} else {
			this.log("Daily note already exists in this folder.", true);
		}
	}

}
