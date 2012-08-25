/**
 * Тетрис
 *
 * @author кто-то
 */
Game = {
	board: null,

	config: {},

	figure: null,

	figures: ['LineFigure', 'SquareFigure', 'LFigure', 'ZFigure'],

	matrix: [],

	prevFigureMatrix: [],

	rowOffsetQueue: [],

	tick: null,

	canMove: function(matrix, figure, offset) {
		var row = figure.row + offset;
		if (row < 0) {
			return 0;
		}
		if (row > Game.config.rows - 2) {
			return 0;
		}
		var col = figure.col, i, j;
		for (i = 0; i < 4; i++) {
			for (j = 0; j < 4; j++) {
				if (matrix[i + col][row] && figure.matrix[i][j]) {
					return 0;
				}
			}
		}
		return 1;
	},

	checkCollision: function(matrix, figure, col, row) {
		var i, j;
		for (i = 0; i < 4; i++) {
			for (j = 0; j < 4; j++) {
				if (figure.matrix[i][j]) {
					if (matrix[col + i][row + j]) {
						return 1;
					}
				}
			}
		}
		return 0;
	},

	checkFloor: function(matrix, figure, offset) {
		var col = figure.col, row = figure.row, i;
		var bounding = figure.getBottomBouding(), offsetCol, offsetRow;
		for (i = 0; i < bounding.length; i++) {
			offsetCol = col + bounding[i][0] + offset;
			offsetRow = row + bounding[i][1];
			//console.log(offsetCol + ', ' + offsetRow);
			if (offsetCol >= Game.config.cols) {
				return 1;
			}
			if (matrix[offsetCol] && matrix[offsetCol][offsetRow]) {
				return 1;
			}

		}
		return 0;
	},

	clearFigure: function(matrix) {
		var i, col, row;
		for (i = 0; i < Game.prevFigureMatrix.length; i++) {
			col = Game.prevFigureMatrix[i][0];
			row = Game.prevFigureMatrix[i][1];
			matrix[col][row] = 0;
		}
	},

	createCell: function(col, row) {
		var div = $('<div></div>').addClass('cell-' + col + '-' + row).css({
			width: Game.config.width,
			height: Game.config.height,
			top: col * Game.config.height,
			left: row * Game.config.width,
			position: 'absolute'
		});
		return div;
	},

	createRandomFigure: function() {
		var index = Math.floor(Math.random() * Game.figures.length);
		var figure = new window[Game.figures[index]](
			0, Math.floor(Game.config.rows / 2)
		);
		Game.figure = figure;
		Game.placeFigure(Game.matrix, figure);
		Game.resetFigureData();
	},

	extinguishCell: function(board, i, j) {
		board.find('div.cell-' + i + '-' + j).css({
			backgroundColor: '#fff'
		});
	},

	gameLoop: function() {
		var status, i;
		status = Game.moveFigure(Game.matrix, Game.figure, +1, 0);
		if (status >= 0) {
			if (Game.rowOffsetQueue.length) {
				for (i = 0; i < Game.rowOffsetQueue.length; i++) {
					status = Game.moveFigure(Game.matrix, Game.figure, 0,
						Game.rowOffsetQueue[i]);
					if (status <= 0) {
						break;
					}
				}
			}
		}
		//console.log(status);
		if (status < 0) {
			clearInterval(Game.tick);
			return;
		}
		Game.rowOffsetQueue = [];
		Game.redraw(Game.matrix, Game.prevFigureMatrix, Game.board,
			Game.config.cols, Game.config.rows);
	},

	hightlightCell: function(board, i, j) {
		board.find('div.cell-' + i + '-' + j).css({
			backgroundColor: 'red'
		});
	},

	init: function(board, config) {
		Game.config = $.extend({
			cols: 20,
			rows: 20,
			width: 20,
			height: 20,
			duration: 200
		}, config);
		Game.board = board;
		Game.initMatrix(Game.config.cols, Game.config.rows);
		Game.initBoard(Game.board, Game.config.cols, Game.config.rows);
		Game.initFigureMatrix();
		Game.initControlls();
	},

	initBoard: function(board, cols, rows) {
		var i, j, cell;
		for (i = 0; i < cols; i++) {
			for (j = 0; j < rows; j++) {
				cell = Game.createCell(i, j);
				board.append(cell);
			}
		}
	},

	initControlls: function() {
		$(window).bind('keydown', function(event) {
			switch(event.keyCode) {
				case 37: Game.rowOffsetQueue.push(-1); break;
				case 39: Game.rowOffsetQueue.push(+1); break;
			}
		});
	},

	initFigureMatrix: function() {
		Game.prevFigureMatrix = [];
	},

	initMatrix: function(cols, rows) {
		var i, j;
		for (i = 0; i < cols; i++) {
			Game.matrix[i] = [];
			for (j = 0; j < rows; j++) {
				Game.matrix[i][j] = 0;
			}
		}
	},

	moveFigure: function(matrix, figure, colOffset, rowOffset) {
		Game.replaceFigureMatrix(figure);
		Game.clearFigure(matrix);	
		if (Game.checkFloor(matrix, figure, colOffset)) {
			Game.restoreLastFigure();
			Game.createRandomFigure();
			return 1;
		}
		if (!Game.checkCollision(matrix, figure, figure.col + colOffset,
			figure.row + rowOffset)) {
			figure.col += colOffset;
			if (rowOffset) {
				if (Game.canMove(matrix, figure, rowOffset)) {
					figure.row += rowOffset;
				}
			}
		}
		Game.placeFigure(matrix, figure);
		return 1;
	},

	placeFigure: function(matrix, figure) {
		var col = figure.col, row = figure.row, i, j;
		for (i = 0; i < 4; i++) {
			for (j = 0; j < 4; j++) {
				if (figure.matrix[i][j]) {
					matrix[i + col][j + row] = 1;
				}
			}
		}
	},

	redraw: function(matrix, clear, board, cols, rows) {
		var i, j;
		for (i = 0; i < clear.length; i++) {
			Game.extinguishCell(board, clear[i][0], clear[i][1]);
		}
		clear = [];
		for (i = 0; i < cols; i++) {
			for (j = 0; j < rows; j++) {
				if (matrix[i][j]) {
					Game.hightlightCell(board, i, j);
				}
				/*board.find('div.cell-' + i + '-' + j).text(
					matrix[i][j]
				);*/
			}
		}
	},

	replaceFigureMatrix: function(figure) {
		var i, j, col = figure.col, row = figure.row;
		for (i = 0; i < 4; i++) {
			for (j = 0; j < 4; j++) {
				if (figure.matrix[i][j]) {
					Game.prevFigureMatrix.push([col + i, row + j]);
				}
			}
		}
	},

	resetFigureData: function() {
		Game.prevFigureMatrix = [];
		Game.rowOffsetQueue = [];
	},
	
	restoreLastFigure: function() {
		if (Game.prevFigureMatrix.length) {
			var count = 0, i, j;
			for (i = 0; i < 4; i++) {
				for (j = 0; j < 4; j++) {
					if (Game.figure.matrix[i][j]) {
						count++;
					}
				}
			}
			var i, col, row, last;
			for (i = 0; i < count; i++) {
				last = Game.prevFigureMatrix.length - i - 1;
				col = Game.prevFigureMatrix[last][0];
				row = Game.prevFigureMatrix[last][1];
				Game.matrix[col][row] = 1; 
			}
		}
	},

	start: function(board, config) {
		Game.init(board, config);
		Game.createRandomFigure();
		Game.tick = setInterval(function() {
			Game.gameLoop();
		}, Game.config.duration);
	}
};

var Figure = Ice.Class.extend({
	col: 0,

	matrix: [],

	row: 0,

	__construct: function(col, row) {
		this.col = col;
		this.row = row;
		this.matrix = [];
		this.initMatrix();
		this.fillMatrix();
	},

	fillMatrix: function() {

	},

	getBottomBouding: function() {
		return [];
	},

	getLeftBounding: function() {
		return [];
	},

	getRightBounding: function() {
		return [];
	},

	initMatrix: function() {
		var i, j;
		for (i = 0; i < 4; i++) {
			this.matrix[i] = [];
			for (j = 0; j < 4; j++) {
				this.matrix[i][j] = 0;
			}
		}
	}
});

var LFigure = Figure.extend({
	fillMatrix: function() {
		var i;
		for (i = 0; i < 3; i++) {
			this.matrix[i][0] = 1;
		}
		this.matrix[2][1] = 1;
	},

	getBottomBouding: function() {
		return [[2, 0], [2, 1]];
	},

	getLeftBounding: function() {
		return [0, 0, 0];
	},

	getRightBounding: function() {
		return [0, 0, 0];
	}
});

var LineFigure = Figure.extend({
	fillMatrix: function() {
		var i;
		for (i = 0; i < 4; i++) {
			this.matrix[i][0] = 1;
		}
	},

	getBottomBouding: function() {
		return [[3, 0]];
	},

	getLeftBounding: function() {
		return [0, 0, 0, 0];
	},

	getRightBounding: function() {
		return [0, 0, 0, 0];
	}
})

var SquareFigure = Figure.extend({
	fillMatrix: function() {
		var i, j;
		for (i = 0; i < 2; i++) {
			for (j = 0; j < 2; j++) {
				this.matrix[i][j] = 1;
			}
		}
	},

	getBottomBouding: function() {
		return [[1, 0], [1, 1]];
	},

	getLeftBounding: function() {
		return [0, 0];
	},

	getRightBounding: function() {
		return [1, 1];
	}
});

var ZFigure = Figure.extend({
	fillMatrix: function() {
		var i;
		for (i = 0; i < 2; i++) {
			this.matrix[0][i] = 1;
		}
		for (i = 1; i < 3; i++) {
			this.matrix[1][i] = 1;
		}
	},

	getBottomBouding: function() {
		return [[0, 0], [1, 1], [1, 2]];
	},

	getLeftBounding: function() {
		return [0, 1];
	},

	getRightBounding: function() {
		return [1, 2];
	}
});