import { ErrorWrappingSettings } from 'utils/base-plugin-module';

export default class LocalImageServerPluginSettings implements ErrorWrappingSettings {
	static readonly DEFAULT_ENABLE_ERROR_WRAPPING: boolean = false;
	static readonly DEFAULT_PATH: string = 'localhost';
	static readonly DEFAULT_PORT: string = '8181';
	static readonly DEFAULT_USE_CORS: boolean = true;
	static readonly DEFAULT_USE_HTTPS: boolean = false;

	enableErrorWrapping: boolean = LocalImageServerPluginSettings.DEFAULT_ENABLE_ERROR_WRAPPING;
	path: string = LocalImageServerPluginSettings.DEFAULT_PATH;
	port: string = LocalImageServerPluginSettings.DEFAULT_PORT;
	useCors: boolean = LocalImageServerPluginSettings.DEFAULT_USE_CORS;
	useHttps: boolean = LocalImageServerPluginSettings.DEFAULT_USE_HTTPS;

	url(): string {
		return `${this.useHttps ? 'https' : 'http'}://${this.path}:${this.port}`;
	}

	corsCommand(): string {
		return this.useCors ? '--cors' : '';
	}
}
