'use strict';

// --------------------
// class
// public
// --------------------
class ValidatorError extends Error {
  constructor(info) {
    super('Invalid values');
    this.name = this.constructor.name;
    this.info = info;
    if (typeof(Error.captureStackTrace === 'function')) {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = (new Error(message)).stack;
    }
  }
}


// --------------------
// exports
// public
// --------------------
module.exports = ValidatorError;
