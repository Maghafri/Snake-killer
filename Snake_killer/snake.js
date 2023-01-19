// Directions
const LEFT = 37;
const UP = 38;
const RIGHT = 39;
const DOWN = 40;

// Board
var board;
var columns = 40;
var rows = 30;
var grid; // A bidimensional array to map [i, j] coordinates to the cells of the grid
var goodSnake;
var badSnakes = [];

// Identifier returned by setInterval, used to stop the game
var intervalId;

// Init the grid
init();

// Update the board every 80 ms
intervalId = setInterval(updateGrid, 80);

// Make a bad snake appear every 500 ms
setInterval(addBadSnake, 500);

/**
 * Build the initial grid and create the good snake
 */
function init(){
	buildGrid();
	goodSnake = new Snake(20, 15);
}

/**
 * Build the grid of the game
 */
function buildGrid(){
	// Init the grid array
	grid = [];
	for (var i = 0; i < columns; i++){
		grid[i] = [];
	}

	board = document.getElementById("board");

	for (var j = 0; j < rows; j++){
		for (var i = 0; i < columns; i++){
			// Create a div for the current cell
			var cell = document.createElement("div");
			cell.className = "cells";
			board.appendChild(cell);

			// Link the cell to the grid array
			grid[i][j] = cell;
		}
	}
}

/**
 * Draw the current state of the game.
 */
function draw(){
	// Empty everything
	var elements = document.getElementsByClassName('cells'); // get all cells elements
	for(var i = 0; i < elements.length; i++){
		elements[i].style.backgroundColor = "black";
	}

	// Draw the good snake
	drawSnake(goodSnake, "red", "blue");

	// Draw all the bad snakes
	for (var k = 0; k < badSnakes.length; k++){
		drawSnake(badSnakes[k], "orange", "green");
	}
}

/**
 * Draw a snake
 * @param {Snake} snake - The snake to draw
 * @param {string} headColor - The color of the head of the snake
 * @param {string} tailColor - The color of the tail of the snake
 */
function drawSnake(snake, headColor, tailColor){
	// Head
	grid[snake.head[0]][snake.head[1]].style.backgroundColor = headColor;

	// Tail
	for (var k = 0; k < snake.tail.length; k++){
		grid[snake.tail[k][0]][snake.tail[k][1]].style.backgroundColor = tailColor;
	}
}

/**
 * Update the state of the game (snake position and drawing)
 */
function updateGrid(){
	// Move good snake
	move(goodSnake);

	// Move bad snakes
	for (var k = 0; k < badSnakes.length; k++){
		var snake = badSnakes[k];
		changeDirection(snake);
		move(snake);
	}

	// Game over?
	if (isDeadGoodSnake()){
		// Game over
		clearInterval(intervalId);
	}
	else{
		// Were some snake killed?
		updateDeadBadSnakes();
		draw();
	}
}

/**
 * The prototype constructor of Snake objects
 * @constructor
 * @param {number} x - The initial x coordinate of the snake.
 * @param {number} y - The initial y coordinate of the snake.
 */
function Snake(x, y){
	this.head = [x, y];
	this.tail = [
		[x, y],
		[x, y],
		[x, y],
		[x, y],
		[x, y]
	];
	var direction = randomDirection(); // private attribute

	/**
	 * Get the direction of the snake
	 * @return {number} the direction
	 */
	this.getDirection = function(){
		return direction;
	}

	/**
	 * Set the direction of the snake
	 * @param {number} d - the direction
	 */
	this.setDirection = function(d){
		if (!oppositeDirections(direction, d)){
			direction = d;
		}
	}
}

/**
 * Test if two directions are opposite.
 * @param {number} d1 - the first direction
 * @param {number} d2 - the second direction
 * @return {boolean} true if the directions are opposite, false else
 */
function oppositeDirections(d1, d2){
	if (d1 == LEFT){
		return d2 == RIGHT;
	}
	if (d1 == UP){
		return d2 == DOWN;
	}
	if (d1 == RIGHT){
		return d2 == LEFT;
	}
	if (d1 == DOWN){
		return d2 == UP;
	}
}

/**
 * A function to make a snake moves
 * @param {Snake} snake - the snake
 */
function move(snake){	
	// Move the snake

	// shift the n - 1 first elements of the tail
	for (var k = snake.tail.length - 1; k > 0; k--){
		snake.tail[k][0] = snake.tail[k - 1][0];
		snake.tail[k][1] = snake.tail[k - 1][1];
	}

	// Put the head in the first element of the tail
	snake.tail[0][0] = snake.head[0];
	snake.tail[0][1] = snake.head[1];

	// Move the head
	if (snake.getDirection() == LEFT){
		snake.head[0]--;
	}
	else if (snake.getDirection() == UP){
		snake.head[1]--;
	}
	else if (snake.getDirection() == RIGHT){
		snake.head[0]++;
	}
	else if (snake.getDirection() == DOWN){
		snake.head[1]++;
	}
}

// Change the direction of the snake of the user using the keybord
document.addEventListener("keydown", function(e){
	var code = e.keyCode;
	if (code == LEFT || code == UP || code == RIGHT || code == DOWN){
		goodSnake.setDirection(code);
	}
});

/**
 * Change the direction of a bad snake at random (only for bad snakes)
 * @param {Snake} snake - the snake
 */
function changeDirection(snake){
	if (parseInt(Math.random() * 10) == 0){
		snake.setDirection(randomDirection());
	}
}

/**
 * Select a random direction. Exploits the fact that directions have value 37 to 40.
 * @return {number} the random direction
 */
function randomDirection(){
	var r = parseInt(Math.random() * 4);
	return 37 + r;
}

/**
 * Add a bad snake
 */
function addBadSnake(){
	var x = parseInt(Math.random() * columns);
	var y = parseInt(Math.random() * rows);
	badSnakes[badSnakes.length] = new Snake(x, y);
}

/**
 * Test if we are dead
 * @return {boolean} true if we are dead, false else
 */
function isDeadGoodSnake(){

	// Case 1: we are out of the board
	if (outOfBoard(goodSnake)){
		return true;
	}
	
	// Case 2: one of the head of one of the bad snakes is on one of our tail cells
	for (var k = 0; k < badSnakes.length; k++){
		var badSnake = badSnakes[k];
		if (bites(badSnake, goodSnake)){
			return true;
		}
	}

	// OK we are good
	return false;
}

/**
 * Check if a snake is out of the board
 * @param {Snake} snake - the snake
 * @return {boolean} true if we the snake is out of the board, false else
 */
function outOfBoard(snake){
	return snake.head[0] < 0 || snake.head[0] >= columns || snake.head[1] < 0 || snake.head[1] >= rows;
}

/**
 * Check if a snake bites another snake (if the head of the first is on the tail of the second)
 * @param {Snake} s1 - the first snake
 * @param {Snake} s2 - the second snake
 * @return {boolean} true if the head of the first is on the tail of the second, false else.
 */
function bites(s1, s2){
	for (var k = 0; k < s2.tail.length; k++){
		if (s1.head[0] == s2.tail[k][0] && s1.head[1] == s2.tail[k][1]){
			return true;
		}
	}
	return false;
}

/**
 * Detect the bad snakes we killed, remove them from the board and add points.
 */
function updateDeadBadSnakes(){
	// Snakes out of the board (we did not kill them)
	for (var k = badSnakes.length - 1; k >= 0; k--){
		if (outOfBoard(badSnakes[k])){
			badSnakes.splice(k, 1);
		}
	}

	// Did we bit a snake?
	for (var k = badSnakes.length - 1; k >= 0; k--){
		var badSnake = badSnakes[k];
		if (bites(goodSnake, badSnake)){
			badSnakes.splice(k, 1);
			var scoreSpan = document.getElementById("score");
			var score = parseInt(scoreSpan.innerHTML) + 1;
			scoreSpan.innerHTML = score;
		}
	}
}