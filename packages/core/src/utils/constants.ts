// automatic terminal height and width detection
export const TERMINAL_HEIGHT = process.stdout.rows;
export const TERMINAL_WIDTH = process.stdout.columns;

// console.log(`Terminal height: ${TERMINAL_HEIGHT}, width: ${TERMINAL_WIDTH}`);

export const defaultSize = {
	/** Height */
	x: Math.round(TERMINAL_HEIGHT - 10),
	/** Width */
	y: Math.round(TERMINAL_WIDTH - 5),
}

export const state = {
	idle: 'IDLE',
	running: 'RUNNING'
}

export const defaultOptions: EngineOptions = {
	clearOnStop: true,
	idleTimeout: 10000
}

export interface EngineOptions {
	clearOnStop?: boolean;
	idleTimeout?: number;
	keyBinds?: {
		[key: string]: string
	};
	debug?: (...args: string[]) => void;
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