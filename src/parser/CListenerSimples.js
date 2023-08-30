import CListener from "./CListener";
import { ForkTree } from "../ForkTree";

export default class CListenerSimples extends CListener {
  constructor() {
    super();
    this.variables = new Map();
    this.tree = new ForkTree();
  }

  getLeafs(node, leafs) {
    if (!node.children) {
      if (node.getText() != "=" && node.getText() != ",") {
        const parseNumber = Number(node.getText());
        if (parseNumber) {
          leafs.push(Number(node.getText()));
        } else {
          leafs.push(node.getText());
        }
      }
    } else {
      for (let n of node.children) {
        this.getLeafs(n, leafs);
      }
    }
  }

  exitCompilationUnit(ctx) {
    console.warn("-------------------EXIT CompilationUnit-------------------");
    console.warn("ctx:", ctx);
    console.warn("ctx.getText():", ctx.getText());
    console.warn("this.tree:", this.tree.bundleTree());
    console.warn("this.variables:", this.variables);
  }

  enterBlockItem(ctx) {
    console.debug("-------------------ENTER BlockItem-------------------");
    console.debug("ctx:", ctx);
    console.debug("ctx.getText():", ctx.getText());
    if (ctx.getText().includes("fork()")) {
      this.tree.addChild();
    }
  }

  // Enter a parse tree produced by CParser#declaration.
  enterDeclaration(ctx) {
    console.debug("-------------------ENTER Declaration-------------------");
    console.debug("ctx:", ctx);
    console.debug("ctx.getText():", ctx.getText());
    console.debug("ctx.children.length:", ctx.children.length);
    console.debug("ctx.children:", ctx.children);
    console.debug("first child:", ctx.children[0].getText());
    console.debug("second child:", ctx.children[1].getText());
    // console.debug("terceiro child:", ctx.children[2].getText());

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
      variable.value = leafs[1];
      console.log(variable);
    }
    // Verifica se é uma declaração sem atribuir valor com muitas variáveis. `int a, b, c = 0;` Por exemplo
    else if (ctx.children[1].children[ctx.children[1].children.length-1].children.length == 3) {
      this.getLeafs(ctx.children[1], leafs);
      for (let i = 0; i < leafs.length-1; i++) {
        variable = {}
        variable.type = ctx.children[0].getText();
        variable.name = leafs[i]
        variable.value = leafs[leafs.length-1]
        if (!this.variables.has(variable.name)){
          this.variables.set(variable.name, variable);
        } else {
          console.error(`The variable '${variable.name}' has already been declared.`)
        }
      }
      return
    }
    // Verifica se é uma declaração sem atribuir valor com muitas variáveis. `int a, b, c;` Por exemplo
    else if (ctx.children[1].children.length > 1) {
      this.getLeafs(ctx.children[1], leafs);
      for (let leaf of leafs) {
        variable = {}
        variable.type = ctx.children[0].getText();
        variable.name = leaf
        variable.value = undefined
        if (!this.variables.has(variable.name)){
          this.variables.set(variable.name, variable);
        } else {
          console.error(`The variable '${variable.name}' has already been declared.`)
        }
      }
      return
    }
    
    if (!this.variables.has(variable.name)){
      this.variables.set(variable.name, variable);
    } else {
      console.error(`The variable '${variable.name}' has already been declared.`)
    }
  }
}
