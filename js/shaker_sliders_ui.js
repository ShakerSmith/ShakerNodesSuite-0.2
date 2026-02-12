import { app } from "../../scripts/app.js";

const SLIDER_TYPES = ["ShakerIntegerSlider", "ShakerFloatSlider", "ShakerStringSlider"];

app.registerExtension({
    name: "Shaker.Sliders.NativeMaster",
    async beforeRegisterNodeDef(nodeType, nodeData) {
        if (SLIDER_TYPES.includes(nodeData.name)) {
            
            const onNodeCreated = nodeType.prototype.onNodeCreated;
            nodeType.prototype.onNodeCreated = function () {
                if (onNodeCreated) onNodeCreated.apply(this, arguments);
                
                this.properties = this.properties || {};
                this.properties["label_text"] = "value";
                this.properties["min_val"] = nodeData.name === "ShakerFloatSlider" ? 0.0 : 0;
                this.properties["max_val"] = nodeData.name === "ShakerFloatSlider" ? 1.0 : 100;
                this.properties["step"] = nodeData.name === "ShakerFloatSlider" ? 0.01 : 1;
                
                const widget = this.widgets[0];
                if (widget) {
                    widget.options.min = this.properties["min_val"];
                    widget.options.max = this.properties["max_val"];
                    widget.options.step = this.properties["step"] * 10;
                    
                    // Clean Label: Set the widget name to the property value
                    Object.defineProperty(widget, "label", {
                        get() { return this.node.properties["label_text"] || "value"; },
                        set(v) {},
                        configurable: true
                    });
                }
            };

            const onPropertyChanged = nodeType.prototype.onPropertyChanged;
            nodeType.prototype.onPropertyChanged = function (name, value) {
                if (onPropertyChanged) onPropertyChanged.apply(this, arguments);
                const widget = this.widgets[0];
                if (!widget) return;

                if (name === "min_val") widget.options.min = parseFloat(value);
                if (name === "max_val") widget.options.max = parseFloat(value);
                if (name === "step") widget.options.step = parseFloat(value) * 10;
                
                this.setDirtyCanvas(true, true);
            };
        }
    }
});