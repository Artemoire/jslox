const Interpreter = require('./interpreter');
const utils = require('../../utils');
const { THIS } = require('../../token-type');

class Resolver {

    /**
     * @param {Interpreter} interpreter 
     */
    constructor(interpreter) {
        this.interpreter = interpreter;
        this.scopes = [];
        this.currentScopeKind = "global";
    }

    visitBlockStmt(stmt) {
        this.beginScope();
        this.resolveStmts(stmt.statements);
        this.endScope();
    }

    visitClassStmt(stmt) {
        this.declare(stmt.name);
        this.define(stmt.name);

        this.beginScope();
        this.scopes[this.scopes.length - 1]["this"] = true;

        for(var method of stmt.methods) {
            this.resolveFunction(method, "method");
        }

        this.endScope();
        
        return null;
    }

    visitVarStmt(stmt) {
        this.declare(stmt.name);
        if (stmt.initializer != null) {
            this.resolve(stmt.initializer);
        }
        this.define(stmt.name);
        return null;
    }

    visitWhileStmt(stmt) {
        this.resolve(stmt.condition);
        this.resolve(stmt.body);
        return null;
    }

    visitFunctionStmt(stmt) {
        this.declare(stmt.name);
        this.define(stmt.name);

        this.resolveFunction(stmt, "fun");
        return null;
    }

    visitIfStmt(stmt) {
        this.resolve(stmt.condition);
        this.resolve(stmt.thenBranch);
        if (stmt.elseBranch != null) this.resolve(stmt.elseBranch);
        return null;
    }

    visitPrintStmt(stmt) {
        this.resolve(stmt.expression);
        return null;
    }

    visitReturnStmt(stmt) {
        if (this.currentScopeKind == "global") {
            utils.loxParseError(stmt.keyword, "Cannot return from top-level code.");
        }

        if (stmt.value != null) this.resolve(stmt.value);

        return null;
    }

    visitExpressionStmt(stmt) {
        this.resolve(stmt.expression);
        return null;
    }

    visitVariableExpr(expr) {
        if (this.scopes.length != 0 && this.scopes[this.scopes.length - 1][expr.name.lexeme] == false) {
            utils.loxParseError(expr.name, "Cannot read local variable in its own initializer.");
        }

        this.resolveLocal(expr, expr.name);
        return null;
    }

    visitAssignExpr(expr) {
        this.resolve(expr.value);
        this.resolveLocal(expr, expr.name);
        return null;
    }

    visitBinaryExpr(expr) {
        this.resolve(expr.left);
        this.resolve(expr.right);
        return null;
    }

    visitCallExpr(expr) {
        this.resolve(expr.callee);

        for (const arg of expr.args) {
            this.resolve(arg);
        }

        return null;
    }

    visitGetExpr(expr) {
        this.resolve(expr.object);
        return null;
    }

    visitGroupingExpr(expr) {
        this.resolve(expr.expression);
        return null;
    }

    visitLiteralExpr(expr) {
        return null;
    }

    visitLogicalExpr(expr) {
        this.resolve(expr.left);
        this.resolve(expr.right);
        return null;
    }

    visitSetExpr(expr) {
        this.resolve(expr.value)
        this.resolve(expr.object);
        return null;
    }

    visitThisExpr(expr) {
        this.resolveLocal(expr, expr.keyword);
        return null;
    }

    visitUnaryExpr(expr) {
        this.resolve(expr.right);
        return null;
    }

    beginScope() {
        this.scopes.push({});
    }

    endScope() {
        this.scopes.pop();
    }

    resolveStmts(stmts) {
        for (var stmt of stmts) {
            this.resolve(stmt);
        }
    }

    resolve(expr) {
        expr.accept(this);
    }

    declare(name) {
        if (this.scopes.length == 0) return;
        if (typeof this.scopes[this.scopes.length - 1][name.lexeme] != "undefined") {
            utils.loxParseError(name, "Variable with this name already declared in this scope.");
        }
        this.scopes[this.scopes.length - 1][name.lexeme] = false;
    }

    define(name) {
        if (this.scopes.length == 0) return;
        this.scopes[this.scopes.length - 1][name.lexeme] = true;
    }

    resolveLocal(expr, name) {
        for (var i = this.scopes.length - 1; i >= 0; --i) {
            if (typeof this.scopes[i][name.lexeme] != "undefined") {
                this.interpreter.resolve(expr, this.scopes.length - 1 - i);
                return;
            }
        }
    }

    resolveFunction(fun, scopeKind) {
        const enclosingScopeKind = this.currentScopeKind;
        this.currentScopeKind = scopeKind;

        this.beginScope();
        for (var param of fun.params) {
            this.declare(param);
            this.define(param);
        }

        this.resolveStmts(fun.body);
        this.endScope();
        this.currentScopeKind = enclosingScopeKind;
    }

}

module.exports = Resolver;