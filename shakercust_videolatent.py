import torch
import torch.nn.functional as F

class ShakerCust_VideoLatents:
    """
    A custom node to generate empty latents for video models.
    It automatically detects orientation from an input image (landscape 16:9, portrait 2:3),
    and includes an image processor that scales and center-crops.
    """
    @classmethod
    def IS_CHANGED(s, **kwargs):
        return float("NaN")

    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "orientation": (["landscape", "portrait"],),
                "resolution": ([720, 480],),
                "seconds": ("INT", {"default": 5, "min": 1, "max": 60, "step": 1}),
                "frame_rate": ("INT", {"default": 12, "min": 1, "max": 60, "step": 1}),
                "custom_frames": ("INT", {"default": 0, "min": 0, "max": 120, "step": 1}),
                "batch_size": ("INT", {"default": 1, "min": 1, "max": 64, "step": 1}),
            },
            "optional": {
                "image": ("IMAGE",)
            }
        }

    RETURN_TYPES = ("LATENT", "IMAGE", "INT", "INT", "INT",)
    RETURN_NAMES = ("latent", "processed_image", "width", "height", "Length",)
    FUNCTION = "generate_latents"
    CATEGORY = "ShakerNodes"

    def generate_latents(self, orientation, resolution, seconds, frame_rate, custom_frames, batch_size, image=None):
        # --- Automatic Orientation Logic ---
        if image is not None:
            source_height, source_width = image.shape[1], image.shape[2]
            if source_width > source_height:
                orientation = "landscape"
            elif source_height > source_width:
                orientation = "portrait"

        # --- Resolution and Orientation Logic ---
        if orientation == "landscape":
            if resolution == 720:
                target_width, target_height = 1280, 720  # 16:9
            else: # 480p
                target_width, target_height = 854, 480   # 16:9
        else:  # portrait
            if resolution == 720:
                target_width, target_height = 720, 1080  # 2:3
            else: # 480p
                target_width, target_height = 480, 720   # 2:3

        latent_width = target_width // 8
        latent_height = target_height // 8

        # --- Frame Calculation ---
        num_frames = int(seconds * frame_rate) + custom_frames

        # --- Latent Tensor Generation ---
        latent = torch.zeros([batch_size, 4, num_frames, latent_height, latent_width])

        # --- Optional Image Processing (Scale and Center Crop) ---
        if image is not None:
            source_height, source_width = image.shape[1], image.shape[2]
            source_aspect = source_width / source_height
            target_aspect = target_width / target_height

            img_bchw = image.permute(0, 3, 1, 2)

            if source_aspect > target_aspect:
                scale_factor = target_height / source_height
                new_height = target_height
                new_width = int(source_width * scale_factor)
            else:
                scale_factor = target_width / source_width
                new_width = target_width
                new_height = int(source_height * scale_factor)

            resized_bchw = F.interpolate(img_bchw, size=(new_height, new_width), mode='bicubic', align_corners=False)

            left = (new_width - target_width) // 2
            top = (new_height - target_height) // 2
            cropped_bchw = resized_bchw[:, :, top:top + target_height, left:left + target_width]

            processed_image = cropped_bchw.permute(0, 2, 3, 1)
        else:
            processed_image = torch.zeros([1, target_height, target_width, 3], dtype=torch.float32)

        return ({"samples": latent}, processed_image, target_width, target_height, num_frames,)

# --- Node Registration ---
NODE_CLASS_MAPPINGS = {
    "ShakerCust-VideoLatents": ShakerCust_VideoLatents
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "ShakerCust-VideoLatents": "Shaker Video Latents"
}