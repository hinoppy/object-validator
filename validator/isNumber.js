'use strict';

/**
 * check if the value is number
 */
const isNumber = (value) => {
  return (!isNaN(Number(value, 10)))
};

module.exports = isNumber;
