const { AnimationUtils, Constants, GameEngine } = require("../dist/index");

const game = new GameEngine("Snek");
const animationUtils = new AnimationUtils(game);

const DeathWalls = {
	x: [1, Constants.defaultSize.x],
	y: [2, Constants.defaultSize.y]
}

let snakeTail = []
let lastX = Constants.FLAGS.coordinates.center.x
let lastY = Constants.FLAGS.coordinates.center.y
let currentProgress = 0;
let removedTails = []
let food = []

game.startRenderLoop()
// starting position
game.create(Constants.FLAGS.coordinates.center.x, Constants.FLAGS.coordinates.center.y, '▲');

animationUtils.animateFrom(Constants.defaultSize.x, 'x', '-');
animationUtils.animateFrom(0, 'x', '-');
animationUtils.animateFrom(1, 'y', '|');
animationUtils.animateFrom(Constants.defaultSize.y, 'y', '|');

let currentDirection = 'UP';


const foodSpawn = setInterval(() => {
	// no more than 2 food items on the screen at a time
	if(food.length >= 5) return;
	const x = Math.floor(Math.random() * Constants.defaultSize.x);
	const y = Math.floor(Math.random() * Constants.defaultSize.y);
	const foodItem = { x, y }

	if(food.some(item => item.x === foodItem.x && item.y === foodItem.y)) return;

	if(lastX === foodItem.x && lastY === foodItem.y) return;
	if(DeathWalls.x.includes(foodItem.x) || DeathWalls.y.includes(foodItem.y)) return;
	if(snakeTail.some(tail => tail.x === foodItem.x && tail.y === foodItem.y)) return;

	food.push(foodItem);
	game.create(foodItem.x, foodItem.y, '●');
}, 2000);


const MoveLogic = setInterval(async () => {
	switch(currentDirection) {
		case 'UP':
			game.create(lastX, lastY, ' ');
			const newX = lastX - 1;
			const newY = lastY;
			newMove(newX, newY);
			lastX = newX;
			lastY = newY;
			await checkDeath();
			game.create(newX, newY, '▲');
			checkIfFood();
			UpdateSnakeTail();
		break;
		case 'DOWN':
			game.create(lastX, lastY, ' ');
			const newX2 = lastX + 1;
			const newY2 = lastY;
			newMove(newX2, newY2);
			game.create(newX2, newY2, '▼');
			lastX = newX2;
			lastY = newY2;
			await checkDeath();
			checkIfFood();
			UpdateSnakeTail();
			break;
		case 'LEFT':
			game.create(lastX, lastY, ' ');
			const newX3 = lastX;
			const newY3 = lastY - 1;
			newMove(newX3, newY3);
			game.create(newX3, newY3, '◄');
			lastX = newX3;
			lastY = newY3;
			await checkDeath();
			checkIfFood()
			UpdateSnakeTail();
		break;
		case 'RIGHT':
			game.create(lastX, lastY, ' ');
			const newX4 = lastX;
			const newY4 = lastY + 1;
			newMove(newX4, newY4);
			game.create(newX4, newY4, '►');
			lastX = newX4;
			lastY = newY4;
			await checkDeath();
			checkIfFood()
			UpdateSnakeTail()
		break;
	}
}, 100)


const checkDeath = async () => {
	const currentLocation = { x: lastX, y: lastY }
	if (
		DeathWalls.x.includes(currentLocation.x) ||
		DeathWalls.y.includes(currentLocation.y)
	) {
		console.clear();
		game.reset();
		clearInterval(MoveLogic)
		clearInterval(foodSpawn)
		try {
			await animationUtils.drawLineByLine(`
			|    You Died    |
		`, {
			x: Constants.FLAGS.coordinates.center.x,
			y:	Constants.FLAGS.coordinates.center.y
		})
		}
		catch(err) {
			//game.stopRenderLoop();
			//console.log(err)

		}
	}
	else if(snakeTail.some(tail => tail.x === currentLocation.x && tail.y === currentLocation.y)) {
		console.clear()
		clearInterval(foodSpawn)
		clearInterval(MoveLogic)
		game.reset()
		try {
			await animationUtils.drawLineByLine(`
			|    You Died    |
		`, {
			x: Constants.FLAGS.coordinates.center.x,
			y:	Constants.FLAGS.coordinates.center.y
		})
		}
		catch(err) {
			//game.stopRenderLoop();
			//console.log(err)

		}
	}
}



function newMove (x, y) {
	if(snakeTail.length >= currentProgress) {
		const removed = snakeTail.shift()
		if(removed) {
			removedTails.push(removed);
		}
	}
	// for each currentProgress there is 1 tail pixel
	// if currentProgress is 0, then there is no tail
	// if currentProgress is 1, then there is 1 tail pixel
	// etc
	// each time newMove is called it should move a snake (by moving it pixel by pixel)
	// snake head is already at the new location
	// lastY and lastX are will be updated to the new location

	if(currentProgress > 0) {
		snakeTail.push({ x: lastX, y: lastY });
	}
}

function UpdateSnakeTail () {
	snakeTail.forEach(tail => {
		game.create(tail.x, tail.y, '■');
	});

	removedTails.forEach(tail => {
		game.create(tail.x, tail.y, ' ');
	});
}

function checkIfFood() {
	if(food.some(f => f.x === lastX && f.y === lastY)) {
		currentProgress++;
		food = food.filter(f => f.x !== lastX || f.y !== lastY)
	}
}

game.on('moveDown', () => {
	if(currentDirection == 'UP') return;
	currentDirection = 'DOWN';
});

game.on('moveUp', () => {
	if(currentDirection == 'DOWN') return;
	currentDirection = 'UP';
});

game.on('moveLeft', () => {
	if(currentDirection == 'RIGHT') return;
	currentDirection = 'LEFT';
});

game.on('moveRight', () => {
	if(currentDirection == 'LEFT') return;
	currentDirection = 'RIGHT';
});





game.on('stop', () => process.exit(1))