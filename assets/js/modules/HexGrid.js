// https://github.com/rrreese/Hexagon.js/blob/master/hexagon.js

var HexGrid = (function() {

	//////////////////////////////////////////////////
	// Constructor
	//////////////////////////////////////////////////

		var Element = function(radius, columns, rows, originX, originY) {
			this.updateGrid(radius, columns, rows, originX, originY);
		};


	//////////////////////////////////////////////////
	// Public Methods
	//////////////////////////////////////////////////

		Element.prototype.updateGrid = function(radius, columns, rows, originX, originY) {

			this.radius = radius;
			this.height = Math.sqrt(3) * radius;
			this.width = 2 * radius;
			this.side = (3 / 2) * radius;

			this.columns = columns;
			this.rows = rows;
			this.originX = originX;
			this.originY = originY;

		};
		Element.prototype.drawGrid = function(context, strokeColor, fillColor, isDebug) {

			var col,
				row,
				currentHexX,
				currentHexY,
				debugText = '',
				offsetColumn = false;

			for (col = 0; col < this.columns; col++) {
				for (row = 0; row < this.rows; row++) {
					if (!offsetColumn) {
						currentHexX = (col * this.side) + this.originX;
						currentHexY = (row * this.height) + this.originY;
					} else {
						currentHexX = (col * this.side) + this.originX;
						currentHexY = (row * this.height) + this.originY + (this.height * 0.5);
					}
					if (isDebug) {
						debugText = col + ',' + row;
					}
					this.drawHex(context, currentHexX, currentHexY, strokeColor, fillColor, debugText);
				}
				offsetColumn = !offsetColumn;
			}

		};
		Element.prototype.drawTile = function(context, column, row, strokeColor, fillColor) {
			var x = (column * this.side) + this.originX;
			var y = column % 2 === 0 ? (row * this.height) + this.originY : (row * this.height) + this.originY + (this.height / 2);
			this.drawHex(context, x, y, strokeColor, fillColor, '');
		};
		Element.prototype.getTile = function(x, y) {
			var localX = x - this.originX;
			var localY = y - this.originY;
			var tile = this.getHex(localX, localY);
			if (tile.column >= 0 && tile.column < this.columns && tile.row >= 0 && tile.row < this.rows) {
				return tile;
			}
			return null;
		};
		Element.prototype.getTileCenterPosition = function(column, row) {
			var x = (column * this.side) + this.originX;
			var y = column % 2 === 0 ? (row * this.height) + this.originY : (row * this.height) + this.originY + (this.height / 2);
			return {
				x: x + this.radius,
				y: y + (this.height / 2)
			};
		};
		Element.prototype.getSurroundingTiles = function(column, row) {
			var center = this.getTileCenterPosition(column, row);
			var tile;
			var tiles = [];

			// top, left
			tile = this.getTile(
				center.x - this.width,
				center.y - (this.height / 2)
			);
			if (tile !== null) {
				tiles.push(tile);
			}

			// top, middle
			tile = this.getTile(
				center.x,
				center.y - this.height
			);
			if (tile !== null) {
				tiles.push(tile);
			}

			// top, right
			tile = this.getTile(
				center.x + (this.width / 2),
				center.y - (this.height / 2)
			);
			if (tile !== null) {
				tiles.push(tile);
			}

			// bottom, left
			tile = this.getTile(
				center.x - this.width,
				center.y + (this.height / 2)
			);
			if (tile !== null) {
				tiles.push(tile);
			}

			// bottom, middle
			tile = this.getTile(
				center.x,
				center.y + this.height
			);
			if (tile !== null) {
				tiles.push(tile);
			}

			// bottom, right
			tile = this.getTile(
				center.x + (this.width / 2),
				center.y + (this.height / 2)
			);
			if (tile !== null) {
				tiles.push(tile);
			}

			return tiles;
		};


	//////////////////////////////////////////////////
	// Helpers
	//////////////////////////////////////////////////

		Element.prototype.drawHex = function(context, x0, y0, strokeColor, fillColor, debugText) {

			context.strokeStyle = strokeColor;
			context.beginPath();
			context.moveTo(x0 + this.width - this.side, y0);
			context.lineTo(x0 + this.side, y0);
			context.lineTo(x0 + this.width, y0 + (this.height / 2));
			context.lineTo(x0 + this.side, y0 + this.height);
			context.lineTo(x0 + this.width - this.side, y0 + this.height);
			context.lineTo(x0, y0 + (this.height / 2));

			if (fillColor) {
				context.fillStyle = fillColor;
				context.fill();
			}

			context.closePath();
			context.stroke();

			if (debugText) {
				context.font = '8px';
				context.fillStyle = '#000';
				context.fillText(debugText, x0 + (this.width / 2) - (this.width / 4), y0 + (this.height - 5));
			}

		};

		// Uses a grid overlay algorithm to determine hexagon location
		// Left edge of grid has a test to acuratly determin correct hex
		Element.prototype.getHex = function(x, y) {

			var column = Math.floor((x) / this.side);
			var row = Math.floor(
				column % 2 === 0
					? Math.floor((y) / this.height)
					: Math.floor(((y + (this.height * 0.5)) / this.height)) - 1);

			// Test if on left side of frame
			if (x > (column * this.side) && x < (column * this.side) + this.width - this.side) {

				// Now test which of the two triangles we are in
				// Top left triangle points
				var p1 = new Object();
				p1.x = column * this.side;
				p1.y = column % 2 === 0
					? row * this.height
					: (row * this.height) + (this.height / 2);

				var p2 = new Object();
				p2.x = p1.x;
				p2.y = p1.y + (this.height / 2);

				var p3 = new Object();
				p3.x = p1.x + this.width - this.side;
				p3.y = p1.y;

				var point = new Object();
				point.x = x;
				point.y = y;

				if (this.isPointInTriangle(point, p1, p2, p3)) {
					column--;
					if (column % 2 !== 0) {
						row--;
					}
				}

				// Bottom left triangle points
				var p4 = new Object();
				p4 = p2;

				var p5 = new Object();
				p5.x = p4.x;
				p5.y = p4.y + (this.height / 2);

				var p6 = new Object();
				p6.x = p5.x + (this.width - this.side);
				p6.y = p5.y;

				if (this.isPointInTriangle(point, p4, p5, p6)) {
					column--;

					if (column % 2 === 0) {
						row++;
					}
				}
			}

			return { column: column, row: row };
		};

		// TODO: Replace with optimized barycentric coordinate method
		Element.prototype.isPointInTriangle = function isPointInTriangle(pt, v1, v2, v3) {
			var b1, b2, b3;
			b1 = this.sign(pt, v1, v2) < 0.0;
			b2 = this.sign(pt, v2, v3) < 0.0;
			b3 = this.sign(pt, v3, v1) < 0.0;
			return ((b1 === b2) && (b2 === b3));
		};
		Element.prototype.sign = function(p1, p2, p3) {
			return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
		};


	//////////////////////////////////////////////////
	// Return Object
	//////////////////////////////////////////////////

		return Element;

})();