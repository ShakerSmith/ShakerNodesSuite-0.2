import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";

async function refreshShakerNodes() {
    await api.fetchApi("/object_info", { method: "GET" });
    app.refresh();
}

export class ShakerBasePanel {
    constructor(id, title, defaultWidth = 450, defaultHeight = 750) {
        this.id = id;
        this.el = document.createElement("div");
        this.el.id = id;
        
        this.el.style.cssText = `
            position:fixed; z-index:5000; 
            background: rgba(15, 15, 20, 0.98); backdrop-filter: blur(25px);
            border: 1px solid rgba(255, 255, 255, 0.08); 
            display:none; flex-direction:column; border-radius:15px; 
            box-shadow: 0 30px 90px rgba(0,0,0,0.8); overflow:hidden;
            font-family: 'Inter', 'Segoe UI', sans-serif;
        `;
        
        this.el.innerHTML = `
            <div class="header" style="background: rgba(255, 255, 255, 0.03); padding:16px 20px; font-weight:600; color:white; display:flex; justify-content:space-between; align-items:center; cursor:move; user-select:none; border-bottom:1px solid rgba(255,255,255,0.05);">
                <span style="letter-spacing: 2px; text-transform: uppercase; font-size: 11px; opacity: 0.7;">${title}</span>
                <button class="close-btn" style="background:none; border:none; color:#fff; opacity:0.5; cursor:pointer; font-size:18px;">✕</button>
            </div>
            <div class="top-bar" style="padding: 10px 20px; background: rgba(0,0,0,0.2); border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; gap: 10px; align-items: center;"></div>
            <div class="content" style="flex:1; display:flex; overflow:hidden; color:#eee;"></div>
            <div class="resize-handle" style="position:absolute; bottom:0; right:0; width:20px; height:20px; cursor:nwse-resize; background: linear-gradient(135deg, transparent 50%, rgba(255,255,255,0.1) 50%);"></div>
        `;
        
        document.body.appendChild(this.el);
        this.topBar = this.el.querySelector(".top-bar");
        this.content = this.el.querySelector(".content");
        this.el.querySelector(".close-btn").onclick = () => this.toggle();
        
        this.loadLayout(defaultWidth, defaultHeight);
        this.makeDraggable();
        this.makeResizable();
    }

    saveLayout() {
        const layout = {
            top: this.el.style.top,
            left: this.el.style.left,
            width: this.el.style.width,
            height: this.el.style.height
        };
        localStorage.setItem(`shaker_layout_${this.id}`, JSON.stringify(layout));
    }

    loadLayout(defaultWidth, defaultHeight) {
        const saved = localStorage.getItem(`shaker_layout_${this.id}`);
        if (saved) {
            const { top, left, width, height } = JSON.parse(saved);
            this.el.style.top = top;
            this.el.style.left = left;
            this.el.style.width = width;
            this.el.style.height = height;
        } else {
            this.el.style.top = "10%";
            this.el.style.right = "5%";
            this.el.style.width = `${defaultWidth}px`;
            this.el.style.height = `${defaultHeight}px`;
        }
    }

    toggle() { 
        this.el.style.display = this.el.style.display === "none" ? "flex" : "none"; 
        if(this.el.style.display === "flex") this.refresh(); 
    }

    makeDraggable() {
        const header = this.el.querySelector(".header");
        header.onmousedown = (e) => {
            if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return;
            let offset = [this.el.offsetLeft - e.clientX, this.el.offsetTop - e.clientY];
            const move = (ev) => { 
                this.el.style.left = (ev.clientX + offset[0]) + "px"; 
                this.el.style.top = (ev.clientY + offset[1]) + "px"; 
                this.el.style.right = "auto";
            };
            window.onmousemove = move;
            window.onmouseup = () => { window.onmousemove = null; this.saveLayout(); };
        };
    }

    makeResizable() {
        const handle = this.el.querySelector(".resize-handle");
        handle.onmousedown = (e) => {
            e.preventDefault();
            const startW = parseInt(document.defaultView.getComputedStyle(this.el).width, 10);
            const startH = parseInt(document.defaultView.getComputedStyle(this.el).height, 10);
            const startX = e.clientX;
            const startY = e.clientY;
            const doResize = (ev) => {
                this.el.style.width = (startW + ev.clientX - startX) + 'px';
                this.el.style.height = (startH + ev.clientY - startY) + 'px';
            };
            const stopResize = () => {
                window.removeEventListener('mousemove', doResize);
                window.removeEventListener('mouseup', stopResize);
                this.saveLayout();
            };
            window.addEventListener('mousemove', doResize);
            window.addEventListener('mouseup', stopResize);
        };
    }
}

export class PresetManagerPanel extends ShakerBasePanel {
    constructor(id, title) {
        super(id, title, 1100, 800);
        this.content.innerHTML = `
            <div class="sidebar" style="width:260px; background: rgba(0,0,0,0.3); border-right:1px solid rgba(255,255,255,0.05); overflow-y:auto; padding:15px; display:flex; flex-direction:column; gap:10px;"></div>
            <div class="editor-container" style="flex:1; display:flex; flex-direction:column; overflow:hidden;">
                <div class="cat-settings-bar" style="padding:10px 30px; background:rgba(255,255,255,0.02); border-bottom:1px solid rgba(255,255,255,0.05); display:flex; gap:20px; align-items:center;"></div>
                <div class="editor" style="flex:1; background: transparent; overflow-y:auto; padding:30px;"></div>
            </div>
        `;
        this.sidebar = this.content.querySelector(".sidebar");
        this.editor = this.content.querySelector(".editor");
        this.catBar = this.content.querySelector(".cat-settings-bar");
        this.currentCat = null;
        this.searchTerm = "";
        this.isCatEditMode = false;
        this.editingLabels = new Set();
        this.setupTopBar();
    }

    setupTopBar() {
        this.topBar.innerHTML = `
            <input type="text" id="pm-search" placeholder="Search presets..." style="flex: 1; padding: 10px 15px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; font-size: 13px;">
            <button id="pm-cat-edit" style="padding: 8px 15px; background: #444; color: #fff; border: 1px solid #555; border-radius: 6px; cursor: pointer; font-size: 11px;">EDIT CATEGORIES</button>
            <button id="pm-restore" style="padding: 8px 15px; background: #333; color: #ccc; border: 1px solid #444; border-radius: 6px; cursor: pointer; font-size: 11px;">RESTORE BACKUP</button>
            <button id="pm-clear-bak" style="padding: 8px 15px; background: #422; color: #f88; border: 1px solid #533; border-radius: 6px; cursor: pointer; font-size: 11px;">CLEAR BACKUPS</button>
            <button id="pm-save-all" style="padding: 10px 25px; background: #fff; color: #000; border: none; border-radius: 8px; cursor: pointer; font-weight: 800; font-size: 12px; letter-spacing:1px;">SAVE ALL</button>
        `;
        this.topBar.querySelector("#pm-search").oninput = (e) => { this.searchTerm = e.target.value.toLowerCase(); this.renderEditor(this.currentCat); };
        this.topBar.querySelector("#pm-cat-edit").onclick = () => {
            this.isCatEditMode = !this.isCatEditMode;
            this.topBar.querySelector("#pm-cat-edit").style.background = this.isCatEditMode ? "#ff9500" : "#444";
            this.renderSidebar();
        };
        this.topBar.querySelector("#pm-save-all").onclick = async () => {
            await api.fetchApi("/shakercust/save_presets", { method: "POST", body: JSON.stringify(this.data) });
            alert("Configuration Saved."); refreshShakerNodes();
        };
        this.topBar.querySelector("#pm-clear-bak").onclick = async () => {
            if(confirm("Delete all backups?")) {
                await api.fetchApi("/shakercust/clear_backups", { method: "POST" });
                alert("Backups cleared.");
            }
        };
        this.topBar.querySelector("#pm-restore").onclick = () => this.showBackupRestorer();
    }

    async showBackupRestorer() {
        const res = await api.fetchApi("/shakercust/list_backups");
        const files = await res.json();
        if(files.length === 0) { alert("No backups found."); return; }
        const listStr = files.map((f, i) => `${i}: ${f}`).join("\n");
        const choice = prompt(`Available Backups:\n${listStr}\n\nEnter the number to restore:`);
        if (choice !== null && files[choice]) {
            await api.fetchApi("/shakercust/restore_backup", { method: "POST", body: JSON.stringify({ filename: files[choice] }) });
            location.reload();
        }
    }

    async refresh() {
        const res = await api.fetchApi("/shakercust/get_presets");
        this.data = await res.json();
        if(!this.data.category_settings) this.data.category_settings = {};
        if(!this.data.prompts) this.data.prompts = {};
        this.renderSidebar();
        if(this.currentCat) this.renderEditor(this.currentCat);
    }

    renderSidebar() {
        this.sidebar.innerHTML = `<div id="cat-list" style="display:flex; flex-direction:column; gap:4px;"></div>`;
        const list = this.sidebar.querySelector("#cat-list");
        this.data.build_order.forEach((cat, idx) => {
            const active = this.currentCat === cat;
            const container = document.createElement("div");
            container.style.cssText = `display:flex; align-items:center; gap:5px; padding:8px 12px; background:${active ? 'rgba(255,255,255,0.08)' : 'transparent'}; border-radius:8px; cursor:pointer; transition:0.2s;`;
            
            if (this.isCatEditMode) {
                const upBtn = document.createElement("button"); upBtn.innerText = "▲"; upBtn.style.cssText = "background:none; border:none; color:#666; cursor:pointer; font-size:10px;";
                upBtn.onclick = (e) => { e.stopPropagation(); if(idx > 0) { const temp = this.data.build_order[idx-1]; this.data.build_order[idx-1] = cat; this.data.build_order[idx] = temp; this.renderSidebar(); }};
                
                const downBtn = document.createElement("button"); downBtn.innerText = "▼"; downBtn.style.cssText = "background:none; border:none; color:#666; cursor:pointer; font-size:10px;";
                downBtn.onclick = (e) => { e.stopPropagation(); if(idx < this.data.build_order.length - 1) { const temp = this.data.build_order[idx+1]; this.data.build_order[idx+1] = cat; this.data.build_order[idx] = temp; this.renderSidebar(); }};

                const delBtn = document.createElement("button"); delBtn.innerText = "✕"; delBtn.style.cssText = "background:none; border:none; color:#ff4b2b; cursor:pointer; font-size:12px; font-weight:bold;";
                delBtn.onclick = (e) => { e.stopPropagation(); if(confirm(`Delete category "${cat}" and ALL its presets?`)) { this.data.build_order.splice(idx, 1); delete this.data.prompts[cat]; delete this.data.category_settings[cat]; this.currentCat = null; this.renderSidebar(); this.renderEditor(null); }};

                const nameInput = document.createElement("input");
                nameInput.value = cat;
                nameInput.style.cssText = "background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.1); color:#fff; font-size:11px; padding:2px 5px; width:100px; border-radius:4px;";
                nameInput.onclick = (e) => e.stopPropagation();
                nameInput.onchange = (e) => {
                    const newName = e.target.value.trim();
                    if (newName && newName !== cat) {
                        this.data.build_order[idx] = newName;
                        this.data.prompts[newName] = this.data.prompts[cat];
                        this.data.category_settings[newName] = this.data.category_settings[cat];
                        delete this.data.prompts[cat];
                        delete this.data.category_settings[cat];
                        this.currentCat = newName;
                        this.renderSidebar();
                    }
                };
                
                container.appendChild(upBtn); container.appendChild(downBtn); container.appendChild(nameInput); container.appendChild(delBtn);
            } else {
                const label = document.createElement("span");
                label.innerText = cat;
                label.style.cssText = `flex:1; font-size:12px; color:${active ? '#fff' : '#888'};`;
                container.appendChild(label);
            }

            container.onclick = () => { this.currentCat = cat; this.renderSidebar(); this.renderEditor(cat); };
            list.appendChild(container);
        });

        if (this.isCatEditMode) {
            const addBtn = document.createElement("button");
            addBtn.innerText = "+ NEW CATEGORY";
            addBtn.style.cssText = "margin-top:10px; padding:8px; background:rgba(255,255,255,0.05); border:1px dashed rgba(255,255,255,0.2); color:#aaa; cursor:pointer; font-size:10px; border-radius:8px;";
            addBtn.onclick = () => {
                const name = prompt("Enter new category name:");
                if (name && !this.data.build_order.includes(name)) {
                    this.data.build_order.push(name);
                    this.data.prompts[name] = [];
                    this.data.category_settings[name] = { multi_select: false, random_at_bottom: false };
                    this.renderSidebar();
                }
            };
            this.sidebar.appendChild(addBtn);
        }
    }

    renderCatBar(cat) {
        if (!this.data.category_settings[cat]) {
            this.data.category_settings[cat] = { multi_select: false, random_at_bottom: false };
        }
        const settings = this.data.category_settings[cat];
        this.catBar.innerHTML = `
            <span style="font-size:11px; opacity:0.5; text-transform:uppercase; letter-spacing:1px; margin-right:10px;">Category Config:</span>
            <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:12px;"><input type="checkbox" id="check-multi" ${settings.multi_select ? 'checked' : ''}> Multi-Select (Manual Mode)</label>
            <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:12px;"><input type="checkbox" id="check-rand-pos" ${settings.random_at_bottom ? 'checked' : ''}> Randomization at Bottom</label>
        `;
        this.catBar.querySelector("#check-multi").onchange = (e) => { settings.multi_select = e.target.checked; };
        this.catBar.querySelector("#check-rand-pos").onchange = (e) => { settings.random_at_bottom = e.target.checked; };
    }

    renderEditor(cat) {
        if (!cat) { this.editor.innerHTML = `<div style="text-align:center; padding-top:100px; opacity:0.3; color:white;">Select a category</div>`; this.catBar.innerHTML=""; return; }
        this.renderCatBar(cat);
        this.editor.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
                <h2 style="margin:0; font-weight:300; letter-spacing:2px; color:#fff; text-transform:uppercase; font-size:18px;">${cat}</h2>
                <button id="add-item" style="padding:10px 20px; background:#fff; color:#000; border:none; cursor:pointer; border-radius:8px; font-weight:bold; font-size:11px;">+ NEW PRESET</button>
            </div>
            <div id="card-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;"></div>`;
        const container = document.getElementById("card-container");
        document.getElementById("add-item").onclick = () => {
            if(!this.data.prompts[cat]) this.data.prompts[cat] = [];
            const newItem = { label: "New Preset", prompt: "", pin_status: "normal", _isNew: true };
            this.data.prompts[cat].unshift(newItem);
            this.renderEditor(cat);
        };
        const presets = (this.data.prompts[cat] || []).filter(p => p.label.toLowerCase().includes(this.searchTerm) || p.prompt.toLowerCase().includes(this.searchTerm));
        presets.sort((a, b) => {
            if (a._isNew && !b._isNew) return -1;
            if (!a._isNew && b._isNew) return 1;
            return a.label.localeCompare(b.label);
        });
        presets.forEach((p, idx) => {
            const card = document.createElement("div");
            const isEditing = this.editingLabels.has(p.label) || p._isNew;
            card.style.cssText = `background: rgba(255,255,255,0.03); padding:20px; border-radius:12px; border: 1px solid ${isEditing ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.05)'}; display: flex; flex-direction: column; gap:15px; transition: 0.3s;`;
            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; gap:10px;">
                    ${isEditing ? `<input type="text" value="${p.label}" class="p-label" style="background:rgba(0,0,0,0.3); color:#fff; border:1px solid rgba(255,255,255,0.1); border-radius:6px; padding:6px 10px; font-size:13px; width:60%;">` : `<span style="font-weight:600; color:#fff; font-size:14px; overflow:hidden; text-overflow:ellipsis;">${p.label}</span>`}
                    <div style="display:flex; gap:6px;">
                        <button class="p-pin" title="Pin Cycle" style="background:none; border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:6px; cursor:pointer; width:30px; height:30px; font-size:12px;">${p.pin_status === 'top' ? '▲' : p.pin_status === 'bottom' ? '▼' : '•'}</button>
                        <button class="p-edit" title="Edit" style="background:rgba(255,255,255,0.05); border:none; border-radius:6px; cursor:pointer; width:30px; height:30px; color:white;">${isEditing ? '✓' : '✎'}</button>
                        <button class="p-del" title="Delete" style="background:rgba(255,75,43,0.1); border:none; border-radius:6px; cursor:pointer; width:30px; height:30px; color:#ff4b2b;">✕</button>
                    </div>
                </div>
                <div style="background:rgba(0,0,0,0.2); border-radius:8px; padding:15px; border: 1px solid rgba(255,255,255,0.02);">
                    ${isEditing ? `<textarea class="p-text" style="width:100%; height:80px; background:transparent; color:#fff; border:none; outline:none; resize:none; font-family:monospace; font-size:12px;">${p.prompt}</textarea>` : `<div style="color:#aaa; font-size:12px; line-height:1.5; white-space: pre-wrap; word-break: break-word;">${p.prompt || '...'}</div>`}
                </div>`;
            card.querySelector(".p-pin").onclick = () => { const states = ['normal', 'top', 'bottom']; let cur = states.indexOf(p.pin_status || 'normal'); p.pin_status = states[(cur + 1) % 3]; this.renderEditor(cat); };
            card.querySelector(".p-edit").onclick = () => { if (isEditing) { delete p._isNew; this.editingLabels.delete(p.label); } else { this.editingLabels.add(p.label); } this.renderEditor(cat); };
            card.querySelector(".p-del").onclick = () => { if(confirm(`Delete "${p.label}"?`)) { this.data.prompts[cat] = this.data.prompts[cat].filter(item => item !== p); this.renderEditor(cat); }};
            if (isEditing) { card.querySelector(".p-label").onchange = (e) => p.label = e.target.value; card.querySelector(".p-text").onchange = (e) => p.prompt = e.target.value; }
            container.appendChild(card);
        });
    }
}

export class SceneManagerPanel extends ShakerBasePanel {
    constructor(id, title) {
        super(id, title, 800, 750);
        this.isEditMode = false;
        this.setupTopBar();
    }

    setupTopBar() {
        this.topBar.innerHTML = `
            <input type="text" id="scene-name-input" placeholder="Scene Name..." style="flex: 2; padding: 10px 15px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff;">
            <button id="sm-toggle-edit" style="padding: 10px 20px; background: #444; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 12px;">EDIT MODE: OFF</button>
            <button id="sm-capture-btn" style="padding: 10px 20px; background: #0088ff; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 12px;">CAPTURE</button>
        `;
        this.topBar.querySelector("#sm-capture-btn").onclick = () => this.captureCurrentState();
        const editBtn = this.topBar.querySelector("#sm-toggle-edit");
        editBtn.onclick = () => {
            this.isEditMode = !this.isEditMode;
            editBtn.innerText = `EDIT MODE: ${this.isEditMode ? "ON" : "OFF"}`;
            editBtn.style.background = this.isEditMode ? "#ff9500" : "#444";
            this.refresh();
        };
    }

    async refresh() {
        const res = await api.fetchApi("/shakercust/get_scenes");
        this.scenes = await res.json();
        this.renderSmartName();
        this.renderSceneList();
    }

    renderSmartName() {
        const currentActive = [];
        app.graph._nodes.filter(n => n.comfyClass?.startsWith("ShakerCust_") && n.comfyClass.endsWith("Presets")).forEach(node => {
            const selected = node.widgets.filter(w => w.name.startsWith("preset_") && w.value).map(w => w.name.replace("preset_", ""));
            currentActive.push(...selected);
        });
        const nameInput = this.topBar.querySelector("#scene-name-input");
        if (!nameInput.value.trim()) {
            nameInput.value = currentActive.slice(0, 3).join("_") || "NewScene_" + new Date().toLocaleTimeString().replace(/:/g, '-');
        }
    }

    async captureCurrentState() {
        const name = this.topBar.querySelector("#scene-name-input").value.trim();
        const state = {};
        app.graph._nodes.filter(n => n.comfyClass?.startsWith("ShakerCust_") && n.comfyClass.endsWith("Presets")).forEach(node => {
            const cat = node.comfyClass.replace("ShakerCust_", "").replace("Presets", "").replace("_", " ");
            const selected = node.widgets.filter(w => w.name.startsWith("preset_") && w.value).map(w => w.name.replace("preset_", ""));
            const mode = node.widgets.find(w => w.name === "random_mode")?.value || "manual";
            state[cat] = { selected, mode };
        });
        await api.fetchApi("/shakercust/save_scene", { method: "POST", body: JSON.stringify({ name, state, description: "" }) });
        this.refresh();
    }

    renderSceneList() {
        this.content.innerHTML = `<div id="sc-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 15px; padding: 25px; width:100%; overflow-y:auto;"></div>`;
        const container = this.content.querySelector("#sc-container");
        Object.keys(this.scenes).sort().forEach(name => {
            const scObj = this.scenes[name];
            const state = scObj.state || scObj;
            const description = scObj.description || "";
            const editing = this.isEditMode;
            const card = document.createElement("div");
            card.style.cssText = `background: rgba(255,255,255,0.03); padding:20px; border-radius:15px; border:1px solid ${editing ? '#ff9500' : 'rgba(255,255,255,0.1)'}; display:flex; flex-direction:column; gap:12px;`;
            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    ${editing ? `<input value="${name}" class="sc-name" style="background:rgba(0,0,0,0.2); border:none; color:white; font-weight:bold;">` : `<span style="font-weight:bold; font-size:16px;">${name}</span>`}
                    <div style="display:flex; gap:8px;">
                        <button class="load-btn" style="background:#0088ff; border:none; border-radius:6px; color:white; padding:5px 12px; cursor:pointer;">LOAD</button>
                        <button class="del-btn" style="background:#ff4b2b; border:none; border-radius:6px; color:white; padding:5px 12px; cursor:pointer; display:${editing?'block':'none'}">✕</button>
                    </div>
                </div>
                <textarea class="sc-desc" placeholder="Add description..." style="width:100%; height:45px; background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.05); color:#aaa; font-size:12px; border-radius:8px; padding:8px; resize:none;">${description}</textarea>
            `;
            card.querySelector(".load-btn").onclick = () => {
                app.graph._nodes.filter(n => n.comfyClass?.startsWith("ShakerCust_") && n.comfyClass.endsWith("Presets")).forEach(node => {
                    const cat = node.comfyClass.replace("ShakerCust_", "").replace("Presets", "").replace("_", " ");
                    if(state[cat]) {
                        const { selected, mode } = state[cat];
                        const mW = node.widgets.find(w => w.name === "random_mode");
                        if(mW) mW.value = mode;
                        node.widgets.forEach(w => { if(w.name.startsWith("preset_")) w.value = false; });
                        selected.forEach(s => {
                            const wN = "preset_" + s.replace(/[^A-Za-z0-9]+/g, '_');
                            const target = node.widgets.find(w => w.name === wN);
                            if(target) target.value = true;
                        });
                        node.setDirtyCanvas(true, true);
                    }
                });
            };
            const descField = card.querySelector(".sc-desc");
            descField.onchange = async (e) => { await api.fetchApi("/shakercust/save_scene", { method: "POST", body: JSON.stringify({ name, state, description: e.target.value }) }); };
            if (editing) {
                card.querySelector(".del-btn").onclick = async () => { if(confirm("Delete Scene?")) { await api.fetchApi("/shakercust/delete_scene", { method: "POST", body: JSON.stringify({ name }) }); this.refresh(); }};
                card.querySelector(".sc-name").onchange = async (e) => {
                    const newName = e.target.value.trim();
                    if (newName && newName !== name) {
                        await api.fetchApi("/shakercust/delete_scene", { method: "POST", body: JSON.stringify({ name }) });
                        await api.fetchApi("/shakercust/save_scene", { method: "POST", body: JSON.stringify({ name: newName, state, description: descField.value }) });
                        this.refresh();
                    }
                };
            }
            container.appendChild(card);
        });
    }
}