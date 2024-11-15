import { Notice, TFile, TFolder } from 'obsidian';
import { BasePluginModule } from './base-plugin-module';
import { PluginSettings } from 'settings';

export class FolderNotesPlugin extends BasePluginModule<PluginSettings> {

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
		await this.addFoldersNotes(folders);
		for (const folder of folders) {
			const subFolders = folder.children.filter((item) => item instanceof TFolder) as TFolder[];
			if (subFolders.length) await this.addFoldersNotesAndSubFoldersNotes(subFolders);
		}
	}

	private async addFoldersNotes(folders: TFolder[]) {
		for (const folder of folders) await this.addFolderNote(folder);
	}

	private async addFolderNote(folder: TFolder) {
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
			new Notice(`Created the folder note '${folderNoteName}'.`, 3500);
		}
	}

	private async modifyFolderNote(folderNote: TFile, waypointMagicString: string) {
		const content = await this.plugin.app.vault.read(folderNote);
		if (!content.includes('%% Begin Waypoint %%')) {
			const updatedContent = `${waypointMagicString}\n${content}`;
			await this.plugin.app.vault.modify(folderNote, updatedContent);
			new Notice(`Updated the content of '${folderNote.basename}'`, 3500);
		}
	}

}
