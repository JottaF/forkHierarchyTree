import { ForkTree } from "../ForkTree";

export class Process {
  constructor(blockItem, pid) {
    this.blockItem = blockItem;
    this.pid = pid;
    this.variables = new Map();
    this.isActivated = true;
    this.tree = new ForkTree();
  }
}
