import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";

/**
 * SHAKER NODES INTERNAL STYLER
 * Updated to respect the Category Settings managed via the Preset Manager.
 */
const ShakerStyler = {
    clean(widget, labelText) {
        if (!widget) return;
        Object.defineProperty(widget, "label", {
            get() { return " "; },
            set(v) {},
            configurable: true 
        });
        if (widget.options && widget.type !== "combo") {
            widget.options.on = labelText;
            widget.options.off = labelText;
        }
    },

    async apply(node) {
        const catName = node.comfyClass.replace("ShakerCust_", "").replace("Presets", "").replace("_", " ");
        
        // Fetch current global settings
        const res = await api.fetchApi("/shakercust/get_presets");
        const data = await res.json();
        const settings = data.category_settings?.[catName] || { multi_select: false };

        const modeW = node.widgets.find(w => w.name === "random_mode");
        const presetWidgets = node.widgets.filter(w => w.name.startsWith("preset_"));

        presetWidgets.forEach(w => {
            const cleanName = w.name.replace("preset_", "").replace(/_/g, " ");
            this.clean(w, cleanName);

            const baseCallback = w.callback;
            w.callback = function() {
                if (baseCallback) baseCallback.apply(this, arguments);
                
                // MULTI-SELECT CHECK (Managed in PM):
                const multiSelectAllowed = settings.multi_select === true;

                if (this.value === true && modeW?.value === "manual" && !multiSelectAllowed) {
                    presetWidgets.forEach(other => {
                        if (this !== other) other.value = false;
                    });
                }
            };
        });
    }
};

app.registerExtension({
    name: "ShakerNodes.InternalStyler",
    nodeCreated(node) {
        if (node.comfyClass?.startsWith("ShakerCust_") && node.comfyClass.endsWith("Presets")) {
            ShakerStyler.apply(node);
        }
    }
});