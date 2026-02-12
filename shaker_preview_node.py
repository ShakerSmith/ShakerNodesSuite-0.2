import os

# Define the category to match your existing suite
SUITE_CATEGORY = "ShakerNodes"

class ShakerLivePreviewMirror:
    """
    A specialized node that mirrors the active sampler's live preview.
    It has no functional output; the JS extension handles the visual mirroring.
    """
    @classmethod
    def INPUT_TYPES(s):
        return {"required": {}}
    
    RETURN_TYPES = ()
    FUNCTION = "noop"
    CATEGORY = f"{SUITE_CATEGORY}/Utility"
    OUTPUT_NODE = True

    def noop(self):
        return {}

# Mappings for ComfyUI to recognize the node
NODE_CLASS_MAPPINGS = {
    "ShakerLivePreviewMirror": ShakerLivePreviewMirror
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "ShakerLivePreviewMirror": "Live Preview Mirror 📺"
}