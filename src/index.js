'use strict';

const cloneDeep = require('lodash.clonedeep');

const _types = {};

const __err = (message) => {
    console.error(`JsTypes: ${message}`);
};

function isFunction(val) {
    return typeof val === 'function';
}

const JsTypes = {
    define(name, schema, Super) {

        Super = Super || this.get('Base') || Object;

        if (!name) {
            __err(`Name parameter is empty: ${name}`);
        }
        if (_types[name]) {
            __err(`Duplicate type definition: ${name}`);
        }

        function JsTypeConstructor(params) {
            params = params || {};

            Super.call(this, params);

            Object.defineProperty(this, '__jstype__', {
                enumerable: true,
                configurable: true,
                value: {},
            });

            const __schema__ = JsTypeConstructor.prototype.__schema__;

            for (let key in __schema__) {
                if (!isFunction(__schema__[key])) {
                    if (params[key] !== undefined) {
                        this.__jstype__[key] = params[key];
                    } else {
                        this.__jstype__[key] = __schema__[key].default || null;
                    }
                }
            }
        }

        JsTypeConstructor.prototype = Object.create(Super.prototype);
        JsTypeConstructor.prototype.constructor = JsTypeConstructor;

        Object.defineProperty(JsTypeConstructor.prototype, '__schema__', {
            enumerable: false,
            configurable: false,
            value: Object.assign(cloneDeep(Super.prototype.__schema__ || {}), cloneDeep(schema)),
        });

        for (let key in schema) {
            const prop = schema[key];

            if (isFunction(prop)) {
                JsTypeConstructor.prototype[key] = prop;

            } else if (typeof prop === 'object') {
                Object.defineProperty(JsTypeConstructor.prototype, key, {
                    enumerable: true,
                    configurable: true,
                    get: function () {
                        return this.__jstype__[key];
                    },
                    set: function (val) {
                        this.__jstype__[key] = val;
                    },
                });
            }
        }

        _types[name] = JsTypeConstructor;

        return JsTypeConstructor;
    },
    extend(name, base, schema) {
        return this.define(name, schema, this.get(base));
    },
    get(name) {
        return _types[name];
    },
};

JsTypes.define('Base', {
    _base_1: {type: String, default: 111},
    _base_2: {type: String, default: 222},

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
global.window.User = JsTypes.extend('User', 'Person', {
    id: {type: String, default: null},
    promotion: {type: String, default: null},
});
global.window.Car = JsTypes.define('Car', {
    tires: {type: Array, default: []},
});

global.window.u = new User();
global.window.u1 = new User();
global.window.u2 = new User();
global.window.c = new Car();
global.window.p = new Person();

module.exports = global.window.JsTypes = JsTypes;
