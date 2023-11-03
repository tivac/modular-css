const { workspace, commands, window } = require("vscode");

const { LanguageClient, TransportKind } = require("vscode-languageclient/node");

let client;

exports.activate = (context) => {
	// The server is implemented in node
	const serverModule = require.resolve("@modular-css/language-server");

	// If the extension is launched in debug mode then the debug server options are used
	// Otherwise the run options are used
	const serverOptions = {
		run   : { module : serverModule, transport : TransportKind.ipc },
		debug : {
			module    : serverModule,
			transport : TransportKind.ipc,
		},
	};

	// Options to control the language client
	const clientOptions = {
		// Register the server for plain text documents
		documentSelector : [{ scheme : "file", language : "plaintext" }],
		synchronize      : {
			// Notify the server about file changes to '.clientrc files contained in the workspace
			fileEvents : workspace.createFileSystemWatcher("**/.clientrc"),
		},
	};

	// Create the language client and start the client.
	client = new LanguageClient(
		"languageServerExample",
		"Language Server Example",
		serverOptions,
		clientOptions
	);

	// Start the client. This will also launch the server
	client.start();

	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "helloworld-sample" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = commands.registerCommand("extension.helloWorld", () => {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		window.showInformationMessage("Hello World!");
	});

	context.subscriptions.push(disposable);
};

exports.deactivate = () => {
	if(!client) {
		return undefined;
	}

	return client.stop();
};
