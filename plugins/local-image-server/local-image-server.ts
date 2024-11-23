import { ChildProcess, exec, execSync } from 'child_process';
import { existsSync } from 'fs';
import { Plugin } from 'obsidian';
import { join } from 'path';
import BasePluginModule from '../../utils/base-plugin-module';
import LocalImageServerPluginSettings from './settings.ts';

export default class LocalImageServerPlugin extends BasePluginModule<LocalImageServerPluginSettings> {
	private serverProcess: ChildProcess | null = null;

	constructor(plugin: Plugin) {
		super('LocalImageServerPlugin', plugin)
	}

	// Function to check if 'http-server' is installed
	private checkAndInstallHttpServer(callback: () => void) {
		exec('npm list -g http-server', (error, stdout, stderr) => {
			if (error || stderr) {
				this.log("http-server not found, installing...", true);
				exec('npm install -g http-server', (installError, installStdout, installStderr) => {
					if (installError || installStderr) {
						this.log(`Failed to install http-server: ${installStderr}, ${installError}`, true);
					} else {
						this.log("http-server installed successfully!", true);
					}
					callback();
				});
			} else {
				this.log("http-server already installed.", true);
				callback();
			}
		});
	}

	// Function to start the local HTTP server with better logging
	private startLocalServer(rootDir: string) {
		if (this.serverProcess) {
			this.log('Server is already running', true);
			return;
		}

		const serverArgs = []
		serverArgs.push(rootDir)
		serverArgs.push(`-a ${this.settings.path}`)
		serverArgs.push(`-p ${this.settings.port}`)

		if (this.settings.useHttps) {
			serverArgs.push('--ssl')

			const certificatePath = join(this.getVaultPath(), 'certificates', 'localhost.pem');
			if (!existsSync(certificatePath)) throw new Error(`SSL certificate file not found at ${certificatePath}`);
			serverArgs.push(`--cert ${certificatePath}`)

			const keyPath = join(this.getVaultPath(), 'certificates', 'localhost-key.pem');
			if (!existsSync(certificatePath)) throw new Error(`SSL key file not found at ${keyPath}`);
			serverArgs.push(`--key ${keyPath}`)
		}

		if (this.settings.useCors) {
			serverArgs.push('--cors')
		}

		const serverCommand = `http-server ${serverArgs.join(' ')}`;
		this.serverProcess = exec(serverCommand, (error, stdout, stderr) => {
			if (error) {
				this.log(`Error starting server: ${stderr}`, true);
			}
			if (stdout) {
				this.log(`Server stdout: ${stdout}`, true);
			}
			if (stderr) {
				this.log(`Server stderr: ${stderr}`, true);
			}
		});

		// Log the server output continuously
		this.serverProcess.stdout?.on('data', (data: string) => {
			this.log(`Server stdout: ${data}`, true);
		});

		this.serverProcess.stderr?.on('data', (data: string) => {
			this.log(`Server stderr: ${data}`, true);
		});

		this.serverProcess.on('close', (code: number) => {
			this.log(`Server process exited with code ${code}`, true);
		});

		this.log(`Server running at ${this.settings.url()}`, true);
	}

	// Function to stop the local HTTP server and log the process
	private stopLocalServer() {
		this.log(`Trying to stopping server.`, true);
		this.killServerProcess();
		if (this.serverProcess) {
			this.log(`Stopping server.`, true);
			this.serverProcess.kill()
			this.serverProcess = null;
			this.log("Local HTTP server stopped.");
		}
	}


	private killServerProcess() {
		// Ensure this runs only on Windows
		if (process.platform !== 'win32') {
			this.log(`Task kill logic is only supported on Windows.`, true, 700);
			return;
		}

		this.log(`Attempting to find and kill any running http-server processes associated with the vault`, true, 700);

		// Use WMIC to find processes with `http-server` and the vault path in the command line
		const vaultPath = this.getVaultPath().replace(/\\/g, '\\\\'); // Escape backslashes for WMIC
		const findCommand = `wmic process where "CommandLine like '%http-server%' and CommandLine like '%${vaultPath}%'" get ProcessId /FORMAT:LIST`;

		try {
			// Run the WMIC command synchronously
			const stdout = execSync(findCommand).toString();

			// Extract PIDs from WMIC output
			const pids = stdout
				.split('\n')
				.filter((line) => line.includes('ProcessId='))
				.map((line) => line.match(/ProcessId=(\d+)/)?.[1]) // Fixed regex
				.filter(Boolean);

			if (!pids || pids.length === 0) {
				this.log('No http-server process associated with the vault found.', true, 700);
				return;
			}

			this.log(`Found http-server process(es): ${pids.join(', ')}`, true, 700);

			// Kill each process synchronously
			pids.forEach((pid) => {
				try {
					const killCommand = `taskkill /PID ${pid} /F`;

					this.log(`Executing kill command for PID ${pid}: ${killCommand}`, true, 700);

					// Run the kill command synchronously
					execSync(killCommand);

					this.log(`Successfully killed http-server process with PID ${pid}`, true, 700);
				} catch (killError) {
					this.log(`Failed to kill process ${pid}: ${killError.message}`, true, 700);
				}
			});
		} catch (error) {
			this.logError('killServerProcess', `Error finding or killing http-server process: ${error.message}`);
		}
	}

	onLoad(): void {
		this.log('onLoad');
		this.stopLocalServer();
		this.startLocalServer(join(this.getVaultPath(), 'attachments'));

		this.addCommand(
			"start-local-image-server",
			"Start Local Image Server",
			() => {
				this.startLocalServer(join(this.getVaultPath(), 'attachments'));
			}
		);

		this.addCommand(
			"stop-local-image-server",
			"Stop Local Image Server",
			() => {
				this.stopLocalServer();
			}
		);
	}

	onUnload(): void {
		this.log('onUnload');
		this.stopLocalServer();
	}

	// This function allows toggling the server via settings
	async toggleLocalServer(enable: boolean) {
		const assetsDir = join(this.getVaultPath(), 'attachments');
		if (existsSync(assetsDir)) {
			this.checkAndInstallHttpServer(() => {
				if (enable) {
					this.startLocalServer(assetsDir);
				} else {
					this.stopLocalServer();
				}
			});
		} else {
			this.log("Assets directory 'attachments' not found.", true);
		}
	}

}
