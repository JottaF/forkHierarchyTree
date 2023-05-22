import antlr4 from 'antlr4';
import MatematicaListener from './parser/MatematicaListener';
import MatematicaParser from './parser/MatematicaParser';
export default class MatematicaListenerCompleto extends MatematicaListener {
constructor() {
...
}
enterPrograma(ctx) {
...
}
exitPrograma(ctx) {
...
}
enterExpressao(ctx) {
...
}
exitExpressao(ctx) {
...
}
}