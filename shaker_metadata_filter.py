import os
import json
import re

NODE_DIRECTORY = os.path.dirname(os.path.abspath(__file__))
# Shared profile pathing
ACTIVE_PRESETS_FILE = os.path.join(NODE_DIRECTORY, "profiles", "presets.json")
GLOBAL_DEFAULTS_FILE = os.path.join(NODE_DIRECTORY, "profiles", "global_defaults.json")

class ShakerMetadataFilter:
    """
    MODERNIZED FILTER: Moves category toggles to Right-Click Properties.
    Only the readable_list input remains visible on the node face.
    """
    @classmethod
    def INPUT_TYPES(s):
        # We no longer generate 20+ widgets here.
        # Python will instead read the toggles from the 'Properties' sent via hidden data.
        return {
            "required": {"readable_list": ("STRING", {"forceInput": True})},
            "hidden": {"prompt": "PROMPT", "extra_pnginfo": "EXTRA_PNGINFO"}
        }

    RETURN_TYPES = ("STRING", "STRING", "PROMPT", "EXTRA_PNGINFO")
    RETURN_NAMES = ("filtered_list", "filename_text", "prompt", "extra_pnginfo")
    FUNCTION = "filter_metadata"
    CATEGORY = "ShakerNodes"

    def load_settings(self, extra_pnginfo):
        # Default: All ON
        settings = {}
        if os.path.exists(ACTIVE_PRESETS_FILE):
            try:
                with open(ACTIVE_PRESETS_FILE, "r") as f:
                    for cat in json.load(f).get("build_order", []):
                        settings[cat] = True
            except: pass

        # Override with Instance Properties from Workflow
        if extra_pnginfo and "workflow" in extra_pnginfo:
            for node in extra_pnginfo["workflow"].get("nodes", []):
                if node.get("type") == "ShakerMetadataFilter":
                    props = node.get("properties", {})
                    # If the property exists, it overrides the default
                    for k, v in props.items():
                        if isinstance(v, bool): settings[k] = v
                    break
        return settings

    def filter_metadata(self, readable_list, prompt=None, extra_pnginfo=None, **kwargs):
        if not readable_list:
            return ("", "", prompt, extra_pnginfo)

        # Get toggles from Properties bridge
        toggles = self.load_settings(extra_pnginfo)
        
        lines = readable_list.split("\n")
        filtered_lines = []
        filename_parts = []
        
        for line in lines:
            if ":" in line:
                parts = line.split(":", 1)
                cat_name = parts[0].strip()
                preset_label = parts[1].strip()
                
                # Check the property toggle
                if toggles.get(cat_name, True):
                    filtered_lines.append(line)
                    filename_parts.append(preset_label)
        
        display_output = "\n".join(filtered_lines)
        clean_name = "_".join(filename_parts)
        clean_name = re.sub(r'[\\/*?:"<>|]', "", clean_name)
        clean_name = re.sub(r'_{2,}', "_", clean_name)
        
        return (display_output, clean_name.strip("_"), prompt, extra_pnginfo)

NODE_CLASS_MAPPINGS = {"ShakerMetadataFilter": ShakerMetadataFilter}
NODE_DISPLAY_NAME_MAPPINGS = {"ShakerMetadataFilter": "⚖️ Shaker Metadata Filter"}