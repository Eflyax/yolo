import {Command} from '@tauri-apps/plugin-shell';
import type {Child} from '@tauri-apps/plugin-shell';
import {invoke} from '@tauri-apps/api/core';
import {WebSocketClient} from '../websocket/WebSocketClient';
import type {ITransportClient} from '../ITransportClient';
import {ENetworkCommand} from '@/domain';
import {useActivityLog} from '@/composables/useActivityLog';

const REMOTE_BINARY_PATH = '~/.local/bin/gityak';
const REMOTE_WORKER_VERSION = '1.0.0';

export class SshTunnelClient implements ITransportClient {
	private serverChild: Child | null = null;
	private tunnelChild: Child | null = null;
	private wsClient: WebSocketClient | null = null;
	private localPort = 0;
	private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
	private readonly log = useActivityLog().addLog;

	constructor(
		private readonly host: string,
		private readonly sshPort: number,
		private readonly user: string,
		private readonly keyPath?: string,
	) {}

	async connect(): Promise<void> {
		this.log({type: 'ssh', status: 'info', direction: 'request', message: `Connecting to ${this.user}@${this.host}:${this.sshPort}`});

		try {
			const binaryPath = await invoke<string>('get_server_binary_path');

			await this.provision(binaryPath);

			const remotePort = await this.startServer();

			this.localPort = await invoke<number>('find_free_port');

			await this.createTunnel(remotePort);

			this.wsClient = new WebSocketClient(`ws://127.0.0.1:${this.localPort}`);

			this.startHeartbeat();
		}
		catch (err: unknown) {
			this.log({type: 'ssh', status: 'error', direction: 'response', message: err instanceof Error ? err.message : String(err)});
			throw err;
		}
	}

	private async provision(binaryPath: string): Promise<void> {
		try {
			const remoteVer = await this.runSsh(
				`${REMOTE_BINARY_PATH} --version 2>/dev/null || echo NOT_INSTALLED`,
			);

			if (remoteVer.trim() === REMOTE_WORKER_VERSION) {
				this.log({type: 'ssh', status: 'info', direction: 'response', message: `Remote worker up-to-date (v${REMOTE_WORKER_VERSION})`});
				return;
			}

			this.log({type: 'ssh', status: 'info', direction: 'request', message: 'Uploading remote worker binary…'});
			await this.runSsh(`mkdir -p ~/.local/bin`);
			await this.runScp(binaryPath, REMOTE_BINARY_PATH);
			await this.runSsh(`chmod +x ${REMOTE_BINARY_PATH}`);
			this.log({type: 'ssh', status: 'success', direction: 'response', message: 'Remote worker provisioned'});
		}
		catch (err: unknown) {
			this.log({type: 'ssh', status: 'error', direction: 'response', message: err instanceof Error ? err.message : String(err)});
			throw err;
		}
	}

	private startServer(): Promise<number> {
		this.log({type: 'ssh', status: 'info', direction: 'request', message: `Starting remote worker on ${this.host}`});

		return new Promise((resolve, reject) => {
			const cmd = Command.create('ssh', this.buildSshArgs(
				`ONESHOT=1 PORT=0 ${REMOTE_BINARY_PATH}`,
			));

			cmd.stdout.addListener('data', (line: string) => {
				const m = /SERVER_READY\|PORT:(\d+)/.exec(line);
				if (m) {
					const port = Number(m[1]);
					this.log({type: 'ssh', status: 'success', direction: 'response', message: `Remote worker ready on port ${port}`});
					resolve(port);
				}
			});

			cmd.on('close', ({code}: {code: number | null}) => {
				if (code !== 0 && code !== null) {
					const err = new Error(`Remote worker exited with code ${code}`);
					this.log({type: 'ssh', status: 'error', direction: 'response', message: err.message});
					reject(err);
				}
			});

			cmd.spawn()
				.then(child => { this.serverChild = child; })
				.catch(err => {
					this.log({type: 'ssh', status: 'error', direction: 'response', message: err instanceof Error ? err.message : String(err)});
					reject(err);
				});

			setTimeout(() => {
				const err = new Error('Server startup timeout (15s)');
				this.log({type: 'ssh', status: 'error', direction: 'response', message: err.message});
				reject(err);
			}, 15_000);
		});
	}

	private createTunnel(remotePort: number): Promise<void> {
		this.log({type: 'ssh', status: 'info', direction: 'request', message: `Creating SSH tunnel :${this.localPort} → :${remotePort}`});

		return new Promise((resolve, reject) => {
			const args = [
				'-p', String(this.sshPort),
				'-o', 'BatchMode=yes',
				'-o', 'StrictHostKeyChecking=accept-new',
				'-o', 'ExitOnForwardFailure=yes',
				...(this.keyPath ? ['-i', this.keyPath] : []),
				'-L', `${this.localPort}:127.0.0.1:${remotePort}`,
				'-N',
				`${this.user}@${this.host}`,
			];

			Command.create('ssh', args).spawn()
				.then(child => {
					this.tunnelChild = child;
					setTimeout(() => {
						this.log({type: 'ssh', status: 'success', direction: 'response', message: 'SSH tunnel established'});
						resolve();
					}, 800);
				})
				.catch(err => {
					this.log({type: 'ssh', status: 'error', direction: 'response', message: err instanceof Error ? err.message : String(err)});
					reject(err);
				});
		});
	}

	private startHeartbeat(): void {
		this.heartbeatTimer = setInterval(() => {
			this.wsClient?.call(ENetworkCommand.Heartbeat, {}).catch(() => {});
		}, 10_000);
	}

	private buildSshArgs(remoteCmd: string): string[] {
		return [
			'-p', String(this.sshPort),
			'-o', 'BatchMode=yes',
			'-o', 'StrictHostKeyChecking=accept-new',
			'-o', 'SendEnv=NONE',
			...(this.keyPath ? ['-i', this.keyPath] : []),
			`${this.user}@${this.host}`,
			remoteCmd,
		];
	}

	private async runSsh(cmd: string): Promise<string> {
		const r = await Command.create('ssh', this.buildSshArgs(cmd)).execute();
		if (r.code !== 0) throw new Error(r.stderr || `SSH command failed: ${cmd}`);
		return r.stdout;
	}

	private async runScp(localPath: string, remotePath: string): Promise<void> {
		const args = [
			'-P', String(this.sshPort),
			'-o', 'BatchMode=yes',
			'-o', 'StrictHostKeyChecking=accept-new',
			...(this.keyPath ? ['-i', this.keyPath] : []),
			localPath,
			`${this.user}@${this.host}:${remotePath}`,
		];
		const r = await Command.create('scp', args).execute();
		if (r.code !== 0) throw new Error(r.stderr || 'SCP failed');
	}

	call(command: string, payload: Record<string, unknown>): Promise<unknown> {
		if (!this.wsClient) return Promise.reject(new Error('Not connected'));
		return this.wsClient.call(command, payload);
	}

	close(): void {
		this.log({type: 'ssh', status: 'info', direction: 'request', message: `Disconnecting from ${this.host}`});
		if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
		this.wsClient?.close();
		this.tunnelChild?.kill();
		this.serverChild?.kill();
		this.heartbeatTimer = null;
		this.wsClient = null;
		this.tunnelChild = null;
		this.serverChild = null;
	}
}
