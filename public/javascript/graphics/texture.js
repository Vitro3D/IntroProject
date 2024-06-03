// texture.js
// Defines a webgl texture for 3d display.

import MathExt from '../core/math-ext.js';
import DomUtils from '../util/dom-utils.js';

if (typeof document != "undefined")
	var utilCanvas = document.createElement("CANVAS");	// prevents having to declare a new canvas for each texture which the gc may not clean up.
		
export default class Texture  {
	// dataSource		url | File | base64 | ImageData | Image
	// alias				string	optional. A name used by the texture manager to refer to this texture.
	constructor (glContext, dataSource, alias) {
		this.gl = glContext;
		this.dataSource = dataSource;		// url | File | base64 string | ImageData (from canvas) | Image

		this.saveImageData = false;		// bool. If true, the pixels of the texture are stored for saving. 
		this.imageData = null;				// ImageData { data: Uint8ClampedArray, height, width }. From canvas. Contains the RGB information from the canvas for saving if requested.
					
		this.alias = alias;					// string. The identifier that uniquely identifies this texture in the TextureManager
		this.maxDimension = 16384;				// Pixels. If this is not 0, downscale the largest extent of this texture

		this.dimensions = null;				// { width, height } Pixels. The dimensions of the texture after any resizing has been done.
		this.sourceImgDimensions = null;		// { width, height } Pixels.  The dimensions of the original image passed in.
		this._hasAlpha = null;				// bool. Does the texture have alpha values? null means unknown.

		this.flipSourceY = true;			// Should the Y coordinates be flipped on render. Normally it would be unless loading from a preformatted file like glTF.
		this.tileU = false;				// Should the texture be tiled on the U axis. def=CLAMP (no tiling)
		this.tileV = false;				// Should the texture be tiled on the V axis. def=CLAMP (no tiling)
		
		this.uMax = 1.0; // If the image does not occupy the entire area (usually because it was not a power of 2 image), this is what the u and v should be clamped to.
		this.vMax = 1.0; 
		this.glTexture = null;
		this.error = false;
		this.isLoaded = false;
		this.callbacks = [];					// Function[].  Functions to callback when loaded.

		if (dataSource && dataSource.data !== undefined) {	// check for instance of ImageData. The server does not understand ImageData.
			this.imageData = this.dataSource;
			this.dimensions = { width: this.imageData.width, height: this.imageData.height };
		}
	};

	// Bind this texture to the 0 slot. Multitexturing is not yet supported.
	bind () {
		var gl = this.gl;
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
	};

	cleanup () {
		if (this.glTexture)
			this.gl.deleteTexture(this.glTexture);
		this.glTexture = null;
	}

	// If there was no context set when it was created set it here. For instance, it may not have been known when it was loaded from file.
	setContext (glContext) {
		if (this.gl == glContext)
			return;

		this.gl = glContext;
		if (!this.isLoaded) {
			if (this.imageData) {
				this._loadFromImageData();
			}
		}
	}

	// Sets if the source data should be interpreted as the top 0 (flipped) or 1 (not flipped). Normally it should be flipped.
	setFlipSourceY (flip /* bool */) {
		this.flipSourceY = flip;
	}

	// Sets if the texture repeats in the U direction if the coordinates are outside 0 and 1?
	setTileU (tile /* bool */) {
		this.tileU = tile;
		if (this.glTexture) {
			var gl = this.gl;
			gl.activeTexture(gl.TEXTURE0);	
			gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, this.tileU ? gl.REPEAT : gl.CLAMP_TO_EDGE);
		}
	}

	// Sets if the texture repeats in the V direction if the coordinates are outside 0 and 1?
	setTileV (tile /* bool */) {
		this.tileV = tile;
		if (this.glTexture) {
			var gl = this.gl;
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, this.tileV ? gl.REPEAT : gl.CLAMP_TO_EDGE);
		}
	}

	setTile (tile /* bool */) {
		this.tileU = tile;
		this.tileV = tile;
	}

	canResize () {
		return !(this.dataSource instanceof ImageData);  // can't resize from image data at this time.
	}

	setMaxDimension (max) {
		if (!this.canResize())
			return;	
		if (max == this.maxDimension || max < 0 || max > 35536)
			return;		
		
		this.maxDimension = MathExt.prevPowerOf2(max);

		// reload the texture with the new max dimension if it already exists.
		if (this.glTexture)  {
			this.cleanup();
			this.load();	
		}
	}
	
	getImageData (data) {
		return this.imageData;
	}
	
	// Allows the texture data to be saved.  Otherwise the data will exist only in a glTexture which can't be accessed directly.
	// enable		bool		opt, def=false
	enableSave (enable) {
		this.saveImageData = enable !== false;
	}

	getAspectRatio () {
		if (!this.sourceImgDimensions)
			return 1.0;		// unknown

		return this.sourceImgDimensions.width / this.sourceImgDimensions.height;
	};

	// This can be set manually or it can automatically be deduced from the image data.
	setHasAlpha () {
		return this._hasAlpha;
	};

	hasAlpha () {
		if (this._hasAlpha === null) {
			this._hasAlpha = false;	
			if (this.imageData) {
				// look at the image data.
				var pi;	// pixel index
				var everyX = 2; everyY = 2;	// don't check every pixel for performance.
				for (var y = 0; y < this.imageData.height; y += everyY) {
					for (var x = 0; x < this.imageData.width; x += everyX) {
						pi = ((this.imageData.width * y) + x) * 4; 	// four bits per pixel (rgba)
						if (this.imageData.data[pi + 3] < 255) {
							this._hasAlpha = true;
							break;
						}
					}
					if (this._hasAlpha)
						break;
				}
			}
		}
		return this._hasAlpha;
	};

	getUMax () {
		return this.uMax;
	};

	getVMax () {
		return this.vMax;
	};

	getAlias () {
		return this.alias;
	};

	setAlias (alias) {
		this.alias = alias;
	}

	isDynamic () {
	    return false;
	};

	getDimensions () {
		return this.dimensions;
	}

	getSourceImageDimensions () {
		return this.sourceImgDimensions;
	};

	// Invert the passed value from the result of convertU.
	unconvertU (uValue) {
		if (this.uMax == 1.0) return uValue;
		return uValue / this.uMax;
	}

	// Invert the passed value from the result of convertV.
	unconvertV (vValue) {
		if (this.vMax == 1.0) return vValue;
		return (vValue - (1.0 - this.vMax)) / this.vMax;
	}

	// Add a function to the list that will be called when it has been loaded.
	addCallback (callback /* function */) {
		if (this.isLoaded)
			return;		// No point anymore

		this.callbacks.push(callback);
		return;
	};
	
	// Loads the texture from this.imageData. For loading from binary data.
	_loadFromImageData () {
		if (!this.imageData || !this.gl)
			return;

		// Since this was from a saved texture we can be sure it's already a power of 2 and not too big.
		this.sourceImgDimensions = { width: this.imageData.width, height: this.imageData.height };
		this.dimensions = { width: this.sourceImgDimensions.width, height: this.sourceImgDimensions.height };

		var gl = this.gl;
		this.glTexture = gl.createTexture();
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, this.flipSourceY);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, this.tileU ? gl.REPEAT : gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, this.tileV ? gl.REPEAT : gl.CLAMP_TO_EDGE);

		utilCanvas.width = this.imageData.width;
		utilCanvas.height = this.imageData.height;
		utilCanvas.getContext('2d').putImageData(this.imageData, 0, 0);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, utilCanvas);
		this.isLoaded = true;

		for (var i = 0; i < this.callbacks.length; i++)
			this.callbacks[i](this);
	}

	// options: 
	//   dimensions 	{width, height, left, top}  pixels. Defines the dimensions of the image to use in the texture.
	//   enableSave	bool			def=false. The texture will save the data so it can be saved to disk. Otherwise it's lost in the glTexture.
	loadFromImage (image /* IMG dom element */, options)  {
		if (!options) options = {};

		if (options.enableSave)
			this.enableSave();
		
		this.sourceImgDimensions = { width: image.width, height: image.height };
		var imgDim = options.dimensions;

		if (!imgDim)
			imgDim = { width: image.width, height: image.height, left: 0, top: 0 };
								
		var sWidth = imgDim.width;					// source width
		var sHeight = imgDim.height;				// source height
		var cWidth = MathExt.nextPowerOf2(sWidth);		// canvas width
		var cHeight = MathExt.nextPowerOf2(sHeight);		// canvas height
		var scaleFactor = 1.0;			// If the image size is greater than the texture size, scale the image down.
						
		// Check to see if the image needs to be scaled because it is larger than the maximum texture size the device supports.
		var maxDim = this.gl ? this.gl.getParameter(this.gl.MAX_TEXTURE_SIZE) : 99999;
		maxDim = Math.min(maxDim, this.maxDimension);
		//maxDim = 512;		// debug - cell phones are 4096
		if (maxDim && (cWidth > maxDim || cHeight > maxDim)) {
			scaleFactor = Math.min(maxDim / cWidth, maxDim / cHeight);
			cWidth *= scaleFactor;
			cHeight *= scaleFactor;
			sWidth = Math.floor(sWidth * scaleFactor);
			sHeight = Math.floor(sHeight * scaleFactor);
			console.log("Image '" + (this.filename || this.alias) + "' has been scaled down to " + sWidth + "x" + sHeight + " from " + image.width + "x" + image.height + ".  Max Texture Size = " + maxDim);
		}

		// No need to use a canvas if the Image is power of 2 and not scaled. Also if save is enabled a canvas is required.
		// if (sHeight == cHeight && sWidth == cWidth && scaleFactor == 1 && imgDim.width == image.width && imgDim.height == image.height && !this.enableSave) {
		// 	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
		// }
		
		// Always paint the image on a canvas first then create the texture from the canvas. 
		utilCanvas.width = cWidth;
		utilCanvas.height = cHeight;
		utilCanvas.addEventListener('webglcontextlost', function(e) {	alert("Texture Context Lost!"); 	}, false);
		var context = utilCanvas.getContext('2d');

		this.uMax = sWidth / cWidth; 
		this.vMax = sHeight / cHeight;
		context.drawImage(image, imgDim.left, imgDim.top, imgDim.width, imgDim.height, 0, 0, sWidth, sHeight);	// scales the image.

		// Color the white space immediately abutting the photo the same as the adjacent pixels so it doesn't try to blend in white space.
		if (cWidth != sWidth || cHeight != sHeight) {
			var imageData = context.getImageData(0, 0, cWidth, cHeight);
			for (var x = 0; x < sWidth; x++) {
				var sPI = ((cWidth * (sHeight - 1)) + x) * 4; // pixel index of the last pixel in the column (source)
				var yEnd = Math.min(sHeight + 3, cHeight);
				for (var y = sHeight; y < yEnd; y++) {
					var dPI = (cWidth * y + x) * 4;
					for (var i = 0; i < 4; i++)
						imageData.data[dPI + i] = imageData.data[sPI + i];
				}
			}
			for (var y = 0; y < sHeight; y++) {
				var sPI = ((cWidth * y) + (sWidth - 1)) * 4; // pixel index of the last pixel in the column (source)
				var xEnd = Math.min(sWidth + 3, cWidth);
				for (var x = sWidth; x < xEnd; x++) {
					var dPI = (cWidth * y + x) * 4;
					for (var i = 0; i < 4; i++) 
						imageData.data[dPI + i] = imageData.data[sPI + i];
				}
			}
			context.putImageData(imageData, 0, 0);
		}
		if (this.saveImageData) {
			this.imageData = context.getImageData(0, 0, cWidth, cHeight);	// image data is copied.
		}

		// Take the texture from the canvas.
		var gl = this.gl;
		if (gl) {		// may be just loading/saving the texture.
			this.glTexture = gl.createTexture();
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, this.flipSourceY);
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, this.tileU ? gl.REPEAT : gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, this.tileV ? gl.REPEAT : gl.CLAMP_TO_EDGE);
			//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
			//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, utilCanvas);
		}
		
		this.dimensions = { width: cWidth, height: cHeight };
		this.isLoaded = true;

		for (var i = 0; i < this.callbacks.length; i++)
			this.callbacks[i](this);
	}

	// Loads the texture after the dataSource has already been defined. 
	// It is syncronous if the texture is defined from an Image.
	// options: 
	// 	width, height, left, top  [0.0-1.0] These values define a portion of the image to use, as a percentage.  
	//		enableSave						bool		def=false. The texture will save the data so it can be saved to disk. Otherwise it's lost in the glTexture.
	load (options, callback) {

		if (!options) options = {};

		if (options.enableSave)
			this.enableSave();

		if (callback)
			this.addCallback(callback);

		if (this.dataSource instanceof ImageData) {
			this._loadFromImageData();
			return;
		}

		if (this.dataSource instanceof Image) {
			this.loadFromImage(this.dataSource, options);
			return;
		}
		
		var self = this;
		DomUtils.loadImage(this.dataSource, 
			function (image) {
				if (!image) {
					self.error = true;
				}
				else {
					self.loadFromImage(image, options);	
				}
			}
		)
	};

	writeBinary (file /* BinaryFile */) {
		if (!this.imageData) {
			console.log("Cannot write texture - no image data. Set 'EnableSave' to true.");
			return;
		}
		
		var version = 1.2;
		file.writeVersion(version);
		file.writeString(this.alias);
		file.writeBoolean(this.hasAlpha());	// 1.1
				
		// Save the data as RGB instead of RGBA if there is no alpha.
		var data = this.imageData.data;
		if (!this.hasAlpha()) {
			var len = data.length;
			var rgbData = new Uint8Array(len / 4 * 3);
			var pos = 0;
			for (var i = 0; i < data.length; i++) {
				if ((i+1) % 4 == 0)	
					continue;	// skip the alpha value
				rgbData[pos++] = data[i];
			}
			data = rgbData;
		}

		file.writeInt(this.imageData.width);
		file.writeInt(this.imageData.height);
		file.writeIntArray(data, 1, false /* signed */);

		file.writeBoolean(this.flipSourceY);	// 1.2
		file.writeBoolean(this.tileU);			// 1.2
		file.writeBoolean(this.tileV);			// 1.2
		
	}

	static readBinary (file /* BinaryFile */, glContext) {
		var version = file.readVersion();
		if (version > 1.2) {
			console.log("Unable to read Texture version: " + version);
			return null;
		}
		var isServer = typeof(window) === 'undefined';
		
		var alias = file.readString();
		var hasAlpha = file.readBoolean();
		var width = file.readInt();
		var height = file.readInt();
		var data = file.readIntArray(1, false /* signed */);
	
		// image data
		var imageData = isServer ? { width: width, height: height, data: new Uint8Array(width * height * 4) } : 
												utilCanvas.getContext('2d').createImageData(width, height);	
		var pos = 0;
		for (var i = 0; i < data.length; i++)	{
			imageData.data[pos++] = data[i];
			if (!hasAlpha && (i % 3 == 2))
				imageData.data[pos++] = 255;	// put back the alpha we took out when the texture had no alpha.
		}

		var texture = new Texture(glContext, imageData, alias);
		texture.setHasAlpha(hasAlpha);

		if (version >= 1.2) {
			texture.flipSourceY = file.readBoolean();
			texture.tileU = file.readBoolean();
			texture.tileV = file.readBoolean();
		}

		if (!isServer)
			texture._loadFromImageData();	// note if the glContext was not passed in, it will have to be set later before it will display.

		return texture;
	}	
};
