import os
import random
import folder_paths
import comfy.sd
import comfy.utils

class ShakerLoraLoader:
    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(s):
        loras = folder_paths.get_filename_list("loras")
        unique_folders = sorted(list(set(os.path.dirname(l) for l in loras if os.path.dirname(l))))
        if not unique_folders:
            unique_folders = ["/"]
        
        return {
            "required": {
                "model": ("MODEL",),
                "clip": ("CLIP",),
                "folder_path": (unique_folders,), 
                "mode": (["Search", "Random"], {"default": "Search"}),
                "strength": ("FLOAT", {"default": 1.0, "min": -10.0, "max": 10.0, "step": 0.01}),
                "seed": ("INT", {"default": 0, "min": 0, "max": 0xffffffffffffffff}),
            },
            "optional": {
                "lora_name_string": ("STRING", {"forceInput": True}), 
            }
        }

    RETURN_TYPES = ("MODEL", "CLIP", "STRING")
    RETURN_NAMES = ("MODEL", "CLIP", "loaded_name")
    FUNCTION = "load_lora"
    CATEGORY = "ShakerNodes"

    def load_lora(self, model, clip, folder_path, mode, strength, seed, lora_name_string=""):
        if strength == 0:
            return (model, clip, "Bypassed (Strength 0)")

        all_loras = folder_paths.get_filename_list("loras")
        available_in_folder = [l for l in all_loras if os.path.dirname(l) == folder_path]

        if not available_in_folder:
            print(f"🥤 ShakerLoader: Folder {folder_path} is empty. Bypassing.")
            return (model, clip, "Folder Empty")

        selected_full_path = None

        if mode == "Random":
            random.seed(seed)
            selected_full_path = random.choice(available_in_folder)
        else:
            target = lora_name_string.strip().lower()
            if not target:
                return (model, clip, "No Input - Bypassed")
            
            # Find all files where the search string is INSIDE the filename
            matches = [l for l in available_in_folder if target in os.path.basename(l).lower()]

            if len(matches) == 1:
                selected_full_path = matches[0]
            elif len(matches) > 1:
                print(f"🥤 ShakerLoader: Multiple matches for '{target}' ({len(matches)}). Please be more specific. Bypassing.")
                return (model, clip, f"Ambiguous Match ({len(matches)} found)")
            else:
                print(f"🥤 ShakerLoader: No match for '{target}' in {folder_path}. Bypassing.")
                return (model, clip, "No Match")
        
        # Load the Lora
        try:
            full_path = folder_paths.get_full_path("loras", selected_full_path)
            lora = comfy.utils.load_torch_file(full_path, safe_load=True)
            model_lora, clip_lora = comfy.sd.load_lora_for_models(
                model, clip, lora, strength, strength
            )
            clean_name = os.path.splitext(os.path.basename(selected_full_path))[0]
            return (model_lora, clip_lora, clean_name)
        except Exception as e:
            print(f"🥤 ShakerLoader: Error loading {selected_full_path}: {e}")
            return (model, clip, "Load Error")

NODE_CLASS_MAPPINGS = {"ShakerLoraLoader": ShakerLoraLoader}
NODE_DISPLAY_NAME_MAPPINGS = {"ShakerLoraLoader": "🥤 Shaker Lora Searcher"}