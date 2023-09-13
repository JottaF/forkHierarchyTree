export class Process {
  constructor(blockItem) {
    this.blockItem = blockItem;
    this.variables = new Map();
    this.isActivated = true;
  }
}
