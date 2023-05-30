import antlr4 from "antlr4";
import CListener from "./CListener";

export default class CListenerSimples extends CListener {
  constructor() {
    super();
    this.variables = [];
    this.forks = [];
  }
  enterCompilationUnit(ctx) {
    console.debug(
      "-------------------ENTER CompilationUnit-------------------"
    );
    console.debug("ctx:", ctx);
    console.error("ctx.getText():", ctx.getText());
    ctx.variables = {};
    console.debug("------------------------------------------------------\n");
  }
  exitCompilationUnit(ctx) {
    console.warn("-------------------EXIT CompilationUnit-------------------");
    console.warn("ctx:", ctx);
    console.error("ctx.getText():", ctx.getText());
    this.variables.push(ctx.variables);
    console.warn("this.variables:", this.variables);
    console.warn("this.forks:", this.forks);
    console.warn("------------------------------------------------------\n");
  }

  enterBlockItem(ctx) {
    console.debug("-------------------ENTER BlockItem-------------------");
    console.debug("ctx:", ctx);
    console.error("ctx.getText():", ctx.getText());
    console.debug("------------------------------------------------------\n");
    if (ctx.getText().includes("fork(")) {
      console.log('\n\nTem fork\n\n');
      this.forks.push(1);
      ctx.forks.push(1);
    }
  }
  exitBlockItem(ctx) {
    console.warn("-------------------EXIT BlockItem-------------------");
    console.warn("ctx:", ctx);
    console.error("ctx.getText():", ctx.getText());
    console.error("ctx.children:", ctx.children[0].getText().length);
    console.warn("------------------------------------------------------\n");
  }

  enterDeclaration(ctx) {
    console.debug("-------------------ENTER Declaration-------------------");
    console.debug("ctx:", ctx);
    console.error("ctx.getText():", ctx.getText());
    console.debug("------------------------------------------------------\n");
  }
  exitDeclaration(ctx) {
    console.warn("-------------------EXIT Declaration-------------------");
    console.warn("ctx:", ctx);
    console.error("ctx.getText():", ctx.getText());
    console.warn("------------------------------------------------------\n");
  }

  enterTypeSpecifier(ctx) {
    console.debug("-------------------ENTER TypeSpecifier-------------------");
    console.debug("ctx:", ctx);
    console.error("ctx.getText():", ctx.getText());
    console.debug("------------------------------------------------------\n");
  }
  exitTypeSpecifier(ctx) {
    console.warn("-------------------EXIT TypeSpecifier-------------------");
    console.warn("ctx:", ctx);
    console.error("ctx.getText():", ctx.getText());
    console.warn("------------------------------------------------------\n");
  }

  enterInitDeclaratorList(ctx) {
    console.debug(
      "-------------------ENTER InitDeclaratorList-------------------"
    );
    console.debug("ctx:", ctx);
    console.error("ctx.getText():", ctx.getText());
    console.debug("------------------------------------------------------\n");
  }
  exitInitDeclaratorList(ctx) {
    console.warn(
      "-------------------EXIT InitDeclaratorList-------------------"
    );
    console.warn("ctx:", ctx);
    console.error("ctx.getText():", ctx.getText());
    console.warn("------------------------------------------------------\n");
    console.warn("ctx.children:", ctx.children);
  }

  enterDirectDeclarator(ctx) {
    console.debug(
      "-------------------ENTER DirectDeclarator-------------------"
    );
    console.debug("ctx:", ctx);
    console.error("ctx.getText():", ctx.getText());
    console.debug("------------------------------------------------------\n");
  }
  exitDirectDeclarator(ctx) {
    console.warn("-------------------EXIT DirectDeclarator-------------------");
    console.warn("ctx:", ctx);
    console.error("ctx.getText():", ctx.getText());
    console.warn("------------------------------------------------------\n");
  }

  enterInitializer(ctx) {
    console.debug("-------------------ENTER Initializer-------------------");
    console.debug("ctx:", ctx);
    console.error("ctx.getText():", ctx.getText());
    console.debug("------------------------------------------------------\n");
  }
  exitInitializer(ctx) {
    console.warn("-------------------EXIT Initializer-------------------");
    console.warn("ctx:", ctx);
    console.error("ctx.getText():", ctx.getText());
    console.warn("------------------------------------------------------\n");

    ctx.variables;
  }

  enterPrimaryExpression(ctx) {
    console.debug(
      "-------------------ENTER PrimaryExpression-------------------"
    );
    console.debug("ctx:", ctx);
    console.error("ctx.getText():", ctx.getText());
    console.debug("------------------------------------------------------\n");
  }
  exitPrimaryExpression(ctx) {
    console.warn(
      "-------------------EXIT PrimaryExpression-------------------"
    );
    console.warn("ctx:", ctx);
    console.error("ctx.getText():", ctx.getText());
    console.warn("------------------------------------------------------\n");
  }
}
