const cloneDeep = require('lodash.clonedeep');

const _types = {};

const __err = (message) => {
    console.error(`JsTypes: ${message}`);
};

function Base(params) {

}

const JsTypes = {
    define(name, schema, base = Base) {
        if (!name) {
            __err(`Name parameter is empty: ${name}`);
        }
        if (_types[name]) {
            __err(`Duplicate type definition: ${name}`);
        }

        function JsRuntimeType(params) {
            base.call(this, params);

            this._state = {};

            for (let key in JsRuntimeType.prototype._schema) {
                this._state[key] = JsRuntimeType.prototype._schema[key].default || null;
            }
        }

        JsRuntimeType.prototype = Object.create(base.prototype);
        JsRuntimeType.prototype._schema = Object.assign(cloneDeep(base.prototype._schema || {}), cloneDeep(schema));

        for (let key in schema) {
            console.log('define prop', key);

            Object.defineProperty(JsRuntimeType.prototype, key, {
                get: function () {
                    console.log('getter', this);
                    return this._state[key];
                },
                set: function (val) {
                    console.log('setter', val, this);
                    this._state[key] = val;
                },
            });
        }

        _types[name] = JsRuntimeType;

        return JsRuntimeType;
    },
    extend(name, base, schema) {
        return this.define(name, schema, this.get(base));
    },
    get(name) {
        return _types[name];
    },
};

global.window.Person = JsTypes.define('Person', {
    name: {type: String, default: null},
    surname: {type: String, default: null},
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
