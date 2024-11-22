
export default class LocalImageServerPluginSettings {
	static readonly DEFAULT_PATH: string = 'localhost';
	static readonly DEFAULT_PORT: string = '8181';
	static readonly DEFAULT_CORS: boolean = true;

	path: string = LocalImageServerPluginSettings.DEFAULT_PATH;
	port: string = LocalImageServerPluginSettings.DEFAULT_PORT;
	cors: boolean = LocalImageServerPluginSettings.DEFAULT_CORS;

	url(): string {
		return `http://${this.path}:${this.port}`;
	}

	corsCommand(): string {
		return this.cors ? '--cors' : '';
	}
}
