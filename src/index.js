const Parser = require('./syntax/parser');
const Interpreter = require('./syntax/visitors/interpreter');
const Resolver = require('./syntax/visitors/resolver')
const ASTPrinter = require('./syntax/visitors/ast-printer');
const Scanner = require("./scanner");
const utils = require('./utils');

var interpreter = new Interpreter();
var printer = new ASTPrinter();

if (process.argv.length > 3) {
    console.error("Usage: jslox [script]");
    process.exit(64);
} else if (process.argv.length == 3) {
    runFile(process.argv[2]);
} else {
    runPrompt();
}

function runFile(filePath) {
    const fs = require('fs');
    const fileContent = fs.readFileSync(filePath, "utf8")
    run(fileContent);

    if (utils.hadError) {
        process.exit(65);
    }
    if (utils.hadRuntimeError) {
        process.exit(70);
    }
}

function runPrompt() {

    const readline = require('readline');

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: '> '
    });

    rl.prompt();

    rl.on('line', (line) => {
        run(line);

        if (utils.hadError) {
            utils.hadError = false;
        }

        rl.prompt();
    }).on('close', () => {
        console.log('\n');
        process.exit(0);
    });
}

function run(source) {
    var scanner = new Scanner(source);

    var tokens = scanner.scanTokens();
    var parser = new Parser(tokens);
    var stmts = parser.parse();

    if (utils.hadError) return;

    var resolver = new Resolver(interpreter);
    resolver.resolveStmts(stmts);

    if (utils.hadError) return;

    interpreter.interpret(stmts);
}