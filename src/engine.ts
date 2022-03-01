// used by render loop to render the scene
import logUpdate from 'log-update';
import readline from "readline";
import { EventEmitter } from 'events';
import { EngineOptions, defaultSize, defaultOptions, Pixel } from './utils/constants';
import sync, { cancelSync, Process } from 'framesync';
import KeyBindManager from './keyBinds';

class GameEngine extends EventEmitter {
	name: string;
	screen: Pixel[][];
	renderer: { renders: number; render: Process | null; fps: number; startTime: number };
	options: EngineOptions;
	readline: readline.Interface | null;
	console_: logUpdate.LogUpdate;
	keyBindManager: KeyBindManager;
	constructor(gameName: string, options: EngineOptions = {}) {
		super();
		this.name = gameName;
		this.screen = [[]];
		this.options = Object.assign({}, options, defaultOptions);
		this.renderer = {
			renders: 0,
			render: null,
			fps: 0,
			startTime: 0,
		}
		this.readline = null;
		this.console_ = logUpdate.create(process.stdout, {
			showCursor: this.options.allowInput,
		});
		this.keyBindManager = new KeyBindManager(this);
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
	/**
	 * Start a loop that will render frames per every second
	 */
	async startRenderLoop() {
		if(this.renderer.render) throw new Error('RenderLoop is already running');
		// create a empty screen with all values fille
		this._createEmptyScreen(defaultSize.x, defaultSize.y);
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
		}, true);
	}
	/**
	 * Stop the render loop
	 * @returns 
	 */
	stopRenderLoop() {
		if(!this.renderer.render) throw new Error('Render Loop has already ended')
		cancelSync.render(this.renderer.render)
		this.renderer.render = null;
		return this;
	}
	private enableDefaults() {
		if(this.options.allowInput) this.enableInput();
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
	private enableInput() {
		if(this.readline) throw new Error(`Input already enabled`)
		this.readline = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});

		this.readline.on('line', (input) => {
			this.emit('textInput', input);
		})
	}
	reset() {
		this._createEmptyScreen(defaultSize.x, defaultSize.y);
		return this;
	}
	
}

export default GameEngine;