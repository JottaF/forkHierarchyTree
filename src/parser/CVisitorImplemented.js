import { ForkTree } from "../ForkTree";
import CVisitor from "./CVisitor";
import { Process } from "./Process";

export default class CVisitorImplemented extends CVisitor {
  constructor() {
    super();
    this.tree = new ForkTree();
    this.pidController = this.tree.pidController;
    this.count = 1;

    this.currentProcess = new Process(null, this.tree.root);
    this.currentProcess.forkEnabled = true;
    this.currentProcess.pid = 1;
    this.currentProcess.isSleeping = false;

    this.processList = [this.currentProcess];
    this.currentBlockItem = null;
    this.blockItemList = null;
    this.currentBlockItemList = null;
  }

  visitChildren(ctx) {
    if (!this.currentProcess.isActivated) {
      return [null];
    }
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

    let newProcess = new Process(this.currentBlockItem, node);
    newProcess.pid = node.pid;
    newProcess.variables = this.cloneMap(this.currentProcess.variables);
    newProcess.context = { ...this.currentProcess.context };

    this.processList.push(newProcess);
    return node.pid;
  }

  removeVariables(ctx) {
    this.currentProcess.variables.forEach((context) => {
      if (context.blockItem == ctx) {
        this.currentProcess.variables.delete(context.name);
      }
    });
  }

  removeIteration(ctx) {
    let list = this.currentProcess.context.iterationsNotExecuted;
    if (list) {
      this.currentProcess.context.iterationsNotExecuted = list.filter(
        (context) => {
          return context.ctx != ctx;
        }
      );
    }
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
      (this.currentProcess.pid != 1 &&
        ctx.parentCtx.constructor.name == "StatementContext") ||
      ctx.parentCtx.constructor.name != "FunctionDefinitionContext"
    ) {
      return this.visitChildren(ctx)[1];
    }

    this.visitChildren(ctx);

    let process = this.processList[1];
    let processIndex = 1;
    while (true) {
      if (processIndex > this.processList.length - 1) {
        break;
      }

      this.currentProcess = process;
      this.visitChildren(this.blockItemList);

      processIndex++;
      this.currentProcess.isActivated = false;
      process = this.processList[processIndex];
    }
  }

  visitBlockItemList(ctx) {
    if (
      ctx.parentCtx.parentCtx.constructor.name == "FunctionDefinitionContext"
    ) {
      this.blockItemList = ctx;
    }

    this.currentBlockItemList = ctx;

    const result = this.visitChildren(ctx);

    if (
      this.currentProcess.pid != 1 &&
      !this.currentProcess.isSleeping &&
      this.currentProcess.context.iterationsNotExecuted &&
      this.currentProcess.context.iterationsNotExecuted[0] &&
      !this.currentProcess.context.iterationsNotExecuted[0].visited
    ) {
      this.removeVariables(ctx);
      this.currentProcess.context.iterationsNotExecuted[0].visited = true;
      return this.visitChildren(
        this.currentProcess.context.iterationsNotExecuted[0].ctx.parentCtx
      );
    }

    if (
      ctx.parentCtx.parentCtx.constructor.name != "FunctionDefinitionContext"
    ) {
      this.removeVariables(ctx);
    }

    return result;
  }

  visitBlockItem(ctx) {
    this.currentBlockItem = ctx;

    if (this.currentProcess.blockItem == ctx) {
      this.currentProcess.isSleeping = false;
    }

    return this.visitChildren(ctx)[0];
  }

  visitExpressionStatement(ctx) {
    return this.visitChildren(ctx)[0];
  }

  visitDeclaration(ctx) {
    if (this.currentProcess.isSleeping) {
      return this.visitChildren(ctx);
    }

    const result = this.visitChildren(ctx);

    if (ctx.children.length == 2) {
      const name = ctx.children[0].children[1].getText();
      const type = ctx.children[0].children[0].getText();
      if (!this.currentProcess.variables.get(name)) {
        this.currentProcess.variables.set(name, {
          type,
          name,
          value: null,
          blockItem: this.currentBlockItemList,
        });
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
          variable.blockItem = this.currentBlockItemList;
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
    if (this.currentProcess.isSleeping) {
      return this.visitChildren(ctx);
    }

    const result = this.visitChildren(ctx);
    const newResult = [];

    for (let r of result) {
      if (r != undefined) {
        newResult.push(r);
      }
    }
    return newResult;
  }

  visitInitDeclarator(ctx) {
    if (this.currentProcess.isSleeping) {
      return this.visitChildren(ctx);
    }

    const result = this.visitChildren(ctx);
    if (ctx.children.length > 1 && ctx.children.length < 4) {
      result[0].value = result[2];
    }
    return result[0];
  }

  visitDeclarator(ctx) {
    if (this.currentProcess.isSleeping) {
      return this.visitChildren(ctx);
    }

    return this.visitChildren(ctx)[0];
  }

  visitForDeclaration(ctx) {
    if (this.currentProcess.isSleeping) {
      return this.visitChildren(ctx);
    }

    const result = this.visitChildren(ctx);
    const resultVar = result[1][0];

    if (ctx.children.length == 2) {
      const name = ctx.children[1].children[0].children[0].getText();
      const type = ctx.children[0].getText();
      if (!this.currentProcess.variables.get(name)) {
        const variable = {
          type,
          name,
          value: null,
          blockItem: this.currentBlockItemList,
        };
        if (resultVar) {
          variable.value = resultVar.value;
        }
        this.currentProcess.variables.set(name, variable);
        return variable;
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
          variable.blockItem = this.currentBlockItemList;
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

  visitDirectDeclarator(ctx) {
    if (this.currentProcess.isSleeping) {
      return this.visitChildren(ctx);
    }

    return { type: null, name: ctx.getText(), value: null };
  }

  visitInitializer(ctx) {
    if (this.currentProcess.isSleeping) {
      return this.visitChildren(ctx);
    }
    if (ctx.children.length > 1) {
      console.error(
        `Erro na função 'visitInitializer'. Essa expressão não está disponível. Linha ${ctx.start.line}.`
      );
    }
    return this.visitChildren(ctx)[0];
  }

  visitStatement(ctx) {
    if (this.currentProcess.isSleeping) {
      return this.visitChildren(ctx);
    }

    if (
      this.currentProcess.pid != 1 &&
      ctx.parentCtx.children.indexOf(ctx) == 6 &&
      ctx.parentCtx.ifCondition
    ) {
      return null;
    }

    return this.visitChildren(ctx)[0];
  }

  visitIterationStatement(ctx) {
    if (this.currentProcess.isSleeping) {
      if (!this.currentProcess.context.iterationsNotExecuted) {
        this.currentProcess.context.iterationsNotExecuted = [
          { ctx, visited: false },
        ];
      } else {
        this.currentProcess.context.iterationsNotExecuted.unshift({
          ctx,
          visited: false,
        });
      }
      return this.visitChildren(ctx);
    }
    if (ctx.children.length == 1) {
      return this.visitChildren(ctx);
    }

    if (ctx.children[0].getText() == "while") {
      let conditionState = this.visitChildren(ctx.children[2])[0];
      let result;
      while (conditionState) {
        result = this.visitChildren(ctx.children[4]);
        try {
          conditionState = this.visitChildren(ctx.children[2])[0];
        } catch {
          return null;
        }
      }
      this.removeIteration(ctx);
      return result;
    } else if (ctx.children[0].getText() == "for") {
      let forDecl;

      if (this.currentProcess.pid == 1) {
        const varName =
          ctx.children[2].children[0].children.length == 2
            ? ctx.children[2].children[0].children[1].children[0].children[0].getText()
            : ctx.children[2].children[0].children[0].getText();
        forDecl = this.currentProcess.variables.get(varName);
        if (!forDecl) {
          forDecl = this.visitForDeclaration(ctx.children[2].children[0]);
        }
      } else {
        // Verifica se é realizada uma declaração de variável no for ou apenas atribuída uma variável
        // Por exemplo, se foi realizado: for(int i = 0) ou apenas for (i), com i sendo uma variável já instanciada
        const varName =
          ctx.children[2].children[0].children.length == 2
            ? ctx.children[2].children[0].children[1].children[0].children[0].getText()
            : ctx.children[2].children[0].children[0].getText();
        forDecl = this.currentProcess.variables.get(varName);
        if (!forDecl) {
          forDecl = this.visitForDeclaration(ctx.children[2].children[0]);
        }
      }

      if (
        this.currentProcess.pid != 1 &&
        this.currentProcess.context.iterationsNotExecuted &&
        this.currentProcess.context.iterationsNotExecuted[0].ctx == ctx
      ) {
        this.visitUnaryExpression(ctx.children[2].children[4]);
      }

      let forExp = this.visitChildren(ctx.children[2].children[2])[0];
      let result;

      while (forExp) {
        result = this.visitChildren(ctx.children[4]);
        this.visitChildren(ctx.children[2].children[4]);
        try {
          forExp = this.visitChildren(ctx.children[2].children[2])[0];
        } catch {
          return null;
        }
      }
      this.currentProcess.variables.delete(forDecl.name);
      this.removeIteration(ctx);
      return result;
    }

    return this.visitChildren(ctx);
  }

  visitSelectionStatement(ctx) {
    if (this.currentProcess.isSleeping) {
      return this.visitChildren(ctx);
    }

    if (ctx.children[0].getText() == "if") {
      const state = this.visitChildren(ctx.children[2])[0];

      if (state) {
        ctx.ifCondition = true;
        const result = this.visitChildren(ctx.children[4]);
        return result;
      } else if (ctx.children.length == 7) {
        return this.visitChildren(ctx.children[6]);
      }
      return null;
    }
    return ctx.visitChildren(ctx)[0];
  }

  visitExpression(ctx) {
    if (this.currentProcess.isSleeping) {
      return this.visitChildren(ctx);
    }

    if (ctx.children.length > 1) {
      console.error(
        `Erro na função 'visitExpression'. Essa expressão não está disponível. Linha ${ctx.start.line}`
      );
    }
    return this.visitChildren(ctx)[0];
  }

  visitAssignmentExpression(ctx) {
    if (this.currentProcess.isSleeping) {
      return this.visitChildren(ctx);
    }

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
    if (this.currentProcess.isSleeping) {
      return this.visitChildren(ctx);
    }

    if (ctx.children.length > 1) {
      console.error(
        `Erro na função 'visitConditionalExpression'. Essa expressão não está disponível. Linha ${ctx.start.line}`
      );
    }
    return this.visitChildren(ctx)[0];
  }

  visitLogicalOrExpression(ctx) {
    if (this.currentProcess.isSleeping) {
      return this.visitChildren(ctx);
    }

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
    if (this.currentProcess.isSleeping) {
      return this.visitChildren(ctx);
    }

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
    if (this.currentProcess.isSleeping) {
      return this.visitChildren(ctx);
    }

    if (ctx.children.length > 1) {
      console.error(
        `Erro na função 'visitInclusiveOrExpression'. Essa expressão não está disponível. Linha ${ctx.start.line}`
      );
    }
    return this.visitChildren(ctx)[0];
  }

  visitExclusiveOrExpression(ctx) {
    if (this.currentProcess.isSleeping) {
      return this.visitChildren(ctx);
    }

    if (ctx.children.length > 1) {
      console.error(
        `Erro na função 'visitExclusiveOrExpression'. Essa expressão Cast não está disponível. Linha ${ctx.start.line}`
      );
    }
    return this.visitChildren(ctx)[0];
  }

  visitAndExpression(ctx) {
    if (this.currentProcess.isSleeping) {
      return this.visitChildren(ctx);
    }

    if (ctx.children.length > 1) {
      console.error(
        `Erro na função 'visitAndExpression'. Essa expressão  não está disponível. Linha ${ctx.start.line}`
      );
    }
    return this.visitChildren(ctx)[0];
  }

  visitEqualityExpression(ctx) {
    if (this.currentProcess.isSleeping) {
      return this.visitChildren(ctx);
    }

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
    if (this.currentProcess.isSleeping) {
      return this.visitChildren(ctx);
    }

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
    if (this.currentProcess.isSleeping) {
      return this.visitChildren(ctx);
    }

    if (ctx.children.length > 1) {
      console.error(
        `Erro na função 'visitShiftExpression'. Expressão de Shift não está disponível. Linha ${ctx.start.line}`
      );
    }
    return this.visitChildren(ctx)[0];
  }

  visitAdditiveExpression(ctx) {
    if (this.currentProcess.isSleeping) {
      return this.visitChildren(ctx);
    }

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
    if (this.currentProcess.isSleeping) {
      return this.visitChildren(ctx);
    }

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
    if (this.currentProcess.isSleeping) {
      return this.visitChildren(ctx);
    }

    if (ctx.children.length > 1) {
      console.error(
        `Erro na função 'visitCastExpression'. Expressão de Cast não está disponível. Linha ${ctx.start.line}`
      );
    }
    return this.visitChildren(ctx)[0];
  }

  visitUnaryExpression(ctx) {
    if (this.currentProcess.isSleeping) {
      return this.visitChildren(ctx);
    }

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
    if (this.currentProcess.isSleeping) {
      return this.visitChildren(ctx);
    }

    const result = this.visitChildren(ctx);
    let element = result[0];

    if (this.currentProcess.isActivated) {
      if (ctx.getText() === "exit(0)") {
        this.currentProcess.isActivated = false;
        return null;
      } else if (ctx.getText() === "fork()") {
        if (!this.currentProcess.forkEnabled) {
          this.currentProcess.forkEnabled = true;
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
    if (this.currentProcess.isSleeping) {
      return this.visitChildren(ctx);
    }

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
