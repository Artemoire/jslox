const Token = require('../token');

class Expr {

	accept(visitor) { }

}

class Assign extends Expr {

	/**
	 * @param {Token} name
	 * @param {Expr} value
	 */
	constructor(name, value) {
		super();
		this.name = name;
		this.value = value;
	}

	/**
	 * @param {Visitor} visitor
	 */
	accept(visitor) {
		return visitor.visitAssignExpr(this);
	}

}

class Binary extends Expr {

	/**
	 * @param {Expr} left
	 * @param {Token} operator
	 * @param {Expr} right
	 */
	constructor(left, operator, right) {
		super();
		this.left = left;
		this.operator = operator;
		this.right = right;
	}

	/**
	 * @param {Visitor} visitor
	 */
	accept(visitor) {
		return visitor.visitBinaryExpr(this);
	}

}

class Call extends Expr {

	/**
	 * @param {Expr} callee
	 * @param {Token} paren
	 * @param {Expr[]} args
	 */
	constructor(callee, paren, args) {
		super();
		this.callee = callee;
		this.paren = paren;
		this.args = args;
	}

	/**
	 * @param {Visitor} visitor
	 */
	accept(visitor) {
		return visitor.visitCallExpr(this);
	}

}

class Grouping extends Expr {

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
		return visitor.visitGroupingExpr(this);
	}

}

class Literal extends Expr {

	/**
	 * @param {any} value
	 */
	constructor(value) {
		super();
		this.value = value;
	}

	/**
	 * @param {Visitor} visitor
	 */
	accept(visitor) {
		return visitor.visitLiteralExpr(this);
	}

}

class Logical extends Expr {

	/**
	 * @param {Expr} left
	 * @param {Token} operator
	 * @param {Expr} right
	 */
	constructor(left, operator, right) {
		super();
		this.left = left;
		this.operator = operator;
		this.right = right;
	}

	/**
	 * @param {Visitor} visitor
	 */
	accept(visitor) {
		return visitor.visitLogicalExpr(this);
	}

}

class Unary extends Expr {

	/**
	 * @param {Token} operator
	 * @param {Expr} right
	 */
	constructor(operator, right) {
		super();
		this.operator = operator;
		this.right = right;
	}

	/**
	 * @param {Visitor} visitor
	 */
	accept(visitor) {
		return visitor.visitUnaryExpr(this);
	}

}

class Variable extends Expr {

	/**
	 * @param {Token} name
	 */
	constructor(name) {
		super();
		this.name = name;
	}

	/**
	 * @param {Visitor} visitor
	 */
	accept(visitor) {
		return visitor.visitVariableExpr(this);
	}

}

Expr.Assign = Assign;
Expr.Binary = Binary;
Expr.Call = Call;
Expr.Grouping = Grouping;
Expr.Literal = Literal;
Expr.Logical = Logical;
Expr.Unary = Unary;
Expr.Variable = Variable;

class Visitor {

	visitAssignExpr(expr) {
	}

	visitBinaryExpr(expr) {
	}

	visitCallExpr(expr) {
	}

	visitGroupingExpr(expr) {
	}

	visitLiteralExpr(expr) {
	}

	visitLogicalExpr(expr) {
	}

	visitUnaryExpr(expr) {
	}

	visitVariableExpr(expr) {
	}

}

Expr.Visitor = Visitor;

module.exports = Expr;