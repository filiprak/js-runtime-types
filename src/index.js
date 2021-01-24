'use strict';

const cloneDeep = require('lodash.clonedeep');
const isArray = require('lodash.isarray');
const isFunction = require('lodash.isfunction');

const __err = (message) => {
    console.error(`[JsTypes error]: ${message}`);
};

function toConstructorTypeStr(fn) {
    if (fn) {
        if (fn.prototype && fn.prototype.__jstypename__) {
            return fn.prototype.__jstypename__;
        } else {
            const match = fn.toString().match(/^\s*function (\w+)/);
            return match ? match[1] : '';
        }
    } else {
        return '';
    }
}

function toConstructorTypesStr(types) {
    if (!isArray(types)) {
        types = [types];
    }
    return types.map(toConstructorTypeStr).join(', ');
}

function toTypeStr(value) {
    if (value && value.__jstypename__) {
        return value.__jstypename__;
    } else {
        return Object.prototype.toString.call(value).slice(8, -1);
    }
}

function isDefined(val) {
    if (typeof val === 'number') {
        return !isNaN(val) && isFinite(val);
    } else {
        return val !== null && val !== undefined;
    }
}

function getDefaultValue(descriptor) {
    if (isDefined(descriptor.default)) {
        if (isFunction(descriptor.default)) {
            return descriptor.default();
        } else {
            return descriptor.default;
        }
    } else {
        return null;
    }
}

const JsTypes = {
    define(name, schema, Super) {

        Super = Super || JsTypes.Base || Object;

        if (!name) {
            __err(`Name parameter is empty: ${name}`);
            return;
        }
        if (!Super.prototype) {
            __err(`Unable to extend object with no prototype defined.`);
            return;
        }
        if (JsTypes[name]) {
            __err(`Duplicate type definition: ${name}`);
            return;
        }

        function JsTypeConstructor(params) {
            params = params || {};

            if (!this || this === JsTypes || this === globalThis) {
                __err(`${name}: Invalid object construction attempt. Please use "new" keyword syntax.`);
                return;
            }

            Super.call(this, params);

            Object.defineProperty(this, '__jstype__', {
                enumerable: true,
                configurable: true,
                value: {},
            });

            const __schema__ = JsTypeConstructor.prototype.__schema__;

            for (let key in __schema__) {
                const descriptor = __schema__[key];
                if (!isFunction(descriptor)) {
                    if (params[key] !== undefined) {
                        this[key] = params[key];
                    } else {
                        this[key] = getDefaultValue(descriptor);
                    }
                }
            }
        }

        JsTypeConstructor.prototype = Object.create(Super.prototype);
        Object.defineProperty(JsTypeConstructor.prototype, '__schema__', {
            enumerable: false,
            configurable: false,
            value: Object.assign(cloneDeep(Super.prototype.__schema__ || {}), cloneDeep(schema)),
        });
        Object.defineProperty(JsTypeConstructor.prototype, 'constructor', {
            enumerable: false,
            configurable: false,
            value: JsTypeConstructor,
        });
        Object.defineProperty(JsTypeConstructor.prototype, '__jstypename__', {
            enumerable: false,
            configurable: false,
            value: name,
        });

        for (let key in schema) {
            const descriptor = schema[key];

            if (isFunction(descriptor)) {
                JsTypeConstructor.prototype[key] = descriptor;

            } else if (typeof descriptor === 'object') {
                Object.defineProperty(JsTypeConstructor.prototype, key, {
                    enumerable: true,
                    configurable: true,
                    get: function () {
                        return this.__jstype__[key];
                    },
                    set: function (val) {
                        if (!JsTypes.validate(val, descriptor)) {
                            __err(`${name}: Type check for property "${key}" failed. Expected ${toConstructorTypesStr(descriptor.type)}, got ${toTypeStr(val)}`);
                        }
                        this.__jstype__[key] = val;
                    },
                });
            }
        }

        JsTypeConstructor.extend = function (name, schema) {
            return JsTypes.extend(name, JsTypeConstructor, schema);
        };

        JsTypes[name] = JsTypeConstructor;

        return JsTypeConstructor;
    },
    extend(name, Super, schema) {
        return this.define(name, schema, Super);
    },
    validate: function (value, descriptor) {
        const types = isArray(descriptor.type) ? descriptor.type : [descriptor.type];

        if (isDefined(value)) {
            let is_valid = true;

            for (let i = 0; i < types.length; i++) {
                const type = types[i];

                if (type) {
                    switch (type) {
                        case String:
                            is_valid = typeof value === 'string';
                            break;
                        case Number:
                            is_valid = typeof value === 'number';
                            break;
                        case Boolean:
                            is_valid = typeof value === 'boolean';
                            break;
                        case Array:
                            is_valid = isArray(value);
                            break;
                        default:
                            is_valid = value instanceof type;
                    }
                }
                if (!is_valid) {
                    return false;
                }
            }
            return true;

        } else if (value === null) {
            return true;
        } else {
            return false;
        }
    },
};

JsTypes.define('Base', {
    _base_1: {type: String, default: null},
    _base_2: {type: String, default: null},

    keys: function () {
        return Object.keys(this.__jstype__ || {});
    },
    clone: function () {
        return cloneDeep(this);
    },
});

global.window.Person = JsTypes.define('Person', {
    name: {type: String, default: null},
    surname: {type: String, default: null},

    getFullname: function () {
        return [this.name, this.surname].join(' ').trim();
    },
});
global.window.User = JsTypes.Person.extend('User', {
    id: {type: String, default: null},
    promotion: {type: String, default: null},
});
global.window.Car = JsTypes.define('Car', {
    tires: {type: Array, default: null},
    user: {
        type: JsTypes.Person, default: function () {
            return new JsTypes.User();
        },
    },
    models: {type: Array, default: []},
    anon: {
        type: JsTypes.define('Anonymus', {
            an1: {type: String, default: null},
            an2: {type: String, default: null},
        }),
        default: null,
    },
});

global.window.u = new User();
global.window.u1 = new User();
global.window.u2 = new User();
global.window.c = new Car();
global.window.p = new Person();

module.exports = global.window.JsTypes = JsTypes;
