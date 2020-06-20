const Expr = require('./expr');
const Stmt = require('./stmt');
const Token = require('../token');
const TokenType = require('../token-type');
const utils = require('../utils');

class Parser {

    /**
     * 
     * @param {Token[]} tokens 
     */
    constructor(tokens) {
        this.tokens = tokens;
        this.current = 0;
    }

    /**
     * program → declaration* EOF ;
     */
    parse() {
        var stmts = [];
        while (!this.isAtEnd()) {
            stmts.push(this.declaration())
        }

        return stmts;
    }

    /**
     * declaration → classDecl
*                  | funDecl
     *             | varDecl
     *             | statement ;
     */
    declaration() {
        try {
            if (this.match(TokenType.CLASS)) return this.classDeclaration();
            if (this.match(TokenType.FUN)) return this.fun("function");
            if (this.match(TokenType.VAR)) return this.varDeclaration();

            return this.statement();
        } catch (err) {
            this.synchronize();
            return null;
        }
    }


    /**
     * classDecl   → "class" IDENTIFIER "{" function* "}" ;
     */
    classDeclaration() {
        var name = this.consume(TokenType.IDENTIFIER, "Expect class name.");
        this.consume(TokenType.LEFT_BRACE, "Expect '{' before class body.");

        var methods = [];
        while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
            methods.push(this.fun("method"));
        }

        this.consume(TokenType.RIGHT_BRACE, "Expect '}' after class body.");

        return new Stmt.Class(name, methods);
    }

    /**
     * funDecl → "fun" function ;
     * function → IDENTIFIER "(" parameters? ")" block ;
     * parameters → IDENTIFIER ( "," IDENTIFIER )* ;
     */
    fun(kind) {
        var name = this.consume(TokenType.IDENTIFIER, `Expect ${kind} name.`);

        this.consume(TokenType.LEFT_PAREN, `Expect '(' after ${kind} name.`);
        var params = [];
        if (!this.check(TokenType.RIGHT_PAREN)) {
            do {
                if (params.length >= 255) {
                    this.error(this.peek(), "Cannot have more than 255 params.");
                }
                params.push(this.consume(TokenType.IDENTIFIER, "Expect parameter name."));
            } while (this.match(TokenType.COMMA));
        }
        this.consume(TokenType.RIGHT_PAREN, `Expect ')' after parameters.`);

        this.consume(TokenType.LEFT_BRACE, `Expect '{' before ${kind} body.`);

        var body = this.block();

        return new Stmt.Function(name, params, body);
    }

    /**
     * varDecl → "var" IDENTIFIER ( "=" expression )? ";" ;
     */
    varDeclaration() {
        var name = this.consume(TokenType.IDENTIFIER, "Expect variable name.");
        var initializer = null
        if (this.match(TokenType.EQUAL)) {
            initializer = this.expression();
        }

        this.consume(TokenType.SEMICOLON, "Expect ';' after variable declaration.");
        return new Stmt.Var(name, initializer);
    }



    /**
     * statement → exprStmt
     *           | forStmt
     *           | ifStmt
     *           | printStmt
     *           | returnStmt 
     *           | whileStmt
     *           | block ;
     */
    statement() {
        if (this.match(TokenType.FOR)) return this.forStatement();
        if (this.match(TokenType.IF)) return this.ifStatement();
        if (this.match(TokenType.PRINT)) return this.printStatement();
        if (this.match(TokenType.RETURN)) return this.returnStatement();
        if (this.match(TokenType.WHILE)) return this.whileStatement();
        if (this.match(TokenType.LEFT_BRACE)) return new Stmt.Block(this.block());

        return this.expressionStatement();
    }

    /**
     * forStmt   → "for" "(" ( varDecl | exprStmt | ";" )
     *           | expression? ";"
     *           | expression? ")" statement ;
     */
    forStatement() {
        this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'for'.");
        var initializer;
        if (this.match(TokenType.SEMICOLON)) {
            initializer = null;
        } else if (this.match(TokenType.VAR)) {
            initializer = this.varDeclaration();
        } else {
            initializer = this.expressionStatement();
        }

        var condition = null;
        if (!this.check(TokenType.SEMICOLON)) {
            condition = this.expression();
        }
        this.consume(TokenType.SEMICOLON, "Expect ';' after loop condition");

        var increment = null;
        if (!this.check(TokenType.RIGHT_PAREN)) {
            increment = this.expression();
        }
        this.consume(TokenType.RIGHT_PAREN, "Expect ')' after for clauses");

        var body = this.statement();

        if (increment != null) {
            body = new Stmt.Block([body, new Stmt.Expression(increment)]);
        }

        if (condition == null) condition = new Expr.Literal(true);
        body = new Stmt.While(condition, body);

        if (initializer != null) {
            body = new Stmt.Block([initializer, body]);
        }

        return body;
    }

    /**
     * ifStmt → "if" "(" expression ")" statement ( "else" statement )? ;
     */
    ifStatement() {
        this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'if'.")
        var condition = this.expression();
        this.consume(TokenType.RIGHT_PAREN, "Expect ')' after if condition.")

        var thenBranch = this.statement();
        var elseBranch = null;

        if (this.match(TokenType.ELSE)) {
            elseBranch = this.statement();
        }

        return new Stmt.If(condition, thenBranch, elseBranch);
    }

    /**
     * printStmt → "print" expression ";" ;
     */
    printStatement() {
        var value = this.expression();
        this.consume(TokenType.SEMICOLON, "Expect ';' after value.");
        return new Stmt.Print(value);
    }

    /**
     * returnStmt → "return" expression? ";" ;
     */
    returnStatement() {
        var keyword = this.previous();

        var expr = null;
        if (!this.check(TokenType.SEMICOLON)) {
            expr = this.expression();
        }

        this.consume(TokenType.SEMICOLON, "Expect ';' after return value.");
        return new Stmt.Return(keyword, expr);
    }

    /**
     * whileStmt → "while" "(" expression ")" statement ;
     */
    whileStatement() {
        this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'while'.");
        var condition = this.expression();
        this.consume(TokenType.RIGHT_PAREN, "Expect ')' after 'while' condition.");

        var body = this.statement();

        return new Stmt.While(condition, body);
    }

    /**
     * exprStmt  → expression ";" ;
     */
    expressionStatement() {
        var expr = this.expression();
        this.consume(TokenType.SEMICOLON, "Expect ';' after expression.");
        return new Stmt.Expression(expr);
    }

    block() {
        var stmts = [];

        while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
            stmts.push(this.declaration());
        }

        this.consume(TokenType.RIGHT_BRACE, "Expect '}' after block");
        return stmts;
    }

    /**
     * expression → assignment ;
     */
    expression() {
        return this.assignment();
    }

    /**
     * assignment → IDENTIFIER "=" assignment
     *            | logic_or ;
     */
    assignment() {
        var expr = this.logic_or();

        if (this.match(TokenType.EQUAL)) {
            var equals = this.previous();
            var value = this.assignment();

            if (expr instanceof Expr.Variable) {
                var name = expr.name;
                return new Expr.Assign(name, value);
            }

            this.error(equals, "Invalid assignment target.");
        }

        return expr;
    }

    /**
     * logic_or → logic_and ( "or" logic_and )* ;
     */
    logic_or() {
        var expr = this.logic_and();

        while (this.match(TokenType.OR)) {
            var operator = this.previous();
            var right = this.logic_and();
            expr = new Expr.Logical(expr, operator, right);
        }

        return expr;
    }

    /**
     * logic_and → equality ( "and" equality )* ;
     */
    logic_and() {
        var expr = this.equality();

        while (this.match(TokenType.AND)) {
            var operator = this.previous;
            var right = this.equality();
            expr = new Expr.Logical(expr, operator, right);
        }

        return expr;
    }

    /**
     * equality → comparison ( ( "!=" | "==" ) comparison )* ;
     */
    equality() {
        var expr = this.comparison();

        while (this.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
            var operator = this.previous();
            var right = this.comparison();
            expr = new Expr.Binary(expr, operator, right);
        }

        return expr;
    }

    /**
     * comparison → addition ( ( ">" | ">=" | "<" | "<=" ) addition )* ;
     */
    comparison() {
        var expr = this.addition();

        while (this.match(TokenType.GREATER, TokenType.GREATER_EQUAL, TokenType.LESS, TokenType.LESS_EQUAL)) {
            var operator = this.previous();
            var right = this.addition();
            expr = new Expr.Binary(expr, operator, right);
        }

        return expr;
    }

    /**
     * addition → multiplication ( ( "-" | "+" ) multiplication )* ;
     */
    addition() {
        var expr = this.multiplication();

        while (this.match(TokenType.MINUS, TokenType.PLUS)) {
            var operator = this.previous();
            var right = this.multiplication();
            expr = new Expr.Binary(expr, operator, right);
        }

        return expr;
    }

    /**
     * multiplication → unary ( ( "/" | "*" ) unary )* ;
     */
    multiplication() {
        var expr = this.unary();

        while (this.match(TokenType.SLASH, TokenType.STAR)) {
            var operator = this.previous();
            var right = this.unary();
            expr = new Expr.Binary(expr, operator, right);
        }

        return expr;
    }

    /**
     * unary → ( "!" | "-" ) unary
     *       | call ;
     */
    unary() {
        if (this.match(TokenType.BANG, TokenType.MINUS)) {
            var operator = this.previous();
            var right = this.unary();
            return new Expr.Unary(operator, right);
        }

        return this.call();
    }

    /**
     * call → primary ( "(" arguments? ")" )* ;
     */
    call() {
        var expr = this.primary();

        while (true) {
            if (this.match(TokenType.LEFT_PAREN)) {
                expr = this.finishCall(expr);
            } else {
                break;
            }
        }

        return expr;
    }

    finishCall(callee) {
        var args = [];
        if (!this.check(TokenType.RIGHT_PAREN)) {
            do {
                if (args.length >= 255) {
                    this.error(this.peek(), "Cannot have more than 255 arguments.");
                }
                args.push(this.expression());
            } while (this.match(TokenType.COMMA));
        }

        var paren = this.consume(TokenType.RIGHT_PAREN, "Expect ')' after arguments.");

        return new Expr.Call(callee, paren, args);
    }
    // /**
    //  * arguments → expression ( "," expression )* ;
    //  */
    // args() {

    // }

    /**
     * primary → "true" | "false" | "nil"
     *         | NUMBER | STRING
     *         | "(" expression ")" ;
     *         | IDENTIFIER
     */
    primary() {
        if (this.match(TokenType.FALSE)) return new Expr.Literal(false);
        if (this.match(TokenType.TRUE)) return new Expr.Literal(true);
        if (this.match(TokenType.NIL)) return new Expr.Literal(null);

        if (this.match(TokenType.NUMBER, TokenType.STRING)) {
            return new Expr.Literal(this.previous().literal);
        }

        if (this.match(TokenType.IDENTIFIER)) {
            return new Expr.Variable(this.previous());
        }

        if (this.match(TokenType.LEFT_PAREN)) {
            var expr = expression();
            this.consume(TokenType.RIGHT_PAREN, "Expect ')' after expression.");
            return new Expr.Grouping(expr);
        }

        throw this.error(this.peek(), "Expect expression.");
    }

    match(...tokenTypes) {
        for (const ttype of tokenTypes) {
            if (this.check(ttype)) {
                this.advance();
                return true;
            }
        }

        return false;
    }

    check(tokenType) {
        return (this.isAtEnd() ? false : (this.peek().type == tokenType));
    }

    isAtEnd() {
        return (this.peek().type == TokenType.EOF);
    }

    advance() {
        if (!this.isAtEnd()) {
            this.current++;
        }
        return this.previous();
    }

    peek() {
        return this.tokens[this.current];
    }

    previous() {
        return this.tokens[this.current - 1];
    }

    consume(tokenType, errorMsg) {
        if (this.check(tokenType)) return this.advance();

        throw this.error(this.peek(), errorMsg)
    }

    synchronize() {
        this.advance();

        while (!this.isAtEnd()) {
            if (this.previous().type == TokenType.SEMICOLON) return;

            switch (this.peek().type) {
                case TokenType.CLASS:
                case TokenType.FUN:
                case TokenType.VAR:
                case TokenType.FOR:
                case TokenType.IF:
                case TokenType.WHILE:
                case TokenType.PRINT:
                case TokenType.RETURN:
                    return;
            }

            this.advance();
        }
    }

    error(token, msg) {
        utils.loxParseError(token, msg);
        return "ParseError";
    }

}

module.exports = Parser;