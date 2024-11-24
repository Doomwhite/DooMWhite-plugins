import { Plugin } from 'obsidian';
import { TFile, TFolder } from 'obsidian';
import BasePluginModule from '../../utils/base-plugin-module';
import FolderNotesPluginSettings from './settings.ts';

export default class FolderNotesPlugin extends BasePluginModule<FolderNotesPluginSettings> {

	constructor(plugin: Plugin) {
		super('FolderNotesPlugin', plugin)
	}

	onLoad(): void {
		this.addContexMenuItemToFileMenu(
			(file) => file instanceof TFolder, // Condition: only for folders
			"Create waypoint node to folder and subfolders", // Title
			"link", // Icon
			(file) => this.addFoldersNotesAndSubFoldersNotes([file as TFolder]) // Action
		);
		this.addContexMenuItemToFileMenu(
			(file) => file instanceof TFolder, // Condition: only for folders
			"Create waypoint node to folder", // Title
			"link", // Icon
			(file) => this.addFolderNote(file as TFolder) // Action
		);
	}

	onUnload(): void {
	}

	private async addFoldersNotesAndSubFoldersNotes(folders: TFolder[]) {
		this.trace(`folders, ${folders}`)
		await this.addFoldersNotes(folders);
		for (const folder of folders) {
			const subFolders = folder.children.filter((item) => item instanceof TFolder) as TFolder[];
			if (subFolders.length) await this.addFoldersNotesAndSubFoldersNotes(subFolders);
		}
	}

	private async addFoldersNotes(folders: TFolder[]) {
		this.trace(`folders, ${folders}`)
		for (const folder of folders) await this.addFolderNote(folder);
	}

	private async addFolderNote(folder: TFolder) {
		this.trace(`folder, ${folder}`)
		const folderNoteName = folder.name + '.md';
		const folderNotePath = `${folder.path}/${folderNoteName}`;
		const waypointMagicString = '%% Waypoint %%';

		const existingNote = folder.children.find(
			(file) => file instanceof TFile && file.basename === folder.name
		) as TFile | undefined;

		if (existingNote) {
			await this.modifyFolderNote(existingNote, waypointMagicString);
		} else {
			await this.plugin.app.vault.create(folderNotePath, waypointMagicString);
			this.info(`Created the folder note '${folderNoteName}'.`, true, 3500);
		}
	}

	private async modifyFolderNote(folderNote: TFile, waypointMagicString: string) {
		const content = await this.plugin.app.vault.read(folderNote);
		if (!content.includes('%% Begin Waypoint %%')) {
			const updatedContent = `${waypointMagicString}\n${content}`;
			await this.plugin.app.vault.modify(folderNote, updatedContent);
			this.info(`Updated the content of '${folderNote.basename}'`, true, 3500);
		}
	}

}
