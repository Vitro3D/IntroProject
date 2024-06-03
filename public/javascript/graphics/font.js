// font.js
// Defines a font from a bitmap and xml definition. Static fonts are defined in fonts.js.
// Used for displaying text in webgl.

// Defines single letter glyph in the image.
class Letter  {
	constructor() {
		this.charCode = 0;	
		this.pixelWidth = 0;		// Width of the glyph in pixels.
		this.pixelHeight = 0;	// Height of the glyph in pixels
		this.xOffset = 0;			// Pixels to move before start.  Sometimes negative.
		this.xAdvance = 0;		// Pixels the next char should be moved over from this one.
		this.yOffset = 0;			// Pixels to offset the y from the top of the line.

		// Texture coordinates of the glyph in the font image (0-1).
		this.left = 0;		
		this.right = 0;
		this.top = 0;
		this.bottom = 0;
	}
}
  	
// Font can be set by passing in a filename that is the base name of 2 files, a png and an xml.
export default class Font {
	constructor () {
		this.isLoaded = false;
		this.isError = false;	// An error has occured parsing or loading the font.
		
		this.size = 0;				// the y size of each glyph, in pixels.
		this.base = 0;				// The base y level (the line on the paper)
		this.isBold = false;		// It is defined in the xml definition as a bold font.
		this.isItalic = false;	// It is defined in the xml definttion as an italic font.
		// Is this font defined with an outline?  Outline fonts are 32 bit and place the outline data in the 'blue' channel and the glyph in the 'red' channel.
      // Standard fonts are 8 bit and store the glyph in the 'alpha' channel.
		this.isOutlineFont = false;  

		this.texture = null;		// Texture. The webgl texture associated with this font. Used for displaying in the 3d world.
		this.dictionary = new Map();	// char code => Letter. Map of all letter definitions derived from the xml file.
	};

	getTexture (texture) {
		return this.texture;
	};

	setTexture (texture /* Texture */) {
		this.texture = texture;
	};

	// Letter. Returns the definition of a single letter.
	getLetter (character) {
		return this.dictionary.get(character.charCodeAt(0));
	};

	// Processes the data in the passed document object which is from the parsed xml file.
	_initDictionary (xmlData) {
		var parser = new DOMParser();			// an xml parser
		var data = parser.parseFromString(xmlData, "text/xml");

		var font = data.childNodes[0];		// Parent tag of all.
		var textureWidth = 0;			// Width of the bitmap the texture is located on.
		var textureHeight = 0;			// Height of the bitmap the texture is located on.

		for (var i = 0; i < font.childNodes.length; i++) {
			var node = font.childNodes[i];
			if (node.nodeName == "info") {
				//this.formalName = node.getAttributeNode("face").nodeValue;
				this.size = Number(node.getAttributeNode("size").nodeValue);
				this.isBold = node.getAttributeNode("bold").nodeValue == "1";
				this.isItalic = node.getAttributeNode("italic").nodeValue == "1";
			}
			else if (node.nodeName == "common") {
				this.base = Number(node.getAttributeNode("base").nodeValue);
				textureWidth = Number(node.getAttributeNode("scaleW").nodeValue);
				textureHeight = Number(node.getAttributeNode("scaleH").nodeValue);
				var blueChannel = node.getAttributeNode("blueChnl").nodeValue;
				this.isOutlineFont = blueChannel == "1";           // '1' is the value for 'outline'. 
			}
			else if (node.nodeName == "chars") {
				for (var j = 0; j < node.childNodes.length; j++) {
					var charNode = node.childNodes[j];
					if (charNode.nodeName == "char") {
						// Dimensions of the glyph
						var pixelX = Number(charNode.getAttributeNode("x").nodeValue);		// left edge of glyph
						var pixelY = Number(charNode.getAttributeNode("y").nodeValue);		// top of glyph
						var pixelWidth = Number(charNode.getAttributeNode("width").nodeValue);
						var pixelHeight = Number(charNode.getAttributeNode("height").nodeValue);
						pixelY = textureHeight - pixelY;		// Invert Y. 

						// Definition of each LETTER
						var letter = new Letter();
						letter.charCode = Number(charNode.getAttributeNode("id").nodeValue);
						letter.left = pixelX / textureWidth;
						letter.right = (pixelX + pixelWidth) / textureWidth;
						letter.top = pixelY / textureHeight;
						letter.bottom = (pixelY - pixelHeight) / textureHeight;
						letter.pixelWidth = pixelWidth;
						letter.pixelHeight = pixelHeight;
						letter.xOffset = Number(charNode.getAttributeNode("xoffset").nodeValue);
						letter.xAdvance = Number(charNode.getAttributeNode("xadvance").nodeValue);
						letter.yOffset = Number(charNode.getAttributeNode("yoffset").nodeValue);
						
						this.dictionary.set(letter.charCode, letter);
					}
				}
			}
		}
		this.isLoaded = true;
	}
	
	// Load a font from base64 image data and an xml definition, such as defined in fonts.js.
	static loadFromData (glContext, base64Data /* string */, xmlData /* string */) {
		var font = new Font();
		font.texture = glContext.textures.load(base64Data);
		font._initDictionary(xmlData);
		return font;
	};

	// Load a font from the passed location. eg. 'game-data/fonts/Gill'.
	// The two files must exist at the location:  [fontName].png and [fontName].xml.
	static loadFromFile (glContext, url) {
		var font = new Font();
				
		var textureUrl = url + ".png";
		var definitionUrl = url + ".xml";
		font.texture = glContext.textures.load(textureUrl);

		var request = new XMLHttpRequest();
		request.open("GET", definitionUrl, true /* async */);
		request.onload = function ()		{ 
			if (request.status !== 200) {
				console.error("Error getting font definition '" + definitionUrl + "': " + request.status + ", " + request.statusText);
				return;
			}
			font._initDictionary(request.responseText);
		}
		request.onerror = function (e) { console.log("Error getting font definition for " + url + ": " + e.message); }
		request.send();

		return font;
	};
}
