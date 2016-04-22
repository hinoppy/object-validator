'use strict';

const validator = require('./validator');
const sanitizer = require('./sanitizer');
const ValidatorError = require('./errors/ValidatorError');


/**
 * function to create error object used when missing required parameter
 */
const NullViolation = (expectedType) => {
  return {
    error: 'NullViolation',
    expectedType: expectedType
  };
};

/**
 * function to create error object used when type mismatch
 */
const TypeMismatch = (value, expectedType) => {
  return {
    error: 'TypeMismatch',
    value: value,
    expectedType: expectedType
  };
};


/**
 * types for property definition
 */
const type = {
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  ARRAY: 'array',
  OBJECT: 'object'
};


/**
 * check if the value is empty
 */
const _checkEmpty = function(value, definition) {
  if (!definition.allowNull && validator.isEmpty(value)) {
    return NullViolation(definition.type);
  }
  switch(definition.type) {
    case type.ARRAY:
      if (!Array.isArray(value)) {
        return;
      }
      const errors = value.map((element, index) => {
        const error = _checkEmpty(element, definition.element);
        if (!definition.element.allowNull) {
          if (error) {
            return {
              index: index,
              info: error
            };
          }
        }
      });
      _removeEmptyElement(errors);
      if (errors.length <= 0 ) {
        return;
      }
      return {
        errors
      };
      break;
  }
};


/**
 * check if the value is type of the type specified
 */
const _checkType = (value, definition) => {
  if (definition.allowNull && validator.isEmpty(value)) {
    return;
  }
  if (definition.type === type.STRING) {
    if (!validator.isString(value)) {
      return TypeMismatch(value, definition.type);
    }
  }
  else if (definition.type === type.NUMBER) {
    if (!validator.isNumber(value)) {
      return TypeMismatch(value, definition.type);
    }
  }
  else if (definition.type === type.BOOLEAN) {
    if (!validator.isBoolean(value)) {
      return TypeMismatch(value, definition.type);
    }
  } else if (definition.type === type.ARRAY) {
    if (!Array.isArray(value)) {
      return TypeMismatch(value, definition.type);
    }
    const errors = value.map((element, index) => {
      const error = _checkType(element, definition.element);
      if (error) {
        return {
          index: index,
          info: error
        };
      }
    });
    _removeEmptyElement(errors);
    if (errors.length > 0) {
      return {
        errors
      };
    }
  } else if (definition.type === type.OBJECT) {
    if (typeof value !== 'object') {
      return TypeMismatch(value, definition.type);
    }
  }
};

/**
 * sanitize value to specified type
 */
const _sanitize = (value, parameter) => {
  if (validator.isEmpty(value)) {
    return value;
  }
  if (parameter.type === type.STRING) {
    return value;
  } else if (parameter.type === type.NUMBER) {
    return sanitizer.toNumber(value);
  } else if (parameter.type === type.BOOLEAN) {
    return sanitizer.toBoolean(value);
  } else if (parameter.type === type.ARRAY) {
    return value.map((element) => {
      const sanitizedElement = _sanitize(element, parameter.element);
      return sanitizedElement;
    });
  }
};

/**
 * remove empty element from array
 */
const _removeEmptyElement = function(array) {
    for (let i = 0; i < array.length; i++) {
      const element = array[i];
      if (validator.isEmpty(element)) {
        array.splice(i, 1);
        i--;
      }
    }
};

const _arrayify = (value) => {
  if (Array.isArray(value)) {
    return value;
  }
  return [value];
};



/**
 * validte object
 */
const _validate = (object, definitions, callback) => {
  let validationErrors = {};
  let validated = {};
  Object.keys(definitions).forEach((key) => {
    const definition = definitions[key];
    let value = object[key];

    if (typeof definition.type !== 'string') {
      throw TypeError(`'${key}' must have type`);
      return;
    }

    if (definition.type == type.ARRAY) {
      // arrayify value if type is array
      value = _arrayify(value);

      // remove empty element from array if needed
      if (definition.removeEmptyElement) {
        _removeEmptyElement(value);
      }
    }

    // check empty
    let emptyError = _checkEmpty(value, definition);
    if (emptyError) {
      validationErrors[key] = emptyError;
      return;
    }

    // check type
    let typeError = _checkType(value, definition);
    if (typeError) {
      validationErrors[key] = typeError;
      return;
    }

    // validate properties if type is `object`
    if (definition.type == type.OBJECT) {
      _validate(value, definition.properties, (errors, object) => {
        if (errors) {
          validationErrors[key] = errors;
        }
        validated[key] = object;
      });
    } else {
      // sanitize value before check rules
      value = _sanitize(value, definition);

      // overwrite object by sanitized value
      if (value) {
        validated[key] = value;
      }
    }
  });

  // check if there is any error
  const anyError = (Object.keys(validationErrors).length > 0);
  if (anyError) {
    callback(validationErrors, validated);
    return;
  }
  callback(null, validated);
};


module.exports = {
  type: type,
  validate: (object, definitions) => {
    let validated;
    _validate(object, definitions, (errors, object) => {
      if (errors) {
        throw new ValidatorError(errors);
      }
      validated = object;
    });
    return validated;
  }
};
