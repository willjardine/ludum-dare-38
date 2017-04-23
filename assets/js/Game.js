var Game = (function() {

	//////////////////////////////////////////////////
	// CONSTANTS
	//////////////////////////////////////////////////

		var GAME_WIDTH = 640;
		var GAME_HEIGHT = 480;


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
			this.canvas.imageSmoothingEnabled = false;
			this.canvas.width = GAME_WIDTH;
			this.canvas.height = GAME_HEIGHT;
			document.body.appendChild(this.canvas);

			// grid
			this.grid = new HexGrid(25, 16, 10, 15, 10); // radius, cols, rows, originX, originY
			this.grid.drawGrid(this.context, '#000', '#eee', false);

			// events
			this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this), false);
			this.canvas.addEventListener('touchstart', this.onTouchStart.bind(this), false);

		};


	//////////////////////////////////////////////////
	// Misc
	//////////////////////////////////////////////////

		Element.prototype.selectTile = function(x, y) {
			var tile = this.grid.getTile(x, y);
			if (tile !== null) {
				this.grid.drawTile(
					this.context,
					tile.column,
					tile.row,
					'transparent',
					'rgba(110,110,70,0.3)'
				);

				var position = this.grid.getTileCenterPosition(tile.column, tile.row);

				this.context.fillStyle = "#000000";
				this.context.beginPath();
				this.context.arc(position.x, position.y, 20, 0, 2 * Math.PI);
				this.context.fill();

				var surrounding = this.grid.getSurroundingTiles(tile.column, tile.row);
				for (var i=0, l=surrounding.length; i<l; i++) {
					var pos = this.grid.getTileCenterPosition(surrounding[i].column, surrounding[i].row);
					this.context.fillStyle = "#ff0000";
					this.context.beginPath();
					this.context.arc(pos.x, pos.y, 10, 0, 2 * Math.PI);
					this.context.fill();
				}

			}
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