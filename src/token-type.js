const TokenType = (function () {
    var id = 0;
    function n() {
        return id++;
    }

    var types = {
        // Single-character tokens.                      
        LEFT_PAREN: n(), RIGHT_PAREN: n(), LEFT_BRACE: n(), RIGHT_BRACE: n(),
        COMMA: n(), DOT: n(), MINUS: n(), PLUS: n(), SEMICOLON: n(), SLASH: n(), STAR: n(),

        // One or two character tokens.                  
        BANG: n(), BANG_EQUAL: n(),
        EQUAL: n(), EQUAL_EQUAL: n(),
        GREATER: n(), GREATER_EQUAL: n(),
        LESS: n(), LESS_EQUAL: n(),

        // Literals.                                     
        IDENTIFIER: n(), STRING: n(), NUMBER: n(),

        // Keywords.                                     
        AND: n(), CLASS: n(), ELSE: n(), FALSE: n(), FUN: n(), FOR: n(), IF: n(), NIL: n(), OR: n(),
        PRINT: n(), RETURN: n(), SUPER: n(), THIS: n(), TRUE: n(), VAR: n(), WHILE: n(),

        EOF: n()
    }

    return types;
})();

module.exports = TokenType;