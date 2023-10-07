import { ForkTree } from "../ForkTree";
import CVisitor from "./CVisitor";
import { Process } from "./Process";

export default class CVisitorImplemented extends CVisitor {
  constructor() {
    super();
    this.tree = new ForkTree();
    this.pidController = this.tree.pidController;
    this.currentProcess = new Process(null, this.tree.root);
    this.currentProcess.count = 2;
    this.currentProcess.pid = 1;
    this.processList = [this.currentProcess];
    this.currentBlockItemPosition = 0;
  }

  visitChildren(ctx, p = false) {
    if (!this.currentProcess.isActivated) return null;
    return super.visitChildren(ctx);
  }

  cloneMap(map) {
    const newMap = new Map();

    for (let [k, v] of map.entries()) {
      newMap.set(k, Object.assign({}, v));
    }
    return newMap;
  }

  createProcess() {
    let node = this.currentProcess.tree.addChild(this.pidController);
    let currentBlockItemP =
      typeof this.currentBlockItem == "number"
        ? this.currentBlockItem
        : this.blockItemList.children.indexOf(this.currentBlockItem);
    let newProcess = new Process(currentBlockItemP, node);
    newProcess.pid = node.pid;
    this.processList.push(newProcess);
    newProcess.variables = this.cloneMap(this.currentProcess.variables);
    this.currentProcess.addProcess(newProcess);
    return node.pid;
  }

  visitCompilationUnit(ctx) {
    this.visitChildren(ctx);

    console.warn(
      "this.currentProcess.variables:",
      this.currentProcess.variables
    );
    console.warn("this.selectionConditions:", this.selectionConditions);
    console.warn("this:", this);
    console.warn("this.processList:", this.processList);
    this.currentProcess.isActivated = false;
  }

  visitCompoundStatement(ctx) {
    if (
      this.currentProcess.pid != 1 &&
      ctx.parentCtx.constructor.name == "StatementContext"
    ) {
      return this.visitChildren(ctx)[0];
    }
    ctx.isChild = true;
    this.visitChildren(ctx);
    const children = Array.from(this.blockItemList.children);

    let process = this.processList[1];
    while (process.nextProcess) {
      let flag = false;
      this.currentProcess = process;
      for (let i = 0; i < children.length; i++) {
        if ((i == process.blockItem || flag) && process.isActivated) {
          flag = true;
          this.currentBlockItem = i;
          let text = children[i].getText();
          this.visitChildren(children[i]);
        }
      }
      process = process.nextProcess;
    }
  }

  visitBlockItemList(ctx) {
    if (
      ctx.parentCtx.parentCtx.constructor.name == "FunctionDefinitionContext"
    ) {
      this.blockItemList = ctx;
    }

    return this.visitChildren(ctx);
  }

  visitBlockItem(ctx) {
    if (
      ctx.parentCtx.parentCtx.parentCtx.constructor.name ==
      "FunctionDefinitionContext"
    ) {
      this.currentBlockItem = ctx;
      this.currentBlockItemPosition = this.blockItemList.children.indexOf(ctx);
    }

    return this.visitChildren(ctx);
  }

  visitDeclaration(ctx) {
    const result = this.visitChildren(ctx);

    if (ctx.children.length == 2) {
      const name = ctx.children[0].children[1].getText();
      const type = ctx.children[0].children[0].getText();
      if (!this.currentProcess.variables.get(name)) {
        this.currentProcess.variables.set(name, { type, name, value: null });
      } else {
        console.error(
          `A variável '${name}' já foi definida. Erro na função visitDeclaration. Linha ${ctx.start.line}.`
        );
      }
    } else {
      const type = ctx.children[0].getText();
      for (let variable of result[1]) {
        if (!this.currentProcess.variables.get(variable.name)) {
          variable.type = type;
          this.currentProcess.variables.set(variable.name, variable);
        } else {
          console.error(
            `A variável '${variable.name}' já foi definida. Erro na função visitDeclaration. Linha ${ctx.start.line}.`
          );
          break;
        }
      }
    }
  }

  visitInitDeclaratorList(ctx) {
    const result = this.visitChildren(ctx);
    const resultLen = result.length;
    const newResult = [];

    for (let r of result) {
      if (r != undefined) {
        r.value = result[resultLen - 1].value;
        newResult.push(r);
      }
    }
    return newResult;
  }

  visitInitDeclarator(ctx) {
    const result = this.visitChildren(ctx);
    if (ctx.children.length > 1 && ctx.children.length < 4) {
      result[0].value = result[2];
    }
    return result[0];
  }

  visitDeclarator(ctx) {
    return this.visitChildren(ctx)[0];
  }

  visitDirectDeclarator(ctx) {
    return { type: null, name: ctx.getText(), value: null };
  }

  visitInitializer(ctx) {
    if (ctx.children.length > 1) {
      console.error(
        `Erro na função 'visitInitializer'. Essa expressão não está disponível. Linha ${ctx.start.line}.`
      );
    }
    return this.visitChildren(ctx)[0];
  }

  visitStatement(ctx) {
    this.currentProcess.count++;
    return this.visitChildren(ctx)[0];
  }

  visitSelectionStatement(ctx) {
    if (ctx.children[0].getText() == "if") {
      const state = this.visitChildren(ctx.children[2])[0];
      console.debug("state", state, "ctx", ctx.getText());

      if (state) {
        let a = this.visitChildren(ctx.children[4]);
        return a;
      }
      return null;
    }
    return ctx.visitChildren(ctx)[0];
  }

  visitExpression(ctx) {
    if (ctx.children.length > 1) {
      console.error(
        `Erro na função 'visitExpression'. Essa expressão não está disponível. Linha ${ctx.start.line}`
      );
    }
    return this.visitChildren(ctx)[0];
  }

  visitAssignmentExpression(ctx) {
    const result = this.visitChildren(ctx);
    if (ctx.children.length > 1 && ctx.children.length < 4) {
      const elements = ctx.children;
      const variable = this.currentProcess.variables.get(elements[0].getText());
      let number = Number(elements[0].getText());

      if (variable) {
        const operator = elements[1].getText();

        try {
          switch (operator) {
            case "=":
              variable.value = result[2];
              break;
            case "*=":
              variable.value *= result[2];
              break;
            case "/=":
              variable.value /= result[2];
              break;
            case "%=":
              variable.value %= result[2];
              break;
            case "+=":
              variable.value += result[2];
              break;
            case "-=":
              variable.value -= result[2];
              break;

            default:
              console.error("Logical And", elements[i].getText());
              break;
          }
        } catch (err) {
          console.error(
            `Erro ao tentar usar o operador ${operator}. Linha ${ctx.start.line}`
          );
        }

        return variable.value;
      } else if (number.toString() != "NaN") {
        const operator = elements[1].getText();

        try {
          switch (operator) {
            case "=":
              number = result[2];
              break;
            case "*=":
              number *= result[2];
              break;
            case "/=":
              number /= result[2];
              break;
            case "%=":
              number %= result[2];
              break;
            case "+=":
              number += result[2];
              break;
            case "-=":
              number -= result[2];
              break;

            default:
              console.error("Logical And", elements[i].getText());
              break;
          }
        } catch (err) {
          console.error(
            `Erro ao tentar usar o operador ${operator}. Linha ${ctx.start.line}`
          );
        }

        return number;
      } else {
        console.error("Erro ao executar AssignmentExpression");
      }
    } else if (ctx.children.length > 3) {
      console.error("Erro ao executar AssignmentExpression. Sintaxe errada.");
    }
    return result[0];
  }

  visitConditionalExpression(ctx) {
    if (ctx.children.length > 1) {
      console.error(
        `Erro na função 'visitConditionalExpression'. Essa expressão não está disponível. Linha ${ctx.start.line}`
      );
    }
    return this.visitChildren(ctx)[0];
  }

  visitLogicalOrExpression(ctx) {
    const result = this.visitChildren(ctx);
    if (ctx.children.length > 1) {
      let state = result[0];
      for (let i = 0; i < ctx.children.length; i++) {
        if ((i + 1) % 2 == 0) {
          const elements = ctx.children;
          const operator = elements[i].getText();

          switch (operator) {
            case "||":
              state = state || result[i + 1];
              break;

            default:
              break;
          }
          i++;
        }
      }
      return state;
    }
    return result[0];
  }

  visitLogicalAndExpression(ctx) {
    const result = this.visitChildren(ctx);
    if (ctx.children.length > 1) {
      let state = result[0];
      for (let i = 0; i < ctx.children.length; i++) {
        if ((i + 1) % 2 == 0) {
          const elements = ctx.children;
          const operator = elements[i].getText();

          switch (operator) {
            case "&&":
              state = state && result[i + 1];
              break;

            default:
              break;
          }
          i++;
        }
      }
      return state;
    }
    return result[0];
  }

  visitInclusiveOrExpression(ctx) {
    if (ctx.children.length > 1) {
      console.error(
        `Erro na função 'visitInclusiveOrExpression'. Essa expressão não está disponível. Linha ${ctx.start.line}`
      );
    }
    return this.visitChildren(ctx)[0];
  }

  visitExclusiveOrExpression(ctx) {
    if (ctx.children.length > 1) {
      console.error(
        `Erro na função 'visitExclusiveOrExpression'. Essa expressão Cast não está disponível. Linha ${ctx.start.line}`
      );
    }
    return this.visitChildren(ctx)[0];
  }

  visitAndExpression(ctx) {
    if (ctx.children.length > 1) {
      console.error(
        `Erro na função 'visitAndExpression'. Essa expressão  não está disponível. Linha ${ctx.start.line}`
      );
    }
    return this.visitChildren(ctx)[0];
  }

  visitEqualityExpression(ctx) {
    const result = this.visitChildren(ctx);
    if (ctx.children.length > 1) {
      let state = result[0];
      for (let i = 0; i < ctx.children.length; i++) {
        if ((i + 1) % 2 == 0) {
          const elements = ctx.children;
          const operator = elements[i].getText();

          switch (operator) {
            case "==":
              state = state == result[i + 1];
              break;

            case "!=":
              state = state != result[i + 1];
              break;

            default:
              break;
          }
          i++;
        }
      }
      return state;
    }
    return result[0];
  }

  visitRelationalExpression(ctx) {
    const result = this.visitChildren(ctx);
    if (ctx.children.length > 1) {
      let state = result[0];
      for (let i = 0; i < ctx.children.length; i++) {
        if ((i + 1) % 2 == 0) {
          const elements = ctx.children;
          const operator = elements[i].getText();

          switch (operator) {
            case "<":
              state = state < result[i + 1];
              break;

            case ">":
              state = state > result[i + 1];
              break;

            case "<=":
              state = state <= result[i + 1];
              break;

            case ">=":
              state = state >= result[i + 1];
              break;

            default:
              break;
          }
          i++;
        }
      }
      return state;
    }
    return result[0];
  }

  visitShiftExpression(ctx) {
    if (ctx.children.length > 1) {
      console.error(
        `Erro na função 'visitShiftExpression'. Expressão de Shift não está disponível. Linha ${ctx.start.line}`
      );
    }
    return this.visitChildren(ctx)[0];
  }

  visitAdditiveExpression(ctx) {
    const result = this.visitChildren(ctx);
    if (ctx.children.length > 1) {
      let product = result[0];
      for (let i = 0; i < ctx.children.length; i++) {
        if ((i + 1) % 2 == 0) {
          const elements = ctx.children;
          const operator = elements[i].getText();

          switch (operator) {
            case "+":
              product += result[i + 1];
              break;

            case "-":
              product -= result[i + 1];
              break;

            default:
              break;
          }
          i++;
        }
      }
      return product;
    }
    return result[0];
  }

  visitMultiplicativeExpression(ctx) {
    const result = this.visitChildren(ctx);
    if (ctx.children.length > 1) {
      let product = result[0];
      for (let i = 0; i < ctx.children.length; i++) {
        if ((i + 1) % 2 == 0) {
          const elements = ctx.children;
          const operator = elements[i].getText();

          switch (operator) {
            case "*":
              product *= result[i + 1];
              break;

            case "/":
              product /= result[i + 1];
              break;

            case "%":
              product %= result[i + 1];
              break;

            default:
              break;
          }
          i++;
        }
      }
      return product;
    }
    return result[0];
  }

  visitCastExpression(ctx) {
    if (ctx.children.length > 1) {
      console.error(
        `Erro na função 'visitCastExpression'. Expressão de Cast não está disponível. Linha ${ctx.start.line}`
      );
    }
    return this.visitChildren(ctx)[0];
  }

  visitUnaryExpression(ctx) {
    const result = this.visitChildren(ctx);
    const element = result[0];
    const variable = result[1];

    if (ctx.children.length === 2) {
      if (typeof element === Number) {
        switch (ctx.children[0].getText()) {
          case "++":
            element++;
            break;

          case "--":
            element--;
            break;

          default:
            console.error(
              "Não foi possível processar a informação:",
              ctx.children[0].getText()
            );
        }
        return element;
      } else if (typeof variable === typeof Object()) {
        switch (ctx.children[0].getText()) {
          case "++":
            variable.value++;
            break;

          case "--":
            variable.value--;
            break;

          default:
            console.error(
              "Não foi possível processar a informação:",
              ctx.children[0].getText()
            );
        }
        return variable.value;
      } else if (element == null) {
        console.error(
          `A variável "${ctx.children[0].getText()}" não foi iniciada. Não é possível realizar esse tipo de operação antes da inicialização da variável. Erro Linha ${
            ctx.start.line
          }.`
        );
      } else {
        console.error(
          `O termo "${ctx.children[1].getText()}" não foi definida ou não é compatível com a operação. Erro Linha ${
            ctx.start.line
          }.`
        );
      }
    } else if (typeof element == typeof Object() && element != null) {
      return element.value;
    }
    return element;
  }

  visitPostfixExpression(ctx) {
    const result = this.visitChildren(ctx);
    let element = result[0];

    if (this.currentProcess.isActivated) {
      if (ctx.getText() === "exit(0)") {
        this.currentProcess.isActivated = false;
        return null;
      } else if (ctx.getText() === "fork()") {
        if (this.currentProcess.count < 2) {
          return 0;
        }

        return this.createProcess();
      } else if (ctx.children.length === 2) {
        if (typeof element === typeof Number()) {
          switch (ctx.children[1].getText()) {
            case "++":
              element++;
              break;

            case "--":
              element--;
              break;

            default:
              console.error(
                "Não foi possível processar a informação:",
                ctx.children[1].getText()
              );
          }
          return element;
        } else if (typeof element === typeof Object()) {
          switch (ctx.children[1].getText()) {
            case "++":
              element.value++;
              break;

            case "--":
              element.value--;
              break;

            default:
              console.error(
                "Não foi possível processar a informação:",
                ctx.children[1].getText()
              );
          }
          return element.value;
        } else if (element == null) {
          console.error(
            `A variável "${ctx.children[0].getText()}" não foi iniciada. Não é possível realizar esse tipo de operação antes da inicialização da variável. Erro Linha ${
              ctx.start.line
            }.`
          );
        } else {
          console.error(
            `O termo "${ctx.children[0].getText()}" não foi definida ou não é compatível com a operação. Erro Linha ${
              ctx.start.line
            }.`
          );
        }
      }
    }

    return element;
  }

  visitPrimaryExpression(ctx) {
    if (ctx.children.length > 1) {
      const element = ctx.children;
      if (element[0].getText() === "(" && element[2].getText() === ")") {
        const result = this.visitChildren(element[1]);
        return result[0];
      } else {
        console.error(
          `Erro na função '${ctx.constructor.name}'. Essa expressão não está disponível. Linha ${ctx.start.line}`
        );
        return this.visitChildren(ctx);
      }
    } else {
      let variable = this.currentProcess.variables.get(ctx.getText());
      let number = Number(ctx.getText());
      if (variable) {
        return variable;
      } else if (number.toString() != "NaN") {
        return number;
      }
      return ctx.getText();
    }
  }
}
