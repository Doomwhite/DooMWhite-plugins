import { Plugin } from 'obsidian';
import { App, ButtonComponent, DropdownComponent, Modal, Notice, TAbstractFile, TextComponent, TFile, TFolder } from 'obsidian';
import BasePluginModule from '../../utils/base-plugin-module';
import RelatedNotesPluginSettings from './settings';

export default class RelatedNotesPlugin extends BasePluginModule<RelatedNotesPluginSettings> {

	constructor(plugin: Plugin) {
		super('RelatedNotesPlugin', plugin)
	}

	onLoad(): void {
		this.addCommand(
			"add-file-property-to-folder-and-subfolders",
			"Add File Property to Folder and Subfolders",
			async () => {
				// Prompt user to select a folder
				const folder = await this.selectFolder();
				if (folder) {
					// Add the file property to each file in the selected folder
					new PropertyModal(
						this.plugin.app,
						'related_notes',
						`[[${folder.path}]]`,
						async (propertyName, propertyValue) => {
							await this.addFilePropertyToFolderChildren(folder, propertyName, propertyValue);
						},
					).open();
				}
			}
		);
		this.addCommand(
			"add-file-property-to-folder",
			"Add File Property to Folder",
			async () => {
				// Prompt user to select a folder
				const folder = await this.selectFolder();
				if (folder) {
					// Add the file property to each file in the selected folder
					new PropertyModal(
						this.plugin.app,
						'related_notes',
						`[[${folder.path}]]`,
						async (propertyName, propertyValue) => {
							const files = this.getChildrenMarkdownFiles(folder);
							await this.addFilePropertyToFiles(files, folder, propertyName, propertyValue);
						}
					).open();
				}
			}
		);
		this.addContexMenuItemToFileMenu(
			(file) => file instanceof TFolder,
			'Add File Property to Folder and Subfolders',
			'link',
			(file) => {
				// When clicked, run the same logic as your command
				new PropertyModal(
					this.plugin.app,
					'related_notes',
					file.path,
					async (propertyName, propertyValue) => {
						await this.addFilePropertyToFolderChildren(file as TFolder, propertyName, propertyValue);
					},
				).open();
			}
		)
		this.addContexMenuItemToFileMenu(
			(file) => file instanceof TFolder,
			'Add File Property to Folder',
			'link',
			(file) => {
				// When clicked, run the same logic as your command
				new PropertyModal(
					this.plugin.app,
					'related_notes',
					file.path,
					async (propertyName, propertyValue) => {
						await this.addFilePropertyToFolderChildren(file as TFolder, propertyName, propertyValue);
					},
				).open();
			}
		)
		this.addContexMenuItemToFileMenu(
			(file) => file instanceof TFile && file.extension === "md",
			'Add File Property to File',
			'link',
			(file) => {
				// When clicked, run the same logic as your command
				new PropertyModal(
					this.plugin.app,
					'related_notes',
					file.parent ? file.parent.path : '',
					async (propertyName, propertyValue) => {
						// const files = this.getChildrenMarkdownFiles(folder);
						await this.addFilePropertyToFiles([file as TFile], file.parent, propertyName, propertyValue);
					}
				).open();
			}
		)
		this.addContexMenuItemToFilesMenu(
			(files) => true,
			'Add File Property to files/folders',
			'link',
			(files) => {
				// When clicked, run the same logic as your command
				new PropertyModal(
					this.plugin.app,
					'related_notes',
					``,
					async (propertyName, propertyValue) => {
						await this.addFilePropertyToFolders(files, propertyName, propertyValue);
					},
				).open();
			}
		)
	}

	onUnload(): void {
	}

	async selectFolder(): Promise<TFolder | null> {
		return new Promise((resolve) => {
			const modal = new FolderSelectionModal(this.plugin.app, (selectedFolder) => {
				resolve(selectedFolder);
				modal.close();
			});
			modal.open();
		});
	}

	async addFilePropertyToFolders(folders: TAbstractFile[], propertyName?: string, selectedLink?: string) {
		const files = this.getMarkdownFiles(folders);
		for (const file of files) {
			this.addFilePropertyToFiles([file], file.parent, propertyName, selectedLink)
		}

		const subfolders = folders.filter((item) => item instanceof TFolder) as TFolder[];
		for (const subfolder of subfolders) {
			await this.addFilePropertyToFolderChildren(subfolder, propertyName, selectedLink); // Recursive call on each subfolder
		}
	}

	async addFilePropertyToFolderChildren(folder: TFolder, propertyName?: string, selectedLink?: string) {
		const files = this.getChildrenMarkdownFiles(folder);
		this.addFilePropertyToFiles(files, folder, propertyName, selectedLink)

		const subfolders = folder.children.filter((item) => item instanceof TFolder) as TFolder[];
		for (const subfolder of subfolders) {
			await this.addFilePropertyToFolderChildren(subfolder, propertyName, selectedLink); // Recursive call on each subfolder
		}
	}

	async addFilePropertyToFiles(
		files: TFile[],
		folder: TFolder | null,
		propertyName?: string,
		selectedLink?: string
	) {
		if (!selectedLink && !folder) {
			this.info(`It's not possible to use the folder name of a file with no parent`)
			return;
		}

		// Generate the link based on the folder's path
		if (!propertyName) propertyName = 'related_notes';
		const propertyLink: string = this.getPropertyLink(selectedLink, folder!);

		for (const file of files) {
			let fileContent = await this.plugin.app.vault.read(file);

			// Step 1: Find the YAML front matter (between ---)
			//const firstLine = fileContent.split('\n', 1)[0];
			const firstLine = fileContent.split('\n', 1)[0];
			const yamlStartIndex = firstLine.indexOf('---');
			const yamlEndIndex = fileContent.indexOf('---', yamlStartIndex + 3);

			if (yamlStartIndex === -1 || yamlEndIndex === -1) {
				// Case 1: No YAML front matter found
				await this.emptyPropertiesContext(
					propertyName,
					propertyLink,
					fileContent,
					file
				);
			} else {
				// Case 2: YAML front matter found
				await this.hasPropertiesContext(
					propertyName,
					fileContent,
					yamlStartIndex,
					yamlEndIndex,
					propertyLink,
					file
				);
			}
		}

		this.info(`File property successfully added to all files in the folder (${folder!.path})!`, true, 3000)
	}

	private getChildrenMarkdownFiles(folder: TFolder): TFile[] {
		return this.getMarkdownFiles(folder.children);
	}

	private getMarkdownFiles(files: TAbstractFile[]): TFile[] {
		return files.filter((item) => item instanceof TFile && item.extension === "md") as TFile[];
	}

	private getPropertyLink(selectedLink: string | undefined, folder: TFolder): string {
		if (selectedLink) {
			return selectedLink;
		} else {
			return `[[${folder.path}]]`;
		}
	}

	private async emptyPropertiesContext(
		propertyName: string,
		propertyLink: string,
		fileContent: string,
		file: TFile
	) {
		// Add YAML front matter with property at the top of the file
		const newYAML = `---\n${propertyName}:\n  - \"${propertyLink}\"\n---\n`;
		const updatedContent = newYAML + fileContent;
		await this.plugin.app.vault.modify(file, updatedContent);
		this.info(`Added '${propertyName}' to file: ${file.path}`);
	}

	private async hasPropertiesContext(
		propertyName: string,
		fileContent: string,
		yamlStartIndex: number,
		yamlEndIndex: number,
		propertyLink: string,
		file: TFile
	) {
		const yamlContent = fileContent.slice(yamlStartIndex + 3, yamlEndIndex).trim();

		// Check if 'propertyName' exists in the YAML
		const propertyNamePattern = new RegExp(`${propertyName}:`);
		if (propertyNamePattern.test(yamlContent)) {
			await this.hasProperty(
				propertyName,
				propertyLink,
				fileContent,
				yamlStartIndex,
				yamlContent,
				yamlEndIndex,
				file
			);
		} else {
			await this.noProperty(
				propertyName,
				propertyLink,
				fileContent,
				yamlStartIndex,
				yamlContent,
				yamlEndIndex,
				file
			);
		}
	}

	private async hasProperty(
		propertyName: string,
		propertyLink: string,
		fileContent: string,
		yamlStartIndex: number,
		yamlContent: string,
		yamlEndIndex: number,
		file: TFile
	) {
		this.debug('Checking if property contains the link');

		// Search for property line
		const propertyIndex = yamlContent.indexOf(`${propertyName}:`);
		if (propertyIndex === -1) {
			this.error('hasProperty', `'${propertyName}' not found`)
			return;
		}

		// Case 1: property is found, now check the format
		this.debug(`${propertyName} property found(`);

		// Check if it's in array format or comma-separated format
		const arrayStartIndex = yamlContent.indexOf('-', propertyIndex);
		if (arrayStartIndex !== -1) {
			this.debug('property is in array format');

			const preArraySlice = yamlContent.slice(propertyIndex, arrayStartIndex);

			// Find the last newline in this slice and count spaces after it
			const lastNewlineIndex = preArraySlice.lastIndexOf('\n');
			const indentationCount = arrayStartIndex - (propertyIndex + lastNewlineIndex + 1);
			this.debug(`'indentationCount:', ${indentationCount}`);

			const indentation = ' '.repeat(indentationCount)
			this.debug(`'indentation:', ${indentation}`);

			// Array format: add the new link as a new item in the list
			const newYAML = indentation + `- \"${propertyLink}\"`;
			this.debug(`'newYAML', ${newYAML}`);

			const nextPropertyPattern = /\n\w+:/;
			const nextPropertyMatch = yamlContent.slice(arrayStartIndex).search(nextPropertyPattern);
			const propertyEndIndex = nextPropertyMatch === -1
				? yamlContent.length
				: arrayStartIndex + nextPropertyMatch;

			// Isolate the property array section
			const propertySlice = yamlContent.slice(arrayStartIndex, propertyEndIndex);

			// Check if the new link already exists in this section
			if (propertySlice.includes(newYAML.trim())) return;

			this.trace('fileContent, ' + fileContent);
			this.trace('yamlContent, ' + yamlContent);

			this.trace('fileContent.slice(0, yamlStartIndex + 3), ' + fileContent.slice(0, yamlStartIndex + 3));
			this.trace('yamlContent.slice(0, propertyIndex), ' + yamlContent.slice(0, propertyIndex));
			this.trace('yamlContent.slice(0, propertyIndex + 14), ' + yamlContent.slice(0, propertyIndex + 14));
			this.trace('newYAML, ' + newYAML);
			this.trace('yamlContent.slice(arrayStartIndex), ' + yamlContent.slice(arrayStartIndex));
			this.trace('fileContent.slice(yamlEndIndex), ' + fileContent.slice(yamlEndIndex));

			const updatedContent = fileContent.slice(0, yamlStartIndex + 3)
				+ '\n'
				+ yamlContent.slice(0, propertyIndex + `${propertyName}:`.length)
				+ '\n'
				+ newYAML
				+ '\n'
				+ indentation
				+ yamlContent.slice(arrayStartIndex)
				+ '\n'
				+ fileContent.slice(yamlEndIndex);
			this.trace('updatedContent, ' + updatedContent);

			await this.plugin.app.vault.modify(file, updatedContent);
		} else {
			this.trace('property is in comma-separated format');
			const commaSeparatedIndex = yamlContent.indexOf(`${propertyName}:`, propertyIndex);
			// Comma-separated format: add the new link at the end of the line
		}
	}

	private async noProperty(
		propertyName: string,
		propertyLink: string,
		fileContent: string,
		yamlStartIndex: number,
		yamlContent: string,
		yamlEndIndex: number,
		file: TFile
	) {
		this.warn('noProperty', 'Property not found');

		// Case 3: `propertyName` is not found in the existing YAML, so add it at the start
		const newYAML = `${propertyName}:\n  - \"${propertyLink}\"`;

		// Remove existing --- markers and insert the new YAML
		const updatedContent = fileContent.slice(0, yamlStartIndex + 3)
			+ '\n'
			+ newYAML
			+ '\n'
			+ yamlContent
			+ '\n'
			+ fileContent.slice(yamlEndIndex);
		await this.plugin.app.vault.modify(file, updatedContent);
		this.warn('noProperty', `Added '${propertyName}' to existing YAML front matter in file: ${file.path}`);
	}

}

class FolderSelectionModal extends Modal {
	private onSelect: (folder: TFolder | null) => void;

	constructor(app: App, onSelect: (folder: TFolder | null) => void) {
		super(app);
		this.onSelect = onSelect;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.createEl("h2", { text: "Select a Folder" });

		// Create a search input for filtering folders
		const searchInput = contentEl.createEl("input", {
			type: "text",
			placeholder: "Search for a folder...",
		});

		// Style the search input
		searchInput.style.width = "100%";
		searchInput.style.padding = "8px";
		searchInput.style.marginBottom = "10px";

		const list = contentEl.createEl("ul");
		list.style.minHeight = "200px";  // Set a max height to add a scroll if needed
		list.style.maxHeight = "200px";  // Set a max height to add a scroll if needed
		list.style.overflowY = "auto";   // Enable vertical scrolling
		list.style.listStyleType = "none";
		list.style.paddingLeft = "0";

		// Get all folders and render the list
		const folders = this.app.vault.getAllLoadedFiles()
			.filter((file) => file instanceof TFolder) as TFolder[];

		// Function to update the displayed list based on the search input
		const updateList = (filterText: string) => {
			list.empty();
			folders
				.filter(folder => folder.path.toLowerCase().includes(filterText.toLowerCase()))
				.forEach(folder => {
					const li = list.createEl("li");

					// Style each list item
					li.style.cursor = "pointer";
					li.style.padding = "5px";
					li.style.marginBottom = "5px";
					li.style.textDecoration = "underline";
					li.style.color = "#007acc";  // Optional: Change color to make it look more like a link

					li.textContent = folder.path;
					li.addEventListener("click", () => {
						this.onSelect(folder);
						this.close();
					});
				});
		};

		// Initial list render without filtering
		updateList("");

		// Add input event listener for real-time search filtering
		searchInput.addEventListener("input", (event) => {
			const filterText = (event.target as HTMLInputElement).value;
			updateList(filterText);
		});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class PropertyModal extends Modal {
	private readonly onSubmit: (propertyName: string, propertyValue: string) => void;
	private readonly defaultName: string;
	private readonly defaultValue: string;
	private allNotes: TFile[];

	constructor(
		app: App,
		defaultName: string,
		defaultValue: string,
		onSubmit: (propertyName: string, propertyValue: string) => void
	) {
		super(app);
		this.defaultName = defaultName;
		this.defaultValue = defaultValue;
		this.onSubmit = onSubmit;
		this.allNotes = this.app.vault.getFiles().filter((file: TFile) => file.extension === "md");
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		// Title of the modal
		contentEl.createEl('h2', { text: 'Add Property to Files' });

		// Create input for property name
		const propertyNameInput = new TextComponent(contentEl);
		propertyNameInput.setPlaceholder('Enter property name');
		propertyNameInput.inputEl.style.width = '100%';
		propertyNameInput.inputEl.style.marginBottom = '10px';
		propertyNameInput.setValue(this.defaultName);

		// Create search field to filter dropdown options
		const searchInput = new TextComponent(contentEl);
		searchInput.setPlaceholder('Search for a note');
		searchInput.inputEl.style.width = '100%';
		searchInput.inputEl.style.marginBottom = '10px';

		// Create dropdown for property value
		const propertyValueDropdown = new DropdownComponent(contentEl);
		propertyValueDropdown.selectEl.style.width = '100%';
		propertyValueDropdown.selectEl.style.marginBottom = '20px';

		// Function to populate dropdown options based on search term
		const updateDropdownOptions = (searchTerm: string) => {
			propertyValueDropdown.selectEl.empty(); // Clear current options

			this.allNotes
				.filter((note) => note.path.toLowerCase().includes(searchTerm.toLowerCase()))
				.forEach((note) => {
					propertyValueDropdown.addOption(note.path, note.path);
				});

			// Select the default value if it matches the search
			if (this.defaultValue && this.defaultValue.toLowerCase().includes(searchTerm.toLowerCase())) {
				propertyValueDropdown.setValue(this.defaultValue);
			}
		};

		// Populate dropdown with all notes initially
		updateDropdownOptions('');

		// Filter dropdown options based on search input
		searchInput.onChange((value) => {
			updateDropdownOptions(value);
		});

		// Submit button
		const submitButton = new ButtonComponent(contentEl);
		submitButton.setButtonText('Add Property');
		submitButton.onClick(async () => {
			const propertyName = propertyNameInput.getValue();
			const propertyValue = propertyValueDropdown.getValue();
			if (!propertyName || !propertyName.trim().length) {
				new Notice('The property name is required!');
				return;
			}
			if (!propertyValue || !propertyValue.trim().length) {
				new Notice('The property value is required!');
				return;
			}

			this.onSubmit(propertyName, `[[${propertyValue.replace('.md', '')}]]`);
			this.close();
		});

		const useFolderNameButton = new ButtonComponent(contentEl);
		useFolderNameButton.setButtonText('Use folder name as property');
		useFolderNameButton.onClick(() => {
			const propertyName = propertyNameInput.getValue();
			this.onSubmit(propertyName, '');
			this.close();
		});

		// Create cancel button
		const cancelButton = new ButtonComponent(contentEl);
		cancelButton.setButtonText('Cancel');
		cancelButton.onClick(() => {
			this.close();
		});

		// Add a little space between the buttons
		submitButton.buttonEl.style.marginTop = '10px';
		submitButton.buttonEl.style.marginRight = '10px';
		useFolderNameButton.buttonEl.style.marginRight = '10px';
		cancelButton.buttonEl.style.marginTop = '10px';
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
