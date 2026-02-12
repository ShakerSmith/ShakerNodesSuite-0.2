import { app } from "../../scripts/app.js";

app.registerExtension({
    name: "Shaker.LabelFixedPipe",
    async beforeRegisterNodeDef(nodeType, nodeData) {
        
        const syncNode = (node) => {
            if (app.configuringGraph || !node.inputs || !node.outputs) return;

            // Save the current width so we don't shrink the node horizontally
            const originalWidth = node.size[0];

            if (node.comfyClass === "ShakerPipePack") {
                let lastIdx = -1;
                node.inputs.forEach((inp, i) => { if (inp.link !== null) lastIdx = i; });
                const targetIn = Math.max(4, lastIdx + 2);

                while (node.inputs.length < targetIn && node.inputs.length < 20) {
                    node.addInput("in_" + (node.inputs.length + 1), "*");
                }
                while (node.inputs.length > targetIn && node.inputs[node.inputs.length - 1].link === null) {
                    node.removeInput(node.inputs.length - 1);
                }
            } 
            
            else if (node.comfyClass === "ShakerPipeUnpack") {
                const pipeLink = node.inputs[0].link;
                if (!pipeLink) {
                    while (node.outputs.length > 1) node.removeOutput(node.outputs.length - 1);
                    node.outputs[0].name = "pipe_pass";
                } else {
                    const link = app.graph.links[pipeLink];
                    const origin = app.graph.getNodeById(link?.origin_id);
                    if (origin && origin.inputs) {
                        const activeInputs = origin.inputs.filter(inp => inp.link !== null);
                        const targetOut = activeInputs.length + 1; 

                        while (node.outputs.length < targetOut) node.addOutput("temp", "*");
                        while (node.outputs.length > targetOut) node.removeOutput(node.outputs.length - 1);

                        // Apply Labels
                        node.outputs[0].name = "pipe_pass";
                        activeInputs.forEach((inp, i) => {
                            const label = inp.label || inp.name;
                            if (node.outputs[i + 1]) node.outputs[i + 1].name = label;
                        });
                    }
                }
            }
            
            // FIX: Only re-calculate size for these specific nodes and keep original width
            const newSize = node.computeSize();
            node.setSize([originalWidth, newSize[1]]);
        };

        const onConnectionsChange = nodeType.prototype.onConnectionsChange;
        nodeType.prototype.onConnectionsChange = function() {
            if (onConnectionsChange) onConnectionsChange.apply(this, arguments);
            // Only run sync on ShakerPipe nodes to prevent global graph shrinking
            if (this.comfyClass?.startsWith("ShakerPipe")) {
                setTimeout(() => syncNode(this), 0);
            }
        };

        const onNodeCreated = nodeType.prototype.onNodeCreated;
        nodeType.prototype.onNodeCreated = function() {
            if (onNodeCreated) onNodeCreated.apply(this, arguments);
            if (this.comfyClass?.startsWith("ShakerPipe")) {
                setTimeout(() => syncNode(this), 100);
            }
        };
    }
});