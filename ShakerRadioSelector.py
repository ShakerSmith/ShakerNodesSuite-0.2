import os
import random
from aiohttp import web
from server import PromptServer

CHAR_PATH = r"C:\Users\Admin\Applications\AI\Library\models\loras\Z-Image\Character"

class ShakerRadioSelector:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "mode": (["Manual", "Random Select", "Random All"], {"default": "Manual"}),
                "seed": ("INT", {"default": 0, "min": 0, "max": 0xffffffffffffffff}),
                "ui_selected_string": ("STRING", {"default": ""}),
            }
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("character_name",)
    FUNCTION = "process"
    CATEGORY = "ShakerNodes"

    def process(self, mode, seed, ui_selected_string):
        if not os.path.exists(CHAR_PATH):
            return ("Path Not Found",)
        
        all_files = [os.path.splitext(f)[0] for f in os.listdir(CHAR_PATH) 
                     if f.endswith(('.safetensors', '.ckpt', '.pt'))]
        
        selected_from_ui = [x.strip() for x in ui_selected_string.split("|") if x.strip()]
        random.seed(seed)

        if mode == "Random All":
            return (random.choice(all_files),)
        if mode == "Random Select":
            if not selected_from_ui: return (random.choice(all_files),)
            return (random.choice(selected_from_ui),)
        return (selected_from_ui[0] if selected_from_ui else all_files[0],)

# --- API ROUTE FOR THE UI ---
@PromptServer.instance.routes.get("/shaker/get_characters")
async def get_characters(request):
    if not os.path.exists(CHAR_PATH):
        return web.json_response([])
    files = [os.path.splitext(f)[0] for f in os.listdir(CHAR_PATH) 
             if f.endswith(('.safetensors', '.ckpt', '.pt'))]
    return web.json_response(files)

NODE_CLASS_MAPPINGS = {"ShakerRadioSelector": ShakerRadioSelector}
NODE_DISPLAY_NAME_MAPPINGS = {"ShakerRadioSelector": "🥤 Shaker Radio Selector"}