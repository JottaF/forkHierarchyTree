(function () {
  var consoleOutput = document.getElementById("console-container");

  // Verifica se as funções do console já foram substituídas
  if (!window.consoleLogged) {
    // Substitui console.log para capturar mensagens de log
    var originalConsoleLog = console.log;
    console.log = function (message) {
      printMessage(message, "log");
      originalConsoleLog.apply(console, arguments);
    };

    // Substitui console.error para capturar mensagens de erro
    var originalConsoleError = console.error;
    console.error = function (message) {
      printMessage(message, "error");
      originalConsoleError.apply(console, arguments);
    };

    // Substitui console.warn para capturar mensagens de aviso
    var originalConsoleWarn = console.warn;
    console.warn = function (message) {
      printMessage(message, "warn");
      originalConsoleWarn.apply(console, arguments);
    };

    // Marca que as funções do console foram substituídas
    window.consoleLogged = true;
  }

  // Função para imprimir mensagem na tela
  function printMessage(message, type) {
    var p = document.createElement("p");
    p.textContent = message;
    p.classList.add(type);
    consoleOutput.appendChild(p);
  }
})();

window.onload = function() {
  document.querySelector('#console-container').innerHTML = ''
};