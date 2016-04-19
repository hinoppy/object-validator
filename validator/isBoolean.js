'use strict';

/**
 * check if the value is boolean
 */
const isBoolean = (value) => {
  if (typeof value === 'string') {
    return validator.isBoolean(value);
  } else if (!isNaN(Number(value))) {
    return (value !== 0);
  } else {
    return false;
  }
};

module.exports = isBoolean;
