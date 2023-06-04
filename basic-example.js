
var children = [
    {
        text:{
            name: "PID: 2",
            title: "PPID: 1",
        }
    },
    {
        text:{
            name: "PID: 3",
            title: "PPID: 1",
        }
    },
    {
        text:{
            name: "PID: 4",
            title: "PPID: 1",
        }
    }
];

var chart_config = {
    chart: {
        container: "#output-container",
        
        connectors: {
            type: 'step',
            style: {
                "stroke-width": 2,
            }
        },
        node: {
            HTMLclass: 'nodeExample1'
        }
    },
    nodeStructure: {
        text: {
            name: "PID: 1",
        },
        children: children
    }
};
