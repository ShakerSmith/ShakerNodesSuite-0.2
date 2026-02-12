import { app } from "../../scripts/app.js";

app.registerExtension({
    name: "Shaker.VideoSourceUI",
    async beforeRegisterNodeDef(nodeType, nodeData) {
        if (nodeData.name === "ShakerVideoSource") {
            const onNodeCreated = nodeType.prototype.onNodeCreated;
            nodeType.prototype.onNodeCreated = function() {
                if (onNodeCreated) onNodeCreated.apply(this, arguments);
                
                const modeWidget = this.widgets.find(w => w.name === "source_mode");
                const uploadWidget = this.widgets.find(w => w.name === "upload_image");

                // Dynamic visibility logic
                const updateVisibility = () => {
                    const isManual = modeWidget.value === "Manual Upload";
                    uploadWidget.type = isManual ? "combo" : "hidden";
                    // Adjust node size based on visible widgets
                    this.size = [300, isManual ? 120 : 60];
                };

                modeWidget.callback = updateVisibility;
                setTimeout(updateVisibility, 10); // Initial check
            };
        }
    }
});