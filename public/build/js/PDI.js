var PDI = (function($){

	var GRAY_SCALE_TYPES = [
		'media',
		'grayscale',
		'desaturate',
		'hsv',
	];

	function PDI(){
		this.original = new Image();
		this.image = new Image();
		this.processes = [];
		this.grayScaleType = 'media';

		this.grid = [];

		this.reset();
	}

	PDI.prototype = {
		setGrayScale: function(type){
			this.grayScaleType = type;
		},
		reset: function(){
			this.statistics = {
				average : 0,
				median : 0,
				variance: 0,
				moda : 0,
				totalPx : 0,
			};
			this.histogram = {};
			this.histogram.gray = Array(256).fill(0);
			this.histogram.rgb = {
				r: Array(256).fill(0),
				g: Array(256).fill(0),
				b: Array(256).fill(0)
			};

			this.grid = [];
		},
		loadImagem: function(image, callback){
			var _this = this;
			_this.original.src = URL.createObjectURL(image);
			_this.image.src = URL.createObjectURL(image);
			if(typeof callback == 'function'){
				_this.original.onload = function(){
					callback(_this.original);
					_this.resetImage();
					_this.convertToGrid();
				}
			}
			this.reset();
		},
		resetImage: function(processesToo){
			var _this = this;

			if(processesToo){
				_this.processes = [];
			}

			var tmpCanvas = document.createElement('canvas');
			tmpCanvas.width = _this.original.width;
			tmpCanvas.height = _this.original.height;
			var ctx = tmpCanvas.getContext('2d');
			ctx.drawImage(_this.original, 0, 0);
			_this.image = ctx.getImageData(0, 0, _this.original.width, _this.original.height);

			return [_this.image];
		},
		getImageData: function(){
			var _this = this;
			var tmpCanvas = document.createElement('canvas');

			if(_this.image instanceof Image){
				var image = _this.image;
				tmpCanvas.width = image.width;
				tmpCanvas.height = image.height;
				var ctx = tmpCanvas.getContext('2d');
				ctx.drawImage(image, 0, 0);
				return ctx.getImageData(0, 0, image.width, image.height);
			}
			if(_this.image instanceof ImageData){
				tmpCanvas.width = _this.image.width;
				tmpCanvas.height = _this.image.height;
				var ctx = tmpCanvas.getContext('2d');
				ctx.putImageData(_this.image, 0, 0);
				return ctx.getImageData(0, 0, _this.image.width, _this.image.height);
			}
		},
		getPixelData: function(x, y, imgData){
			var _this = this;

			var width = imgData.width;
			var height = imgData.height;

			var lenStart = (y * width * 4) + x * 4;

			return [
				imgData.data[lenStart],		// red
				imgData.data[lenStart + 1],	// green
				imgData.data[lenStart + 2],	// blue
				imgData.data[lenStart + 3],	// alpha
				lenStart
			];
		},
		applyFilter: function(){
			var _this = this;
			var params = Array.from(arguments);
			var name = params.shift();

			if(params === undefined){
				params = {};
			}
			_this.processes.push({
				name: name,
				params: params
			});

			return _this.processImage();
		},
		processImage: function(){
			var _this = this;
			_this.resetImage();

			var results = [];

			for(var i in _this.processes){
				var curr = _this.processes[i];
				var func = curr.name
				var params = curr.params;

				var result = _this[func].apply(this, params)[0];
				results.push(result);

				_this.image = result;
			}
			return results;
		},
		getStatistics: function(){
			return this.statistics;
		},
		getHistogram: function(type){
			var _this = this;
			if(type == 'gray'){
				_this.filterGray();
				return _this.histogram.gray;
			}else
			if(type == 'rgb'){
				var imgData = this.getImageData();
				for (var i = 0; i < imgData.data.length; i += 4) {
					histogram.r[imgData.data[i]]++;
					histogram.g[imgData.data[i + 1]]++;
					histogram.b[imgData.data[i + 2]]++;
				}
			}
		},
		blankMatrix: function(width, height, defaultValue = 255){
			var tmpCanvas = document.createElement('canvas');
			tmpCanvas.width = width;
			tmpCanvas.height = height;
			var ctx = tmpCanvas.getContext('2d');
			return ctx.getImageData(0, 0, width, height);
		},

		// O GRID NAO DEVE SER USADO, APENAS PARA FINS DE CONFERENCIA;
		convertToGrid: function(){
			var _this = this;
			var imgData = _this.getImageData();
			var width = _this.image.width;
			var height = _this.image.height;

			for (var i=0, x=0, y=0; i < imgData.data.length; i += 4, x++){
				if(x == width){
					x = 0;
					y++;
				}

				if(_this.grid[y] === undefined) _this.grid[y] = [];
				if(_this.grid[y][x] === undefined) _this.grid[y][x] = [];

				_this.grid[y][x] = [
					imgData.data[i],
					imgData.data[i+1],
					imgData.data[i+2],
					imgData.data[i+3],
					i
				];
			}
		},

	// PROCESSOES COM MATRIZ {
		showMatrix:function(matrix, data){
			if(!data){
				for (var y = 0; y < matrix.length; y++){
					console.log('[ '+matrix[y].join(' ')+' ]');
				}
			}else{
				var matrixShow = [];
				for (var y = 0; y < matrixData.length; y++){
					if(matrixShow[y] == undefined) matrixShow[y] = [];

					for (var x = 0; x < matrixData[0].length; x++){
						if(matrixShow[y][x] == undefined) matrixShow[y][x] = [];
						var values = matrixData[y][x];

						matrixShow[y][x] = '[ '+values.join(' ')+' ]';

						_this.showMatrix(matrixShow);
					}
				}
			}
		},
		filterMatrixConvolution: function(matrixData, matrixCalc, callback = null){
			//		  [r, g, b, a]
			var sum = [0, 0, 0, 0];
			for (var y = 0; y < matrixData.length; y++){
				for (var x = 0; x < matrixData[0].length; x++){
					var values = matrixData[y][x];
					var valueCalc = matrixCalc[y][x];

					values.map(function(value, key){
						sum[key] += value * valueCalc;
					});
				}
			}
			if(typeof callback === 'function'){
				sum = callback(sum);
			}
			return sum;
		},
		getMatrixFromData: function(startX, startY, lenX, lenY, imgData){
			var _this = this;

			if(imgData === undefined){
				imgData = _this.getImageData();
			}

			var matrix = [];
			for (var y = 0; y < lenY; y++){
				if(matrix[y] == undefined){
					matrix[y] = [];
				}
				for (var x = 0; x < lenX; x++){
					if(matrix[y][x] == undefined){
						matrix[y][x] = [];
					}
					var nx = (startX + x);
					var ny = (startY + y);
					if(nx < 0 || ny < 0 || nx >= imgData.width || ny >= imgData.height){
						matrix[y][x] = [127, 127, 127, 255];
					}else{
						matrix[y][x] = _this.getPixelData(nx, ny, imgData).slice(0);
					}
				}
			}
			return matrix;
		},
		applyFilterMatrix: function(matrix, callback = null){
			var _this = this;

			var mYType = (matrix.length%2 == 0); // true = par | false = impar
			var midY = mYType ? [Math.floor(matrix.length/2), Math.ceil(matrix.length/2)] : [Math.floor(matrix.length/2)];
			var marginY = Math.abs(0 - Math.min.apply(null, midY));

			var mXType = (matrix[0].length%2 == 0);
			var midX = mXType ? [Math.floor(matrix[0].length/2), Math.ceil(matrix[0].length/2)] : [Math.floor(matrix[0].length/2)];
			var marginX = Math.abs(0 - Math.min.apply(null, midX));

			var imgDataOriginal = _this.getImageData();
			var imgData = _this.getImageData();

			var width = imgData.width;
			var height = imgData.height;

			var k = 0;
			for (var i = 0; i <= imgData.data.length; i += 4){
				var y = Math.floor(i/4/width);
				var x = Math.abs(i - y * width * 4)/4;
				
				var matrixData = _this.getMatrixFromData(x - marginX, y - marginY, matrix[0].length, matrix.length, imgDataOriginal);
				var sum = _this.filterMatrixConvolution(matrixData, matrix, callback);

				imgData.data[i]			= sum[0];	// red
				imgData.data[i + 1]		= sum[1];	// green
				imgData.data[i + 2]		= sum[2];	// blue
				// imgData.data[i + 3]		= sum[3];	// alpha
			}
			return [imgData];
		},
	// }

	// FILTERS
		getVfromType: function(r, g, b){
			if(this.grayScaleType == 'media'){
				return (r + g + b)/3;
			}else
			if(this.grayScaleType == 'grayscale'){
				return (r*0.3 + g*0.59 + b*0.11);
			}else
			if(this.grayScaleType == 'desaturate'){
				return (Math.max(r,g,b) + Math.min(r,g,b))/2;
			}else
			if(this.grayScaleType == 'hsv'){
				return Math.max(r,g,b);
			}else{
				return (r + g + b)/3;
			}
		},
		filterGray: function(){
			var _this = this;

			var imgData = _this.getImageData();

			var avg = 0;
			var totalPx = 0;
			_this.histogram.gray = Array(256).fill(0);
			for (var i = 0; i < imgData.data.length; i += 4){

				var r = imgData.data[i];		// red
				var g = imgData.data[i + 1];	// green
				var b = imgData.data[i + 2];	// blue
				var a = imgData.data[i + 3];	// alpha
				var v = _this.getVfromType(r, g, b);

				imgData.data[i] = v;
				imgData.data[i + 1] = v;
				imgData.data[i + 2] = v;

				// STATISTICS
				_this.histogram.gray[v]++;

				avg += v;
				totalPx++;
			}
			_this.statistics.average = avg/totalPx;
			_this.statistics.totalPx = totalPx;

			function statisticsComplete(){
				var imgData = _this.getImageData();

				// AVERAGE
				var vrc = 0;
				for (var i = 0; i < imgData.data.length; i += 4){
					var r = imgData.data[i];		// red
					var g = imgData.data[i + 1];	// green
					var b = imgData.data[i + 2];	// blue
					var a = imgData.data[i + 3];	// alpha
					var v = _this.getVfromType(r, g, b);
					vrc += Math.pow(v - _this.statistics.average, 2);
				}
				_this.statistics.variance = vrc/_this.statistics.totalPx;

				// MEDIAN
				imgData.data.sort((a, b) => {
					return b - a;
				});
				_this.statistics.median = imgData.data[imgData.data.length / 2];

				// MODA
				var moda = { px: null, total: 0 };
				_this.histogram.gray.map(function(value, key){
					if(value >= moda.total){
						moda.total = value;
						moda.px = key;
					}
				});
				_this.statistics.moda = moda.px;
			};
			statisticsComplete();

			return [imgData];
		},
		brightnessContrast: function(brightness, contrast){
			var _this = this;

			var B = brightness;
			var C = contrast;

			var imgData = _this.getImageData();

			for (var y = 0, x = 0, i = 0; i < imgData.data.length; i += 4){
				for (let j = 0; j < 3; j++) {
					imgData.data[i + j] = imgData.data[i + j] * C + B;

					if (imgData.data[i + j] > 255) {
						imgData.data[i + j] = 255;
					}
					if (imgData.data[i + j] < 0) {
						imgData.data[i + j] = 0;
					}
				}
			}
			_this.image = imgData;
			return [imgData];
		},
		negative: function(){
			var _this = this;

			var imgData = _this.getImageData();
			for (var y = 0, x = 0, i = 0; i < imgData.data.length; i += 4){
				for (let j = 0; j < 3; j++) {
					imgData.data[i + j] = 255 - imgData.data[i + j];
				}
			}
			return [imgData];
		},
		transform: function(width, height, matrix){

			width = Math.floor(width);
			height = Math.floor(height);

			var _this = this;
			var results = [];

			function addResult(){
				results.push(_this.blankMatrix(width, height));
			}
			addResult();

			// Pega os dados da imagem original
			var pixelData = _this.getImageData().data;

			// Pega a proporção da imagem
			var prop = {
				ow: _this.image.width / width,
				oh: _this.image.height / height,
				nw: width / _this.image.width,
				nh: height / _this.image.height,
			};

			// X Y Z
			// 0 1 2
			// 3 4 5
			// 6 7 8

			// Ajusta os dados segundo calcuto da matriz
			for (var y = 0, x = 0, i = 0; i <= results[0].data.length; i += 4){
				x = i/4 - width * y;
				if(x == width) y++;

				var nx = Math.floor(matrix[0] * x + matrix[3] * y + matrix[6]);
				var ny = Math.floor(matrix[1] * x + matrix[4] * y + matrix[7]);

				var currPixel = i;
				if (nx >= 0 && nx <= _this.image.width && ny >= 0 && ny <= _this.image.height){

					var orig = {
						newPixel: ( Math.floor ( ( ny * _this.image.width + nx ) * 4 ) ),
					}

					var test = [
						orig.newPixel,
					];
				}else{
					var test = [
						0,
					];
				}

				for(var k = 0; k < test.length; k++){
					if(results[k] === undefined){
						addResult();
					}
					var value = test[k];
					results[k].data[currPixel]		= pixelData[value];
					results[k].data[currPixel + 1]	= pixelData[value + 1];
					results[k].data[currPixel + 2]	= pixelData[value + 2];
					results[k].data[currPixel + 3]	= pixelData[value + 3];
				}
			}
			return results;
		},
		transladar: function(top, left, bottom, right){
			var _this = this;

			// Largura x Altura do canvas
			var width = _this.image.width + left + right;
			var height = _this.image.height + top + bottom;

			// Matriz para transladar
			//            X  Y  Z
			var matrix = [1, 0, 0,
						  0, 1, 0,
						  0, 0, 1];
			if (left > 0){	matrix[6] = -left;	matrix[0]; }
			if (top > 0){	matrix[7] = -top;	matrix[0]; }

			// Transforma a imagem do canvas - Transladar
			var results = _this.transform(width, height, matrix);
			_this.image = results[0];
			return results;
		},
		resize: function(x, y){
			var _this = this;

			if(x >= 4 || x <= 0){
				alert('Intervalo aceito para X [0, 4] e != 0');
				x = 1;
			}
			if(y >= 4 || y <= 0){
				alert('Intervalo aceito para Y [0, 4] e != 0');
				y = 1;
			}

			var width = this.image.width * x;
			var height = this.image.height * y;

			var matrix = [1, 0, 0, 0, 1, 0, 0, 0, 1];

			matrix[0] = 1/x;
			matrix[4] = 1/y;

			var results = this.transform(width, height, matrix);
			_this.image = results[0];
			return results;
		},
		rotate: function(ang){
			var _this = this;
			// JS TRABALHA COM RAD
			var width = this.image.width;
			var height = this.image.height;
			
			// CONVERTE DE DEG TO RAD
			var cos = Math.cos(ang * Math.PI / 180);
			var sin = Math.sin(ang * Math.PI / 180);

			var xt = -sin * width / 2 - cos * height / 2 + height / 2;
			var yt = -cos * width / 2 + sin * height / 2 + width / 2;

			var matrix = [cos, -sin, 0, sin, cos, 0, xt, yt, 1];
			// Transforma a imagem do canvas - rotacionar
			var results = this.transform(width, height, matrix);
			return results;
		},
		mirror: function (x, y){
			var _this = this;

			// Largura x Altura do canvas
			var width = _this.image.width;
			var height = _this.image.height;

			// Matriz para transladar
			//            X  Y  Z
			var matrix = [1, 0, 0,
						  0, 1, 0,
						  0, 0, 1];
			if (x > 0){ matrix[0] = -x; matrix[6] = _this.image.width; }
			if (y > 0){ matrix[4] = -y; matrix[7] = _this.image.height; }

			// console.log(matrix);

			// Transforma a imagem do canvas - Transladar
			var results = _this.transform(width, height, matrix);
			_this.image = results[0];
			return results;
		},
		aliasing: function(){
			var _this = this;

			// Pega os dados da imagem original
			var pixelData = _this.getImageData().data;

			// Pega os dados da imagem criada em branco
			var newImgData = this.blankMatrix(_this.image.width, _this.image.height);
			var newPixelData = newImgData.data;

			// Ajusta os dados segundo calcuto da matriz
			// for (var x = 0; x < _this.image.width; x++){
			// 	for (var y = 0; y < _this.image.height; y++){
			// 		var prev = {};
			// 		prev[y-1] = 0;
			// 		prev[y] = 0;
			// 		prev[y+1] = 0;
			// 		prev = newPixelData[x-1] || prev;

			// 		var next = {};
			// 		next[y-1] = 0;
			// 		next[y] = 0;
			// 		next[y+1] = 0;
			// 		next = newPixelData[x+1] || next;

			// 		newPixelData[x][y] = [
			// 			(prev[y-1] || 0),
			// 			(prev[y] || 0),
			// 			(prev[y+1] || 0),
			// 			(newPixelData[x][y-1] || 0),
			// 			(newPixelData[x][y] || 0),
			// 			(newPixelData[x][y+1] || 0),
			// 			(next[y-1] || 0),
			// 			(next[y] || 0),
			// 			(next[y+1] || 0),
			// 		].reduce((a,b) => a + b, 0);

			// 		if(x == 50 && y == 50){
			// 			console.log(prev, next);
			// 		}
			// 	}
			// }
			return newImgData;
		},
		binary: function(grayValue){
			var _this = this;

			// BINARIZA A IMAGEM
			var imgData = _this.filterGray()[0];
			for (var y = 0, x = 0, i = 0; i < imgData.data.length; i += 4){
				for (let j = 0; j < 3; j++) {
					var binary = (imgData.data[i + j] > grayValue) ? 255 : 0;
					imgData.data[i + j] = binary;
				}
			}

			return [imgData];
		},
	// }

		domino: function(){
			var _this = this;

			var processedPixel = {};
			function searchBodyObject(x,y, imgData){
				var grid = {};

				var limits = {
					x : {
						min : x,
						max : x
					},
					y : {
						min : y,
						max : y
					}
				}

				function getBlackNbrs(x,y, imgData){

					//             P2      P3       P4      P5      P6       P7       P8       P9
					var nbrs = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];
					//             0       1        2       3       4        5        6        7

					var blackPixelNbrs = [];
					for(var i in nbrs){
						var curr = nbrs[i];
						var nX = x+curr[0];
						var nY = y+curr[1];
						var data = _this.getPixelData(x+curr[0], y+curr[1], imgData);

						if(data[0] === 0){
							blackPixelNbrs.push({
								x : nX,
								y : nY,
							});
						}
					}
					return blackPixelNbrs;
				}

				function recursiveSearchBlackNbrs(x,y, imgData){
					if(processedPixel[x] !== undefined && processedPixel[x][y] !== undefined) return;
					if(processedPixel[x] === undefined) processedPixel[x] = {};
					processedPixel[x][y] = true;

					var nbrs = getBlackNbrs(x,y, imgData);
					for(var i in nbrs){
						var curr = nbrs[i];

						var nX = curr.x;
						var nY = curr.y;

						if(grid[nX] === undefined) grid[nX] = {};
						if(grid[nX][nY] === undefined){
							grid[nX][nY] = {};
							grid[nX][nY] = 0;

							if(nX < limits.x.min) limits.x.min = nX;
							if(nX > limits.x.max) limits.x.max = nX;

							if(nY < limits.y.min) limits.y.min = nY;
							if(nY > limits.y.max) limits.y.max = nY;

							recursiveSearchBlackNbrs(curr.x, curr.y, imgData);
						}
					}
				}
				recursiveSearchBlackNbrs(x,y, imgData);

				if(Object.keys(grid).length > 0){
					return {
						limits : limits,
						grid: grid,
					};
				}else{
					return null;
				}
			}

			function createImageFromFoundedObject(object, imgDataColorFull){

				var width = object.limits.x.max - object.limits.x.min;
				var height = object.limits.y.max - object.limits.y.min;

				var imgData = _this.blankMatrix(width, height);

				for(var x = 0; x <= width; x++){
					var nX = object.limits.x.min + x;
					for(var y = 0; y <= height; y++){
						var nY = object.limits.y.min + y;

						var pixel = [255,255,255,255];
						if(object.grid[nX] !== undefined && object.grid[nX][nY] !== undefined){
							pixel = _this.getPixelData(nX, nY, imgDataColorFull);
						}

						var lenStart = (y * width * 4) + x * 4;
						imgData.data[lenStart]		= pixel[0];	// R
						imgData.data[lenStart + 1]	= pixel[1];	// G
						imgData.data[lenStart + 2]	= pixel[2];	// B
						imgData.data[lenStart + 3]	= 255;		// A
					}
				}
				return imgData;
			}

			function getBlackPixelsByImg(imgData){
				var blackPixels = 0;
				for (var y = 0, x = 0, i = 0; i < imgData.data.length; i += 4){
					if(imgData.data[i] == 0){
						blackPixels++;
					}
				}
				return blackPixels;
			}

			function getFeaturesByObject(object){
				var objectData = object.dataImg;

				var width = objectData.width;
				var height = objectData.height;

				var tmpCanvas = document.createElement('canvas');
				tmpCanvas.width = width;
				tmpCanvas.height = height;
				var ctx = tmpCanvas.getContext('2d');
				ctx.putImageData(objectData, 0, 0);
				_this.image = ctx.getImageData(0, 0, objectData.width, objectData.height);

				// BINARIZA A IMAGEM
				var result = _this.binary(215);
				_this.image = result[0];

				var middle = ((width * Math.floor(height/2)) + Math.floor(width/2)) * 4;
				var xMid = Math.floor(width/2);
				var yMid = Math.floor(height/2);

				//              0       45      90      135      180      225       270      315
				var angles = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
				var radius = [];

				angles.map(function(data, key){
					var x = xMid;
					var y = yMid;
					var count = 0;
					var _continue = true;
					do{
						_continue = false;
						x = x + data[0];
						y = y + data[1];
						if(x >= 0 && x < width && y >= 0 && y < height){
							var pixel = _this.getPixelData(x, y, _this.image);
							if(pixel[0] === 0){
								_continue = true;
								count++;
							}
						}
					}while(_continue);
					radius.push(count);
				});

				function isTriangle(radius){
					return radius[0] < radius[1] && radius[4] < radius[3] &&
						radius[7] < radius[0] && radius[5] < radius[4] &&
						(radius[1]*0.7) <= radius[3] && radius[3] <= (radius[1]*1.3) && 
						(radius[3]*0.7) <= radius[6] && radius[6] <= (radius[3]*1.3) &&
						(radius[1]*0.7) <= radius[6] && radius[6] <= (radius[1]*1.3) &&
						(radius[0]*0.7) <= radius[4] && radius[4] <= (radius[0]*1.3);
				}

				function isDiamond(radius){
					return radius[1] < radius[0] &&
						radius[3] < radius[2] && radius[5] < radius[4] &&
						radius[7] < radius[6] && 
						(radius[0]*0.7) <= radius[4] && radius[4] <= (radius[0]*1.3) &&
						(radius[2]*0.7) <= radius[6] && radius[6] <= (radius[2]*1.3) &&
						(radius[4]*0.7) <= radius[6] && radius[6] <= (radius[4]*1.3) &&
						(radius[6]*0.7) <= radius[0] && radius[0] <= (radius[6]*1.3);
				}

				function isCircle(radius){
					var pixelArea = getBlackPixelsByImg(_this.image);
					var maxRad = Math.max(radius[0], radius[2], radius[4], radius[6]);

					var CircleArea = Math.PI * maxRad * maxRad;

					return CircleArea*0.9 <= pixelArea && pixelArea <= CircleArea*1.2;
				}

				function isElipse(radius){
					var pixelArea = getBlackPixelsByImg(_this.image);
					var minRad = Math.min(radius[0], radius[2], radius[4], radius[6]);
					var maxRad = Math.max(radius[0], radius[2], radius[4], radius[6]);

					var CircleArea = Math.PI * minRad * maxRad;

					return CircleArea*0.8 <= pixelArea && pixelArea <= CircleArea*1.2;
				}

				function isSquare(radius){
					var diameterX = radius[0] + radius[4];
					var diameterY = radius[2] + radius[6];
					return (diameterX*0.9) <= width && width <= (diameterX*1.1) &&
						(diameterY*0.9) <= height && height <= (diameterY*1.1) &&
						radius[1]*0.9 <= radius[0] && radius[0] <= radius[1]*1.1 &&
						radius[3]*0.9 <= radius[2] && radius[2] <= radius[3]*1.1 &&
						radius[5]*0.9 <= radius[4] && radius[4] <= radius[5]*1.1 &&
						radius[7]*0.9 <= radius[6] && radius[6] <= radius[7]*1.1 &&
						(width*0.9) <= height && height <= (width*1.1);
				}

				function isRetangle(radius){
					var diameterX = radius[0] + radius[4];
					var diameterY = radius[2] + radius[6];
					return (diameterX*0.9) <= width && width <= (diameterX*1.1) &&
						(diameterY*0.9) <= height && height <= (diameterY*1.1) &&
						radius[0]*0.9 <= radius[4] && radius[4] <= radius[0]*1.1 &&
						radius[4]*0.9 <= radius[0] && radius[0] <= radius[4]*1.1 &&
						radius[2]*0.9 <= radius[1] && radius[1] <= radius[2]*1.1 &&
						radius[6]*0.9 <= radius[5] && radius[5] <= radius[6]*1.1 &&
						((width*1.1) <= height || height <= (width*1.1));
				}

				var type = 'undefined';
				if(isTriangle(radius)){
					type = 'Triangulo';
				}else
				if(isCircle(radius)){
					type = 'Circulo';
				}else
				if(isElipse(radius)){
					type = 'Elipse';
				}else
				if(isSquare(radius)){
					type = 'Quadrado';
				}else
				if(isRetangle(radius)){
					type = 'Retangulo';
				}else
				if(isDiamond(radius)){
					type = 'Losango';
				}else
				{
					type = 'undefined';
				}

				var pixelMiddle = _this.getPixelData(xMid, yMid, objectData);

				_this.image.data[middle] = 255;
				_this.image.data[middle+1] = 0;
				_this.image.data[middle+2] = 0;
				_this.image.data[middle+3] = 255;


				object.type = type;
				object.color = {
					R: pixelMiddle[0],
					G: pixelMiddle[1],
					B: pixelMiddle[2],
				};
				return object;
			}

			this.resetImage();
			var imgDataColorFull = _this.getImageData();

			var result = _this.applyFilter('binary', 215);
			_this.image = result[0];

			var objects = [];

			var imgData = _this.getImageData();
			var width = imgData.width;
			var height = imgData.height;
			for (var i = 0; i <= imgData.data.length; i += 4){
				var y = Math.floor(i/4/width);
				var x = Math.abs(i - y * width * 4)/4;

				if(imgData.data[i] === 0){
					var object = searchBodyObject(x, y, imgData);
					if(object !== null){
						object.dataImg = createImageFromFoundedObject(object, imgDataColorFull);
						objects.push(getFeaturesByObject(object));
						// objects.push((object));
					}
				}
			}

			objects = objects.filter((data) => data.type != undefined && data.type != 'undefined');
			return objects;
			// return [getFeaturesByObject(objects[11])];
		}
	}
	return PDI;
}(jQuery));