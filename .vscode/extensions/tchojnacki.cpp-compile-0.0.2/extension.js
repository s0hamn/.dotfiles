const vscode = require('vscode')

function activate (context) {
  let runButton = new RunButton()
  let runButtonController = new RunButtonController(runButton)

  let runTerminal = new RunTerminal()

  let compileCommand = vscode.commands.registerTextEditorCommand('cppCompile.run', () => {
    let terminal = runTerminal.createTerminal()
    let currentFile = vscode.window.activeTextEditor.document.fileName
    terminal.sendText('cd "' + currentFile.substring(0, currentFile.lastIndexOf('\\')) + '"')
    terminal.sendText('cls')
    let outputFile = vscode.window.activeTextEditor.document.fileName.substring(currentFile.lastIndexOf('\\') + 1, currentFile.lastIndexOf('.'))
    terminal.sendText('g++ ' + (vscode.workspace.getConfiguration('cppCompile').flags ? `${vscode.workspace.getConfiguration('cppCompile').flags} ` : '') + currentFile.substring(currentFile.lastIndexOf('\\') + 1, currentFile.length) + ' -o ' + outputFile + ' && ' + outputFile)
  })

  context.subscriptions.push(compileCommand)
  context.subscriptions.push(runButtonController)
  context.subscriptions.push(runButton)
}
exports.activate = activate

function deactivate () {}
exports.deactivate = deactivate

class RunButton {
  updateRunButton () {
    if (!this._runButton) {
      this._runButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left)
      this._runButton.text = '$(triangle-right) Run C++'
      this._runButton.command = 'cppCompile.run'
    }

    let editor = vscode.window.activeTextEditor
    if (!editor || editor.document.isUntitled) {
      this._runButton.hide()
      return
    }

    let doc = editor.document
    if (doc.languageId === 'cpp') {
      this._runButton.show()
    } else {
      this._runButton.hide()
    }
  }

  dispose () {
    this._runButton.dispose()
  }
}

class RunButtonController {
  constructor (runButton) {
    this._runButton = runButton

    let subscriptions = []
    vscode.window.onDidChangeActiveTextEditor(this._onEvent, this, subscriptions)
    vscode.workspace.onDidSaveTextDocument(this._onEvent, this, subscriptions)
    this._runButton.updateRunButton()

    this._disposable = vscode.Disposable.from(...subscriptions)
  }

  _onEvent () {
    this._runButton.updateRunButton()
  }

  dispose () {
    this._disposable.dispose()
  }
}

class RunTerminal {
  createTerminal () {
    if (!this._terminal) {
      this._terminal = vscode.window.createTerminal('cpp')
    }
    this._terminal.show()

    return this._terminal
  }
}
