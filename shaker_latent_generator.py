import torch
import random
import time

class LatentGenerator:
    RESOLUTIONS = {
        "Large": {
            "Portrait (2:3)": (832, 1248),
            "Wide (3:2)": (1248, 832),
            "Cinema (16:9)": (1344, 768),
            "Ultrawide (2.39:1)": (1536, 640)
        },
        "Small": {
            "Portrait (2:3)": (416, 624),
            "Wide (3:2)": (640, 360),
            "Cinema (16:9)": (640, 360),
            "Ultrawide (2.39:1)": (768, 320)
        }
    }

    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "aspect_ratio": (["Portrait (2:3)", "Wide (3:2)", "Cinema (16:9)", "Ultrawide (2.39:1)", "Custom", "Random"], {"default": "Wide (3:2)"}),
                "size_model": (["Large (SDXL)", "Small (SD1.5)"], {"default": "Large (SDXL)"}),
                "multiplier": ("FLOAT", {"default": 1.0, "min": 0.1, "max": 4.0, "step": 0.1}),
                "custom_width": ("INT", {"default": 1024, "min": 64, "max": 8192}),
                "custom_height": ("INT", {"default": 1024, "min": 64, "max": 8192}),
                "testing_override": ("BOOLEAN", {"default": False, "label_on": "64px (TEST)", "label_off": "Full Size"}),
                "batch_size": ("INT", {"default": 1, "min": 1, "max": 64}),
            }
        }

    RETURN_TYPES = ("LATENT", "INT", "INT")
    RETURN_NAMES = ("latent", "width", "height")
    FUNCTION = "generate"
    CATEGORY = "ShakerNodes"

    @classmethod
    def IS_CHANGED(s, aspect_ratio, **kwargs):
        if aspect_ratio == "Random":
            return float("nan")
        return aspect_ratio

    def generate(self, aspect_ratio, size_model, multiplier, custom_width, custom_height, testing_override, batch_size):
        applied_label = aspect_ratio
        
        if testing_override:
            width, height = 64, 64
            applied_label = "Testing (64x64)"
        elif aspect_ratio == "Custom":
            width = int(custom_width * multiplier)
            height = int(custom_height * multiplier)
            applied_label = f"Custom: {width}x{height}"
        else:
            active_ratio = aspect_ratio
            if aspect_ratio == "Random":
                random.seed(time.time())
                active_ratio = random.choice(["Portrait (2:3)", "Wide (3:2)", "Cinema (16:9)", "Ultrawide (2.39:1)"])
                applied_label = f"Random: {active_ratio}"
            
            size_key = "Large" if "Large" in size_model else "Small"
            base_w, base_h = self.RESOLUTIONS[size_key][active_ratio]
            
            width = int(base_w * multiplier)
            height = int(base_h * multiplier)

        width = (width // 8) * 8
        height = (height // 8) * 8

        latent = torch.zeros([batch_size, 4, height // 8, width // 8])
        
        return {
            "ui": {"applied_res": [f"{applied_label} ({width}x{height})"]},
            "result": ({"samples": latent}, width, height)
        }

NODE_CLASS_MAPPINGS = {"LatentGenerator": LatentGenerator}
NODE_DISPLAY_NAME_MAPPINGS = {"LatentGenerator": "⚖️ Shaker Latent Generator"}