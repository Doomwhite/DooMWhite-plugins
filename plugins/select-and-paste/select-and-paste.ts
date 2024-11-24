import crypto from 'crypto';
import { Editor, normalizePath, Plugin, TFile } from "obsidian";
import { join } from 'path';
import BasePluginModule from 'utils/base-plugin-module';
import { computeFileHash } from 'utils/compute-file-hash.js';
import SelectAndPastePluginSettings from './settings.ts';

export default class SelectAndPastePlugin extends BasePluginModule<SelectAndPastePluginSettings> {

	constructor(plugin: Plugin) {
		super('SelectAndPastePlugin', plugin);
	}

	async onLoad() {
		// Add a context menu option for the editor
		this.registerEvent(
			'select-and-paste',
			this.plugin.app.workspace.on("editor-menu", (menu, editor, view) => {
				menu.addItem((item) => {
					item
						.setTitle("Select and Paste Files")
						.setIcon("paste")
						.onClick(() => this.selectFilesAndPaste(editor));
				});
			})
		);
	}

	onUnload(): void { }

	/**
	 * Opens a file picker dialog, copies selected files to the vault, and pastes their links into the editor.
	 */
	private async selectFilesAndPaste(editor: Editor) {
		const input = document.createElement("input");
		input.type = "file";
		input.multiple = true;
		input.accept = "*";

		input.addEventListener("change", async (event: Event) => {
			const files = (event.target as HTMLInputElement).files;

			if (!files || files.length === 0) {
				this.debug("No files selected.");
				return;
			}

			const pastedLinks: string[] = [];
			for (const file of Array.from(files)) {
				try {
					const vaultPath = await this.copyFileToVault(file);
					if (vaultPath) {
						const link = this.generateMarkdownLink(vaultPath);
						pastedLinks.push(link);
					}
				} catch (error) {
					this.error(`Error copying file "${file.name}":`, error);
				}
			}

			if (pastedLinks.length > 0) {
				editor.replaceSelection(pastedLinks.join("\n") + "\n");
				this.debug(`Pasted ${pastedLinks.length} file(s) into the editor.`);
			}
		});

		input.click();
	}

	/**
	 * Copies a file to the vault's attachments folder and returns its vault-relative path.
	 */
	private async copyFileToVault(file: File): Promise<string | null> {
		const fileName = file.name;
		this.debug(['fileName', fileName])
		const destinationPath = normalizePath(join('attachments', fileName));
		this.debug(['destinationPath', destinationPath])
		const [copy, uniquePath] = await this.getUniquePath(destinationPath, file);
		this.debug(['[copy, uniquePath]', [copy, uniquePath]])

		if (!copy) {
			this.debug(`File "${fileName}" already exists and matches the content.`);
			return uniquePath;
		}

		// Read file data and create the file in the vault
		const fileData = await file.arrayBuffer();
		await this.plugin.app.vault.adapter.writeBinary(uniquePath, new Uint8Array(fileData));

		return uniquePath;
	}

	/**
	 * Ensures a unique path by appending a number if a file with the same name exists.
	 * If the content matches an existing file, returns null to skip copying.
	 */
	private async getUniquePath(filePath: string, file: File): Promise<[copy: boolean, uniquePath: string]> {
		let uniquePath = filePath;

		let existingFilePath;
		while (existingFilePath = this.plugin.app.vault.getAbstractFileByPath(join(this.getVaultPath(), uniquePath))) {
			// Compute hash of the existing file
			const existingFileHash = await computeFileHash(existingFilePath.path);
			this.trace(['existingFileHash', existingFileHash])

			// Convert ArrayBuffer to Buffer
			const fileArrayBuffer = await file.arrayBuffer();
			this.trace(['fileArrayBuffer', fileArrayBuffer])
			const fileBuffer = Buffer.from(fileArrayBuffer);
			this.trace(['fileBuffer', fileBuffer])

			const fileHash = crypto.createHash('sha512').update(fileBuffer).digest('hex');
			this.trace(['fileHash', fileHash])

			if (existingFileHash === fileHash) {
				this.debug(`File "${file.name}" already exists with the same content. Skipping copy.`);
				return [false, uniquePath]; // Skip copying as the file content is identical
			}

			// Generate a new unique path
			const extensionIndex = filePath.lastIndexOf(".");
			const baseName = extensionIndex !== -1 ? filePath.slice(0, extensionIndex) : filePath;
			const extension = extensionIndex !== -1 ? filePath.slice(extensionIndex) : "";
			uniquePath = `${baseName} (${Date.now()})${extension}`;
		}

		return [true, uniquePath];
	}

	/**
	 * Generates a Markdown link for a file in the vault.
	 */
	private generateMarkdownLink(vaultPath: string): string {
		const relativePath = this.plugin.app.metadataCache.fileToLinktext(
			this.plugin.app.vault.getAbstractFileByPath(vaultPath) as TFile,
			"/"
		);
		return `![[${relativePath}]]`;
	}
}