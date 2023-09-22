import { ForkTree } from "../ForkTree";

export class Process {
  /**
   *
   * @param {blockItem} blockItem
   * @param {ForkTree} node
   */
  constructor(blockItem, node) {
    this.blockItem = blockItem;
    this.variables = new Map();
    this.isActivated = true;
    this.tree = node;
    this.count = 0;
    this.pid = 0;
  }
}
