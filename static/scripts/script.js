// Configuração para os módulos do Monaco Editor
require.config({ paths: { vs: "https://unpkg.com/monaco-editor/min/vs" } });

// Carrega o módulo principal do Monaco Editor
require(["vs/editor/editor.main"], function () {
  // Inicializa o Monaco Editor dentro do elemento 'c-code-editor'
  window.editor = monaco.editor.create(
    document.getElementById("c-code-editor"),
    {
      value: [
        "#include <stdio.h>",
        "",
        "int main() {",
        "\tfork();",
        "\tint a;",
        "\ta = 4;",
        "\tif ((a = fork()) - 1000 <= 0) {",
        "\t\ta++;",
        "\t\t++a;",
        "\t\texit(0);",
        "\t};",
        "\tfork();",
        "}",
      ].join("\n"),
      language: "c",
      theme: "vs-dark",
      automaticLayout: true,
    }
  );
});

function gerarArvore() {
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
}
