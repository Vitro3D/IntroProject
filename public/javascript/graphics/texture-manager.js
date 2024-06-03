// texture-manager.js
// Manages loaded textures used for graphics.

import Texture from './texture.js';
import DomUtils from '../util/dom-utils.js';
	
export default class TextureManager {

	constructor (glContext) { 
		this.gl = glContext;	
		this.textures = {};     // Map of alias to 'Texture' objects.
		
		this.inited = false;		
		this.onInitFuncs = [];	// list of functions to call when the manager has been initialized.
		this.nextIndex = 1;
	}

	init (glContext) {
		this.gl = glContext;
		for (var i = 0; i < this.onInitFuncs.length; i++)
			this.onInitFuncs[i]();
		this.inited = true;
	}

	// Add a callback to be called when the manager is initialized with init().  Textures cannot be loaded
	// until initialization, so it's useful to know when that happens.
	onInit (callback /* function */) {
		if (this.inited)
			callback();
		this.onInitFuncs.push(callback);
	}

	getTexture (alias /* or filename */) {         // returns Texture object
		if (alias === null)
			return null;
		if (this.textures.hasOwnProperty(alias))
			return this.textures[alias];
		return this.getTextureByFilename(alias);
	}

	getTextureByFilename (filename) {
		for (prop in this.texutres) {
			if (this.textures.hasOwnProperty(prop)) {
				if (this.textures[prop].filename = filename)
					return this.textures[prop];
			}
		}
		return null;
	}

	hasTexture (alias) {
		var texture = this.getTexture(alias);
		return !!texture;
	}

	// Load the image.  If the image is too large for the devices texture capabilities it will be split into tiles
	// of the maximum dimension supported.
	// Callback is passed the created Texture objects which have the dimensions defined within them.
	loadLarge (filename /* or File object */, alias, callback) {
		
		var self = this;
		DomUtils.loadImage(filename, function (image) {
			if (!image) {
				if (callback)
					callback(null);
				return;
			}

			var gl = self.gl;
			var maxDim = gl.getParameter(gl.MAX_TEXTURE_SIZE);
			//maxDim = 4096;		// cell phones are all 4096
			var tileSize = maxDim;

			// If the image is greater than 2x the max texture size, we'll probably run out of texture memory so 
			// will cap the size.  The texture will be downscaled when it is created.
			if (image.width > maxDim * 2 || image.height > maxDim * 2)
				tileSize = maxDim * 2;		
							
			var newTextures = [];	// Texture[]
			var cols = Math.ceil(image.width / tileSize);
			var rows = Math.ceil(image.height / tileSize);
			var dims = [];		// { width, height, left, top }
			for (var i = 0; i < cols; i++) {
				for (var j = 0; j < rows; j++) {
					// Tile with the maximum sized texture we can.
					var tileAlias = alias + "_" + i + "_" + j;
					var options = {};
					options.dimensions = {  left:  i * tileSize, 
													top:	 j * tileSize,
													width: Math.min(image.width - (i * tileSize), tileSize),
													height: Math.min(image.height - (j * tileSize), tileSize) };
					self.textures[tileAlias] = new Texture(gl, filename, tileAlias);
					self.textures[tileAlias].loadFromImage(image, options);
					newTextures.push(self.textures[tileAlias]);
				}
			}
			if (callback) {
				callback(newTextures);
				//alert(self.textures.length);
			}
		});
	}

	// Add the passed texture to the manager.  Returns false if no more textures can be stored.
	// Returns existing texture if a texture with the alias already exists.
	// dataSource		url | File | base64 string | PixelArray (from canvas)
	// alias				string					Opt. The name that will be used to reference this texture.
	// callback 		function (texture) 	called when the texture has finished loading
	// options: 
	//  width, height, left, top 	0.0-1.0  Specifies the dimensions of the image to place into the texture.
	//  maxDimension: 				int 		Specifies the maximum size of the texture. Texture will be scaled down if it is larger.
	//	 overwrite 						bool 		def=false. Overwrite an existing texture with this name. Otherwise it will immediately return the existing texture by that name.
	//  enableSave						bool		def=false. Allows the texture to be saved later. Otherwise the pixel information is lost to the glTexture and cannot be saved later.
	//  tileX							bool		def=false. Tile the texture in the X/U direction. Default is coords are clamped at 0 and 1.
	//  tileY							bool		def=false. Tile the texture in the Y/V direction. Default is coords are clamped at 0 and 1.
	load (dataSource, alias, callback, options) {
		if (!dataSource)
			return null;
		
		if (!options) options = {};

		if (!alias)
			alias = 'noname-' + this.nextIndex++;

		if (this.textures[alias] != null && !options.overwrite) {
			//console.log("Texture with alias " + alias + " already exists");
			return this.textures[alias];		// Texture with this alias already exists.
		}
		this.textures[alias] = new Texture(this.gl, dataSource, alias);
		if (options.maxDimension)
			this.textures[alias].setMaxDimension(options.maxDimension);
		if (options.enableSave)
			this.textures[alias].enableSave(options.enableSave);
		if (options.tileX)
			this.textures[alias].setTileU(true);
		if (options.tileY)
			this.textures[alias].setTileV(true);

		if (callback)
			this.textures[alias].addCallback(callback);
		this.textures[alias].load(options);		// Loads asynchronously.
		return this.textures[alias];
	}
			
	// Call this every redraw frame so dynamic textures are updated properly.
	onRedraw () {
		// Update the dynamic textures, if necessary.
		var needsRedraw = false;
		for (var i = 0; i < this.dynamicTextures.length; i++) {
			if (this.dynamicTextures[i].needsRefresh) {
				this.dynamicTextures[i].refresh();
				needsRedraw = true;
			}
		}
		return needsRedraw;
	}

	deleteTexture (aliasOrTexture /* string || Texture */) {
		var texture;
		if (aliasOrTexture instanceof Texture) 
			texture = aliasOrTexture;
		else		
			texture = this.getTexture(aliasOrTexture);	// It's an alias
		if (!texture)
			return;	 // Does not exist.

		var pos = this.dynamicTextures.indexOf(texture);
		if (pos >= 0)
			this.dynamicTextures.splice(pos, 1);

		this.gl.deleteTexture(texture.glTexture);
		delete this.textures[texture.alias];
	}

	deleteAll () {
		for (var alias in this.textures) {
			if (this.textures.hasOwnProperty(alias))
				deleteTexture(this.textures[alias]);
		}
	}
};