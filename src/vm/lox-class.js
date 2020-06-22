const Callable = require('./callable');
const Token = require('../token');

class LoxClass extends Callable {


    
    /**
     * @param {string} name 
     * @param {LoxClass} superclass 
     * @param {any[]} methods 
     */
    constructor(name, superclass, methods) {
        super();
        this.superclass = superclass;
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

        if (this.superclass != null) {
            return this.superclass.findMethod(name);
        }

        return null;
    }

    call(interpreter, args) {
        var instance = new LoxInstance(this);

        var init = this.findMethod("init");
        if  (init != null) {
            init.bind(instance).call(interpreter, args);
        }

        return instance;
    }

    arity() {
        var init = this.findMethod("init");
        if(init != null) {
            return init.arity();
        }
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