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

			// display canvas ... has "loading" background image
			this.displayCanvas = document.createElement('canvas');
			this.displayCanvas.className = 'loading';
			this.displayCanvas.width = GAME_WIDTH;
			this.displayCanvas.height = GAME_HEIGHT;
			this.displayCanvas.style.width = (GAME_WIDTH / SCALE) + 'px';
			this.displayCanvas.style.height = (GAME_HEIGHT / SCALE) + 'px';
			document.body.appendChild(this.displayCanvas);

			// preload
			this.preload = new createjs.LoadQueue(true);
			this.preload.installPlugin(createjs.Sound);
			this.preload.addEventListener('complete', this.onPreloadComplete.bind(this));
			this.preload.loadManifest([
				// images
				{id:'bg',				src:'assets/img/bg.jpg'},
				{id:'sprite-blobs',		src:'assets/img/sprite-blobs.png'},
				{id:'sprite-click',		src:'assets/img/sprite-click.png'},
				{id:'txt-game-over',	src:'assets/img/txt-game-over.png'},
				{id:'txt-level-1',		src:'assets/img/txt-level-1.png'},
				{id:'txt-level-2',		src:'assets/img/txt-level-2.png'},
				{id:'txt-level-3',		src:'assets/img/txt-level-3.png'},
				{id:'txt-results',		src:'assets/img/txt-results.png'},
				{id:'txt-title',		src:'assets/img/txt-title.png'},
				{id:'txt-your-turn',	src:'assets/img/txt-your-turn.png'},
				// sounds
				//{id:'music',		src:'assets/snd/music.ogg'},
				//{id:'explosion',	src:'assets/snd/fx-explosion.ogg'}
			]);

		};


	//////////////////////////////////////////////////
	// Init
	//////////////////////////////////////////////////

		Element.prototype.onPreloadComplete = function() {
			setTimeout(this.init.bind(this), 500);
		};
		Element.prototype.init = function() {

			this.nextPlayerMove = null;
			this.txtDisplayed = '';

			// remove "loading" image
			this.displayCanvas.className = '';

			// grid canvas
			this.grid = new HexGrid(55, 11, 11, 132, 28);
			this.gridCanvas = document.createElement('canvas');
			this.gridContext = this.gridCanvas.getContext('2d');
			this.gridCanvas.width = GAME_WIDTH;
			this.gridCanvas.height = GAME_HEIGHT;

			// stage
			this.stage = new createjs.Stage(this.displayCanvas);

			// bg
			var bg = new createjs.Bitmap( this.preload.getResult('bg') );
			this.stage.addChild(bg);

			// grid
			var grid = new createjs.Bitmap( this.gridCanvas );
			this.stage.addChild(grid);

			// blobs
			var blobsSheet = new createjs.SpriteSheet({
				framerate: 2,
				images: [ this.preload.getResult('sprite-blobs') ],
				frames: {width:110, height:110, regX:110/2, regY:110/2, spacing:0, margin:0},
				animations: {
					player1: [0],
					player2: [1],
					player3: [2],
					player4: [3]
				}
			});
			var p, x, y;
			this.blobs = [];
			for (y=0; y<11; ++y) {
				this.blobs.push([]);
				for (x=0; x<11; ++x) {
					p = this.grid.getTileCenterPosition(x, y);
					this.blobs[y][x] = new createjs.Sprite(blobsSheet, 'player1');
					this.blobs[y][x].x = p.x;
					this.blobs[y][x].y = p.y;
					this.blobs[y][x].visible = false;
					this.stage.addChild(this.blobs[y][x]);
				}
			}


			// txt
			this.txtGameOver = new createjs.Bitmap( this.preload.getResult('txt-game-over') );
			this.stage.addChild(this.txtGameOver);
			this.txtLevel1 = new createjs.Bitmap( this.preload.getResult('txt-level-1') );
			this.stage.addChild(this.txtLevel1);
			this.txtLevel2 = new createjs.Bitmap( this.preload.getResult('txt-level-2') );
			this.stage.addChild(this.txtLevel2);
			this.txtLevel3 = new createjs.Bitmap( this.preload.getResult('txt-level-3') );
			this.stage.addChild(this.txtLevel3);
			this.txtResults = new createjs.Bitmap( this.preload.getResult('txt-results') );
			this.stage.addChild(this.txtResults);
			this.txtTitle = new createjs.Bitmap( this.preload.getResult('txt-title') );
			this.stage.addChild(this.txtTitle);
			this.txtYourTurn = new createjs.Bitmap( this.preload.getResult('txt-your-turn') );
			this.stage.addChild(this.txtYourTurn);

			// click
			var clickSheet = new createjs.SpriteSheet({
				framerate: 2,
				images: [ this.preload.getResult('sprite-click') ],
				frames: {width:340, height:80, regX:340/2, regY:80/2, spacing:0, margin:0},
				animations: {
					click: [0, 1]
				}
			});
			this.click = new createjs.Sprite(clickSheet, 'click');
			this.click.x = GAME_WIDTH / 2;
			this.click.y = GAME_HEIGHT - 100;
			this.stage.addChild(this.click);

			// level
			this.overTile = null;
			this.totalLevels = 3;
			this.loadLevel(1);

			// title screen first
			this.showText('title');

			// events
			this.displayCanvas.addEventListener('mousedown', this.onMouseDown.bind(this), false);
			this.displayCanvas.addEventListener('mousemove', this.onMouseMove.bind(this), false);

			// start game loop
			createjs.Ticker.timingMode = createjs.Ticker.RAF;
			createjs.Ticker.addEventListener('tick', this.update.bind(this));
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

			this.nextPlayerMove = null;
			this.level = level;
			this.player = 1;
			this.grid.updateGrid(55, this.board[0].length, this.board.length, 132, 28);

			this.showText('level-' + level);

			this.moves = this.getPlayerMoves(this.player);

		};
		Element.prototype.levelOver = function() {

			/*
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
			console.log("\n");
			*/

			this.nextPlayerMove = null;
			if (this.level === this.totalLevels) {
				this.showText('game-over');
			} else {
				this.showText('results');
			}
		};


	//////////////////////////////////////////////////
	// Update Loop
	//////////////////////////////////////////////////

		Element.prototype.update = function(event) {

			var x, y;

			// clear canvas
			this.gridContext.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

			// draw move locations
			if (this.moves !== null && this.player > 0 && this.txtDisplayed === '') {
				for (y=0; y<this.moves.length; ++y) {
					for (x=0; x<this.moves[y].length; ++x) {
						if (this.moves[y][x].length > 0) {
							var color = COLORS[ this.player ];
							var alpha = 0.4;
							if (this.nextPlayerMove !== null) {
								alpha = 0.0;
								if (this.nextPlayerMove.column === x && this.nextPlayerMove.row === y) {
									alpha = 0.6;
								}
							} else if (this.player === 1 && this.overTile !== null && this.overTile.column === x && this.overTile.row === y) {
								alpha = 0.6;
							}

							this.grid.drawTile(
								this.gridContext,
								x,
								y,
								'transparent',
								'rgba(' + color.r + ',' + color.g + ',' + color.b + ',' + alpha + ')'
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
						this.blobs[y][x].gotoAndPlay('player'+this.players[y][x]);
						this.blobs[y][x].visible = true;
						/*
						var color = COLORS[ this.players[y][x] ];
						this.gridContext.fillStyle = 'rgba(' + color.r + ',' + color.g + ',' + color.b + ',1)';
						this.gridContext.beginPath();
						this.gridContext.arc(pos.x, pos.y, 20, 0, 2 * Math.PI);
						this.gridContext.fill();
						*/
					} else {
						this.blobs[y][x].visible = false;
					}
				}
			}

			// draw grid
			for (y=0; y<this.board.length; ++y) {
				for (x=0; x<this.board[y].length; ++x) {
					if (this.board[y][x] === 0) {
						this.grid.drawTile(
							this.gridContext,
							x,
							y,
							'#fff',
							'transparent'
						);
					}
				}
			}

			// draw grid (debug)
			//this.grid.drawGrid(this.gridContext, 'transparent', 'transparent', true);

			this.stage.update(event);

		};


	//////////////////////////////////////////////////
	// Movement
	//////////////////////////////////////////////////

		Element.prototype.makeMove = function(column, row) {

			this.nextPlayerMove = { column: column, row: row };

			var self = this;

			setTimeout(function(){

				// make move
				var move = self.moves[row][column];
				for (var i=0, l=move.length; i<l; ++i) {
					self.players[ move[i].row ][ move[i].column ] = self.player;
				}

				// next player
				self.player ++;
				if (self.player > self.totalPlayers) {
					self.player = 1;
				}

				// get next moves
				self.moves = self.getPlayerMoves(self.player);
				if (self.moves === null || self.moves.length === 0) {
					self.levelOver();
					return;
				}

				self.nextPlayerMove = null;

				if (self.player === 1) {
					// show "your turn" message
					self.showText('your-turn');
				} else {
					// if player is computer, wait to move
					setTimeout(self.makeComputerMove.bind(self), 1000);
				}

			}, 1000);


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
	// Misc
	//////////////////////////////////////////////////

		Element.prototype.showText = function(txt) {
			this.txtDisplayed = txt;
			this.txtGameOver.visible = (txt === 'game-over') ? true : false;
			this.txtLevel1.visible = (txt === 'level-1') ? true : false;
			this.txtLevel2.visible = (txt === 'level-2') ? true : false;
			this.txtLevel3.visible = (txt === 'level-3') ? true : false;
			this.txtResults.visible = (txt === 'results') ? true : false;
			this.txtTitle.visible = (txt === 'title') ? true : false;
			this.txtYourTurn.visible = (txt === 'your-turn') ? true : false;
			this.click.visible = (txt === '' || txt === 'your-turn') ? false : true;

			if (txt === 'your-turn') {
				var self = this;
				setTimeout(function(){
					self.showText('');
				}, 1500);
			}
		};


	//////////////////////////////////////////////////
	// Event Handlers
	//////////////////////////////////////////////////

		Element.prototype.onMouseDown = function(event) {
			event.preventDefault();
			if (this.txtDisplayed !== '') {
				switch (this.txtDisplayed) {
					case 'level-1':
					case 'level-2':
					case 'level-3':
						this.showText('your-turn');
						break;
					case 'game-over':
						this.showText('title');
						break;
					case 'results':
						this.loadLevel(this.level + 1);
						break;
					case 'title':
						this.loadLevel(1);
						break;
				}


			} else {
				var x = event.pageX - event.currentTarget.offsetLeft,
					y = event.pageY - event.currentTarget.offsetTop;
				var tile = this.grid.getTile(
					x * SCALE,
					y * SCALE
				);
				if (tile !== null && this.player === 1 && this.nextPlayerMove === null) {
					if (this.moves !== null && this.moves[tile.row][tile.column].length > 0) {
						this.makeMove(tile.column, tile.row);
					}
				}
			}
		};
		Element.prototype.onMouseMove = function(event) {
			event.preventDefault();
			var x = event.pageX - event.currentTarget.offsetLeft,
				y = event.pageY - event.currentTarget.offsetTop;

			this.overTile = this.grid.getTile(
				x * SCALE,
				y * SCALE
			);
			if (this.txtDisplayed === 'your-move') {
				this.displayCanvas.className = '';
			} else if (this.txtDisplayed !== '') {
				this.displayCanvas.className = 'pointer';
			} else if (this.nextPlayerMove === null && this.player === 1 && this.overTile !== null && this.moves !== null && this.moves[this.overTile.row][this.overTile.column].length > 0) {
				this.displayCanvas.className = 'pointer';
			} else {
				this.displayCanvas.className = '';
			}
		};


	//////////////////////////////////////////////////
	// Return Object
	//////////////////////////////////////////////////

		return Element;

})();