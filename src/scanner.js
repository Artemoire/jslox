const TokenType = require('./token-type');
const Token = require('./token');
const utils = require('./utils');

const keywords = {
    "and": TokenType.AND,
    "class": TokenType.CLASS,
    "else": TokenType.ELSE,
    "false": TokenType.FALSE,
    "for": TokenType.FOR,
    "fun": TokenType.FUN,
    "if": TokenType.IF,
    "nil": TokenType.NIL,
    "or": TokenType.OR,
    "print": TokenType.PRINT,
    "return": TokenType.RETURN,
    "super": TokenType.SUPER,
    "this": TokenType.THIS,
    "true": TokenType.TRUE,
    "var": TokenType.VAR,
    "while": TokenType.WHILE
}

class Scanner {

    constructor(source) {
        /**@type {Token[]} */
        this.tokens = [];
        /**@type {String} */
        this.source = source;
        this.start = 0;
        this.current = 0;
        this.line = 1;
    }

    scanTokens() {
        while (!this.isAtEnd()) {
            this.start = this.current;
            this.scanToken()
        }

        this.tokens.push(new Token(TokenType.EOF, "", null, this.line));
        return this.tokens;
    }

    scanToken() {
        var c = this.advance();
        switch (c) {
            case '(': this.addToken(TokenType.LEFT_PAREN); break;
            case ')': this.addToken(TokenType.RIGHT_PAREN); break;
            case '{': this.addToken(TokenType.LEFT_BRACE); break;
            case '}': this.addToken(TokenType.RIGHT_BRACE); break;
            case ',': this.addToken(TokenType.COMMA); break;
            case '.': this.addToken(TokenType.DOT); break;
            case '-': this.addToken(TokenType.MINUS); break;
            case '+': this.addToken(TokenType.PLUS); break;
            case ';': this.addToken(TokenType.SEMICOLON); break;
            case '*': this.addToken(TokenType.STAR); break;
            case '!': this.addToken(this.match('=') ? TokenType.BANG_EQUAL : TokenType.BANG); break;
            case '=': this.addToken(this.match('=') ? TokenType.EQUAL_EQUAL : TokenType.EQUAL); break;
            case '<': this.addToken(this.match('=') ? TokenType.LESS_EQUAL : TokenType.LESS); break;
            case '>': this.addToken(this.match('=') ? TokenType.GREATER_EQUAL : TokenType.GREATER); break;
            case '/':
                if (this.match('/')) {
                    // A comment goes until the end of the line.                
                    while (this.peek() != '\n' && !this.isAtEnd()) this.advance();
                } else {
                    this.addToken(TokenType.SLASH);
                }
                break;
            case ' ':
            case '\r': // Ignore whitespace.
            case '\t': break;
            case '\n': this.line++; break;
            case '"': this.string(); break;

            default:
                if (this.isDigit(c)) {
                    this.number();
                } else if (this.isAlpha(c)) {
                    this.identifier();
                } else {
                    utils.loxError(this.line, "Unexpected character.");
                }
                break;
        }
    }

    advance() {
        return this.source[this.current++];
    }

    match(expected) {
        if (this.isAtEnd()) return false;
        if (this.source[this.current] != expected) return false;

        this.current++;
        return true;
    }

    peek() {
        if (this.isAtEnd()) return '\0';
        return this.source[this.current];
    }

    peekNext() {
        if ((this.current + 1) >= this.source.length) return '\0';
        return this.source[this.current + 1];
    }

    string() {
        while (this.peek() != '"' && !this.isAtEnd()) {
            if (this.peek() == '\n') this.line++;
            this.advance();
        }

        // Unterminated string.                                 
        if (this.isAtEnd()) {
            utils.loxError(this.line, "Unterminated string.");
            return;
        }

        // The closing ".
        this.advance();

        var value = this.source.substring(this.start + 1, this.current - 1);
        this.addToken(TokenType.STRING, value);

    }

    number() {
        while (this.isDigit(this.peek())) this.advance();

        // Look for a fractional part.                            
        if (this.peek() == '.' && this.isDigit(this.peekNext())) {
            // Consume the "."                                      
            this.advance();

            while (this.isDigit(this.peek())) this.advance();
        }

        this.addToken(TokenType.NUMBER,
            Number.parseFloat(this.source.substring(this.start, this.current)));
    }

    identifier() {
        while (this.isAlphaNumeric(this.peek())) this.advance();

        var text = this.source.substring(this.start, this.current);
        var type = keywords[text];
        if (typeof type == "undefined") {
            type = TokenType.IDENTIFIER;
        }

        this.addToken(type);
    }

    addToken(type, literal) {
        literal = literal || null;
        var text = this.source.substring(this.start, this.current);
        this.tokens.push(new Token(type, text, literal, this.line));
    }

    isAtEnd() {
        return this.current >= this.source.length;
    }

    isDigit(c) {
        return (c >= '0') && (c <= '9');
    }

    isAlpha(c) {
        return (c >= 'a' && c <= 'z') ||
            (c >= 'A' && c <= 'Z') ||
            (c == '_');
    }

    isAlphaNumeric(c) {
        return this.isAlpha(c) || this.isDigit(c);
    }

}

module.exports = Scanner;