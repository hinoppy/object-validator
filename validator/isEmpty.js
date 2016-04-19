'use strict';

/**
 * check if the value is empty
 */
const isEmpty = (value) => {
  if (typeof value === 'undefined') {
    return true;
  }
  if (value === null) {
    return true;
  }
  return false;
};

module.exports = isEmpty;
