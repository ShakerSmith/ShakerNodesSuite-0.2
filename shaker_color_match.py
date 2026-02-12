import torch
import numpy as np
from PIL import Image

class ShakerGradualColorMatch:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "batch_images": ("IMAGE",),
                "reference_image": ("IMAGE",),
                "enabled": ("BOOLEAN", {"default": True}),
                "start_strength": ("FLOAT", {"default": 0.0, "min": 0.0, "max": 1.0, "step": 0.01}),
                "end_strength": ("FLOAT", {"default": 1.0, "min": 0.0, "max": 1.0, "step": 0.01}),
                "interpolation": (["linear", "smoothstep"], {"default": "linear"}),
                "match_mode": (["RGB", "Luminance"], {"default": "RGB"}),
            }
        }

    RETURN_TYPES = ("IMAGE",)
    FUNCTION = "apply_match"
    CATEGORY = "ShakerNodes/Video"

    def apply_match(self, batch_images, reference_image, enabled, start_strength, end_strength, interpolation, match_mode):
        if not enabled:
            return (batch_images,)

        # Convert tensors to numpy
        # batch_images: [B, H, W, C]
        batch_np = batch_images.cpu().numpy()
        ref_np = reference_image.cpu().numpy()[0]
        
        num_frames = batch_np.shape[0]
        out_frames = []

        for i in range(num_frames):
            target = batch_np[i]
            
            # Calculate normalized progress (t)
            t = i / (num_frames - 1) if num_frames > 1 else 0.0
            
            # Apply interpolation curve
            if interpolation == "smoothstep":
                t = t * t * (3 - 2 * t)
            
            # Calculate actual strength for this frame
            current_strength = start_strength + (end_strength - start_strength) * t
            
            if current_strength <= 0:
                out_frames.append(target)
                continue

            matched = self.histogram_match(target, ref_np, current_strength, match_mode)
            out_frames.append(matched)

        # Convert back to torch tensor [B, H, W, C]
        output_tensor = torch.from_numpy(np.stack(out_frames)).float()
        return (output_tensor,)

    def histogram_match(self, source, reference, strength, mode):
        # Handle Luminance mode by converting to YUV-like behavior internally
        if mode == "Luminance":
            # Simple weighted luminance: Y = 0.299R + 0.587G + 0.114B
            s_lum = 0.299 * source[:,:,0] + 0.587 * source[:,:,1] + 0.114 * source[:,:,2]
            r_lum = 0.299 * reference[:,:,0] + 0.587 * reference[:,:,1] + 0.114 * reference[:,:,2]
            
            matched_lum = self.match_channel(s_lum, r_lum)
            
            # Apply only the difference to the original channels
            diff = (matched_lum - s_lum) * strength
            matched = source + diff[:, :, np.newaxis]
            return np.clip(matched, 0, 1)
        
        else:
            # Standard RGB matching
            matched = np.zeros_like(source)
            for c in range(source.shape[-1]):
                matched_channel = self.match_channel(source[:,:,c], reference[:,:,c])
                matched[:,:,c] = (1 - strength) * source[:,:,c] + strength * matched_channel
            return np.clip(matched, 0, 1)

    def match_channel(self, s_chan, r_chan):
        """Helper to match a single 2D channel histogram"""
        s_values, s_idx, s_counts = np.unique(s_chan.ravel(), return_inverse=True, return_counts=True)
        r_values, r_counts = np.unique(r_chan.ravel(), return_counts=True)

        s_quantiles = np.cumsum(s_counts).astype(np.float64) / s_chan.size
        r_quantiles = np.cumsum(r_counts).astype(np.float64) / r_chan.size

        interp_r_values = np.interp(s_quantiles, r_quantiles, r_values)
        return interp_r_values[s_idx].reshape(s_chan.shape)

NODE_CLASS_MAPPINGS = {"ShakerGradualColorMatch": ShakerGradualColorMatch}
NODE_DISPLAY_NAME_MAPPINGS = {"ShakerGradualColorMatch": "🌓 Shaker Gradual Color Match"}