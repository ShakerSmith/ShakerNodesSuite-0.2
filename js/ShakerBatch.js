import { app } from "../../scripts/app.js";

app.registerExtension({
    name: "Shaker.ShakerBatch",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "ShakerBatch") {
            const onConnectionsChange = nodeType.prototype.onConnectionsChange;
            nodeType.prototype.onConnectionsChange = function (type, index, connected, link_info) {
                if (onConnectionsChange) onConnectionsChange.apply(this, arguments);

                // Only worry about inputs
                if (type === 1) { 
                    const lastInput = this.inputs[this.inputs.length - 1];
                    // If the very last input is connected, add a new one
                    if (lastInput.link !== null) {
                        this.addInput(`input_${this.inputs.length + 1}`, "*");
                    }
                }
            };
        }
    },
});