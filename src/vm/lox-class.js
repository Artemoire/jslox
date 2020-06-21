const Callable = require('./callable');
const Token = require('../token');

class LoxClass extends Callable {

    /**
     * @param {string} name 
     * @param {any} methods
     */
    constructor(name, methods) {
        super();
        this.name = name;
        this.methods = methods;
    }

    /**
     * @param {string} name 
     */
    findMethod(name) {
        if(typeof this.methods[name] != "undefined") {
            return this.methods[name];
        }

        return null;
    }

    call(interpreter, args) {
        var instance = new LoxInstance(this);
        return instance;
    }

    arity() {
        return 0;
    }

    toString() {
        return this.name;
    }

}

class LoxInstance {

    /**
     * @param {LoxClass} klass 
     */
    constructor(klass) {
        this.klass = klass;
        this.fields = {};
    }

    toString() {
        return `${this.klass} instance`;
    }

    /**
     * @param {Token} name 
     */
    get(name) {
        if (typeof this.fields[name.lexeme] != 'undefined') {
            return this.fields[name.lexeme];
        }

        var method = this.klass.findMethod(name.lexeme);
        if (method != null) return method.bind(this); 

        throw { token: name, msg: `Undefined property '${name.lexeme}'.` };
    }

    /**
     * @param {Token} name 
     * @param {any} value 
     */
    set(name, value) {
        this.fields[name.lexeme] = value;
    }
}

LoxClass.Instance = LoxInstance;

module.exports = LoxClass;