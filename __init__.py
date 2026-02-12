import os
import importlib.util

NODE_DIR = os.path.dirname(os.path.abspath(__file__))
NODE_CLASS_MAPPINGS = {}
NODE_DISPLAY_NAME_MAPPINGS = {}

# Dynamic loader for .py files
py_files = [f for f in os.listdir(NODE_DIR) if f.endswith('.py') and f != '__init__.py']

for file in py_files:
    try:
        module_name = os.path.splitext(file)[0]
        spec = importlib.util.spec_from_file_location(module_name, os.path.join(NODE_DIR, file))
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        if hasattr(module, 'NODE_CLASS_MAPPINGS'):
            NODE_CLASS_MAPPINGS.update(module.NODE_CLASS_MAPPINGS)
        if hasattr(module, 'NODE_DISPLAY_NAME_MAPPINGS'):
            NODE_DISPLAY_NAME_MAPPINGS.update(module.NODE_DISPLAY_NAME_MAPPINGS)
    except Exception as e:
        print(f"[ShakerNodes] Error loading {file}: {e}")

# IMPORTANT: Point to the js directory
WEB_DIRECTORY = "./js"

__all__ = ['NODE_CLASS_MAPPINGS', 'NODE_DISPLAY_NAME_MAPPINGS']