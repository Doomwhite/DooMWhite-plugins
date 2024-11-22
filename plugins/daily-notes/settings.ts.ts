export default class DailyNotesPluginSettings {
	constructor(init?: Partial<DailyNotesPluginSettings>) {
		if (init) Object.assign(this, init);
	}
}
