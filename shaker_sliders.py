import os

class ShakerIntegerSlider:
    @classmethod
    def INPUT_TYPES(s):
        return {"required": {"value": ("INT", {"default": 20, "min": 0, "max": 100, "step": 1, "display": "slider"})},
                "hidden": {"extra_pnginfo": "EXTRA_PNGINFO"}}
    RETURN_TYPES = ("INT",)
    RETURN_NAMES = ("value",)
    FUNCTION = "process"
    CATEGORY = "ShakerNodes/Sliders"
    def process(self, value, extra_pnginfo=None):
        return (int(round(float(value))),)

class ShakerFloatSlider:
    @classmethod
    def INPUT_TYPES(s):
        return {"required": {"value": ("FLOAT", {"default": 0.5, "min": 0.0, "max": 1.0, "step": 0.01, "display": "slider"})},
                "hidden": {"extra_pnginfo": "EXTRA_PNGINFO"}}
    RETURN_TYPES = ("FLOAT",)
    RETURN_NAMES = ("value",)
    FUNCTION = "process"
    CATEGORY = "ShakerNodes/Sliders"
    def process(self, value, extra_pnginfo=None):
        return (float(value),)

class ShakerStringSlider:
    @classmethod
    def INPUT_TYPES(s):
        return {"required": {"value": ("FLOAT", {"default": 1.0, "min": 0.0, "max": 10.0, "step": 0.1, "display": "slider"})},
                "hidden": {"extra_pnginfo": "EXTRA_PNGINFO"}}
    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("value",)
    FUNCTION = "process"
    CATEGORY = "ShakerNodes/Sliders"
    def process(self, value, extra_pnginfo=None):
        return (str(value),)

NODE_CLASS_MAPPINGS = {
    "ShakerIntegerSlider": ShakerIntegerSlider,
    "ShakerFloatSlider": ShakerFloatSlider,
    "ShakerStringSlider": ShakerStringSlider
}