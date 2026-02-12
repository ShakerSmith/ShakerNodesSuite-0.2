import json

class ShakerDisplay:
    """
    A specialized display node for the ShakerNodes suite.
    It passes text to the UI for custom rendering with adjustable fonts and colors.
    """
    @classmethod
    def INPUT_TYPES(s):
        return {"required": {"input_data": ("*",),}}
        
    RETURN_TYPES = ("STRING",)
    FUNCTION = "process"
    CATEGORY = "ShakerNodes"
    OUTPUT_NODE = True

    def process(self, input_data):
        # Convert input to string for display
        text_out = str(input_data)
        # Send to UI via the 'ui' key
        return {"ui": {"text": [text_out]}, "result": (text_out,)}

NODE_CLASS_MAPPINGS = {"ShakerDisplay": ShakerDisplay}
NODE_DISPLAY_NAME_MAPPINGS = {"ShakerDisplay": "📺 Shaker Big Display"}