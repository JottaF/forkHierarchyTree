import antlr4 from "antlr4";
import CLexer from "./parser/CLexer";
import CParser from "./parser/CParser";
import CListenerSimples from "./parser/CListenerSimples";
// import CListenerCompleto from "./CListenerCompleto";
export let parse = (input) => {
  const stream = new antlr4.InputStream(input);
  const lexer = new CLexer(stream);
  const tokens = new antlr4.CommonTokenStream(lexer);
  const parser = new CParser(tokens);
  parser.buildParseTrees = true;
  const tree = parser.compilationUnit();

  const listener = new CListenerSimples();
  antlr4.tree.ParseTreeWalker.DEFAULT.walk(listener, tree);

  return listener.tree;
};
