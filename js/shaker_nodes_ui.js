import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";
import { PresetManagerPanel, SceneManagerPanel } from "./shaker_ui_panels.js";

const extensionName = "ShakerNodes.MasterUI.v64.FinalSync";

app.registerExtension({
    name: extensionName,
    
    async beforeRegisterNodeDef(nodeType, nodeData) {
        // --- Metadata Filter Properties ---
        if (nodeData.name === "ShakerMetadataFilter") {
            const onNodeCreated = nodeType.prototype.onNodeCreated;
            nodeType.prototype.onNodeCreated = function() {
                if (onNodeCreated) onNodeCreated.apply(this, arguments);
                this.properties = this.properties || {};
                api.fetchApi("/shakercust/get_presets").then(res => res.json()).then(data => {
                    (data.build_order || []).forEach(cat => {
                        if (this.properties[cat] === undefined) this.properties[cat] = true;
                    });
                });
            };
        }
    },

    setup() {
        // Initialize Panels
        window.pm = new PresetManagerPanel("shaker-pm-v64", "SHAKER PRESET MANAGER");
        window.sm = new SceneManagerPanel("shaker-sm-v64", "SHAKER SCENE MANAGER");
        
        // --- Floating Navigation Bubble ---
        const float = document.createElement("div");
        float.id = "shaker-nav-bubble";
        float.style.cssText = `
            position: fixed; 
            bottom: 20px; 
            right: 20px; 
            z-index: 10000; 
            display: flex; 
            gap: 12px; 
            padding: 12px;
            background: rgba(20, 20, 25, 0.7); 
            backdrop-filter: blur(12px) saturate(180%);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 18px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
            cursor: move;
            user-select: none;
            align-items: center;
        `;

        float.innerHTML = `
            <button id="btn-pm-float" title="Open Preset Manager" style="width:42px; height:42px; border-radius:12px; background:linear-gradient(135deg, #6e8efb, #a777e3); color:white; font-weight:800; cursor:pointer; border:none; box-shadow: 0 4px 10px rgba(0,0,0,0.2); font-size:12px;">PM</button>
            <button id="btn-sm-float" title="Open Scene Manager" style="width:42px; height:42px; border-radius:12px; background:linear-gradient(135deg, #f6d365, #fda085); color:white; font-weight:800; cursor:pointer; border:none; box-shadow: 0 4px 10px rgba(0,0,0,0.2); font-size:12px;">SM</button>
        `;
        document.body.appendChild(float);
        
        // --- Dragging Logic ---
        let isDragging = false;
        let startX, startY, initialLeft, initialTop;

        float.onmousedown = (e) => {
            if (e.target.tagName === 'BUTTON') return;
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            initialLeft = float.offsetLeft;
            initialTop = float.offsetTop;
            e.preventDefault();
        };

        window.addEventListener("mousemove", (e) => {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            float.style.left = (initialLeft + dx) + "px";
            float.style.top = (initialTop + dy) + "px";
            float.style.bottom = "auto";
            float.style.right = "auto";
        });

        window.addEventListener("mouseup", () => { isDragging = false; });

        // --- Button Click Handling ---
        document.getElementById("btn-pm-float").onclick = () => window.pm.toggle();
        document.getElementById("btn-sm-float").onclick = () => window.sm.toggle();
    },

    async nodeCreated(node) {
        // --- Scene Stealer Visual logic ---
        if (node.comfyClass === "ShakerCustSceneStealer") {
            node.addWidget("button", "ARCHIVE TO SCENE MANAGER", null, async () => {
                const stateString = node.stolenRawState;
                if(!stateString || stateString === "{}" || stateString === "No Shaker Metadata Found") { 
                    alert("No metadata found. Drag an image onto the node first."); return; 
                }
                const nameInput = node.widgets.find(w => w.name === "custom_name");
                const finalName = nameInput.value?.trim() || "Stolen_" + new Date().toLocaleTimeString().replace(/:/g, '-');
                await api.fetchApi("/shakercust/save_scene", {
                    method: "POST",
                    body: JSON.stringify({ name: finalName, state: JSON.parse(stateString), description: "Imported from Scene Stealer" })
                });
                alert(`Archived as '${finalName}'`);
                if(window.sm) window.sm.refresh();
            });
        }

        // --- Shaker Dashboard logic ---
        if (node.comfyClass === "ShakerCustDashboard") {
            node.addWidget("button", "OPEN PRESET MANAGER", null, () => window.pm.toggle());
            node.addWidget("button", "OPEN SCENE MANAGER", null, () => window.sm.toggle());
            node.addWidget("button", "REFRESH ALL NODES", null, () => {
                api.fetchApi("/object_info", { method: "GET" });
                app.refresh();
            });
        }

        // --- Latent Advanced Feedback ---
        if (node.comfyClass === "ShakerLatentAdvanced") {
            const resWidget = node.addWidget("text", "SELECTED", "None", () => {});
            resWidget.serializeValue = () => undefined;
            
            const onExecuted = node.onExecuted;
            node.onExecuted = function(message) {
                if (onExecuted) onExecuted.apply(this, arguments);
                if (message?.applied_res) {
                    resWidget.value = message.applied_res[0];
                }
            };
        }
    }
});