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
        "\tfor (int i = 0; i < 2; i++) {",
        "\t\tint j = 0;",
        "\t\tif (j < 2) {",
        "\t\t\tif (i < 3) {",
        "\t\t\t\twhile(j<2) {",
        "\t\t\t\t\tfork();",
        "\t\t\t\t\tj++;",
        "\t\t\t\t}",
        "\t\t\t}",
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
