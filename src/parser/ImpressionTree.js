export class ImpressionNode {
    constructor(content = null) {
        this.content = content
        this.children = []
    }

    addChild(node) {
        this.children.push(node)
    }
}