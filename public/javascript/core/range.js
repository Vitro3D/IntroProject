// range.js
// General functionality defining a range. This could also be called a BBox1.
	
export default class Range {
	// value1, value2		number	opt. Add initial values to the range.
	constructor (value1, value2) {
		this.min = 1e20;
		this.max = -1e20;

		if (value1 !== undefined)
			this.add(value1);
		if (value2 !== undefined)
			this.add(value2);
	};
	
	// Set the min and max values of the range.
	// set (Range)					Set this range to the values of the passed in range.
	// set (value1, value2)		Values do not have to be in order.		
	set (value1, value2) {
		if (value1 instanceof Range) {
			this.min = value1.min;
			this.max = value1.max;
			return;
		}
		if (value1 != null)
			this.min = value1 < value2 ? value1 : value2;
		if (value2 != null)
			this.max = value2 > value1 ? value2 : value1;
	};

	// Reset the range to an invalid state.
	clear () {
		this.min = 1e20;
		this.max = -1e20;
	}

	reset () {
		this.clear();
	}

	// Returns false if values have not been added to this range.
	isValid () {
		return this.min <= this.max;
	};

	extent () {
		return this.max - this.min;
	}

	// Returns true if any of the passed range is within this range
	// contains (Range)
	// contains (min, max)
	contains (val1, val2) {
		if (!this.isValid())
			return false;
		if (val1 instanceof Range) {
			var other = val1;
			return val1.isValid() && this.max >= other.min && this.min <= other.max;	
		}
		else {
			var min = val1;
			var max = val2;
			return this.max >= min && this.min <= max;
		}
	}

	// Add a number to the range. The range will only change if the added value is outside the current range.
	add (value) {
		if (value < this.min)
			this.min = value;
		if (value > this.max)
			this.max = value;
		return this;
	};

	// Adds a series of values to the range. 
	// values		iterable container
	addArray (values) {
		if (!values)
			return this;
		for (var val of values) {
			if (val === null || val === undefined)
				continue;
			if (val < this.min)
				this.min = val;
			if (val > this.max)
				this.max = val;
		}
		return this;
	}
	
	// Reduces the range to that which is included in both ranges. If the ranges do not 
	// intersect, the range becomes invalid.
	union (other /* Range */) {
		if (!this.isValid()) {
			this.set(other);
			return;
		}
		this.min = this.min > other.min ? this.min : other.min;
		this.max = this.max < other.max ? this.max : other.max;
		return this;
	}

	toString (precision) {
		return this.min.toFixed(precision) + " - " + this.max.toFixed(precision); 
	}
	
	// Implementation of the BinaryFile interface.
	writeBinary (file /* BinaryFile */) {
		file.writeFloat(this.min);
		file.writeFloat(this.max);
		return this;
	};

	static readBinary (file /* BinaryFile */) {
		var r = new Range();
		r.min = file.readFloat();
		r.max = file.readFloat();
		return r;
	}	
}
	