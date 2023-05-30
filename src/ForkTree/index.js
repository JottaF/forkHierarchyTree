class Node {
  constructor(value) {
    this.value = value;
    this.children = [];
  }

  addChild(node) {
    this.children.push(node);
  }
}

class ForkTree {
  constructor(rootValue) {
    this.root = new Node(rootValue);
  }

  traverse() {
    this._traverseTree(this.root);
  }

  _traverseTree(node) {
    console.log(node.value);

    if (node.children.length > 0) {
      for (let child of node.children) {
        this._traverseTree(child);
      }
    }
  }

  printTree() {
    this._printSubtree(this.root, "");
  }

  _printSubtree(node, prefix) {
    console.log(`${prefix}${node.value}`);

    if (node.children.length > 0) {
      const childPrefix = prefix + "  |__";

      for (let i = 0; i < node.children.length - 1; i++) {
        const child = node.children[i];
        this._printSubtree(child, childPrefix + "  |");
      }

      const lastChild = node.children[node.children.length - 1];
      this._printSubtree(lastChild, childPrefix + "   ");
    }
  }

  addNodeToHierarchy(parentValue, nodeValue) {
    const parentNode = this._findNode(this.root, parentValue);

    if (parentNode) {
      const newNode = new Node(nodeValue);
      parentNode.addChild(newNode);

      for (let child of parentNode.children) {
        this._addNodeToHierarchy(child, newNode);
      }
    } else {
      console.log("O nó pai não foi encontrado na árvore.");
    }
  }

  _findNode(node, value) {
    if (node.value === value) {
      return node;
    } else {
      for (let child of node.children) {
        const foundNode = this._findNode(child, value);
        if (foundNode) {
          return foundNode;
        }
      }
    }

    return null;
  }

  _addNodeToHierarchy(node, newNode) {
    const childNode = new Node(newNode.value);
    node.addChild(childNode);

    for (let child of node.children) {
      this._addNodeToHierarchy(child, childNode);
    }
  }
}

// Exemplo de uso:
const tree = new ForkTree("Pai");

const node2 = new Node("Filho 1");
const node3 = new Node("Filho 2");
const node4 = new Node("Filho 3");

const node5 = new Node(5);
const node6 = new Node(6);

tree.root.addChild(node2);
tree.root.addChild(node3);
tree.root.addChild(node4);

node2.addChild(node5);
node2.addChild(node6);

tree.printTree();
console.log("-----");

tree.addNodeToHierarchy("Filho 1", "Filho do 1");

tree.printTree();
