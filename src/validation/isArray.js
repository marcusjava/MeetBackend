const isArray = (value) => {
	return Array.isArray(value) || value instanceof Array || value.constructor === Array || value.length === 0;
};

module.exports = isArray;
