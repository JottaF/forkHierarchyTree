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
        "\tint a;",
        "\tint b = 1;",
        "",
        "\tif ((a = fork()) == 0) {",
        "\t\tint i = 0;",
        "\t\twhile (i < 6) {",
        "\t\t\tif (i % 2 == 0) {",
        "\t\t\t\tfork();",
        "\t\t\t} else if (i > 1 && i < 5) {",
        "\t\t\t\tb += 3;",
        "\t\t\t} else {",
        "\t\t\t\tb--;",
        "\t\t\t}",
        "",
        "\t\t\ti++;",
        "\t\t}",
        "\t}",
        "",
        "\tif (a != 0) {",
        "\t\tif (fork() == 0) {",
        "\t\t\twhile (b >= 0) {",
        "\t\t\t\tif (fork() == 0) {",
        "\t\t\t\t\tfork();",
        "\t\t\t\t}",
        "\t\t\t\tb--;",
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
