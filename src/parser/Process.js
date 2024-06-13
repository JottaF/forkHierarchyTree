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
    this.forkEnabled = false;
    this.pid = node.pid;
    this.context = {};
    this.messageSequence = 0;
    this.color;
  }
}
