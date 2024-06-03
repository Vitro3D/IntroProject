// dom-utils.js
// A utility class for dom functionality


	
export default class DomUtils {
	// Load an IMG object. 
	// dataSource	url | File | string of base64 data.
	// callback: function (Image). 
	static loadImage (dataSource, callback)  {
		// Set the source of the image file.
		if (dataSource instanceof File) {	// Local files require a file reader.
			var reader = new FileReader();
			reader.onload = function (event)
			{ 
				var image = new Image();
				image.onload = function () {  if (callback) callback(this); }
				image.onerror = function () { console.log("Error loading image: " + dataSource.name); }
				image.src = event.target.result;
			};
			reader.readAsDataURL(dataSource);
		}
		else {		
			if (dataSource.length < 200) {		// URL
				var url = dataSource;			// keep for feedback 
				var image = new Image();
				image.setAttribute('crossOrigin', 'anonymous');	// Required so the 'tainted canvas' error does not appear when copying it.
				image.onload = function () {  if (callback) callback(this); }
				image.onerror = function () { console.log("Error loading image: " + url); }
				image.src = dataSource;
			}
			else {		// base64
				var image = new Image();
				image.src = dataSource;		// base64 data
				image.onload = function () {  if (callback) callback(this); }
			}
		}
	}

}