import { app } from "../../scripts/app.js";

app.registerExtension({
    name: "ShakerNodes.MasterController",
    async beforeRegisterNodeDef(nodeType, nodeData) {
        if (nodeData.name === "ShakerMasterController") {
            
            nodeType.prototype.onNodeCreated = function() {
                const btnStyle = "margin-top: 5px; height: 30px;";

                // Helper to find all Shaker Category nodes in the current graph
                const getShakerNodes = () => app.graph._nodes.filter(n => n.comfyClass?.startsWith("ShakerCust_") && n.comfyClass !== "ShakerCustMainConsole");

                // 1. SET ALL TO MANUAL
                this.addWidget("button", "SET ALL TO MANUAL", null, () => {
                    getShakerNodes().forEach(node => {
                        const modeW = node.widgets.find(w => w.name === "random_mode");
                        if (modeW) modeW.value = "manual";
                    });
                });

                // 2. SET ALL TO RANDOM
                this.addWidget("button", "SET ALL TO RANDOM", null, () => {
                    getShakerNodes().forEach(node => {
                        const modeW = node.widgets.find(w => w.name === "random_mode");
                        if (modeW) modeW.value = "random select";
                    });
                });

                // 3. CLEAR RANDOMS
                this.addWidget("button", "CLEAR RANDOMS", null, () => {
                    getShakerNodes().forEach(node => {
                        const modeW = node.widgets.find(w => w.name === "random_mode");
                        if (modeW?.value !== "manual") {
                            node.widgets.filter(w => w.name.startsWith("preset_")).forEach(w => w.value = false);
                        }
                    });
                });

                // 4. CLEAR ALL SELECTIONS
                this.addWidget("button", "CLEAR ALL SELECTIONS", null, () => {
                    getShakerNodes().forEach(node => {
                        node.widgets.filter(w => w.name.startsWith("preset_")).forEach(w => w.value = false);
                    });
                });
            };
        }
    }
});