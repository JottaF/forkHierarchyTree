import CListener from "./CListener";
import { ForkTree } from "../ForkTree";

export default class CListenerSimples extends CListener {
  constructor() {
    super();
    this.variables = [];
    this.tree = new ForkTree();
  }
  exitCompilationUnit(ctx) {
    console.warn("-------------------EXIT CompilationUnit-------------------");
    console.warn("ctx:", ctx);
    console.warn("ctx.getText():", ctx.getText());
    console.warn("this.tree:", this.tree.bundleTree());
  }
  enterBlockItem(ctx) {
    console.debug("-------------------ENTER BlockItem-------------------");
    console.debug("ctx:", ctx);
    console.debug("ctx.getText():", ctx.getText());
    if (ctx.getText().includes("fork()")) {
      this.tree.addChild();
    }
  }
}
