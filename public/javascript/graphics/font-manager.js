// font-manager.js
// Manages fonts that have been loaded.

import Font from './font.js';
import FontData from './font-data.js';

export default class FontManager {
	constructor (glContext)
	{
		this.gl = glContext;
		this.fonts = new Map();			// font name -> Font
		
		// Load all the hard coded fonts in FontData.
		for (fontName in FontData) {
			this.loadFromData(fontName, FontData[fontName].image, FontData[fontName].definition);
		}
	}

	cleanup () {
		for (font of fonts.values()) {
			var texture = font.getTexture();
			this.gl.textures.deleteTexture(texture);
		}
		this.fonts.clear();
	}

	loadFromData (alias, base64Data, xmlDefinition) {
		if (this.fonts.has(alias)) {
			console.error("Font " + fontName + " already exists!");
			return;
		}

		var font = Font.loadFromData(this.gl, base64Data, xmlDefinition);
		if (font)
			this.fonts.set(alias, font);
	}

	// Load from a file in the game-data/fonts directory. There must be a png image and an
	// xml definition file with the fontName.
	loadFromFile (alias, fileName) {
		fileName = "./game-data/fonts/" + fileName;
		if (this.fonts.has(alias)) {
			console.error("Font " + alias + " already exists!");
			return;		// don't overwrite an existing font. An object may be using it.
		}

		var font = Font.loadFromFile(this.gl, fileName)
		if (font)
			this.fonts.set(alias, font);
	}

	// Get a font by it's readable name.
	getFont (name) {
		return this.fonts.get(name);
	}

	getFonts () {
		return this.fonts.getValues();
	}

	// Retrieve the read-friendly names of all fonts.
	getFontNames () {
		return this.fonts.getKeys();
	}	
}