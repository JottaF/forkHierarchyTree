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

  addChild(pidController, ppid, node) {
    if (this.pid === ppid) {
      const newNode = new Node(pidController, this.pid);
      if (node) {
        newNode.children = [...node.children];
        newNode.pid = node.pid;
      }
      this.children.push(newNode);
      console.log(newNode.pid);
      return newNode.pid;
    } else {
      if (this.children.length > 0) {
        for (let i of this.children) {
          i.addChild(pidController, ppid, node);
        }
      }
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

  addChild(ppid, node) {
    return this.root.addChild(
      this.pidController,
      ppid ? ppid : this.root.pid,
      node
    );
  }

  bundleTree() {
    const bundle = [];

    const config = {
      container: "#output-container",

      connectors: {
        type: "step",
      },
      node: {
        HTMLclass: "nodeExample1",
      },
    };

    const bundleNode = {
      text: {
        title: `PPID: ${this.root.ppid}`,
        name: `PID: ${this.root.pid}`,
      },
    };

    bundle.push(config);
    bundle.push(bundleNode);

    for (let child of this.root.children) {
      bundle.push(...this._bundleTree(child, bundleNode));
    }

    return bundle;
  }

  _bundleTree(node, parent) {
    const bundle = [];

    const bundleNode = {
      text: {
        title: `PPID: ${node.ppid}`,
        name: `PID: ${node.pid}`,
      },
      parent: parent,
      stackChildren: true,
    };

    bundle.push(bundleNode);

    for (let child of node.children) {
      bundle.push(...this._bundleTree(child, bundleNode));
    }

    return bundle;
  }
}
