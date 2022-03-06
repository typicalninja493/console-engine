// used by render loop to render the scene
import logUpdate from 'log-update';
import readline from "readline";
import { EventEmitter } from 'events';
import { EngineOptions, defaultSize, defaultOptions, Pixel, state } from './utils/constants';
import sync, { cancelSync, Process } from 'framesync';
import KeyBindManager from './keyBinds';

class GameEngine extends EventEmitter {
	name: string;
	screen: Pixel[][];
	renderer: { renders: number; render: Process | null; fps: number; startTime: number; state: string; idleTimeout: NodeJS.Timeout | null   };
	options: EngineOptions;
	readline: readline.Interface | null;
	console_: logUpdate.LogUpdate;
	keyBindManager: KeyBindManager;
	constructor(gameName: string, options: EngineOptions = {}) {
		super();
		this.name = gameName || `powered by console-engine`;
		this.screen = [[]];
		this.options = Object.assign({}, options, defaultOptions);
		this.renderer = {
			renders: 0,
			render: null,
			fps: 0,
			startTime: 0,
			state: state.idle,
			idleTimeout: null
		}
		this.readline = null;
		this.console_ = logUpdate.create(process.stdout, {
			showCursor: false,
		});
		this.keyBindManager = new KeyBindManager(this);
		this._createEmptyScreen(defaultSize.x, defaultSize.y);
		// set the title
		process.stdout.write(
			String.fromCharCode(27) + "]0;" + this.name + String.fromCharCode(7)
		);
	}
	/**
	 * Manually render a frame to the console
	 * @returns 
	 */
	render() {
		const newScreen = this.screen.map(row => row.map(cell => cell.value).join('')).join('\n');
		this.console_(newScreen);
		return true;
	}
	debug(...args: string[]) {
		if(this.options.debug) this.options.debug(...args);
	}
	/**
	 * Start a loop that will render frames per every second
	 */
	async startRenderLoop() {
		if(this.renderer.render) throw new Error('RenderLoop is already running');
		this.restartRenderTimer()
		// prerequisites
		this.enableDefaults();
		// clear the console
		console.clear()
		this.renderer.startTime = Date.now()
		const render = this.render.bind(this);
		this.renderer.render = sync.update(({ delta }) => {
			this.renderer.renders++;
			void render()
			// calculate the fps
			this.renderer.fps = Math.round(1000 / delta);
			this.emit('render', { delta, renders: this.renderer.renders, fps: this.renderer.fps });
		}, true);
	}
	/**
	 * Stop the render loop
	 * @returns 
	 */
	stopRenderLoop() {
		if(!this.renderer.render) throw new Error('Render Loop has already ended');
		this.debug(`Stopping Render Loop`);
		cancelSync.render(this.renderer.render)
		this.renderer.render = null;
		return this;
	}
	private restartRenderTimer() {
		if(this.renderer.idleTimeout) clearTimeout(this.renderer.idleTimeout);
		this.debug(`Restarted Idle Render Timeout`)
		if(this.renderer.state === state.idle) {
			this.emit('active');
			this.debug(`Render Active again`)
			this.renderer.state = state.running;
			this.startRenderLoop()
		}
		this.renderer.idleTimeout = setTimeout(() => {
			if(this.renderer.render) {
				this.stopRenderLoop();
				this.renderer.state = state.idle;
				this.emit('idle');
				this.debug('Render idling')
			}
		}, this.options.idleTimeout);
	}
	private enableDefaults() {
		process.stdout.on('resize', () => this.emit('resize'));
	}
	private _createEmptyScreen(xCoord: number, yCoord: number) {
		const newScreen: { x: number; y: number; value: string }[][] = [];
		for (let x = 0; x < xCoord; x++) {
			newScreen.push([]);
			for (let y = 0; y  < yCoord; y++) {
				newScreen[x].push({ x, y, value: ' ' });
			}
		}
		this.screen = newScreen;

		return this;
	}
	create(x: number, y: number, value: string) {
		x = (x - 1) <= -1 ? 0 : x - 1;
		y = (y - 1) <= -1 ? 0 : y - 1;
		if(!this.screen[x] || !this.screen[x][y]) throw new Error(`Invalid coordinates (x: ${x}, y: ${y}, ${this.screen[x] ? 'No Row' : 'No Column'})`);
		this.screen[x][y].value = value;
		this.restartRenderTimer();
		return this;
	}
	updateBulkScreen(newScreen: Pixel[][]) {
		if(!Array.isArray(newScreen)) throw new Error(`Invalid Screen (Expected: Array, Received: ${typeof newScreen})`);
		for(let x = 0;x < defaultSize.x; x++) {
			if(!newScreen[x]) {
				newScreen[x] = this.screen[x] || [];
			}
			if(!Array.isArray(newScreen[x])) throw new Error(`Invalid X Coordinate (Expected: Array, received: ${typeof newScreen[x]})`)
			for(let y = 0; y < defaultSize.y; y++) {
				if(!newScreen[x][y]) {
					newScreen[x][y] = this.screen[x][y] || { x: x, y: y, value: ' ' };
				}
			}
		}
		this.screen = newScreen;
		return this;
	}
	reset() {
		return new Promise((resolve, reject) => {
			this._createEmptyScreen(defaultSize.x, defaultSize.y);
			return resolve(this);
		})
	}
	
}

export default GameEngine;