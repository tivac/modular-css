import { vscode } from "#vscode";

import Processor from "@modular-css/processor";

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand("extension.helloWorld", () => {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage("HI DICKHEAD!");
	});

	context.subscriptions.push(disposable);
}

export {
    activate,
};
