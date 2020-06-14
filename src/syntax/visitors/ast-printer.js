const Expr = require('../expr');

class ASTPrinter extends Expr.Visitor {


    /**
     * @param {Expr} expr 
     */
    print(expr) {
        return expr.accept(this);
    }

    /**
     * @param {string} name 
     * @param  {...Expr} exprs 
     */
    parenthesize(name, ...exprs) {
        var str = "(" + name;

        for (const expr of exprs) {
            str += " ";
            str += expr.accept(this);
        }

        str += ")";

        return str;
    }

    /**
     * @param {Expr.Binary} expr 
     */
    visitBinaryExpr(expr) {
        return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
    }

    /**
     * @param {Expr.Grouping} expr 
     */
    visitGroupingExpr(expr) {
        return this.parenthesize("group", expr.expression)
    }

    /**
     * @param {Expr.Literal} expr 
     */
    visitLiteralExpr(expr) {
        if (expr.value == null) return "nil";
        return expr.value;
    }

    /**
     * @param {Expr.Unary} expr 
     */
    visitUnaryExpr(expr) {
        return this.parenthesize(expr.operator.lexeme, expr.right);
    }

}

module.exports = ASTPrinter;