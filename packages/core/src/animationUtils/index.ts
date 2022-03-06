import _GameEngine from "../engine";
import { defaultSize, Pixel } from "../utils/constants";
import { stripIndent,  } from 'common-tags'

class AnimationUtils {
	GameEngine: _GameEngine;
	constructor(GameEngine: _GameEngine) {
		if(!GameEngine || !(GameEngine instanceof _GameEngine)) throw new Error('GameEngine is required');
		this.GameEngine = GameEngine;
	}
	/**
	 * Draws a string line by line on the screen
	 * @param str 
	 * @param coordinates 
	 * @returns 
	 */
	drawLineByLine(str: string, coordinates: {  x: number; y?: number } = { x: 0 }) {
		return new Promise((reject, resolve) => {
		if(!coordinates.x) return reject(`X coordinates must be given`)
		// split str by each line
		str = stripIndent(str)
		const splitted = str.split(/\r\n|\r|\n/).map(s => s.split(''));
		const newScreen: Pixel[][] = [];
		let currentY = coordinates.y || 0;
		let currentX = coordinates.x 
		for(const row of splitted) {
			if(row.length) {
				let i = 0;
				for(let y = currentY; i < row.length; y++) {
					if(!newScreen[currentX]) newScreen[currentX] = [];
					newScreen[currentX][y] = { x: currentX, y, value: row[i] };
					i++
				}
				currentX++
			}
		}
		this.GameEngine.updateBulkScreen(newScreen)
		return resolve(this);
		})
	}
	animateFrom(coordinate: number, coordinateType: 'x' | 'y' = 'x', value: string) {
		switch(coordinateType) {
			case 'x':
				for(let y = 0; y <= defaultSize.y; y++) {
					this.GameEngine.create(coordinate, y, value)
				}
				break;
			case 'y':
				for(let x = 0; x <= defaultSize.x; x++) {
					this.GameEngine.create(x, coordinate, value)
				}
			break;
		}
		return this;
	}
	animateFromTo(coordinateFrom: { x: number, y?: number }, coordinateTo: { x: number, y?: number }, value: string) {
		const xFrom = coordinateFrom.x;
		const yFrom = coordinateFrom.y || 0;
		const xTo = coordinateTo.x;
		const yTo = coordinateTo.y || 0;

		for(let x = xFrom; x <= xTo; x++) {
			for(let y = yFrom; y <= yTo; y++) {
				this.GameEngine.create(x, y, value)
			}
		}
		return this;
	}

}


export default AnimationUtils;