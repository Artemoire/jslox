
var outputDir = "src/syntax";
defineAst(outputDir, "Expr", [
    "Assign   : Token name, Expr value",
    "Binary   : Expr left, Token operator, Expr right",
    "Call     : Expr callee, Token paren, Expr[] args",
    "Get      : Expr object, Token name",
    "Grouping : Expr expression",
    "Literal  : Object value",
    "Logical  : Expr left, Token operator, Expr right",
    "Set      : Expr object, Token name, Expr value",
    "Super    : Token keyword, Token method",
    "This     : Token keyword",
    "Unary    : Token operator, Expr right",
    "Variable : Token name"
]);

defineAst(outputDir, "Stmt", [
    "Block      : Stmt[] statements",
    "Class      : Token name, Expr.Variable superclass, Stmt.Function[] methods",
    "Expression : Expr expression",
    "Function   : Token name, Token[] params, Stmt[] body",
    "If         : Expr condition, Stmt thenBranch, Stmt elseBranch",
    "Print      : Expr expression",
    "Return     : Token keyword, Expr value",
    "Var        : Token name, Expr initializer",
    "While      : Expr condition, Stmt body"
], `const Expr = require("./expr")\n`);

function defineAst(outputDir, baseName, types, prefix) {
    prefix = prefix || "";
    var content = prefix + `const Token = require('../token');\n\nclass ${baseName} {\n\n\taccept(visitor) { }\n\n}\n`;

    for (const type of types) {
        var className = type.split(":")[0].trim();
        var fields = type.split(":")[1].trim();
        content += defineType(baseName, className, fields);
    }

    content += "\n";

    for (const type of types) {
        var className = type.split(":")[0].trim();
        content += `${baseName}.${className} = ${className};\n`;
    }

    content += "\nclass Visitor {\n\n";

    for (const type of types) {
        var className = type.split(":")[0].trim();
        content += `\tvisit${className}${baseName}(${baseName.toLowerCase()}) {\n\t}\n\n`;
    }
    content += `}\n\n${baseName}.Visitor = Visitor;\n`;

    content += `\nmodule.exports = ${baseName};`;

    save(outputDir, baseName, content);
}

function defineType(baseName, className, fieldList) {
    var content = `\nclass ${className} extends ${baseName} {\n\n`;

    var fields = [];
    for (var field of fieldList.split(", ")) {
        var type = field.split(" ")[0];
        var name = field.split(" ")[1];
        fields.push({ type, name });
    }

    // JSdoc params
    content += '\t/**\n';
    for (var field of fields) {
        content += `\t * @param {${field.type == 'Object' ? 'any' : field.type}} ${field.name}\n`
    }
    content += '\t */\n';
    content += "\tconstructor(";
    for (var i = 0; i < fields.length; ++i) {
        content += fields[i].name;
        if (i != fields.length - 1) {
            content += ", ";
        }
    }
    content += ") {\n\t\tsuper();\n";
    for (var field of fields) {
        content += `\t\tthis.${field.name} = ${field.name};\n`;
    }
    content += "\t}\n\n";

    content += `\t/**\n\t * @param {Visitor} visitor\n\t */\n\taccept(visitor) {\n\t\treturn visitor.visit${className}${baseName}(this);\n\t}\n\n}\n`

    return content;
}

function save(outputDir, baseName, content) {
    const fs = require('fs');
    fs.writeFileSync(outputDir + `/${baseName}.js`, content);
}