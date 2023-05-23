import antlr4 from "antlr4";
import CListener from "./CListener";

export default class CListenerSimples extends CListener {
  constructor() {
    super();
    this.variables = [];
  }
  enterCompilationUnit(ctx) {
    console.debug(
      "-------------------ENTER CompilationUnit-------------------"
    );
    console.debug("ctx:", ctx);
    console.debug("ctx.getText():", ctx.getText());
    ctx.variables = {};
  }
  exitCompilationUnit(ctx) {
    console.warn("-------------------EXIT CompilationUnit-------------------");
    console.warn("ctx:", ctx);
    console.warn("ctx.getText():", ctx.getText());
    this.variables.push(ctx.variables);
    console.warn("this.variables:", this.variables);
  }
  enterTypeSpecifier(ctx) {
    console.debug("-------------------ENTER TypeSpecifier-------------------");
    console.debug("ctx:", ctx);
    console.debug("ctx.getText():", ctx.getText());
  }
  exitTypeSpecifier(ctx) {
    console.warn("-------------------EXIT TypeSpecifier-------------------");
    console.warn("ctx:", ctx);
    console.warn("ctx.getText():", ctx.getText());
  }
  enterDirectDeclarator(ctx) {
    console.debug(
      "-------------------ENTER DirectDeclarator-------------------"
    );
    console.debug("ctx:", ctx);
    console.debug("ctx.getText():", ctx.getText());
  }
  exitDirectDeclarator(ctx) {
    console.warn("-------------------EXIT DirectDeclarator-------------------");
    console.warn("ctx:", ctx);
    console.warn("ctx.getText():", ctx.getText());
    const variable = ctx.getText();
    ctx.variables[variable] = null;
  }
  enterInitDeclaratorList(ctx) {
    console.debug(
      "-------------------ENTER InitDeclaratorList-------------------"
    );
    console.debug("ctx:", ctx);
    console.debug("ctx.getText():", ctx.getText());
  }
  exitInitDeclaratorList(ctx) {
    console.warn(
      "-------------------EXIT InitDeclaratorList-------------------"
    );
    console.warn("ctx:", ctx);
    console.warn("ctx.getText():", ctx.getText());
    console.warn("ctx.children:", ctx.children);
  }
  enterInitializer(ctx) {
    console.debug("-------------------ENTER Initializer-------------------");
    console.debug("ctx:", ctx);
    console.debug("ctx.getText():", ctx.getText());
  }
  exitInitializer(ctx) {
    console.warn("-------------------EXIT Initializer-------------------");
    console.warn("ctx:", ctx);
    console.warn("ctx.getText():", ctx.getText());

    ctx.variables;
  }
  enterPrimaryExpression(ctx) {
    console.debug(
      "-------------------ENTER PrimaryExpression-------------------"
    );
    console.debug("ctx:", ctx);
    console.debug("ctx.getText():", ctx.getText());
  }
  exitPrimaryExpression(ctx) {
    console.warn(
      "-------------------EXIT PrimaryExpression-------------------"
    );
    console.warn("ctx:", ctx);
    console.warn("ctx.getText():", ctx.getText());
  }
}
