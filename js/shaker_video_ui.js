import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";

app.registerExtension({
    name: "Shaker.VideoSaverUI",
    async beforeRegisterNodeDef(nodeType, nodeData) {
        if (nodeData.name === "ShakerVideoSaver") {
            const onNodeCreated = nodeType.prototype.onNodeCreated;
            nodeType.prototype.onNodeCreated = function() {
                if (onNodeCreated) onNodeCreated.apply(this, arguments);
                
                // Mirroring properties from AdvancedImageSave
                this.properties = this.properties || {};
                this.properties["use_instance_settings"] = false;
                this.properties["folder_by_date"] = true;
                this.properties["prefix_timestamp"] = true;
                this.properties["sub_directory"] = "";

                this.addWidget("button", "SAVE AS GLOBAL DEFAULT", null, async () => {
                    const payload = { "ShakerVideoSaver": this.properties };
                    await api.fetchApi("/shakercust/save_global_defaults", { 
                        method: "POST", 
                        body: JSON.stringify(payload) 
                    });
                    alert("Video Saver Defaults Updated!");
                });
            };
        }
    }
});