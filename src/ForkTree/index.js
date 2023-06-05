class PidController {
  constructor() {
    this.pid = Math.floor(Math.random() * 300 + 300);
  }

  getPid() {
    this.pid += 1;
    return this.pid;
  }
}

class Node {
  constructor(pidController, ppid) {
    this.pidController = pidController;
    this.pid = pidController.getPid();
    this.ppid = ppid;
    this.children = [];
  }

  addChild(pidController) {
    if (this.children.length == 0) {
      const node = new Node(pidController, this.pid);
      this.children.push(node);
    } else {
      const node = new Node(pidController, this.pid);
      for (let child of this.children) {
        child.addChild(pidController, this.pid);
      }
      this.children.push(node);
    }
  }
}

export class ForkTree {
  constructor() {
    this.pidController = new PidController(1);
    this.root = new Node(this.pidController, 1);
    this.count = 0;
  }

  printTree(node = this.root, depth = 0) {
    const indentation = " ".repeat(depth * 4);
    console.log(`${indentation}PID: ${node.pid}, PPID: ${node.ppid}`);

    for (let child of node.children) {
      this.printTree(child, depth + 1); // Chamada recursiva para imprimir os filhos
    }
  }

  addChild() {
    this.root.addChild(this.pidController);
  }

  bundleTree() {
    const bundle = []

    const config = {
      container: "#basic-example",

      connectors: {
        type: "step",
      },
      node: {
        HTMLclass: "nodeExample1",
      },
    };

    const bundleNode = {
      text: {
        name: `PPID: ${this.root.ppid}`,
        title: `PID: ${this.root.pid}`,
      },
    };

    bundle.push(config)
    bundle.push(bundleNode);

    for (let child of this.root.children) {
      bundle.push(...this._bundleTree(child, bundleNode));
    }

    return bundle;
  }

  _bundleTree(node, parent) {
    const bundle = []

    const bundleNode = {
      text: {
        name: `PPID: ${node.ppid}`,
        title: `PID: ${node.pid}`,
      },
      parent: parent,
      stackChildren: true,
    };

    bundle.push(bundleNode);

    for (let child of node.children) {
      bundle.push(...this._bundleTree(child, bundleNode));
    }

    return bundle
  }
}