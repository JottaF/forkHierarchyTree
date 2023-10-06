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
    this.tree = node;
    this.count = 0;
    this.pid = node.pid;
    this.nextProcess = null;
  }

  addProcess(process) {
    if (this.nextProcess != null) {
      this.nextProcess.addProcess(process);
    } else {
      this.nextProcess = process;
    }
  }
}
