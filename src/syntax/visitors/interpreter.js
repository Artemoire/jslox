const Expr = require("../expr");
const Stmt = require("../stmt");
const TokenType = require("../../token-type");
const utils = require("../../utils");
const Env = require("../../vm/env");
const Ex = require("../../vm/exs");
const Callable = require("../../vm/callable");
const LoxClass = require("../../vm/lox-class");
const { LoxFunction } = require("../../vm/callable");

class Interpreter {

    constructor() {
        this.globals = new Env();
        this.locals = new WeakMap();
        this.env = this.globals;

        this.globals.define("clock", new Callable.NativeClock());
    }

    /**
     * 
     * @param {Stmt[]} stmts
     */
    interpret(stmts) {
        try {
            for (const stmt of stmts) {
                this.execute(stmt);
            }
        } catch (err) {
            utils.loxRuntimeError(err);
        }
    }

    stringify(value) {
        if (value == null) return "nil";
        return value.toString();
    }

    /**
     * @param {Stmt} stmt 
     */
    execute(stmt) {
        stmt.accept(this);
    }

    /**
     * @param {Expr} expr 
     * @param {number} depth 
     */
    resolve(expr, depth) {
        this.locals.set(expr, depth);
    }

    /**
     * @param {Stmt.Block} stmt 
     */
    visitBlockStmt(stmt) {
        this.executeBlock(stmt.statements, new Env(this.env));
        return null;
    }

    /**
     * @param {Stmt.Class} stmt 
     */
    visitClassStmt(stmt) {
        var superclass = null;
        if (stmt.superclass != null) {
            superclass = this.evaluate(stmt.superclass);
            if  (!(superclass instanceof LoxClass)) {
                throw { token: stmt.superclass.name, msg: "Superclass must be a class." };
            }
        }

        this.env.define(stmt.name.lexeme, null);

        if (stmt.superclass != null){
            this.env = new Env(this.env);
            this.env.define("super", superclass);
        }

        var methods = {};
        for(var method of stmt.methods) {
            var fun = new LoxFunction(method, this.env, method.name == "init");
            methods[method.name.lexeme] = fun;
        }

        var klass = new LoxClass(stmt.name.lexeme, superclass, methods);
        if (superclass != null) {
            this.env = this.env.enclosing;
        }
        this.env.assign(stmt.name, klass);
        return null;
    }

    /**
     * @param {Stmt[]} stmts 
     * @param {Env} env 
     */
    executeBlock(stmts, env) {
        var prev = this.env;
        try {
            this.env = env;
            for (var stmt of stmts) {
                this.execute(stmt);
            }
        } finally {
            this.env = prev;
        }
    }

    /**
     * @param {Expr} expr 
     */
    evaluate(expr) {
        return expr.accept(this);
    }

    isTruthy(obj) {
        if (obj == null) return false;
        if (typeof obj == "boolean") return obj;

        return true;
    }

    isEqual(a, b) {
        if (a == null && b == null) return true;
        if (a == null) return false;

        return a == b;
    }

    /**
     * @param {Expr.Binary} expr 
     */
    visitBinaryExpr(expr) {
        var left = this.evaluate(expr.left);
        var right = this.evaluate(expr.right);

        switch (expr.operator.type) {
            case TokenType.GREATER:
                this.checkNumberOperands(expr.operator, left, right);
                return left > right;
            case TokenType.GREATER_EQUAL:
                this.checkNumberOperands(expr.operator, left, right);
                return left >= right;
            case TokenType.LESS:
                this.checkNumberOperands(expr.operator, left, right);
                return left < right;
            case TokenType.LESS_EQUAL:
                this.checkNumberOperands(expr.operator, left, right);
                return left <= right;
            case TokenType.MINUS:
                this.checkNumberOperands(expr.operator, left, right);
                return left - right;
            case TokenType.PLUS:
                if (typeof left == "number" && typeof right == "number") {
                    return left + right;
                }
                if (typeof left == "string" && typeof right == "string") {
                    return left + right;
                }
                if (typeof left == "string" && typeof right == "number") {
                    return left + right;
                }
                throw { token: expr.operator, msg: "Operands must be two numbers or two strings." };
            case TokenType.SLASH:
                this.checkNumberOperands(expr.operator, left, right);
                return left / right;
            case TokenType.STAR:
                this.checkNumberOperands(expr.operator, left, right);
                return left * right;
            case TokenType.BANG_EQUAL: return !this.isEqual(left, right);
            case TokenType.EQUAL_EQUAL: return this.isEqual(left, right);
        }

        // Unreachable
        return null;
    }

    /**
     * @param {Expr.Grouping} expr 
     */
    visitGroupingExpr(expr) {
        return this.evaluate(expr.expression)
    }

    /**
     * @param {Expr.Literal} expr 
     */
    visitLiteralExpr(expr) {
        return expr.value;
    }

    /**
     * @param {Expr.Unary} expr 
     */
    visitUnaryExpr(expr) {
        var right = this.evaluate(expr.right);

        switch (expr.operator.type) {
            case TokenType.BANG:
                return !this.isTruthy(right);
            case TokenType.MINUS:
                this.checkNumberOperand(expr.operator, right);
                return -right;
            default:
                break;
        }

        // Unreachable
        return null;
    }

    /**
     * @param {Expr.Variable} expr 
     */
    visitVariableExpr(expr) {
        return this.lookUpVariable(expr.name, expr);
    }

    /**
     * @param {Token} name 
     * @param {Expr} expr 
     */
    lookUpVariable(name, expr) {
        var dist = this.locals.get(expr);
        if (typeof dist != "undefined") {
            return this.env.getAt(dist, name.lexeme);
        } else {
            return this.globals.get(name);
        }
    }

    /**
     * @param {Expr.Logical} expr 
     */
    visitLogicalExpr(expr) {
        var left = this.evaluate(expr.left);

        if (expr.operator.type == TokenType.OR) {
            if (this.isTruthy(left)) return left;
        } else {
            if (!this.isTruthy(left)) return left;
        }

        return this.evaluate(expr.right);
    }

    /**
     * @param {Expr.Set} expr 
     */
    visitSetExpr(expr) {
        var obj = this.evaluate(expr.object);

        if (obj instanceof LoxClass.Instance) {
            var value = this.evaluate(expr.value);
            obj.set(expr.name, value);
            return value;
        }
        
        throw { token: expr.name, msg: `Only instances have fields.` };            
    }

    visitSuperExpr(expr) {
        var dist = this.locals.get(expr);
        var superclass = this.env.getAt(dist, "super");
        var obj = this.env.getAt(dist - 1, "this");

        var method = superclass.findMethod(expr.method.lexeme);
        if (method == null) {
            throw { token: expr.method, msg: `Undefined property '${expr.method.lexeme}'.` };
        }
        return method.bind(obj);
    }

    visitThisExpr(expr) {
        return this.lookUpVariable(expr.keyword, expr);
    }

    /**
     * @param {Expr.Call} expr 
     */
    visitCallExpr(expr) {
        var callee = this.evaluate(expr.callee);

        var args = [];
        for (const arg of expr.args) {
            args.push(this.evaluate(arg));
        }

        if (!(callee instanceof Callable)) {
            throw { token: expr.paren, msg: "Can only call functions and classes." };
        }

        if (args.length != callee.arity()) {
            throw { token: expr.paren, msg: `Expected ${callee.arity()} arguments but got ${args.length}.` };
        }

        return callee.call(this, args);
    }

    /**
     * @param {Expr.Get} expr 
     */
    visitGetExpr(expr) {
        var obj = this.evaluate(expr.object);
        if (obj instanceof LoxClass.Instance) {
            return obj.get(expr.name);
        }

        throw { token: expr.name, msg: `Only instances have properties` };
    }

    checkNumberOperand(operator, op) {
        if (typeof op == "number") return;

        throw { token: operator, msg: "Operand must be a number." };
    }

    checkNumberOperands(operator, left, right) {
        if (typeof left == "number" && typeof right == "number") return;
        throw { token: operator, msg: "Operands must be numbers." };
    }

    /**
     * @param {Stmt.Expression} stmt 
     */
    visitExpressionStmt(stmt) {
        this.evaluate(stmt.expression);
        return null;
    }

    /**
     * @param {Stmt.If} stmt 
     */
    visitIfStmt(stmt) {
        if (this.isTruthy(this.evaluate(stmt.condition))) {
            this.execute(stmt.thenBranch);
        } else if (stmt.elseBranch != null) {
            this.execute(stmt.elseBranch);
        }
        return null;
    }

    /**
     * @param {Stmt.Print} stmt 
     */
    visitPrintStmt(stmt) {
        var value = this.evaluate(stmt.expression);
        console.log(this.stringify(value));
        return null;
    }

    /**
     * @param {Stmt.Var} stmt 
     */
    visitVarStmt(stmt) {
        var value = null;
        if (stmt.initializer != null) {
            value = this.evaluate(stmt.initializer);
        }

        this.env.define(stmt.name.lexeme, value);
        return null;
    }

    /**
     * @param {Stmt.While} stmt 
     */
    visitWhileStmt(stmt) {
        while (this.isTruthy(this.evaluate(stmt.condition))) {
            this.execute(stmt.body);
        }

        return null;
    }

    /**
     * @param {Stmt.Function} stmt 
     */
    visitFunctionStmt(stmt) {
        var fun = new Callable.LoxFunction(stmt, this.env, false);
        this.env.define(stmt.name.lexeme, fun);
        return null;
    }

    /**
     * @param {Stmt.Return} stmt 
     */
    visitReturnStmt(stmt) {
        var value = null;
        if (stmt.value != null) {
            value = this.evaluate(stmt.value);
        }

        throw new Ex.Return(value);
    }

    /**
     * @param {Expr.Assign} expr 
     */
    visitAssignExpr(expr) {
        var value = this.evaluate(expr.value);

        var dist = this.locals.get(expr);
        if (typeof dist != "undefined") {
            this.env.assignAt(dist, expr.name, value);
        } else {
            this.globals.assign(expr.name, value);
        }

        return value;
    }


}

module.exports = Interpreter;