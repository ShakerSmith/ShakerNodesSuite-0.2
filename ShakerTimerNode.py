class ShakerTimer:
    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {},
            "hidden": {"unique_id": "UNIQUE_ID"},
        }

    RETURN_TYPES = ()
    FUNCTION = "execute"
    OUTPUT_NODE = True
    CATEGORY = "ShakerNodes"

    def execute(self, **kwargs):
        return {}

# These are the specific keys your __init__.py is looking for
NODE_CLASS_MAPPINGS = {
    "ShakerTimer": ShakerTimer
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "ShakerTimer": "Shaker Timer ⏱️"
}