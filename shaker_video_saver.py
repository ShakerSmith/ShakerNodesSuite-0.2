import os
import datetime
import json
import re
import numpy as np
import torch
import cv2
from PIL import Image
import folder_paths
from server import PromptServer

NODE_DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class ShakerVideoSaver:
    def __init__(self):
        self.output_dir = folder_paths.get_output_directory()
        self.type = "output"

    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "images": ("IMAGE", ),
                "fps": ("INT", {"default": 12, "min": 1, "max": 120}),
                "filename_prefix": ("STRING", {"default": "ShakerVideo"}),
                "format": (["mp4", "webp_anim", "gif"], {"default": "mp4"}),
                "sub_directory": ("STRING", {"default": ""}),
                "folder_by_date": ("BOOLEAN", {"default": True}),
                "prefix_timestamp": ("BOOLEAN", {"default": True}),
            },
            "hidden": {"prompt": "PROMPT", "extra_pnginfo": "EXTRA_PNGINFO", "unique_id": "UNIQUE_ID"},
        }

    RETURN_TYPES = ("IMAGE", "IMAGE")
    RETURN_NAMES = ("batch_pass", "last_frame")
    FUNCTION = "save_video"
    OUTPUT_NODE = True
    CATEGORY = "ShakerNodes"

    def save_video(self, images, fps, filename_prefix, format, sub_directory, folder_by_date, prefix_timestamp, prompt=None, extra_pnginfo=None, unique_id=None):
        # Path Construction - Using instance-specific widget values directly
        full_output_folder = self.output_dir
        
        try:
            if folder_by_date:
                full_output_folder = os.path.join(full_output_folder, datetime.datetime.now().strftime("%Y-%m-%d"))
            
            sub_dir = sub_directory.strip()
            if sub_dir:
                # Sanitize the sub_directory input
                clean_sub = re.sub(r'[\\/*?:"<>|]', "", sub_dir)
                full_output_folder = os.path.join(full_output_folder, clean_sub)
            
            # Create folder if it doesn't exist
            os.makedirs(full_output_folder, exist_ok=True)
        except Exception as e:
            print(f"ShakerVideoSaver: Path error {e}. Falling back to root output.")
            full_output_folder = self.output_dir 

        # File Naming logic
        current_filename = filename_prefix
        if prefix_timestamp:
            current_filename = f"{datetime.datetime.now().strftime('%H%M')}_{current_filename}"
        
        file_extension = format.replace('webp_anim', 'webp')
        file_path = os.path.join(full_output_folder, f"{current_filename}.{file_extension}")

        # Process Tensors to Numpy
        frames = []
        for image in images:
            i = 255. * image.cpu().numpy()
            img_np = np.clip(i, 0, 255).astype(np.uint8)
            frames.append(img_np)

        # SAVE LOGIC
        if format == "mp4":
            height, width, _ = frames[0].shape
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            out = cv2.VideoWriter(file_path, fourcc, fps, (width, height))
            for frame in frames:
                # RGB to BGR for OpenCV compatibility
                out.write(cv2.cvtColor(frame, cv2.COLOR_RGB2BGR))
            out.release()
        
        elif format in ["webp_anim", "gif"]:
            pil_imgs = [Image.fromarray(f) for f in frames]
            duration = int(1000 / fps)
            pil_imgs[0].save(file_path, save_all=True, append_images=pil_imgs[1:], 
                             duration=duration, loop=0, quality=95 if format=="webp_anim" else None)

        PromptServer.instance.send_sync("shaker_save_complete", {"status": "success"})
        return (images, images[-1:])

NODE_CLASS_MAPPINGS = {"ShakerVideoSaver": ShakerVideoSaver}