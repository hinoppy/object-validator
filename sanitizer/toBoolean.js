'use strict';

/**
 * sanitize value to boolean
 */
const toBoolean = (value) => {
  if (typeof(value) === 'string') {
    if (value === 'false') {
      return false;
    } else if (value === 'true') {
      return true;
    } else if (value === '0') {
      return false;
    } else if (value === '1') {
      return true;
    }
  }
  return Boolean(value);
};

module.exports = toBoolean;
