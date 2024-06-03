// color.js
// - General functionality for an RGBA color.


import MathExt from './math-ext.js';
import BinaryFile from '../util/binary-file.js';
	
export default class Color {

	// Color components are always stored internally with values between 0-1. This is standard for WebGL.
	// Passed in values are floats from 0.0-1.0 OR 0-255 and will automatically convert to 0-1. (note 1,1,1 is ambigious and will be white.)
	constructor (r, g, b, a) {
		if (r === undefined) {	// no initializer
			this.r = 0.0;
			this.g = 0.0;
			this.b = 0.0;
			this.a = 1.0;
		}
		else if (r.r !== undefined) {	// Color
			this.r = r.r;
			this.g = r.g;
			this.b = r.b;
			this.a = r.a;
		}
		else {
			this.set(r, g, b, a);	
		}
	}

	// Return a copy of this Color.
	clone () {
		return new Color(this.r, this.g, this.b, this.a);
	};

	// Returns true if the colors are the same within a small tolerance.
	// equals (Color)
	// equals (r, g, b, a) rgba must be between 0-1.
	equals (rOrColor, g, b, a) {
		if (rOrColor.r !== undefined) {
			return MathExt.close(this.r, rOrColor.r, 0.002) &&
					MathExt.close(this.g, rOrColor.g, 0.002) &&
					MathExt.close(this.b, rOrColor.b, 0.002) &&
					MathExt.close(this.a, rOrColor.a, 0.002);
		}
		else {
			return MathExt.close(this.r, rOrColor, 0.002) &&
					MathExt.close(this.g, g, 0.002) &&
					MathExt.close(this.b, b, 0.002) &&
					MathExt.close(this.a, a, 0.002);
		}
	}
		
	// set (Color)
	// set (r, g, b, a)		rgba between 0-1
	// set (r, g, b, a)		rgba between 0-255. Note a color like 0,1,0 is interpreted as green.
	set (rOrColor, g, b, a) {
		if (rOrColor === undefined)
			return;

		if (rOrColor.r !== undefined) {
			this.r = rOrColor.r;
			this.g = rOrColor.g;
			this.b = rOrColor.b;
			this.a = rOrColor.a;
			return;
		}

		// Allow rgb values to be between 0 - 255
		if (rOrColor > 1.0 || g > 1.0 || b > 1.0 || a > 1.0) {
			this.r = rOrColor / 255;
			this.g = g / 255;
			this.b = b / 255;
			this.a = (a == undefined) ? 1.0 : a / 255;
		}
		else {
			this.r = rOrColor;
			this.g = g;
			this.b = b;
			this.a = (a == undefined) ? 1.0 : a;
		}
	}

	// Set the alpha value. If the value > 1, it will be divided by 255.
	setAlpha (alpha) {
		if (alpha > 1.0)
			this.a = alpha / 255;
		else
			this.a = alpha;
	}

	// Returns alpha value from 0-1.
	getAlpha () {
		return this.a;
	}
	
	// Returns an object containing the hue/saturation/value of the color.
	// h: 0-360, s: 0-100, v: 0-100
	getHSV () {
		var min = Math.min(this.r, Math.min(this.g, this.b));
		var max = Math.max(this.r, Math.max(this.g, this.b));
		var delta = max - min;

		var h = (delta == 0.0) ? 0.0 :
				  max == this.r ? ((this.g - this.b) / delta) + ((this.g < this.b) ? 6 : 0) :
				  max == this.g ? ((this.b - this.r) / delta) + 2 :
				  ((this.r - this.g) / delta) + 4;		// min is blue
		var s = delta == 0 ? 0.0 : delta / max;
		var v = max;

		return { h: h / 6 * 360, s: s * 100, v: v * 100};

	};

	// h is hue between 0 and 360 is the color angle on the color wheel.
	// s is saturation between 0 and 100
	// v is value (brightness) between 0 and 100.
	// https://www.rapidtables.com/convert/color/hsv-to-rgb.html
	setHSV (h, s, v)  {
		if (h < 0)
			h = 360 - (Math.abs(h) % 360);
		else if (h > 360)
			h = h % 360;

		s = Math.min(100, Math.max(0, s));
		v = Math.min(100, Math.max(0, v));

		s /= 100.0;
		v /= 100.0;
		var c = v * s;
		var x = c * (1.0 - Math.abs((h / 60) % 2 - 1.0));
		var m = v - c;

		if (h < 60)  		{  this.r = c;  this.g = x;  this.b = 0; }
		else if (h < 120) {	this.r = x;	 this.g = c;  this.b = 0; }
		else if (h < 180) {	this.r = 0;  this.g = c;  this.b = x; }
		else if (h < 240) {	this.r = 0;	 this.g = x;  this.b = c; }
		else if (h < 300) {	this.r = x;	 this.g = 0;  this.b = c; }
		else  				{	this.r = c;	 this.g = 0;  this.b = x; }

		this.r += m;
		this.g += m;
		this.b += m;
	};

	// Returns a new color with the same rgb values but with the passed alpha.
	withAlpha (alpha) {
		var c = this.clone();
		c.setAlpha(alpha);
		return c;
	}

	getHue () {
		return this.getHSV().h
	}

	setHue (h /* 0 - 255 */) {
		var hsv = this.getHSV();
		this.setHSV(h, hsv.s, hsv.v);
	}

	getSaturation () {
		return this.getHSV().s;
	}

	setSaturation (s /* 0-100 */) {
		var hsv = this.getHSV();
		this.setHSV(hsv.h, s, hsv.v);
	}

	getBrightness () {
		return this.getHSV().v;
	}

	setBrightness (v /* 0-100 */) {
		var hsv = this.getHSV();
		this.setHSV(hsv.h, hsv.s, v);
	}

	mult (factor) {
		this.r *= factor;
		this.g *= factor;
		this.b *= factor;
		return this;
	}

	multc (factor) {
		var result = this.clone();
		return result.mult(factor);
	}
	
	// Brightness is between 0 and 100 and is proportional to the highest rgb value.  
	// That value will be changed by the 'amount' and the others changed proportionally.
	adjustBrightness (amount /* -100 to 100 */) {
		var brightness = getBrightness();
		amount = Math.min(amount, 100 - brightness);
		amount = Math.max(amount, -brightness);

		if (brightness == 0.0) {
			this.set(amount, amount, amount);
			return;
		}
		else {
			// adjust the values proportionally
			var factor = (brightness + amount) / brightness;
			this.r += factor;
			this.g += factor;
			this.b *= factor;
		}
	}

	// Return this color as a rounded value, generally for ascii export.
	rounded () {
		return new Color(MathExt.round(this.r, 3), MathExt.round(this.g, 3), MathExt.round(this.b, 3), MathExt.round(this.a, 3));
	};

	// returns	Color		The result of the interpolation between color1 and color2
	// color1	Color		The color when param is 0.0
	// color2	Color		The color when param is 1.0
	static interpolate (color1, color2, param) {
		var result = new Color();
		param = Math.min(1, Math.max(0, param));
		result.set(color1.r * (1.0 - param) + color2.r * param,
					  color1.g * (1.0 - param) + color2.g * param,
					  color1.b * (1.0 - param) + color2.b * param);
		return result;
	}

	// Return a string representing a color used in CSS. 
	// asHex		bool		opt, def=false. true returns in the form of "#RRGGBB[AA]". false returns "rgb[a](R, G, B, [A])"
	toHtml (asHex) {
		if (asHex) {
			var r = Number(Math.floor(this.r * 255)).toString(16);
			var g = Number(Math.floor(this.g * 255)).toString(16);
			var b = Number(Math.floor(this.b * 255)).toString(16);
			var str = "#" + (r.length == 1 ? "0" + r : r) + 
								(g.length == 1 ? "0" + g : g) + 
								(b.length == 1 ? "0" + b : b);
			
			if (this.a != 1.0) {
				var a = Number(Math.floor(this.a * 255)).toString(16);
				str += a.length == 1 ? "0" + a: a;
			}
			return str;
		}

		else {  // return the rgba value
			if (this.a == 1.0) {
				return "rgb(" + Math.floor(this.r * 255) + "," +
									Math.floor(this.g * 255) + "," +
									Math.floor(this.b * 255) + ")";
			}
			else {
				return "rgba(" + Math.floor(this.r * 255) + "," +
									Math.floor(this.g * 255) + "," +
									Math.floor(this.b * 255) + "," +
									this.a + ")";		// alpha is between 0 and 1, while the others are between 0 and 255.
			}
		}
	};
	
	// returns string. Utility for creates a css color string ("#ffaa80") from rgb values.
	static toHtml (r, g, b) {
		_color.set(r, g, b);
		return _color.toHtml(true /* asHex */);
	}	

	// Sets the color from the passed css format string (eg #FFAA55). Note 'rgb()' is not supported.
	fromHtml (str) {
		var r = parseInt(str.substring(1, 3), 16);
		var g = parseInt(str.substring(3, 5), 16);
		var b = parseInt(str.substring(5, 7), 16);
		var a = 255;
		if (str.length > 7)
			a = parseInt(str.substring(7), 16);
		this.set(r, g, b, a);
	};

	static fromHtml (str) {
		var c = new Color();
		c.fromHtml(str);
		return c;
	};

	
	toString () {
		return "r: " + (this.r * 255).toFixed(1) + "," +
				 " g: " + (this.g * 255).toFixed(1) + "," +
				 " b: " + (this.b * 255).toFixed(1);
	};

	// Generate a random color.
	static random () {
		var c = new Color(Math.random(), Math.random(), Math.random());
		return c;
	}
	
	// A common blank color used to clear the buffers or an image.
	static get ClearColor() { return _clearColor }; 

	/* -- I/O --------------------------------- */

	writeBinary (file /* BinaryFile */) {
		file.writeInt(Math.round(this.r * 255), 1, false);
		file.writeInt(Math.round(this.g * 255), 1, false);
		file.writeInt(Math.round(this.b * 255), 1, false);
		file.writeInt(Math.round(this.a * 255), 1, false);
		return this;
	};

	readBinary (file /* BinaryFile */) {
		this.r = file.readInt(1, false) / 255;
		this.g = file.readInt(1, false) / 255;
		this.b = file.readInt(1, false) / 255;
		this.a = file.readInt(1, false) / 255;
	}

	static readBinary (file /* BinaryFile */) {
		var c = new Color();
		c.r = file.readInt(1, false) / 255;
		c.g = file.readInt(1, false) / 255;
		c.b = file.readInt(1, false) / 255;
		c.a = file.readInt(1, false) / 255;
		return c;
	}
}
		
BinaryFile.registerType(Color, BinaryFile._COLOR);

var _clearColor = new Color(0, 0, 0, 0);
var _color = new Color();

	
