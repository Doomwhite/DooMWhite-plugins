import crypto from 'crypto';
import fs from 'fs';
import https from 'https';
import Mustache from 'mustache';
import {
	Editor,
	MarkdownView,
	Notice,
	parseYaml,
	Plugin
} from 'obsidian';
import path from 'path';
import BasePluginModule from 'utils/base-plugin-module';
import { ArgumentNullException } from 'utils/exceptions';
import ImageDownloader from 'utils/image-downloader';
import {
	EmbedInfo,
	HTMLTemplate,
	MarkdownTemplate,
	REGEX,
	SPINNER,
} from './constants';
import { ExEditor, Selected } from './exEditor';
import { createParser, getParsersNames } from './parser';
import { EmbedLinksPluginSettings } from './settings';
import EmbedSuggest from './suggest';
import { ImageExtractor } from 'utils/get-image-url';

interface PasteInfo {
	trigger: boolean;
	text: string;
}

export default class EmbedLinksPlugin extends BasePluginModule<EmbedLinksPluginSettings> {

	readonly exEditor = new ExEditor(this);
	readonly imageExtractor = new ImageExtractor(this);

	pasteInfo: PasteInfo;

	constructor(plugin: Plugin) {
		super('EmbedLinksPlugin', plugin)
	}

	async getText(editor: Editor): Promise<Selected> {
		let selected = this.exEditor.getSelectedText(editor, this.settings.debug);
		let cursor = editor.getCursor();
		if (!selected.can) {
			selected.text = await navigator.clipboard.readText();
			selected.boundary = {
				start: cursor,
				end: cursor,
			};
		}
		return selected;
	}

	onLoad(): void {
		this.pasteInfo = {
			trigger: false,
			text: '',
		};

		this.registerEvent(
			'editor-paste',
			this.plugin.app.workspace.on(
				'editor-paste',
				(
					evt: ClipboardEvent,
					editor: Editor,
					markdownView: MarkdownView,
				) => {
					this.pasteInfo = {
						trigger: false,
						text: '',
					};
					if (!evt.clipboardData) throw new ArgumentNullException(nameof(evt.clipboardData));

					const text = evt.clipboardData.getData('text/plain');
					if (EmbedLinksPlugin.isUrl(text)) {
						this.pasteInfo.trigger = true;
						this.pasteInfo.text = text;
					}
				},
			),
		);

		this.registerEditorSuggest('embed-suggest', new EmbedSuggest(this.plugin.app, this));

		this.addEditorCommand(
			'embed-link',
			'Embed link',
			async (editor: Editor) => {
				let selected = await this.getText(editor);
				if (!this.checkUrlValid(selected)) {
					return;
				}
				await this.embedUrl(editor, selected, [
					this.settings.primary,
					this.settings.backup,
				]);
			},
		);
		getParsersNames().forEach((name) => {
			this.addEditorCommand(
				`embed-link-${name}`,
				`Embed link with ${name}`,
				async (editor: Editor) => {
					let selected = await this.getText(editor);
					if (!this.checkUrlValid(selected)) {
						return;
					}
					await this.embedUrl(editor, selected, [name]);
				},
			);
		});

		this.registerMarkdownCodeBlockProcessor('embed', (source, el, ctx) => {
			const info = parseYaml(source.trim()) as EmbedInfo;
			this.trace(`info: ${info}`)
			let image: string;

			if (info.image.startsWith('http://') || info.image.startsWith('https://') || info.image.startsWith('file:///')) {
				const protocolRemoved = info.image.replace(/^(https?:\/\/|file:\/\/\/)/, '');
				const imageName = protocolRemoved.split('/').slice(1).join('/');
				image = this.imageExtractor.getObisidianImageUrl(imageName);
			} else {
				image = info.image;
			}

			const html = HTMLTemplate.replace(/{{title}}/gm, info.title)
				.replace(/{{{image}}}/gm, image)
				.replace(/{{description}}/gm, info.description)
				.replace(/{{{url}}}/gm, info.url);
			let parser = new DOMParser();
			var doc = parser.parseFromString(html, 'text/html');
			this.info(`${doc}`);
			el.replaceWith(doc.body.firstChild as ChildNode);
		});
	}

	onUnload(): void { }

	checkUrlValid(selected: Selected): boolean {
		if (
			!(
				selected.text.length > 0 &&
				EmbedLinksPlugin.isUrl(selected.text)
			)
		) {
			new Notice('Need a link to convert to embed.');
			return false;
		}
		return true;
	}

	async embedUrl(
		editor: Editor,
		selected: Selected,
		selectedParsers: string[],
		inPlace: boolean = this.settings.inPlace,
	) {
		let url = selected.text;
		// Replace selection if in place
		if (selected.can && inPlace) {
			editor.replaceRange(
				'',
				selected.boundary.start,
				selected.boundary.end,
			);
		}

		// Put a dummy preview here first
		const cursor = editor.getCursor();
		const lineText = editor.getLine(cursor.line);
		let template = MarkdownTemplate;
		let newLine = false;
		if (lineText.length > 0) {
			newLine = true;
		}
		if (newLine) {
			editor.setCursor({ line: cursor.line + 1, ch: 0 });
		} else {
			editor.setCursor({ line: cursor.line, ch: lineText.length });
		}
		const startCursor = editor.getCursor();
		const dummyEmbed =
			Mustache.render(template, {
				title: 'Fetching',
				image: SPINNER,
				description: `Fetching ${url}`,
				url: url,
			}) + '\n';
		editor.replaceSelection(dummyEmbed);
		const endCursor = editor.getCursor();

		// Fetch image and handle local storage
		let idx = 0;
		while (idx < selectedParsers.length) {
			const selectedParser = selectedParsers[idx];
			this.debug(`Link Embed: parser, ${selectedParser}`);
			const parser = createParser(selectedParser, this);
			parser.debug = this.settings.debug;
			try {
				const data = await parser.parse(url);
				this.debug(`Link Embed: meta data, ${data}`);

				// Download the image to the vault

				try {
					const imageUrl = data.image;
					const finalPath = `${this.getVaultPath()}/attachments/`; // Final desired path

					const tempPath = path.join(`${this.getVaultPath()}/attachments/`, 'temp_image'); // Temporary path (this can be anything)
					const imageDownloader = new ImageDownloader(tempPath, this)
					const imageName = await imageDownloader.downloadImage(imageUrl, finalPath);

					// const localUrl = `https://localhost:8181/${imageName}`;
					const localUrl = `file:///attachments/${imageName}`;

					// Prepare the escaped data
					const escapedData = {
						title: data.title.replace(/"/g, '\\"'),
						image: localUrl,  // Use local URL for image
						description: data.description.replace(/"/g, '\\"'),
						url: data.url,
					};

					// Render the final embed
					const embed = Mustache.render(template, escapedData) + '\n';
					if (this.settings.delay > 0) {
						await new Promise((f) =>
							setTimeout(f, this.settings.delay),
						);
					}

					// Before replacing, check whether the dummy preview is deleted or modified
					const dummy = editor.getRange(startCursor, endCursor);
					if (dummy == dummyEmbed) {
						editor.replaceRange(embed, startCursor, endCursor);
					} else {
						new Notice(
							`Dummy preview has been deleted or modified. Replacing is cancelled.`,
						);
					}
					break;
				} catch (error) {
					this.error('Link Embed: error', error);
					idx += 1;
					if (idx === selectedParsers.length) {
						this.warn('embedUrl', 'Link Embed: Failed to fetch data');
					}
				}
			} catch (error) {
				this.error('embedUrl', error);
				return;
			}

		}
	}

	/**
	 * Generates a SHA-512 hash of a file's contents.
	 *
	 * @param filePath - The path to the file.
	 * @returns A Promise that resolves to the SHA-512 hash string.
	 */
	async computeFileHash(filePath: string): Promise<string> {
		return new Promise((resolve, reject) => {
			const hash = crypto.createHash('sha512');
			const stream = fs.createReadStream(filePath);

			stream.on('data', (chunk) => hash.update(chunk));
			stream.on('end', () => resolve(hash.digest('hex')));
			stream.on('error', (err) => reject(err));
		});
	}

	// Helper function to download the image and save it to the vault attachments folder
	async downloadImage(url: string, tempPath: string, finalPath: string): Promise<string> {
		this.info(`tempPath ${tempPath}`);

		return new Promise((resolve, reject) => {
			https.get(url, (response) => {
				this.info(`response ${response}`);
				// Get the file extension from the Content-Type header (e.g., image/jpeg or image/png)
				const contentType = response.headers['content-type'];
				const extension = contentType ? contentType.split('/')[1] : 'jpg';  // Default to jpg if not found
				this.info(`extension ${extension}`);

				// Create a temporary file stream to download the image
				const tempFile = fs.createWriteStream(tempPath);

				response.pipe(tempFile);
				tempFile.on('finish', async () => {
					tempFile.close(async () => {
						this.info(`Image downloaded to temporary path: ${tempPath}`);

						// Generate the final file name using the current timestamp and the file extension
						const fileHash = await this.computeFileHash(tempPath);
						const finalFileName = `${fileHash}.${extension}`;
						this.info(`finalFileName ${finalFileName}`);

						// Define the final path with the generated name
						const finalFilePath = path.join(finalPath, finalFileName);
						this.info(`finalFilePath ${finalFilePath}`);

						// Ensure that the final directory exists
						fs.mkdir(path.dirname(finalFilePath), { recursive: true }, (err) => {
							if (err) {
								this.error('downloadImage', `Error creating directory: ${err}`);
								reject(err);
							} else {
								// Check if image exists locally, if not, rename and save it
								fs.copyFile(tempPath, finalFilePath, (err) => {
									if (err) {
										this.error('downloadImage', `Error renaming the file: ${err}`);
										reject(err);
									} else {
										this.info(`Image renamed and saved to: ${finalFilePath}`);
										resolve(finalFileName); // Return just the filename
									}
								});
							}
						});
					});
				});
			}).on('error', (err) => {
				fs.unlink(tempPath, () => { }); // delete the file if there's an error
				reject(err);
			});
		});
	}

	public static isUrl(text: string): boolean {
		const urlRegex = new RegExp(REGEX.URL, 'g');
		return urlRegex.test(text);
	}

}