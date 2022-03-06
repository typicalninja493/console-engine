import { GameEngine } from "..";
import readline from "readline";

class PromptsManager {
	game: GameEngine;
	PromptQueue: never[];
	readline: readline.Interface;
	constructor(game: GameEngine) {
		this.game = game;
		this.PromptQueue = []
		this.readline = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});

		this.readline.on('line', (input) => {
			
		});
	}
	async Prompt() {
		
	}
}

export default PromptsManager;