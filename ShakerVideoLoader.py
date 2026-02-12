import os
import torch
import cv2
import numpy as np
import folder_paths
from comfyuibackend import audio # Ensure your environment supports this or use torchaudio

class ShakerVideoLoader:
    @classmethod
    def INPUT_TYPES(s):
        # input_get_filename_list provides the list of files in your 'input' folder
        # This specific structure triggers the Drag-and-Drop/Upload UI in the frontend
        input_dir = folder_paths.get_input_directory()
        files = [f for f in os.listdir(input_dir) if os.path.isfile(os.path.join(input_dir, f))]
        return {
            "required": {
                "video": (sorted(files), {"video_upload": True}),
            }
        }

    RETURN_TYPES = ("STRING", "VIDEO", "IMAGE", "IMAGE", "IMAGE", "AUDIO", "INT")
    RETURN_NAMES = ("filename", "video_path", "images", "first_frame", "last_frame", "audio", "fps")
    FUNCTION = "load_video"
    CATEGORY = "ShakerNodes"

    def load_video(self, video):
        # 1. Resolve the path from the ComfyUI input folder
        video_path = folder_paths.get_annotated_filepath(video)
        filename = os.path.splitext(os.path.basename(video_path))[0]

        # 2. Extract Frames and FPS using OpenCV
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError(f"Failed to open video file: {video_path}")
            
        fps = int(cap.get(cv2.CAP_PROP_FPS))
        frames = []
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            # OpenCV BGR -> RGB
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            # Normalize to ComfyUI (0.0-1.0 float tensor)
            frame = np.array(frame).astype(np.float32) / 255.0
            frames.append(torch.from_numpy(frame))
        
        cap.release()

        if len(frames) == 0:
            raise ValueError("No frames found in video.")

        # Create Batch [Batch, Height, Width, Channels]
        video_batch = torch.stack(frames)
        first_frame = video_batch[0].unsqueeze(0)
        last_frame = video_batch[-1].unsqueeze(0)

        # 3. Audio (Returning path string for VHS/Audio nodes compatibility)
        audio_path = video_path 

        return (filename, video_path, video_batch, first_frame, last_frame, audio_path, fps)

NODE_CLASS_MAPPINGS = {"ShakerVideoLoader": ShakerVideoLoader}
NODE_DISPLAY_NAME_MAPPINGS = {"ShakerVideoLoader": "🥤 Shaker Video Loader"}