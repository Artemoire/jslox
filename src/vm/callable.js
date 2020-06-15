const Stmt = require("../syntax/stmt");
const Env = require("./env");
const Interpreter = require("../syntax/visitors/interpreter");
const Token = require("../token");
const Ex = require("../vm/exs");

class Callable {

    arity() {

    }

    call(interpreter, args) {

    }

}

class NativeClock extends Callable {
    arity() {
        return 0;
    }

    call(interpreter, args) {
        return process.uptime();
    }

    toString() {
        return "<native fn>";
    }
}
Callable.NativeClock = NativeClock;

class LoxFunction extends Callable {

    /**
     * @param {Stmt.Function} decl 
     * @param {Env} closure
     */
    constructor(decl, closure) {
        super();
        this.decl = decl;
        this.closure = closure;
    }

    arity() {
        return this.decl.params.length;
    }

    /**
     * 
     * @param {Interpreter} interpreter 
     * @param {any[]} args 
     */
    call(interpreter, args) {
        // TODO
        var env = new Env(this.closure);
        for (var i = 0; i < args.length; ++i) {
            env.define(this.decl.params[i].lexeme, args[i]);
        }

        try {
            interpreter.executeBlock(this.decl.body, env);
        } catch (err) {
            if (err instanceof Ex.Return) {
                return err.value;
            } else {
                throw err;
            }
        }
        return null;
    }

    toString() {
        return `<fn ${this.decl.name.lexeme}>`;
    }
}
Callable.LoxFunction = LoxFunction;

module.exports = Callable;