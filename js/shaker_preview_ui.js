import { app } from "../../scripts/app.js";

app.registerExtension({
    name: "ShakerNodes.PreviewMirror",
    async beforeRegisterNodeDef(nodeType, nodeData) {
        if (nodeData.name === "ShakerLivePreviewMirror") {
            
            // Initialize the canvas and image objects when the node is created
            nodeType.prototype.onNodeCreated = function() {
                this.size = [320, 320];
                this.previewImage = new Image();
            };

            // Logic to draw the image onto the node face
            nodeType.prototype.onDrawForeground = function(ctx) {
                if (this.flags.collapsed) return;
                
                if (this.previewImage.src) {
                    const margin = 10;
                    const w = this.size[0] - margin * 2;
                    const h = this.size[1] - margin * 2;
                    
                    const imgAspect = this.previewImage.width / this.previewImage.height;
                    const nodeAspect = w / h;
                    
                    let drawW = w;
                    let drawH = h;
                    
                    if (imgAspect > nodeAspect) {
                        drawH = w / imgAspect;
                    } else {
                        drawW = h * imgAspect;
                    }

                    // Draw image centered within the node
                    ctx.drawImage(
                        this.previewImage, 
                        margin + (w - drawW) / 2, 
                        margin + (h - drawH) / 2, 
                        drawW, 
                        drawH
                    );
                } else {
                    // Placeholder text when idle
                    ctx.fillStyle = "#222";
                    ctx.fillRect(10, 10, this.size[0]-20, this.size[1]-20);
                    ctx.fillStyle = "#666";
                    ctx.font = "14px Arial";
                    ctx.textAlign = "center";
                    ctx.fillText("Waiting for active sampler...", this.size[0]/2, this.size[1]/2);
                }
            };
        }
    },

    setup() {
        // Global listener for the preview message stream
        app.api.addEventListener("b_preview", (event) => {
            const blob = event.detail;
            const url = URL.createObjectURL(blob);
            
            // Find all Mirror nodes in the graph and update them
            const mirrorNodes = app.graph._nodes.filter(n => n.comfyClass === "ShakerLivePreviewMirror");
            
            mirrorNodes.forEach(node => {
                const oldUrl = node.previewImage.src;
                node.previewImage.src = url;
                node.setDirtyCanvas(true, false);
                
                // Memory management: Revoke the old blob URL to prevent leaks
                if (oldUrl && oldUrl.startsWith("blob:")) {
                    URL.revokeObjectURL(oldUrl);
                }
            });
        });
    }
});