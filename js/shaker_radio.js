import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";

app.registerExtension({
    name: "Shaker.RadioSelector",
    async beforeRegisterNodeDef(nodeType, nodeData) {
        if (nodeData.name === "ShakerRadioSelector") {
            nodeType.prototype.onNodeCreated = function() {
                const modeWidget = this.widgets.find(w => w.name === "mode");
                const stringWidget = this.widgets.find(w => w.name === "ui_selected_string");
                stringWidget.type = "hidden";

                const container = document.createElement("div");
                container.style = "background: #111; border: 1px solid #444; padding: 10px; margin: 10px 0; border-radius: 4px; color: #eee; min-width: 150px;";
                this.addDOMWidget("character_list", "HTML", container);

                const updateUI = (names) => {
                    const mode = modeWidget.value;
                    container.innerHTML = `<div style="margin-bottom:8px; color:#888; font-size:10px;">MODE: ${mode}</div>`;
                    
                    names.forEach(name => {
                        const label = document.createElement("label");
                        label.style = "display: flex; align-items: center; cursor: pointer; margin-bottom: 4px; font-size: 12px;";
                        
                        const input = document.createElement("input");
                        input.type = (mode === "Manual") ? "radio" : "checkbox";
                        input.name = (mode === "Manual") ? "char_group" : name;
                        input.value = name;
                        input.style = "margin-right: 10px; accent-color: #00d2ff;";

                        input.onchange = () => {
                            const checked = [...container.querySelectorAll('input:checked')].map(i => i.value);
                            stringWidget.value = checked.join("|");
                        };

                        label.appendChild(input);
                        label.append(name);
                        container.appendChild(label);
                    });
                };

                const fetchFiles = async () => {
                    try {
                        const response = await api.fetchApi("/shaker/get_characters");
                        const names = await response.json();
                        updateUI(names);
                    } catch (e) {
                        container.innerHTML = "Error fetching characters.";
                    }
                };

                modeWidget.callback = fetchFiles;
                fetchFiles(); // Initial load
            };
        }
    }
});