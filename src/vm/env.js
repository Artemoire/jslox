const Token = require('../token');

class Env {

    constructor(enclosing) {
        /** @type {Env} */
        this.enclosing = enclosing || null;
        this.values = {};
    }

    define(name, value) {
        this.values[name] = value;
    }


    /**
     * @param {Token} name 
     */
    get(name) {
        if (typeof this.values[name.lexeme] != "undefined") {
            return this.values[name.lexeme];
        }

        if (this.enclosing != null) return this.enclosing.get(name);

        throw { token: name, msg: `Undefined variable '${name.lexeme}'.` }
    }

    /**
     * @param {Token} name 
     * @param {*} value 
     */
    assign(name, value) {
        if (typeof this.values[name.lexeme] != "undefined") {
            this.values[name.lexeme] = value;
            return;
        }

        if (this.enclosing != null) {
            this.enclosing.assign(name, value);
            return;
        }

        throw { token: name, msg: `Undefined variable '${name.lexeme}'.` }
    }

}

module.exports = Env;