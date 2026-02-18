import { app } from "../../scripts/app.js";

const ShakerLatentStyler = {
    clean(widget, labelText) {
        if (!widget) return;
        Object.defineProperty(widget, "label", {
            get() { return " "; },
            set(v) {},
            configurable: true 
        });
        widget.options = widget.options || {};
        widget.options.on = labelText;
        widget.options.off = labelText;
    },

    updateVisibility(node) {
        const modeWidget = node.widgets.find(w => w.name === "random_mode");
        const isCustom = modeWidget.value === "custom";
        
        const ratioNames = ["sq_1_1", "por_2_3", "wide_3_2", "cin_16_9", "ult_2_39"];
        const customNames = ["custom_width", "custom_height"];

        node.widgets.forEach(w => {
            if (ratioNames.includes(w.name)) {
                // Hide ratio buttons if in custom mode
                w.type = isCustom ? "hidden" : "toggle";
            }
            if (customNames.includes(w.name)) {
                // Show width/height only if in custom mode
                w.type = isCustom ? "number" : "hidden";
            }
        });

        // Trigger UI refresh
        node.setSize(node.computeSize());
    },

    init(node) {
        const ratioWidgets = node.widgets.filter(w => ["sq_1_1", "por_2_3", "wide_3_2", "cin_16_9", "ult_2_39"].includes(w.name));
        const modeWidget = node.widgets.find(w => w.name === "random_mode");

        // Set up initial cleaning and radio logic
        ratioWidgets.forEach(w => {
            const cleanName = w.options.on || w.name;
            this.clean(w, cleanName);

            const baseCallback = w.callback;
            w.callback = function() {
                if (baseCallback) baseCallback.apply(this, arguments);
                if (this.value === true && modeWidget.value === "manual") {
                    ratioWidgets.forEach(other => {
                        if (this !== other) other.value = false;
                    });
                }
            };
        });

        // Set up Mode Change Logic
        const baseModeCallback = modeWidget.callback;
        modeWidget.callback = () => {
            if (baseModeCallback) baseModeCallback.apply(this, arguments);
            this.updateVisibility(node);
        };

        // Execution Feedback
        const resWidget = node.addWidget("text", "SELECTED", "None", () => {});
        resWidget.serializeValue = () => undefined;
        
        const onExecuted = node.onExecuted;
        node.onExecuted = function(message) {
            if (onExecuted) onExecuted.apply(this, arguments);
            if (message?.applied_res) {
                resWidget.value = message.applied_res[0];
            }
        };

        // Run initial visibility check
        setTimeout(() => this.updateVisibility(node), 10);
    }
};

app.registerExtension({
    name: "ShakerNodes.LatentUI",
    nodeCreated(node) {
        if (node.comfyClass === "LatentGenerator") {
            ShakerLatentStyler.init(node);
        }
    }
});