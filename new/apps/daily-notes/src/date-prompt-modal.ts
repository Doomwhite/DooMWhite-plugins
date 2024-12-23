import { Modal, App, Notice } from 'obsidian';

export class DatePromptModal extends Modal {
	private onSubmit: (inputDate: string | null) => void;
	private static lastDate: string | null = null;

	constructor(app: App, onSubmit: (inputDate: string | null) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;

		// Title
		contentEl.createEl('h2', { text: 'Enter Date for Daily Note' });

		// Input field
		const input = contentEl.createEl('input', { type: 'date' });
		if (DatePromptModal.lastDate) {
			input.value = DatePromptModal.lastDate;
		} else {
			input.value = new Date().toISOString().split('T')[0]; // Default to today
		}

		// Submit button
		const submitButton = contentEl.createEl('button', { text: 'Create' });
		submitButton.onclick = () => {
			const inputDate = input.value;
			if (inputDate) {
				this.close();
				DatePromptModal.lastDate = inputDate;
				this.onSubmit(inputDate);
			} else {
				new Notice('Please enter a valid date.');
			}
		};

		// Cancel button
		const cancelButton = contentEl.createEl('button', {
			text: 'Cancel',
			cls: 'mod-cta',
		});
		cancelButton.onclick = () => {
			this.close();
			this.onSubmit(null);
		};
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
