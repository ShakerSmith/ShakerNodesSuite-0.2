import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";

const ShakerManager = {
    startTime: 0,
    elapsed: 0,
    isRunning: false,
    activeNodes: new Set(),

    formatTime(ms) {
        if (ms < 0) ms = 0;
        const totalSeconds = Math.floor(ms / 1000);
        const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
        const min = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
        const sec = String(totalSeconds % 60).padStart(2, '0');
        
        // Extract tenths of a second
        // (ms % 1000) / 100 gives us the first digit of the millisecond remainder
        const tenths = Math.floor((ms % 1000) / 100);
        
        return `${hrs}:${min}:${sec}.${tenths}`;
    },

    start() {
        this.isRunning = true;
        this.startTime = Date.now();
        this.updateLoop();
    },

    stop() {
        if (!this.isRunning) return;
        this.isRunning = false;
        this.elapsed = Date.now() - this.startTime;
    },

    updateLoop() {
        if (!this.isRunning) return;
        for (let node of this.activeNodes) {
            node.setDirtyCanvas(true, false);
        }
        requestAnimationFrame(() => this.updateLoop());
    }
};

app.registerExtension({
    name: "ShakerTimer",
    async beforeRegisterNodeDef(nodeType, nodeData) {
        if (nodeData.name === "ShakerTimer") {
            
            nodeType.prototype.onNodeCreated = function() {
                this.properties = this.properties || {};
                this.properties.fontSize = this.properties.fontSize || 60;
                this.properties.fontColor = this.properties.fontColor || "#00FFCC";
                ShakerManager.activeNodes.add(this);
            };

            nodeType.prototype.onDrawForeground = function(ctx) {
                if (this.flags.collapsed) return;

                const timeNow = ShakerManager.isRunning 
                    ? Date.now() - ShakerManager.startTime 
                    : ShakerManager.elapsed;

                const timeStr = ShakerManager.formatTime(timeNow);
                
                ctx.save();
                ctx.font = `bold ${this.properties.fontSize}px monospace`; // Monospace is better for jumping digits
                ctx.fillStyle = this.properties.fontColor;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                
                // Add a slight glow effect to make the high-speed digit look "neon"
                ctx.shadowBlur = 15;
                ctx.shadowColor = this.properties.fontColor;

                // Center the text in the node body
                ctx.fillText(timeStr, this.size[0] / 2, this.size[1] / 2);
                ctx.restore();
            };

            // Custom context menu for size and color
            nodeType.prototype.getExtraMenuOptions = function(_, options) {
                const colors = ["#00FFCC", "#FF0077", "#FFFF00", "#FFFFFF", "#FF5500"];
                const sizes = [40, 60, 80, 100, 150];

                options.push({
                    content: "Timer: Font Size",
                    has_submenu: true,
                    callback: (item, options, e, menu) => {
                        new LiteGraph.ContextMenu(sizes.map(s => ({
                            content: `${s}px`,
                            callback: () => { this.properties.fontSize = s; this.setDirtyCanvas(true); }
                        })), { event: e, parentMenu: menu });
                    }
                },
                {
                    content: "Timer: Font Color",
                    has_submenu: true,
                    callback: (item, options, e, menu) => {
                        new LiteGraph.ContextMenu(colors.map(c => ({
                            content: c,
                            callback: () => { this.properties.fontColor = c; this.setDirtyCanvas(true); }
                        })), { event: e, parentMenu: menu });
                    }
                });
            };

            nodeType.prototype.onRemoved = function() { ShakerManager.activeNodes.delete(this); };
        }
    },
    setup() {
        api.addEventListener("execution_start", () => ShakerManager.start());
        api.addEventListener("executing", ({ detail }) => { if (detail === null) ShakerManager.stop(); });
        api.addEventListener("execution_error", () => ShakerManager.stop());
    }
});