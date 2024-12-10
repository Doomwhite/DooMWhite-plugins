import { Plugin } from "obsidian";
import { createServer, Server } from "http";
import BasePluginModule from "../../utils/base-plugin-module";
import LocalProxyServerPluginSettings from "./settings.ts";
import httpProxy from "http-proxy";

export default class LocalProxyServerPlugin extends BasePluginModule<LocalProxyServerPluginSettings> {
	private proxyServer: Server | null = null;

	constructor(plugin: Plugin) {
		super("LocalProxyServerPlugin", plugin);
	}

	// Function to start the proxy server
	private startProxyServer(targetUrl: string) {
		if (this.proxyServer) {
			this.info("Proxy server is already running", true);
			return;
		}

		// Create a proxy server instance
		const proxy = httpProxy.createProxyServer({
			target: targetUrl,
			changeOrigin: true,
		});

		// Create an HTTP server to handle proxy requests
		this.proxyServer = createServer((req, res) => {
			proxy.web(req, res, {}, (error) => {
				this.error("startProxyServer", `Proxy error: ${error.message}`);
				res.writeHead(500);
				res.end("Proxy server encountered an error.");
			});
		});

		// Start listening on the configured port
		this.proxyServer.listen(this.settings.port, this.settings.path, () => {
			this.info(`Proxy server running at ${this.settings.url()}`, true);
		});

		// Handle proxy server events
		this.proxyServer.on("error", (error) => {
			this.error("Proxy server error", error.message);
		});
	}

	// Function to stop the proxy server
	private stopProxyServer() {
		if (this.proxyServer) {
			this.info("Stopping proxy server...", true);
			this.proxyServer.close(() => {
				this.info("Proxy server stopped.");
			});
			this.proxyServer = null;
		} else {
			this.info("No proxy server is running.", true);
		}
	}

	onLoad(): void {
		this.info("onLoad");
		this.stopProxyServer();

		const targetUrl = this.settings.targetUrl || "http://localhost:3000"; // Default target URL
		this.startProxyServer(targetUrl);

		this.addCommand("start-proxy-server", "Start Proxy Server", () => {
			this.startProxyServer(targetUrl);
		});

		this.addCommand("stop-proxy-server", "Stop Proxy Server", () => {
			this.stopProxyServer();
		});
	}

	onUnload(): void {
		this.info("onUnload");
		this.stopProxyServer();
	}

	// Toggle proxy server via settings
	async toggleProxyServer(enable: boolean) {
		if (enable) {
			const targetUrl =
				this.settings.targetUrl || "http://localhost:3000"; // Default target URL
			this.startProxyServer(targetUrl);
		} else {
			this.stopProxyServer();
		}
	}
}
