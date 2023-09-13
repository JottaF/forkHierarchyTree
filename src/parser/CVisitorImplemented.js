import CVisitor from "./CVisitor";
import { ForkTree } from "../ForkTree";

export default class CVisitorImplemented extends CVisitor {
  constructor() {
    super();
    this.tree = new ForkTree();
    this.variables = new Map();
    this.processList = [];
    this.isActivated = true;
  }

  visitChildren(ctx) {
    if (!this.isActivated) return null;
    return super.visitChildren(ctx);
  }

  visitCompilationUnit(ctx) {
    this.visitChildren(ctx);

    console.warn("this.variables:", this.variables);
    console.warn("this.selectionConditions:", this.selectionConditions);
    console.warn("this:", this);
    console.warn("this.processList:", this.processList);
    this.isActivated = false;
  }

  visitBlockItemList(ctx) {
    this.blockItemList = ctx;
    return this.visitChildren(ctx);
  }

  visitBlockItem(ctx) {
    this.currentBlockItem = ctx;
    let parent = ctx.parentCtx.children;

    for (let i = 0; i < parent.length; i++) {
      if (parent[i] == this.currentBlockItem) {
      }
    }

    return this.visitChildren(ctx);
  }

  // visit a parse tree produced by CParser#declaration.
  visitDeclaration(ctx) {
    const result = this.visitChildren(ctx);

    if (ctx.children.length == 2) {
      const name = ctx.children[0].children[1].getText();
      const type = ctx.children[0].children[0].getText();
      if (!this.variables.get(name)) {
        this.variables.set(name, { type, name, value: null });
      } else {
        console.error(
          `A variável '${name}' já foi definida. Erro na função visitDeclaration. Linha ${ctx.start.line}.`
        );
      }
    } else {
      const type = ctx.children[0].getText();
      for (let variable of result[1]) {
        if (!this.variables.get(variable.name)) {
          variable.type = type;
          this.variables.set(variable.name, variable);
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

  visitSelectionStatement(ctx) {
    if (ctx.children[0].getText() == "if") {
      const state = this.visitChildren(ctx.children[2])[0];
      if (state) {
        let a = this.visitChildren(ctx.children[4]);
        return a;
      }
      return null;
    }
    return ctx.visitChildren(ctx);
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
      const variable = this.variables.get(elements[0].getText());
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
              console.error("Logical OR", elements[i].getText());
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
              console.error("Logical And", elements[i].getText());
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
              console.error("Equality", elements[i].getText());
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
              console.error("Relational", elements[i].getText());
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
              console.error("Additive", elements[i].getText());
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
              console.error("Multiplicative", elements[i].getText());
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

  // TODO: UnaryOperator
  visitUnaryExpression(ctx) {
    const result = this.visitChildren(ctx);
    const element = result[0];

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
        return variable;
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
    }
    return element;
  }

  visitPostfixExpression(ctx) {
    const result = this.visitChildren(ctx);
    let element = result[0];

    if (this.isActivated) {
      if (ctx.getText() === "exit(0)") {
        this.isActivated = false;
        return null;
      } else if (ctx.getText() === "fork()") {
        let node = this.tree.addChild();
        this.processList.push({
          pid: node,
          forkReturn: 0,
          blockItem: this.currentBlockItem,
        });
        return node;
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
      let variable = this.variables.get(ctx.getText());
      let number = Number(ctx.getText());
      if (variable) {
        return variable.value;
      } else if (number.toString() != "NaN") {
        return number;
      }
      return ctx.getText();
    }
  }
}
