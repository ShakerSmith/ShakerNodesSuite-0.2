import os
import datetime
import json
import re
import textwrap
from PIL import Image
from PIL.PngImagePlugin import PngInfo
import numpy as np
import folder_paths
from server import PromptServer

class AdvancedImageSave:
    def __init__(self):
        self.output_dir = folder_paths.get_output_directory()
        self.type = "output"

    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "images": ("IMAGE", ),
                "filename_prefix": ("STRING", {"default": "ShakerGen"}),
                "file_format": (["webp", "png"], {"default": "webp"}),
                "compression": ("INT", {"default": 100, "min": 1, "max": 100, "step": 1}),
                "folder_by_date": ("BOOLEAN", {"default": True}),
                "prefix_timestamp": ("BOOLEAN", {"default": True}),
                "sub_directory": ("STRING", {"default": ""}),
                "metadata_wrap": ("INT", {"default": 60, "min": 10, "max": 500}),
            },
            "optional": {
                "positive_prompt": ("STRING", {"forceInput": True}), 
                "negative_prompt": ("STRING", {"forceInput": True}),
                "filtered_preset_list": ("STRING", {"forceInput": True}),
            },
            "hidden": {"prompt": "PROMPT", "extra_pnginfo": "EXTRA_PNGINFO"},
        }

    RETURN_TYPES = ("IMAGE",)
    RETURN_NAMES = ("images",)
    FUNCTION = "save_images"
    OUTPUT_NODE = True
    CATEGORY = "ShakerNodes"

    def save_images(self, images, filename_prefix, file_format, compression, 
                    folder_by_date, prefix_timestamp, sub_directory, metadata_wrap,
                    positive_prompt="", negative_prompt="", filtered_preset_list="", 
                    prompt=None, extra_pnginfo=None):
        
        full_output_folder = self.output_dir
        if folder_by_date:
            full_output_folder = os.path.join(self.output_dir, datetime.datetime.now().strftime("%Y-%m-%d"))
        
        if sub_directory.strip():
            clean_sub = re.sub(r'[\\/*?:"<>|\n\r\t]', "", sub_directory.strip())
            full_output_folder = os.path.join(full_output_folder, clean_sub)
            
        if not os.path.exists(full_output_folder):
            os.makedirs(full_output_folder, exist_ok=True)

        for (batch_number, image) in enumerate(images):
            i = 255. * image.cpu().numpy()
            img = Image.fromarray(np.clip(i, 0, 255).astype(np.uint8))
            
            current_filename = filename_prefix.strip().replace("\n", "").replace("\r", "")
            
            if prefix_timestamp:
                current_filename = f"{datetime.datetime.now().strftime('%H%M')}_{current_filename}"
            
            file_path = os.path.join(full_output_folder, f"{current_filename}.{file_format}")
            
            png_info = PngInfo()
            
            # Metadata Construction
            wrapped_pos = textwrap.fill(positive_prompt, width=metadata_wrap)
            # Use 'Description' as the primary field (Nomacs compatible)
            clean_meta = f"POSITIVE PROMPT:\n{wrapped_pos}\n\nPRESETS:\n{filtered_preset_list}"
            png_info.add_text("Description", clean_meta)
            
            if prompt is not None: png_info.add_text("prompt", json.dumps(prompt))
            if extra_pnginfo is not None:
                for key, value in extra_pnginfo.items(): png_info.add_text(key, json.dumps(value))
            if filtered_preset_list: png_info.add_text("ShakerPresets", filtered_preset_list)

            if file_format == "webp":
                img.save(file_path, "WEBP", quality=compression, lossless=(compression>=100), metadata=png_info)
            else:
                png_comp = int((100 - compression) / 10) 
                img.save(file_path, "PNG", pnginfo=png_info, compress_level=max(0, min(9, png_comp)), dpi=(300, 300))

        PromptServer.instance.send_sync("shaker_save_complete", {"status": "success"})
        return (images,)

NODE_CLASS_MAPPINGS = {"AdvancedImageSave": AdvancedImageSave}
NODE_DISPLAY_NAME_MAPPINGS = {"AdvancedImageSave": "Advanced Image Save"}