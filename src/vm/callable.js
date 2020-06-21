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
    constructor(decl, closure, isInitializer) {
        super();
        this.decl = decl;
        this.closure = closure;
        this.isInitializer = isInitializer;
    }

    bind(instance) {
        var env = new Env(this.closure);
        env.define("this", instance);
        return new LoxFunction(this.decl, env, this.isInitializer);
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
                if (this.isInitializer) {
                    return this.closure.getAt(0, "this");
                }
                return err.value;
            } else {
                throw err;
            }
        }
        if (this.isInitializer) return this.closure.getAt(0, "this");
        return null;
    }

    toString() {
        return `<fn ${this.decl.name.lexeme}>`;
    }
}
Callable.LoxFunction = LoxFunction;

module.exports = Callable;