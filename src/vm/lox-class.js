const Callable = require('./callable');

class LoxClass extends Callable {

    /**
     * @param {string} name 
     */
    constructor(name) {
        super();
        this.name = name;
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
    }

    toString() {
        return `${this.klass} instance`;
    }

}

module.exports = LoxClass;