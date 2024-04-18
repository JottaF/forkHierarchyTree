export class ImpressionNode {
    constructor(content = null, sleep = null) {
        this.content = content
        this.children = []
        this.sleep = sleep
        this.color = null
    }

    addChild(node) {
        this.children.push(node)
    }
}