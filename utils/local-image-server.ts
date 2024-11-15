import { BasePluginModule } from './base-plugin-module';
import { ChildProcess, exec } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { PluginSettings } from 'settings';

export class LocalImageServerPlugin extends BasePluginModule<PluginSettings> {
    private serverProcess: ChildProcess | null = null;

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

        const serverCommand = `http-server ${rootDir} -p 8181`;
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

        this.log(`Server running at http://localhost:8181`, true);
    }

    // Function to stop the local HTTP server and log the process
    private stopLocalServer() {
        this.log(`Trying to stopping server.`, true);
        if (this.serverProcess) {
            this.log(`Stopping server.`, true);
            this.serverProcess.kill()
            this.serverProcess = null;
            this.log("Local HTTP server stopped.");
        }
    }

    onLoad(): void {
        this.stopLocalServer();
        this.startLocalServer(path.join(this.getVaultPath(), 'attachments'));

        this.addCommand(
            "start-local-image-server",
            "Start Local Image Server",
            () => {
                this.startLocalServer(path.join(this.getVaultPath(), 'attachments'));
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
        this.stopLocalServer();
    }

    // This function allows toggling the server via settings
    async toggleLocalServer(enable: boolean) {
        const assetsDir = path.join(this.getVaultPath(), 'attachments');
        if (fs.existsSync(assetsDir)) {
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