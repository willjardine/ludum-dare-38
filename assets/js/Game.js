var Game = (function() {

	//////////////////////////////////////////////////
	// CONSTANTS
	//////////////////////////////////////////////////

		var COLORS = [
			{ r:0, g:0, b:0}, // #000000
			{ r:42, g:197, b:181}, // #2ac5b5
			{ r:203, g:234, b:29}, // #cb861d
			{ r:203, g:29, b:189}, // #cb1dbd
			{ r:29, g:90, b:203} // #1d5acb
		];
		var GAME_WIDTH = 1200;
		var GAME_HEIGHT = 1200;
		var SCALE = 2;


	//////////////////////////////////////////////////
	// Constructor
	//////////////////////////////////////////////////

		var Element = function() {

			if (!createjs.Sound.initializeDefaultPlugins()) {
				// can't load sound plugins
				return;
			}

			if (createjs.BrowserDetect.isIOS || createjs.BrowserDetect.isAndroid || createjs.BrowserDetect.isBlackberry) {
				// mobile isn't supported
				return;
			}

			// canvas
			this.canvas = document.createElement('canvas');
			this.context = this.canvas.getContext('2d');
			this.canvas.width = GAME_WIDTH;
			this.canvas.height = GAME_HEIGHT;
			this.canvas.style.width = (GAME_WIDTH / SCALE) + 'px';
			this.canvas.style.height = (GAME_HEIGHT / SCALE) + 'px';
			document.body.appendChild(this.canvas);

			// level
			this.grid = new HexGrid(55, 1, 1, 132, 28);
			this.totalLevels = 3;
			this.loadLevel(1);

			// events
			this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this), false);
			this.canvas.addEventListener('touchstart', this.onTouchStart.bind(this), false);

		};


	//////////////////////////////////////////////////
	// Level
	//////////////////////////////////////////////////

		Element.prototype.loadLevel = function(level) {

			switch(level) {
				case 2:
					this.board = [
						[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
						[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
						[1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1],
						[1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1],
						[1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1],
						[1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1],
						[1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1],
						[1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1],
						[1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1],
						[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
						[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
					];
					this.players = [
						[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
						[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
						[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
						[0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
						[0, 0, 0, 0, 2, 1, 2, 0, 0, 0, 0],
						[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
						[0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0],
						[0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0],
						[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
						[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
						[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
					];
					this.totalPlayers = 3;
					break;
				case 3:
					this.board = [
						[1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1],
						[1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1],
						[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
						[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
						[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
						[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
						[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
						[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
						[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
						[1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1],
						[1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1]
					];
					this.players = [
						[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
						[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
						[0, 0, 0, 4, 0, 0, 0, 1, 0, 0, 0],
						[0, 0, 0, 3, 2, 0, 3, 4, 0, 0, 0],
						[0, 0, 0, 0, 1, 0, 2, 0, 0, 0, 0],
						[0, 1, 3, 2, 0, 0, 0, 1, 2, 4, 0],
						[0, 0, 4, 0, 0, 0, 0, 0, 3, 0, 0],
						[0, 0, 0, 1, 3, 0, 4, 2, 0, 0, 0],
						[0, 0, 0, 2, 4, 0, 1, 3, 0, 0, 0],
						[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
						[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
					];
					this.totalPlayers = 4;
					break;
				default:
					this.board = [
						[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
						[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
						[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
						[1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1],
						[1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1],
						[1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1],
						[1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1],
						[1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1],
						[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
						[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
						[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
					];
					this.players = [
						[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
						[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
						[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
						[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
						[0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
						[0, 0, 0, 0, 0, 1, 2, 0, 0, 0, 0],
						[0, 0, 0, 0, 2, 1, 0, 0, 0, 0, 0],
						[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
						[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
						[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
						[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
					];
					this.totalPlayers = 2;
			}

			this.level = level;
			this.player = 1;
			this.grid.updateGrid(55, this.board[0].length, this.board.length, 132, 28);

			this.moves = this.getPlayerMoves(this.player);
			this.update();

		};
		Element.prototype.levelOver = function() {


			var availableTiles = 0;
			var playerTiles = [];

			var x, y;
			for (y=0; y<this.board.length; ++y) {
				for (x=0; x<this.board[y].length; ++x) {
					if (this.board[y][x] === 0) {
						availableTiles += 1;
					}
				}
			}
			for (x=0; x<=this.totalPlayers; ++x) {
				playerTiles[x] = 0;
			}
			for (y=0; y<this.players.length; ++y) {
				for (x=0; x<this.players[y].length; ++x) {
					playerTiles[ this.players[y][x] ] += 1;
				}
			}

			// stats
			console.log('Level Stats:');
			for (x=1; x<playerTiles.length; ++x) {
				console.log('Player '+ x, playerTiles[x] / availableTiles);
			}
			console.log('-----');


			if (this.level === this.totalLevels) {
				alert('Game Completed');
			} else {
				alert('Next Level');
				this.loadLevel(this.level + 1);
			}
		};


	//////////////////////////////////////////////////
	// Update & Render
	//////////////////////////////////////////////////

		Element.prototype.update = function() {
			this.render();
		};
		Element.prototype.render = function() {

			var x, y;

			// clear canvas
			this.context.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

			// draw move locations
			if (this.moves !== null && this.player > 0) {
				for (y=0; y<this.moves.length; ++y) {
					for (x=0; x<this.moves[y].length; ++x) {
						if (this.moves[y][x].length > 0) {
							var color = COLORS[ this.player ];
							this.grid.drawTile(
								this.context,
								x,
								y,
								'transparent',
								'rgba(' + color.r + ',' + color.g + ',' + color.b + ',0.4)'
							);
						}
					}
				}
			}

			// draw players
			for (y=0; y<this.players.length; ++y) {
				for (x=0; x<this.players[y].length; ++x) {
					var pos = this.grid.getTileCenterPosition(x, y);
					if (this.players[y][x] > 0) {
						var color = COLORS[ this.players[y][x] ];
						this.context.fillStyle = 'rgba(' + color.r + ',' + color.g + ',' + color.b + ',1)';
						this.context.beginPath();
						this.context.arc(pos.x, pos.y, 20, 0, 2 * Math.PI);
						this.context.fill();
					}
				}
			}

			// draw grid
			for (y=0; y<this.board.length; ++y) {
				for (x=0; x<this.board[y].length; ++x) {
					if (this.board[y][x] === 0) {
						this.grid.drawTile(
							this.context,
							x,
							y,
							'#fff',
							'transparent'
						);
					}
				}
			}

			// draw grid (debug)
			//this.grid.drawGrid(this.context, 'transparent', 'transparent', true);

		};


	//////////////////////////////////////////////////
	// Movement
	//////////////////////////////////////////////////

		Element.prototype.makeMove = function(column, row) {

			// make move
			var move = this.moves[row][column];
			for (var i=0, l=move.length; i<l; ++i) {
				this.players[ move[i].row ][ move[i].column ] = this.player;
			}

			// next player
			this.player ++;
			if (this.player > this.totalPlayers) {
				this.player = 1;
			}

			// get next moves
			this.moves = this.getPlayerMoves(this.player);
			if (this.moves === null || this.moves.length === 0) {
				this.update();
				this.levelOver();
				return;
			}

			// update game
			this.update();

			// if player is computer, wait to move
			if (this.player !== 1) {
				setTimeout(this.makeComputerMove.bind(this), 1000);
			}

		};
		Element.prototype.makeComputerMove = function() {

			// get available moves
			var moves = [];
			var x, y;
			for (y=0; y<this.moves.length; ++y) {
				for (x=0; x<this.moves[y].length; ++x) {
					if (this.moves[y][x].length > 0) {
						moves.push({x:x, y:y});
					}
				}
			}

			// make random move
			var index = Math.floor(Math.random() * moves.length);
			this.makeMove(moves[index].x, moves[index].y);

		};
		Element.prototype.selectTile = function(x, y) {
			var tile = this.grid.getTile(
				x * SCALE,
				y * SCALE
			);
			if (tile !== null && this.player === 1) {
				if (this.moves !== null && this.moves[tile.row][tile.column].length > 0) {
					this.makeMove(tile.column, tile.row);
				}
			}
		};
		Element.prototype.getPlayerMoves = function(player) {
			var hasMoves = false;
			var moves = [];
			var i, ii, l, ll, p, t, x, y;
			for (y=0; y<this.players.length; ++y) {
				moves[y] = [];
				for (x=0; x<this.players[y].length; ++x) {
					moves[y][x] = [];
				}
			}
			for (y=0; y<this.players.length; ++y) {
				for (x=0; x<this.players[y].length; ++x) {
					if (this.players[y][x] === player) {
						t = this.grid.getSurroundingTiles(x, y);
						for (i=0, l=t.length; i<l; ++i) {
							if (this.board[ t[i].row ][ t[i].column ] === 0 && this.players[ t[i].row ][ t[i].column ] !== 0 && this.players[ t[i].row ][ t[i].column ] !== player) {
								p = this.getMovePositions(player, t[i]);
								if (p !== null) {
									hasMoves = true;
									for (ii=0, ll=p.length; ii<ll; ++ii) {
										moves[ p[p.length-1].row ][ p[p.length-1].column ].push( p[ii] );
									}
								}
							}
						}
					}
				}
			}
			if (hasMoves) {
				return moves;
			}
			return null;
		};
		Element.prototype.getMovePositions = function(player, tile) {
			tiles = [];
			while (tile !== null) {
				tiles.push(tile);
				if (this.board[ tile.row ][ tile.column ] !== 0) {
					tile = null;
					return null;
				}
				if (this.players[ tile.row ][ tile.column ] === player) {
					tile = null;
					return null;
				}
				if (this.players[ tile.row ][ tile.column ] === 0) {
					return tiles;
				}
				tile = this.grid.getTileWithVector(tile.column, tile.row, tile.vector);
			}
			return null;
		};


	//////////////////////////////////////////////////
	// Event Handlers
	//////////////////////////////////////////////////

		Element.prototype.onMouseDown = function(event) {
			event.preventDefault();
			var x = event.pageX - event.currentTarget.offsetLeft,
				y = event.pageY - event.currentTarget.offsetTop;
			this.selectTile(x, y);
		};
		Element.prototype.onTouchStart = function(event) {
			if (event.touches.length === 1) {
				event.preventDefault();
				var x = event.touches[0].pageX - event.currentTarget.offsetLeft,
					y = event.touches[0].pageY - event.currentTarget.offsetTop;
				this.selectTile(x, y);
			}
		};


	//////////////////////////////////////////////////
	// Return Object
	//////////////////////////////////////////////////

		return Element;

})();