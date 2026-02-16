import { app } from "../../scripts/app.js";

app.registerExtension({
    name: "Shaker.ConcatAny",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "ShakerConcatAny") {
            const onConnectionsChange = nodeType.prototype.onConnectionsChange;
            nodeType.prototype.onConnectionsChange = function (type, index, connected, link_info) {
                if (onConnectionsChange) onConnectionsChange.apply(this, arguments);

                // Count how many inputs are currently connected
                let lastConnectedIndex = -1;
                for (let i = 0; i < this.inputs.length; i++) {
                    if (this.inputs[i].link !== null) {
                        lastConnectedIndex = i;
                    }
                }

                // Always show at least 4, or lastConnectedIndex + 2
                const visibleCount = Math.max(4, lastConnectedIndex + 2);
                
                // Toggle visibility of slots
                for (let i = 0; i < this.inputs.length; i++) {
                    const input = this.inputs[i];
                    if (i < visibleCount && i < 20) {
                        input.type = "STRING"; // Show it
                    } else if (input.link === null) {
                        input.type = -1; // Hide it (LiteGraph convention)
                    }
                }
            };
        }
    }
});