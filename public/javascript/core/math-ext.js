// math-ext.js
// - An extension of the standard Javascript Math library.


export default class MathExt {

	static radToDeg (rad) { return rad * 57.2957795; }
	static degToRad (deg) { return deg / 57.2957795; }
	
	// returns true if a and b are within tol.
	static close (a, b, tol) {
		return Math.abs(a - b) <= (tol ? tol : 0.001);
	}
	
	/**
	 * Round a number to a specific number of digits. eg.(1.2345, 2) = 1.23
	 * @param 	{ number } 	a			Number to round.
	 * @param 	{ int }		digits	Number of positions after the decimal to round to. -2=to nearest 100.
	 * @return 	{ number }  
	 */
	static round (a, digits) {
		var x = Math.pow(10, digits);
		a = Math.round(a * x);
		return a / x;
	}

	/**
	// [0-1]. Passed in a value 0-1, will return the value on the ease-in, ease-out curve.
	// https://www.wolframalpha.com/input/?i=plot+t%5E2%283-2t%29+from+t%3D0+to+1
	*/
	static bezier (val) {
		return val * val * (3 - 2 * val);
	}

	// Find the next power of 2 that is the same or higher than the passed value.
	static nextPowerOf2 (num) {
		if (num <= 0)
			return 0;
		var n = 1;
		while (n < num)
			n *= 2;
		return n;
	}

	// Find the next power of 2 that is the same or lower than the passed value.
	static prevPowerOf2 (num) {
		if (num <= 0)
			return 0;
		var n = 1;
		while (n * 2 <= num) 
			n *= 2;
		return n;
	}

	// x		The log to use. 
	// y		The number. eg. baseLog(2, 8) = 4
	static baseLog (x, y) {
		return Math.log(y) / Math.log(x);
	}
};
