import { app } from "../../scripts/app.js";

app.registerExtension({
    name: "Shaker.BigDisplayUI.Minimalist",
    async beforeRegisterNodeDef(nodeType, nodeData) {
        if (nodeData.name === "ShakerDisplay") {
            
            const onNodeCreated = nodeType.prototype.onNodeCreated;
            nodeType.prototype.onNodeCreated = function () {
                if (onNodeCreated) onNodeCreated.apply(this, arguments);
                
                // Properties only - no visible widgets for these
                this.properties = this.properties || {};
                this.properties["font_size"] = 24;
                this.properties["text_color"] = "#00ff88"; 
                
                this.displayValue = "Ready";
                this.size = [350, 120];
            };

            nodeType.prototype.onDrawForeground = function (ctx) {
                if (this.flags.collapsed) return;
                
                const fontSize = this.properties.font_size || 24;
                const color = this.properties.text_color || "#00ff88";
                
                ctx.save();
                ctx.font = `bold ${fontSize}px monospace`;
                ctx.fillStyle = color;
                ctx.textAlign = "left";
                
                const lines = String(this.displayValue).split('\n'); 
                
                // Start drawing immediately below the input slot (approx y=50)
                let y_offset = 60; 
                
                for (let rawLine of lines) {
                    let displayText = rawLine.includes(":") ? rawLine.split(":")[1].trim() : rawLine;
                    if (displayText) {
                        ctx.fillText(displayText, 15, y_offset);
                        y_offset += fontSize * 1.3;
                    }
                }
                ctx.restore();
            };

            const onExecuted = nodeType.prototype.onExecuted;
            nodeType.prototype.onExecuted = function (message) {
                if (onExecuted) onExecuted.apply(this, arguments);
                if (message.text) { 
                    this.displayValue = message.text[0]; 
                    this.setDirtyCanvas(true, true); 
                }
            };
        }
    }
});