import os
import json
import random
import re
import folder_paths
import datetime
import torch
import numpy as np
import shutil
from PIL import Image
from server import PromptServer
from aiohttp import web

# --- Setup Paths ---
NODE_DIRECTORY = os.path.dirname(os.path.abspath(__file__))
PROFILES_DIR = os.path.join(NODE_DIRECTORY, "profiles")
BACKUPS_DIR = os.path.join(PROFILES_DIR, "backups")
ACTIVE_PRESETS_FILE = os.path.join(PROFILES_DIR, "presets.json")
SCENES_FILE = os.path.join(PROFILES_DIR, "scenes.json")

os.makedirs(PROFILES_DIR, exist_ok=True)
os.makedirs(BACKUPS_DIR, exist_ok=True)

# Hardcoded categories removed. The suite now reflects ONLY the presets.json content.
INITIAL_BUILD_ORDER = []

def load_active_presets():
    if not os.path.exists(ACTIVE_PRESETS_FILE): 
        return {"build_order": INITIAL_BUILD_ORDER, "prompts": {}, "category_settings": {}}
    try:
        with open(ACTIVE_PRESETS_FILE, "r") as f: 
            data = json.load(f)
            if "category_settings" not in data: data["category_settings"] = {}
            if "prompts" not in data: data["prompts"] = {}
            return data
    except Exception: 
        return {"build_order": INITIAL_BUILD_ORDER, "prompts": {}, "category_settings": {}}

def load_scenes():
    if not os.path.exists(SCENES_FILE): return {}
    try:
        with open(SCENES_FILE, "r") as f: return json.load(f)
    except Exception: return {}

def create_backup():
    if os.path.exists(ACTIVE_PRESETS_FILE):
        ts = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        bak_path = os.path.join(BACKUPS_DIR, f"presets_bak_{ts}.json")
        shutil.copy2(ACTIVE_PRESETS_FILE, bak_path)

# --- API Endpoints ---
@PromptServer.instance.routes.get("/shakercust/get_presets")
async def get_presets_handler(request): return web.json_response(load_active_presets())

@PromptServer.instance.routes.post("/shakercust/save_presets")
async def save_presets_handler(request):
    try:
        create_backup()
        new_data = await request.json()
        with open(ACTIVE_PRESETS_FILE, "w") as f: json.dump(new_data, f, indent=4)
        return web.json_response({"status": "success"})
    except Exception as e: return web.json_response({"error": str(e)}, status=500)

@PromptServer.instance.routes.post("/shakercust/update_categories")
async def update_categories_handler(request):
    try:
        create_backup()
        data = await request.json() # Expects { build_order, prompts, category_settings }
        with open(ACTIVE_PRESETS_FILE, "w") as f: json.dump(data, f, indent=4)
        return web.json_response({"status": "success"})
    except Exception as e: return web.json_response({"error": str(e)}, status=500)

@PromptServer.instance.routes.get("/shakercust/list_backups")
async def list_backups(request):
    files = sorted([f for f in os.listdir(BACKUPS_DIR) if f.endswith(".json")], reverse=True)
    return web.json_response(files)

@PromptServer.instance.routes.post("/shakercust/restore_backup")
async def restore_backup(request):
    try:
        data = await request.json()
        bak_path = os.path.join(BACKUPS_DIR, data["filename"])
        shutil.copy2(bak_path, ACTIVE_PRESETS_FILE)
        return web.json_response({"status": "success"})
    except Exception as e: return web.json_response({"error": str(e)}, status=500)

@PromptServer.instance.routes.post("/shakercust/clear_backups")
async def clear_backups(request):
    try:
        for f in os.listdir(BACKUPS_DIR):
            os.remove(os.path.join(BACKUPS_DIR, f))
        return web.json_response({"status": "success"})
    except Exception as e: return web.json_response({"error": str(e)}, status=500)

@PromptServer.instance.routes.get("/shakercust/get_scenes")
async def get_scenes_handler(request): return web.json_response(load_scenes())

@PromptServer.instance.routes.post("/shakercust/save_scene")
async def save_scene_handler(request):
    try:
        data = await request.json()
        scenes = load_scenes()
        scenes[data["name"]] = {"state": data["state"], "description": data.get("description", "")}
        with open(SCENES_FILE, "w") as f: json.dump(scenes, f, indent=4)
        return web.json_response({"status": "success"})
    except Exception as e: return web.json_response({"error": str(e)}, status=500)

@PromptServer.instance.routes.post("/shakercust/delete_scene")
async def delete_scene_handler(request):
    try:
        data = await request.json()
        scenes = load_scenes()
        if data["name"] in scenes:
            del scenes[data["name"]]
            with open(SCENES_FILE, "w") as f: json.dump(scenes, f, indent=4)
        return web.json_response({"status": "success"})
    except Exception as e: return web.json_response({"error": str(e)}, status=500)

def sanitize_for_widget(name):
    return "preset_" + re.sub(r'[^A-Za-z0-9]+', '_', name) if name else ""

def clean_text_block(text):
    return [line.strip() for line in text.split("\n") if line.strip() and not line.strip().startswith("//")] if text else []

def find_preset_by_label(all_prompts, category, label):
    return next((p for p in all_prompts.get(category, []) if p.get("label") == label), None)

NODE_CLASS_MAPPINGS = {}
NODE_DISPLAY_NAME_MAPPINGS = {}
SUITE_CATEGORY = "ShakerNodes"

class ShakerCustDashboard:
    CATEGORY = SUITE_CATEGORY
    @classmethod
    def INPUT_TYPES(s):
        return {"required": {"connection_status": (["Check Connection"], {"default": "Check Connection"}),}}
    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("status",)
    FUNCTION = "check"
    def check(self, connection_status): return ("Dashboard Active",)

class ShakerCustSceneStealer:
    CATEGORY = SUITE_CATEGORY
    @classmethod
    def INPUT_TYPES(s):
        input_dir = folder_paths.get_input_directory()
        files = [f for f in os.listdir(input_dir) if os.path.isfile(os.path.join(input_dir, f))]
        return {"required": {"image": (sorted(files), {"image_upload": True}), "custom_name": ("STRING", {"default": ""}),}}
    RETURN_TYPES = ("IMAGE", "STRING")
    RETURN_NAMES = ("IMAGE", "PRESET_LIST")
    FUNCTION = "steal"
    def steal(self, image, custom_name):
        image_path = folder_paths.get_annotated_filepath(image)
        img = Image.open(image_path)
        raw_state = img.info.get("ShakerPresets")
        if not raw_state:
            for key in img.info.keys():
                if "ShakerPresets" in key:
                    raw_state = img.info[key]; break
        if not raw_state or raw_state == "{}": return (self.prepare_image(img), "No Shaker Metadata Found")
        PromptServer.instance.send_sync("shaker_metadata_stolen", {"raw": raw_state})
        try:
            state_data = json.loads(raw_state); readable_list = []
            for cat, data in state_data.items():
                presets = data.get("selected", [])
                if presets: readable_list.append(f"{cat}: {', '.join(presets)}")
            display_text = "\n".join(readable_list)
        except: display_text = raw_state
        return (self.prepare_image(img), display_text)
    def prepare_image(self, img):
        img = img.convert("RGB"); image_np = np.array(img).astype(np.float32) / 255.0
        return torch.from_numpy(image_np)[None,]

def create_category_node(category_name):
    class CategoryNode:
        CATEGORY = f"{SUITE_CATEGORY}/Categories"
        @classmethod
        def INPUT_TYPES(s):
            data = load_active_presets()
            presets = data.get("prompts", {}).get(category_name, [])
            cat_settings = data.get("category_settings", {}).get(category_name, {})
            random_at_bottom = cat_settings.get("random_at_bottom", False)

            def sort_key(p):
                pin_order = {'top': 0, 'normal': 1, 'bottom': 2}
                return (pin_order.get(p.get('pin_status', 'normal'), 1), p.get('label', '').lower())
            
            sorted_presets = sorted(presets, key=sort_key)
            required = {}
            random_selector = (["manual", "random select", "random all"], {"default": "manual"})
            
            if not random_at_bottom: required["random_mode"] = random_selector
            for p in sorted_presets:
                if p.get("label"): required[sanitize_for_widget(p["label"])] = ("BOOLEAN", {"default": False})
            if random_at_bottom: required["random_mode"] = random_selector
                
            return {"required": required}
            
        RETURN_TYPES = ("PROMPT_COMBO",)
        FUNCTION = "process"
        @classmethod
        def IS_CHANGED(s, **kwargs): return os.path.getmtime(ACTIVE_PRESETS_FILE) if os.path.exists(ACTIVE_PRESETS_FILE) else 0
        def process(self, random_mode, **kwargs):
            preset_map = {sanitize_for_widget(p.get('label', '')): p.get('label') for p in load_active_presets().get("prompts", {}).get(category_name, [])}
            selected = [preset_map[k] for k, v in kwargs.items() if v and k in preset_map]
            return ({"category": category_name, "selected_presets": selected, "random_mode": random_mode},)
            
    class_name = f"ShakerCust_{category_name.replace(' ', '_')}Presets"
    globals()[class_name] = CategoryNode
    NODE_CLASS_MAPPINGS[class_name] = CategoryNode
    NODE_DISPLAY_NAME_MAPPINGS[class_name] = f"{category_name} Presets"

class ShakerCustMainConsole:
    CATEGORY = SUITE_CATEGORY
    @classmethod
    def INPUT_TYPES(s):
        data = load_active_presets()
        inputs = {"required": {"positive_prefix": ("STRING", {"multiline": True}), "seed": ("INT", {"default": 0, "min": 0, "max": 0xffffffffffffffff}), "positive_suffix": ("STRING", {"multiline": True}), "sign_text": ("STRING", {"multiline": False, "default": ""})}, "optional": {"build_order_override": ("STRING", {"multiline": False})}}
        # The dynamic inputs are generated here from the build_order in presets.json
        for category in data.get("build_order", []): inputs["optional"][f"combo_{category.lower()}"] = ("PROMPT_COMBO",)
        return inputs
    RETURN_TYPES = ("STRING", "STRING", "STRING", "STRING",)
    RETURN_NAMES = ("positive", "negative", "filename", "readable_list",)
    FUNCTION = "build"
    def build(self, seed, positive_prefix, positive_suffix, sign_text="", build_order_override="", **kwargs):
        random.seed(seed); data = load_active_presets(); prompts_db = data.get("prompts", {})
        build_order = [s.strip() for s in build_order_override.split(',')] if build_order_override.strip() else data.get("build_order", [])
        pos_parts, neg_parts, labels, readable = [], [], [], []
        pos_parts.extend(clean_text_block(positive_prefix))
        category_outputs = {}
        for category in build_order:
            combo = kwargs.get(f"combo_{category.lower()}")
            if not combo: continue
            mode = combo.get("random_mode", "manual"); current_selections = combo.get("selected_presets", []); final_presets = []
            if mode == "random all":
                all_possible = [p.get("label") for p in prompts_db.get(category, []) if p.get("label")]
                if all_possible: final_presets = [random.choice(all_possible)]
            elif mode == "random select":
                if current_selections: final_presets = [random.choice(current_selections)]
            else: final_presets = current_selections
            if not final_presets: continue
            cat_pos, cat_neg, cat_lab = [], [], []
            for lab in final_presets:
                preset = find_preset_by_label(prompts_db, category, lab)
                if not preset: continue
                p_text = preset.get("prompt", "")
                if category == "CustomSign" and sign_text.strip(): p_text = f"{p_text} '{sign_text}'"
                if p_text: cat_pos.append(p_text); cat_lab.append(lab)
                if preset.get("neg_prompt"): cat_neg.append(preset["neg_prompt"])
            category_outputs[category] = {'p': cat_pos, 'n': cat_neg, 'l': cat_lab}
            readable.append(f"{category}: {', '.join(cat_lab)}")
        for cat in build_order:
            if cat in category_outputs:
                out = category_outputs[cat]; pos_parts.extend(out['p']); neg_parts.extend(out['n']); labels.extend(out['l'])
        pos_parts.extend(clean_text_block(positive_suffix))
        return (", ".join(filter(None, pos_parts)), ", ".join(filter(None, neg_parts)), "-".join(filter(None, labels)), "\n".join(filter(None, readable)))

class ShakerCustPromptShaker:
    CATEGORY = SUITE_CATEGORY
    @classmethod
    def INPUT_TYPES(cls): return {"required": {}}
    RETURN_TYPES = ()
    FUNCTION = "execute"
    OUTPUT_NODE = True
    def execute(self): return {}

class ShakerCustSceneQuickLoad:
    CATEGORY = SUITE_CATEGORY
    @classmethod
    def INPUT_TYPES(s):
        scenes = load_scenes(); scene_list = ["None"] + sorted(list(scenes.keys()))
        return {"required": {"scene": (scene_list, {"default": "None"}), "randomize": ("BOOLEAN", {"default": False}), "seed": ("INT", {"default": 0, "min": 0, "max": 0xffffffffffffffff})}}
    RETURN_TYPES = ("STRING",)
    FUNCTION = "exec"
    def exec(self, scene, randomize, seed):
        if randomize:
            scene_data = load_scenes()
            names = list(scene_data.keys())
            if names: return (random.Random(seed).choice(names),)
        return (scene,)

DATA = load_active_presets()
for cat in DATA.get("build_order", []): create_category_node(cat)
NODE_CLASS_MAPPINGS.update({
    "ShakerCustMainConsole": ShakerCustMainConsole, 
    "ShakerCustPromptShaker": ShakerCustPromptShaker, 
    "ShakerCustSceneQuickLoad": ShakerCustSceneQuickLoad,
    "ShakerCustDashboard": ShakerCustDashboard,
    "ShakerCustSceneStealer": ShakerCustSceneStealer
})
NODE_DISPLAY_NAME_MAPPINGS.update({
    "ShakerCustMainConsole": "Prompt Builder Console", 
    "ShakerCustPromptShaker": "Prompt Shaker", 
    "ShakerCustSceneQuickLoad": "Scene Quick Load",
    "ShakerCustDashboard": "Shaker Dashboard 🎛️",
    "ShakerCustSceneStealer": "Scene Stealer 🕵️‍♂️"
})