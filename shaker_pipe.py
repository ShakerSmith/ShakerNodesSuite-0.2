class ShakerPipePack:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {},
            "optional": {"in_1": ("*",), "in_2": ("*",), "in_3": ("*",), "in_4": ("*",)}
        }
    
    RETURN_TYPES = ("SHAKER_PIPE",)
    FUNCTION = "packit"
    CATEGORY = "ShakerNodes/Pipe"

    def packit(self, **kwargs):
        # Pass the dict so labels/order are preserved for the Unpack node
        return (kwargs,)

class ShakerPipeUnpack:
    @classmethod
    def INPUT_TYPES(s):
        return {"required": {"pipe": ("SHAKER_PIPE",)}}
    
    RETURN_TYPES = ("SHAKER_PIPE",) + (("*",) * 20)
    RETURN_NAMES = ("pipe_pass",) + tuple([f"out_{i}" for i in range(1, 21)])
    FUNCTION = "unpackit"
    CATEGORY = "ShakerNodes/Pipe"

    def unpackit(self, pipe=None):
        if pipe is None: return (None,) * 21
        vals = list(pipe.values())
        return (pipe, *vals, *(None,) * (20 - len(vals)))

NODE_CLASS_MAPPINGS = {"ShakerPipePack": ShakerPipePack, "ShakerPipeUnpack": ShakerPipeUnpack}