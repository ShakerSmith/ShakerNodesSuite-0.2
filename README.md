# ShakerNodesSuite-0.2
Comfyui nodes for saving, combining, building, randomizing prompts

1. 
INSTALL:

Add this suite to "/ComfyUI/custom_nodes"

in cmd console: git clone https://github.com/ShakerSmith/ShakerNodesSuite

2. OPEN THE INCLUDED EXAMPLE "TUTORIAL" WORKFLOW: 

TUTORIAL WORKLOW: <img width="832" height="1248" alt="ShakerNodes-Tutorial" src="https://github.com/user-attachments/assets/f7d5071b-2543-4e54-9b02-49fac734d1b4" />

USAGE: 

1. Latent Generator:

has preset Aspect Ratios and sizes - with a global multiplier.
can be set to random - will output a different preset aspect ratio each run. can also be set to manual.
or use your own latent generator

2. Prompt Builder:

<img width="488" height="347" alt="546561546-364eec63-7718-441f-a75e-188744aa4767" src="https://github.com/user-attachments/assets/4b1100f7-675b-4f72-8d0b-d3515154fc93" />

"Categories" "Presets" "Scenes"

A: Categories - contain "presets" and, on reload, will generate a new node for each category. That category's node will contain all the presets saved in that category.

B: Presets - presets contain the actual prompt text you want to be sent to the final prompt.
each "category" node can be set to manual (choose ONE preset), random all (randomly choose from ALL presets in that category), or random select (choose from only the presets user selects)

C: Scenes - contain the randomization modes and any preset selections for all loaded nodes in this nodesuite

3. Preset Manager / Scene Manager

<img width="614" height="233" alt="PresetManager" src="https://github.com/user-attachments/assets/5bfaed00-5f26-49bf-b3f8-751de33cec97" />


open the "PM" floating button, or "Preset Manager" on the Dashboard node. Add categories, reorder them, add/edit presets. can be pinned to the top or bottom of their category node. (default is alphabetical sorting)
open the "SM" floating button, or "Scene Manager" on the Dashboard node. Can "capture" the current state of all your nodes and quickly load captures scenes.

ADDING A NEW CATEGORY REQUIRES A COMFYUI RESTART. The Prompt Builder Console, on restart, will have a new input for your new category. There will ALSO be a new node available for you to connect to the Prompt Builder Console. Build order can be changed in the "edit categories" mode of the Preset Manager (floating "PM" button)


Metadata Filter,
will take all the LABELS of your presets and output them, can be turned on an off by category in the right-click node properties panel.

Big Display - display any, right-click properties to change font size and color - visible at any zoom level

Advanced Image Save -can save as .png or .webp - has inputs for metadata and toggles for folder_by_date (YYYY-MM-DD), prefix timestamp for the file (HHMM), and a custom sub_directory.
0424_BW-Group-Varied-Elderly-Bored-Business Suit-GlassesBlack-Close-Up-Portrait-CityDayTrees


EXTRA NODES:


A. Pipe Any - Shaker Pipe Pack / Unpack - pipe any, inputs automatically generate as you add more. mapped 1 - to - 1 inputs to outputs.

B. Batch Any - lazy batching, doesn't fault if any inputs get a null in

C. Color Match - takes a reference image, applies color matching 
incrementally over a batch

D. Timer Node - right click to change font size and color - visible at any zoom level



ONCE YOU'VE GOT THE HANG OF HOW THE SUITE WORKS - build whatever kind of UI you want, drag your category nodes where they make sense to you, pin presets to the top or bottom of the category node from the Preset Manager. 

HERE'S AN EXAMPLE OF A COMPACT WORKFLOW:


<img width="832" height="1248" alt="ShakerNodes-Compact" src="https://github.com/user-attachments/assets/fe31627a-98eb-452e-82b8-73df498b821d" />
