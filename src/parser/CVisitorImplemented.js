import CVisitor from "./CVisitor";
import { ForkTree } from "../ForkTree";

export default class CVisitorImplemented extends CVisitor {
  constructor() {
    super();
    this.tree = new ForkTree();
    this.variables = new Map();
  }

  async visitChildren(ctx) {
    return await super.visitChildren(ctx);
  }

  // Função que retorna as folhas de um determinado nó
  getLeafs(node, leafs, exclusions = []) {
    if (!node.children) {
      if (!exclusions.includes(node.getText())) {
        leafs.push(node.getText());
      }
    } else {
      for (let n of node.children) {
        this.getLeafs(n, leafs, exclusions);
      }
    }
  }

  // Função para encontrar o nó SelectionStatement
  findSelectionParent(parent, state) {
    try {
      if (
        parent.constructor.name == "SelectionStatementContext" &&
        (parent.condition == null || parent.condition == true)
      ) {
        parent.condition = state;
      } else {
        this.findSelectionParent(parent.parentCtx, state);
      }
    } catch (err) {
      console.error("Function 'findSelectionParent' error:", err);
    }
  }

  async visitCompilationUnit(ctx) {
    let a = this.visitChildren(ctx);
    console.warn("this.variables:", this.variables);
    console.warn("this.selectionConditions:", this.selectionConditions);
    console.warn("this:", this);
    console.warn("a:", a);
  }

  visitBlockItem(ctx) {
    if (ctx.getText().includes("fork()")) {
      this.tree.addChild(this.tree.root.pid);
    }
    return this.visitChildren(ctx);
  }

  // visit a parse tree produced by CParser#declaration.
  visitDeclaration(ctx) {
    let variable = {};
    const leafs = [];

    // Verifica se é uma declaração sem atribuir valor. `int a;` Por exemplo
    if (ctx.children.length === 2) {
      this.getLeafs(ctx.children[0], leafs);
      variable.type = leafs[0];
      variable.name = leafs[1];
      variable.value = undefined;
    }
    // Verifica se é uma declaração simples. `int a = 4;` Por exemplo
    else if (ctx.children[1].children.length === 1) {
      this.getLeafs(ctx.children[1], leafs);
      variable.type = ctx.children[0].getText();
      variable.name = leafs[0];
      variable.value = leafs[2];
    }
    // Verifica se é uma declaração sem atribuir valor com muitas variáveis. `int a, b, c = 0;` Por exemplo
    else if (
      ctx.children[1].children[ctx.children[1].children.length - 1].children
        .length == 3
    ) {
      this.getLeafs(ctx.children[1], leafs);
      for (let i = 0; i < leafs.length - 1; i++) {
        if (leafs[i] === "," || leafs[i] === "=") {
          continue;
        }

        variable = {};
        variable.type = ctx.children[0].getText();
        variable.name = leafs[i];
        variable.value = leafs[leafs.length - 1];
        if (!this.variables.has(variable.name)) {
          this.variables.set(variable.name, variable);
        } else {
          console.error(
            `The variable '${variable.name}' has already been declared.`
          );
        }
      }
      return this.visitChildren(ctx);
    }
    // Verifica se é uma declaração sem atribuir valor com muitas variáveis. `int a, b, c;` Por exemplo
    else if (ctx.children[1].children.length > 1) {
      this.getLeafs(ctx.children[1], leafs);
      for (let leaf of leafs) {
        if (leaf === ",") {
          continue;
        }

        variable = {};
        variable.type = ctx.children[0].getText();
        variable.name = leaf;
        variable.value = undefined;
        if (!this.variables.has(variable.name)) {
          this.variables.set(variable.name, variable);
        } else {
          console.error(
            `The variable '${variable.name}' has already been declared.`
          );
        }
      }
      return this.visitChildren(ctx);
    }

    if (!this.variables.has(variable.name)) {
      this.variables.set(variable.name, variable);
    } else {
      console.error(
        `The variable '${variable.name}' has already been declared.`
      );
    }
    return this.visitChildren(ctx);
  }

  async visitSelectionStatement(ctx) {
    if (ctx.children[0].getText() == "if") {
      ctx.condition = null;
      const leafs = [];
      this.getLeafs(ctx.children[2], leafs);
    }
    await this.visitChildren(ctx);
  }

  visitEqualityExpression(ctx) {
    if (ctx.children.length > 2) {
      const leafs = [];
      this.getLeafs(ctx, leafs, ["(", ")"]);
      if (leafs[0] === leafs[2]) {
        this.findSelectionParent(ctx.parentCtx, true);
      } else {
        this.findSelectionParent(ctx.parentCtx, false);
      }
    }
    return "this.visitChildren(ctx)";
  }

  visitStatement(ctx) {
    if (
      ctx.parentCtx.constructor.name == "SelectionStatementContext" &&
      ctx.parentCtx.condition === false
    ) {
      return null;
    }
    return this.visitChildren(ctx);
  }

  visitPostfixExpression(ctx) {
    console.log(ctx.getText());
    return this.visitChildren(ctx);
  }
}
