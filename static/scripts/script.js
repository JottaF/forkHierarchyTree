// Configuração para os módulos do Monaco Editor
require.config({ paths: { vs: "https://unpkg.com/monaco-editor/min/vs" } });

// Carrega o módulo principal do Monaco Editor
require(["vs/editor/editor.main"], function () {
  monaco.languages.register({
    id: "c",
    extensions: [".c", ".h"], // Extensões de arquivos associadas à linguagem C
    aliases: ["C", "c"], // Aliases para a linguagem C
    mimetypes: ["text/x-csrc", "text/x-chdr"], // Tipos MIME associados à linguagem C
  });

  // Inicializa o Monaco Editor dentro do elemento 'c-code-editor'
  window.editor = monaco.editor.create(
    document.getElementById("c-code-editor"),
    {
      value: [
        "int main() {",
        "\tint f1, f2;",
        "\tf1 = fork();",
        "\t\t",
        "\tif (f1 != 0) {",
        "\t\tf2 = fork();",
        "\t}",
        "\t\t",
        "\tfor(int i = 0; i < 4; i++) {",
        "\t\tif (f1 == 0) {",
        '\t\t\tprintf("Filho 1 - i: %d", i);',
        "\t\t} else if (f2 == 0) {",
        '\t\t\tprintf("Filho 2 - i: %d", i);',
        "\t\t} else {",
        '\t\t\tprintf("Pai - i: %d", i);',
        "\t\t}",
        "\t}",
        "}",
      ].join("\n"),
      language: "c",
      theme: "vs-dark",
      automaticLayout: true,
    }
  );
});

function gerarArvore() {
  limparConsole();
  const entrada = window.editor.getValue();

  if (entrada == "") {
    alert("Insira um código C para gerar a árvore sintática!");
    return;
  }
  const cod = ForkJS.parse(entrada);
  new Treant(cod.bundleTree());
}

function apagarInput() {
  window.editor.setValue("");
  document.querySelector("#console-container").innerHTML = "";
  document.querySelector("#output-container").innerHTML = "";
}

function limparConsole() {
  document.querySelector("#console-container").innerHTML = "";
}
