// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed


/**
 * @param {import('vscode').ExtensionContext} context - The context.
 */
async function activate(context) {
    (await import("./custom-data.mjs")).activate(context);
}

 
module.exports = {
	activate,
};
