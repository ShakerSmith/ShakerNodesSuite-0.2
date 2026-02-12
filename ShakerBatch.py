import torch

class ShakerBatch:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {},
            "optional": {
                "input_1": ("*",),
                "input_2": ("*",),
                "input_3": ("*",),
                "input_4": ("*",),
            }
        }

    RETURN_TYPES = ("*",)
    RETURN_NAMES = ("batched_output",)
    FUNCTION = "combine"
    CATEGORY = "ShakerNodes"

    def combine(self, **kwargs):
        valid_batches = []
        
        # Ensure we process inputs in the correct numerical order
        # This handles input_1, input_2... input_10 correctly
        sorted_keys = sorted(kwargs.keys(), key=lambda x: int(x.split('_')[-1]))

        for key in sorted_keys:
            data = kwargs[key]
            
            # Skip null, empty lists, or None
            if data is None:
                continue
                
            # If it's a tensor, ensure it has a batch dimension
            if isinstance(data, torch.Tensor):
                if data.shape[0] > 0:
                    valid_batches.append(data)
            else:
                # Fallback for non-tensor types if you use wildcards for other data
                valid_batches.append(data)

        if not valid_batches:
            return (None,)

        # Concatenate along the batch dimension (0)
        # Note: This assumes all inputs are the same shape (Width/Height)
        return (torch.cat(valid_batches, dim=0),)

NODE_CLASS_MAPPINGS = {"ShakerBatch": ShakerBatch}
NODE_DISPLAY_NAME_MAPPINGS = {"ShakerBatch": "Shaker Batch (Any)"}