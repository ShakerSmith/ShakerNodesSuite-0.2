class ShakerMasterController:
    """
    Master Controller for Shaker Nodes.
    Provides global commands to toggle manual/random modes across all category nodes.
    """
    @classmethod
    def INPUT_TYPES(cls):
        return {"required": {}}

    RETURN_TYPES = ()
    FUNCTION = "noop"
    CATEGORY = "ShakerNodes"
    OUTPUT_NODE = True

    def noop(self):
        return {}

NODE_CLASS_MAPPINGS = {
    "ShakerMasterController": ShakerMasterController
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "ShakerMasterController": "Master Controller 🕹️"
}