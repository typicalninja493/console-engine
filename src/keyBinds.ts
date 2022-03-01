import { GameEngine } from "..";
import readline from "readline";
import micromatch from "micromatch";
import keyBinds from "./Binds";

class KeyBindManager {
	game: GameEngine;
	options: import("d:/coding/npm-pkgs/console-engine/src/utils/constants").EngineOptions;
	binds: { [key: string]: string };
	constructor(game: GameEngine) {
		this.game = game;
		this.options = game.options;

		// required parts for key binds
		readline.emitKeypressEvents(process.stdin);
		if (process.stdin.isTTY) process.stdin.setRawMode(true);
		this.binds = {}
		this.loadDefaultBinds();
		this._attachEvents();
	}
	private _attachEvents() {
		process.stdin.on('keypress', (str, key) => {
			if(key.ctrl && key.name === 'c') {
				this.game.stopRenderLoop();
				if(this.options.clearOnStop) {
					console.clear()
				}
				this.game.emit('stop', this.game)
			}
			const keyName = key.name;

			const bind = this.binds[keyName];
			if (bind) {
				this.game.emit(bind, this.game, key);
			}
			else if(micromatch.isMatch(keyName, Object.keys(this.binds))) {
				Object.keys(this.binds).forEach(key => {
					if(micromatch.isMatch(keyName, key)) {
						this.game.emit(this.binds[key], this.game, key);
					}
				});
			}
		});
	}
	private loadDefaultBinds() {
		//this.game.stopRenderLoop()
		this.binds = Object.assign({}, keyBinds);
		return this;
	}
}

export default KeyBindManager;