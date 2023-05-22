import antlr4 from "antlr4";
import CListener from "./CListener";

export default class CListenerSimples extends CListener {
  enterTypeSpecifier(ctx) {
    console.debug("-------------------ENTER TypeSpecifier-------------------");
    console.debug("ctx:", ctx);
    console.debug("ctx.getText():", ctx.getText());
  }
  exitTypeSpecifier(ctx) {
    console.debug("-------------------EXIT TypeSpecifier-------------------");
    console.debug("ctx:", ctx);
    console.debug("ctx.getText():", ctx.getText());
  }
  enterDirectDeclarator(ctx) {
    console.debug(
      "-------------------ENTER DirectDeclarator-------------------"
    );
    console.debug("ctx:", ctx);
    console.debug("ctx.getText():", ctx.getText());
  }
  exitDirectDeclarator(ctx) {
    console.debug(
      "-------------------EXIT DirectDeclarator-------------------"
    );
    console.debug("ctx:", ctx);
    console.debug("ctx.getText():", ctx.getText());
  }
  enterInitDeclaratorList(ctx) {
    console.debug(
      "-------------------ENTER InitDeclaratorList-------------------"
    );
    console.debug("ctx:", ctx);
    console.debug("ctx.getText():", ctx.getText());
  }
  exitInitDeclaratorList(ctx) {
    console.debug(
      "-------------------EXIT InitDeclaratorList-------------------"
    );
    console.debug("ctx:", ctx);
    console.debug("ctx.getText():", ctx.getText());
  }
  enterInitializer(ctx) {
    console.debug(
      "-------------------ENTER Initializer-------------------"
    );
    console.debug("ctx:", ctx);
    console.debug("ctx.getText():", ctx.getText());
  }
  exitInitializer(ctx) {
    console.debug(
      "-------------------EXIT Initializer-------------------"
    );
    console.debug("ctx:", ctx);
    console.debug("ctx.getText():", ctx.getText());
  }
  enterPrimaryExpression(ctx) {
    console.debug(
      "-------------------ENTER PrimaryExpression-------------------"
    );
    console.debug("ctx:", ctx);
    console.debug("ctx.getText():", ctx.getText());
  }
  exitPrimaryExpression(ctx) {
    console.debug(
      "-------------------EXIT PrimaryExpression-------------------"
    );
    console.debug("ctx:", ctx);
    console.debug("ctx.getText():", ctx.getText());
  }
}
