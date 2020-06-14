var hadError = false;
var hadRuntimeError = false;

function loxError(lineNum, msg) {
    loxReport(lineNum, "", msg);
}

function loxParseError(token, msg) {
    if (token.type == TokenType.EOF) {
        loxReport(token.line, " at end", msg);
    } else {
        loxReport(token.line, ` at '${token.lexeme}'`, msg);
    }
}

function loxReport(lineNum, where, msg) {
    console.log(`[line ${lineNum}] Error${where}: ${msg}`);
    hadError = true;
}

function loxRuntimeError(err) {
    console.log(err)
    console.log(err.msg + `\n[line ${err.token.line}]`);
    hadRuntimeError = true;
}

module.exports = {
    hadError,
    hadRuntimeError,
    loxError,
    loxReport,
    loxParseError,
    loxRuntimeError,

}