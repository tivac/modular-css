const {
    createConnection,
    TextDocuments,
    DiagnosticSeverity,
    ProposedFeatures,
    DidChangeConfigurationNotification,
    CompletionItemKind,
    TextDocumentSyncKind,
} = require("vscode-languageserver/node");

const { TextDocument } = require("vscode-languageserver-textdocument");

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager.
const documents = new TextDocuments(TextDocument);

// The global settings, used when the `workspace/configuration` request is not supported by the client.
// Please note that this is not the case when using this server with the client provided in this example
// but could happen with other clients.
const defaultSettings = {
    maxNumberOfProblems : 1000,
};
let globalSettings = defaultSettings;

// Cache the settings of all open documents
const documentSettings = new Map();

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;

function getDocumentSettings(resource) {
    if(!hasConfigurationCapability) {
        return Promise.resolve(globalSettings);
    }

    let result = documentSettings.get(resource);

    if(!result) {
        result = connection.workspace.getConfiguration({
            scopeUri : resource,
            section  : "languageServerExample",
        });

        documentSettings.set(resource, result);
    }

    return result;
}

async function validateTextDocument(textDocument) {
    // In this simple example we get the settings for every validate run.
    const settings = await getDocumentSettings(textDocument.uri);

    // The validator creates diagnostics for all uppercase words length 2 and more
    const text = textDocument.getText();
    const pattern = /\b[A-Z]{2,}\b/g;
    let m;

    let problems = 0;
    const diagnostics = [];

    while((m = pattern.exec(text)) && problems < settings.maxNumberOfProblems) {
        problems++;
        const diagnostic = {
            severity : DiagnosticSeverity.Warning,
            range    : {
                start : textDocument.positionAt(m.index),
                end   : textDocument.positionAt(m.index + m[0].length),
            },
            message : `${m[0]} is all uppercase.`,
            source  : "ex",
        };

        if(hasDiagnosticRelatedInformationCapability) {
            diagnostic.relatedInformation = [{
                location : {
                    uri   : textDocument.uri,
                    range : Object.assign({}, diagnostic.range),
                },
                message : "Spelling matters",
            }, {
                location : {
                    uri   : textDocument.uri,
                    range : Object.assign({}, diagnostic.range),
                },
                message : "Particularly for names",
            }];
        }

        diagnostics.push(diagnostic);
    }

    // Send the computed diagnostics to VS Code.
    connection.sendDiagnostics({
        uri : textDocument.uri,
        diagnostics,
    });
}

connection.onInitialize((params) => {
    const {
        capabilities,
    } = params;

    // Does the client support the `workspace/configuration` request?
    // If not, we fall back using global settings.
    hasConfigurationCapability = Boolean(capabilities.workspace && Boolean(capabilities.workspace.configuration));
    hasWorkspaceFolderCapability = Boolean(capabilities.workspace && Boolean(capabilities.workspace.workspaceFolders));
    hasDiagnosticRelatedInformationCapability = Boolean(capabilities.textDocument &&
        capabilities.textDocument.publishDiagnostics &&
        capabilities.textDocument.publishDiagnostics.relatedInformation);

    const result = {
        capabilities : {
            textDocumentSync   : TextDocumentSyncKind.Incremental,
            // Tell the client that this server supports code completion.
            completionProvider : {
                resolveProvider : true,
            },
        },
    };

    if(hasWorkspaceFolderCapability) {
        result.capabilities.workspace = {
            workspaceFolders : {
                supported : true,
            },
        };
    }

    return result;
});

connection.onInitialized(() => {
    if(hasConfigurationCapability) {
        // Register for all configuration changes.
        connection.client.register(DidChangeConfigurationNotification.type, undefined);
    }
    if(hasWorkspaceFolderCapability) {
        connection.workspace.onDidChangeWorkspaceFolders((_event) => {
            connection.console.log("Workspace folder change event received.");
        });
    }
});


connection.onDidChangeConfiguration((change) => {
    if(hasConfigurationCapability) {
        // Reset all cached document settings
        documentSettings.clear();
    } else {
        globalSettings = (
            (change.settings.languageServerExample || defaultSettings)
        );
    }

    // Revalidate all open text documents
    documents.all().forEach(validateTextDocument);
});


// Only keep settings for open documents
documents.onDidClose((e) => {
    documentSettings.delete(e.document.uri);
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent((change) => {
    validateTextDocument(change.document);
});


connection.onDidChangeWatchedFiles((_change) => {
    // Monitored files have change in VS Code
    connection.console.log("We received a file change event");
});

// This handler provides the initial list of the completion items.
connection.onCompletion(
    (_textDocumentPosition) =>
    // The pass parameter contains the position of the text document in
    // which code complete got requested. For the example we ignore this
    // info and always provide the same completion items.
    [{
            label : "TypeScript",
            kind  : CompletionItemKind.Text,
            data  : 1,
        },
        {
            label : "JavaScript",
            kind  : CompletionItemKind.Text,
            data  : 2,
        },
    ]

);

// This handler resolves additional information for the item selected in
// the completion list.
connection.onCompletionResolve(
    (item) => {
        if(item.data === 1) {
            item.detail = "TypeScript details";
            item.documentation = "TypeScript documentation";
        } else if(item.data === 2) {
            item.detail = "JavaScript details";
            item.documentation = "JavaScript documentation";
        }

        return item;
    }
);

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
