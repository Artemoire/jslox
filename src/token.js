const tokenMap = (function () {
    const TokenType = require('./token-type');
    var map = {};

    for (const key in TokenType) {
        if (TokenType.hasOwnProperty(key)) {
            const element = TokenType[key];
            map[element] = key;
        }
    }

    return map;
})();



class Token {
    constructor(type, lexeme, literal, line) {
        this.type = type;
        this.lexeme = lexeme;
        this.literal = literal;
        this.line = line;
    }

    toString() {
        return `[${this.type}]${tokenMap[this.type]}: '${this.lexeme}' '${this.literal}'`
    }
}

module.exports = Token;