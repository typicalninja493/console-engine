// automatic terminal height and width detection
//export const TERMINAL_HEIGHT = process.stdout.rows;
//export const TERMINAL_WIDTH = process.stdout.columns;

// console.log(`Terminal height: ${TERMINAL_HEIGHT}, width: ${TERMINAL_WIDTH}`);

export const defaultSize = {
	/** Height */
	x: 35,
	/** Width */
	y: 100,
}

export const defaultOptions: EngineOptions = {
	renderer: {
		delay: 500,
	},
	allowInput: false,
	clearOnStop: true,
}

export interface EngineOptions {
	renderer?: {
		delay: number,
	}
	allowInput?: boolean
	clearOnStop?: boolean
	keyBinds?: {
		[key: string]: string
	}
}

export interface Pixel {
	x: number;
	y: number;
	value: string;
}


export const FLAGS = {
	coordinates: {
		center: {
			x: Math.floor(defaultSize.x / 2),
			y: Math.floor(defaultSize.y / 2)
		}
	}
}