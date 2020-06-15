const Expr = require("./expr")
const Token = require('../token');

class Stmt {

	accept(visitor) { }

}

class Block extends Stmt {

	/**
	 * @param {Stmt[]} statements
	 */
	constructor(statements) {
		super();
		this.statements = statements;
	}

	/**
	 * @param {Visitor} visitor
	 */
	accept(visitor) {
		return visitor.visitBlockStmt(this);
	}

}

class Expression extends Stmt {

	/**
	 * @param {Expr} expression
	 */
	constructor(expression) {
		super();
		this.expression = expression;
	}

	/**
	 * @param {Visitor} visitor
	 */
	accept(visitor) {
		return visitor.visitExpressionStmt(this);
	}

}

class Function extends Stmt {

	/**
	 * @param {Token} name
	 * @param {Token[]} params
	 * @param {Stmt[]} body
	 */
	constructor(name, params, body) {
		super();
		this.name = name;
		this.params = params;
		this.body = body;
	}

	/**
	 * @param {Visitor} visitor
	 */
	accept(visitor) {
		return visitor.visitFunctionStmt(this);
	}

}

class If extends Stmt {

	/**
	 * @param {Expr} condition
	 * @param {Stmt} thenBranch
	 * @param {Stmt} elseBranch
	 */
	constructor(condition, thenBranch, elseBranch) {
		super();
		this.condition = condition;
		this.thenBranch = thenBranch;
		this.elseBranch = elseBranch;
	}

	/**
	 * @param {Visitor} visitor
	 */
	accept(visitor) {
		return visitor.visitIfStmt(this);
	}

}

class Print extends Stmt {

	/**
	 * @param {Expr} expression
	 */
	constructor(expression) {
		super();
		this.expression = expression;
	}

	/**
	 * @param {Visitor} visitor
	 */
	accept(visitor) {
		return visitor.visitPrintStmt(this);
	}

}

class Return extends Stmt {

	/**
	 * @param {Token} keyword
	 * @param {Expr} value
	 */
	constructor(keyword, value) {
		super();
		this.keyword = keyword;
		this.value = value;
	}

	/**
	 * @param {Visitor} visitor
	 */
	accept(visitor) {
		return visitor.visitReturnStmt(this);
	}

}

class Var extends Stmt {

	/**
	 * @param {Token} name
	 * @param {Expr} initializer
	 */
	constructor(name, initializer) {
		super();
		this.name = name;
		this.initializer = initializer;
	}

	/**
	 * @param {Visitor} visitor
	 */
	accept(visitor) {
		return visitor.visitVarStmt(this);
	}

}

class While extends Stmt {

	/**
	 * @param {Expr} condition
	 * @param {Stmt} body
	 */
	constructor(condition, body) {
		super();
		this.condition = condition;
		this.body = body;
	}

	/**
	 * @param {Visitor} visitor
	 */
	accept(visitor) {
		return visitor.visitWhileStmt(this);
	}

}

Stmt.Block = Block;
Stmt.Expression = Expression;
Stmt.Function = Function;
Stmt.If = If;
Stmt.Print = Print;
Stmt.Return = Return;
Stmt.Var = Var;
Stmt.While = While;

class Visitor {

	visitBlockStmt(stmt) {
	}

	visitExpressionStmt(stmt) {
	}

	visitFunctionStmt(stmt) {
	}

	visitIfStmt(stmt) {
	}

	visitPrintStmt(stmt) {
	}

	visitReturnStmt(stmt) {
	}

	visitVarStmt(stmt) {
	}

	visitWhileStmt(stmt) {
	}

}

Stmt.Visitor = Visitor;

module.exports = Stmt;