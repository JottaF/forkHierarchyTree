import { ForkTree } from "../ForkTree";

export class Process {
  /**
   *
   * @param {blockItem} number
   * @param {ForkTree} node
   */
  constructor(blockItem, node) {
    this.blockItem = blockItem;
    this.variables = new Map();
    this.isActivated = true;
    this.isSleeping = true;
    this.tree = node;
    this.count = 0;
    this.pid = node.pid;
    this.nextProcess = null;
  }

  //TODO: Percorrer a arvoré até achar o nó que originou o processo e, a partir dele, iniciar o processo

  addProcess(process) {
    if (this.nextProcess != null) {
      this.nextProcess.addProcess(process);
    } else {
      this.nextProcess = process;
    }
  }
}
