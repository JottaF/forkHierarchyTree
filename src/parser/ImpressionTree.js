export class ImpressionNode {
    constructor(content = null, sleep = null) {
        this.content = content
        this.children = []
        this.sleep = sleep
    }

    addChild(node) {
        this.children.push(node)
    }
}