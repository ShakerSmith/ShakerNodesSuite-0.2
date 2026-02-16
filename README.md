# ShakerNodesSuite-0.3
Traditional prompting forces you to choose between two extremes: the "Wall of Text" box that is impossible to manage at scale, or Wildcards that feel like a black box where you never quite know what you're going to get. Our suite bridges this gap by turning prompting into a modular, visible UI experience. Instead of memorizing file names or hunting for missing commas, you have tactile Category Nodes that allow you to mix-and-match styles with surgical precision or roll the dice on curated randomization giving you the professional organization of a database with the creative speed of a slot machine.

<img width="614" height="233" alt="PresetManager" src="https://github.com/user-attachments/assets/5bfaed00-5f26-49bf-b3f8-751de33cec97" />

<img width="488" height="347" alt="546561546-364eec63-7718-441f-a75e-188744aa4767" src="https://github.com/user-attachments/assets/4b1100f7-675b-4f72-8d0b-d3515154fc93" />

Comfyui nodes for saving, combining, building, randomizing prompts. Also, lots of utilities for easier workflows - latent generator, live preview mirror, smart filename management, batching, piping. Here's the list of nodes - more detailed descriptions and tutorial workflow below:

### 🧠 Prompting & Management
* **Master Controller 🕹️**: Global remote to switch all Shaker nodes between Manual and Random modes.
* **Shaker Dashboard**: The central hub for accessing the floating UI Preset and Scene managers.
* **Category Nodes**: Dynamic nodes (e.g., Artist, Subject) generated automatically from your presets.
* **Prompt Builder Console**: The engine that compiles selections and merges negative prompts into one final string.
* **Metadata Filter**: Toggles which preset labels are exported to the image metadata/filename.

### 📐 Generation Utilities
* **Shaker Latent Generator**: Smart resolution manager with SD1.5/SDXL presets and auto-rounding logic.
* **Advanced Image Save**: High-speed saver for WebP and PNG with automatic date-sorting and metadata injection.
* **Shaker Reconstructor**: Reads Shaker metadata from an image to reset your workspace to those exact settings.

### 📥 Shaker I/O (Input/Output)
* **Video Single Loader**: Precision video importer with frame-accurate metadata and drag-and-drop support.
* **Folder Loader**: Automated image batcher that iterates through directories one-by-one.
* **Video Folder Loader**: Batch processor designed for high-volume Vid2Vid folder workflows.

### 📺 Monitoring & UI
* **Shaker Big Display 📺**: Large, high-visibility canvas renderer for prompts and seeds.
* **Live Preview Mirror 📺**: A remote viewing window that mirrors sampling progress anywhere in the graph.
* **Shaker Timer ⏱️**: A real-time stopwatch for benchmarking generation and workflow performance.

### 🔌 Workflow Logic
* **Shaker Pipe Pack**: Bundles up to 20 wires into a single clean connection to eliminate spaghetti. Default to 4 and automatically adds more inputs as you connect them.
* **Shaker Pipe Unpack**: Extracts specific wires from a Shaker Pipe at their destination.
* **Shaker Batch**: Batch Any with lazy batching - have as many inputs as you want AND will skip any null inputs.
* **Shaker Integer Slider**: Draggable handle for whole numbers (Steps, Batch Size). Right-click node properties to set upper and lower limits.
* **Shaker Float Slider**: Draggable handle for decimal values (Denoise, CFG). Right-click node properties to set upper and lower limits.
* **Shaker String Slider**: Converts numeric slider values into text strings for prompt injection. Right-click node properties to set upper and lower limits.

1. 
INSTALL:

Add this suite to "/ComfyUI/custom_nodes"

in cmd console: git clone https://github.com/ShakerSmith/ShakerNodesSuite

2. OPEN THE INCLUDED EXAMPLE "TUTORIAL" WORKFLOW: (save this image of a man in a suit - drag the image into Comfy - it will load with all the nodes correctly connected and a tutorial workflow with lots of notes.)

TUTORIAL WORKLOW: <img width="832" height="1248" alt="ShakerNodes-Tutorial" src="https://github.com/user-attachments/assets/f7d5071b-2543-4e54-9b02-49fac734d1b4" />

NODES IN THIS SUITE:

# PROMPT BUILDER:

<img width="488" height="347" alt="546561546-364eec63-7718-441f-a75e-188744aa4767" src="https://github.com/user-attachments/assets/4b1100f7-675b-4f72-8d0b-d3515154fc93" />

"Categories" "Presets" "Scenes": The idea here is to eliminate as much typing and prompt boxes - you use a built-in Preset Manager to save your prompts - organize them into categories - and use the Prompt Builder Main Console to assemble them into your final prompt to send to your samplers / workflow. 

Have ten characters and twenty outfits and thirty settings? Great! save them all as presets, and run as many variations with JUST clicking buttons (or randomize them however you want!)

## A: Categories - contain "presets" and, on reload, will generate a new node for each category. That category's node will contain all the presets saved in that category.

## B: Presets - presets contain the actual prompt text you want to be sent to the final prompt.
each "category" node can be set to manual (choose ONE preset), random all (randomly choose from ALL presets in that category), or random select (choose from only the presets user selects)

## C: Scenes - contain the randomization modes and any preset selections for all loaded nodes in this nodesuite

# Preset Manager / Scene Manager

<img width="614" height="233" alt="PresetManager" src="https://github.com/user-attachments/assets/5bfaed00-5f26-49bf-b3f8-751de33cec97" />


open the "PM" floating button, or "Preset Manager" on the Dashboard node. Add categories, reorder them, add/edit presets. can be pinned to the top or bottom of their category node. (default is alphabetical sorting)

open the "SM" floating button, or "Scene Manager" on the Dashboard node. Can "capture" the current state of all your nodes and quickly load captures scenes.

ADDING A NEW CATEGORY REQUIRES A COMFYUI RESTART. The Prompt Builder Console, on restart, will have a new input for your new category. There will ALSO be a new node available for you to connect to the Prompt Builder Console. Build order can be changed in the "edit categories" mode of the Preset Manager (floating "PM" button)


# Metadata Filter,
will take all the LABELS of your presets and output them, can be turned on an off by category in the right-click node properties panel.





# Advanced Image Save -can save as .png or .webp - has inputs for metadata and toggles for folder_by_date (YYYY-MM-DD), prefix timestamp for the file (HHMM), and a custom sub_directory.

Easily organize your generations into timestamped folders AND autoname your generations using YOUR preset labels. For instance, automatically get your output filenames looking like this: 

"output\2026-02-15\0424_1Man-Elderly-Bored-Business Suit-GlassesBlack-Close-Up-Portrait-CityDayTrees.png"

# 🎥 Shaker Video Saver

The **Shaker Video Saver** is a high-performance export node designed to handle the unique needs of AI-generated video and image sequences. It provides an organized, metadata-aware way to save animations directly from ComfyUI in multiple formats.

## 🚀 Why use this?

Standard video savers often lack flexible organization or force you to use command-line tools for simple exports. The **Shaker Video Saver** integrates into the suite's philosophy of "Clean I/O," offering automatic folder nesting, timestamping, and support for lightweight, high-quality formats like animated WebP.

---

## ✨ Key Features

### 1. Workflow Gatekeeping & Progressive Previews
This node can act as a **strategic checkpoint** in your graph. By placing a Video Saver after an initial low-res pass (like an AnimateDiff base) but before a heavy Upscale or ControlNet pass, you can:
* **Gatekeep the Workflow:** Use the `batch_pass` output to feed the next stage of your graph. This ensures that every time the workflow runs, a "work-in-progress" video is safely committed to disk before the more time-consuming nodes begin.
* **Progressive Previews:** If a long upscale fails or you manually cancel the run, you don't lose your work. The Video Saver has already written the base animation to your drive, giving you a library of previews to review without re-rendering the whole sequence.

### 2. Multi-Format Support
Export your generations in the format that best fits your needs:
* **MP4:** High compatibility for social media and editing (uses `mp4v` codec).
* **WebP (Animated):** Superior quality-to-file-size ratio, perfect for web sharing.
* **GIF:** The classic standard for quick, looped previews.

### 3. Professional File Organization
* **Folder by Date:** Automatically creates sub-folders named `YYYY-MM-DD`.
* **Timestamp Prefix:** Adds a `HHMM` prefix so your renders stay sorted chronologically.
* **Custom Sub-Directories:** Define a project name (e.g., "Scene_01_Tests") to keep related renders grouped.

---

## 🛠 Inputs & Outputs

| Input | Description |
| :--- | :--- |
| **images** | The image batch (tensor) to be converted into video. |
| **fps** | Frames Per Second (Standard is 12-24 for AI video). |
| **format** | Choose between `mp4`, `webp_anim`, or `gif`. |
| **sub_directory** | An optional extra folder layer for project organization. |

| Output | Description |
| :--- | :--- |
| **batch_pass** | Passes the full tensor batch forward. Use this to "gatekeep" the next node in your chain. |
| **last_frame** | Extracts only the final frame. Ideal for "Init Image" loops or frame-to-frame consistency checks. |

---

## 🚀 Pro-Tip: The "Chain-Link" Strategy

To maximize efficiency in complex video workflows, link your nodes as follows:
1. **Sampler** -> **Video Saver (Low Res MP4)** -> **Upscaler** -> **Video Saver (High Res MP4)**.



This setup creates a "fail-safe" point: if your high-res upscale runs out of VRAM, you still have the low-res preview video saved in your output folder automatically.

# 📏 Shaker Latent Generator

The **Shaker Latent Generator** is a specialized resolution-management node for ComfyUI. It eliminates the guesswork and "math fatigue" associated with setting up latents for different models, ensuring your dimensions are always optimized for the specific architecture you are using (SD1.5 or SDXL).

## 🚀 Why use this instead of the Empty Latent Image node?

In standard ComfyUI, you have to manually enter pixel dimensions. If you get the math wrong, or use a resolution that isn't a multiple of 8, you'll encounter artifacts or performance degradation. The Shaker Latent Generator automates this process using industry-standard aspect ratios.

---

## ✨ Key Features

### 1. Smart Architecture Presets
Switching between **Small (SD1.5)** and **Large (SDXL)** models usually requires changing your resolution to hit the "sweet spot" for those models. This node handles that transition with one click:
* **Large (SDXL):** Uses base resolutions optimized for the 1024x1024 training bucket (e.g., 1344 x 768 for Cinema).
* **Small (SD1.5):** Uses base resolutions optimized for the 512x512 / 768x768 range.

### 2. Pro Aspect Ratios
Stop looking up pixel counts. Choose from standard cinematic and photographic ratios:
* **Portrait** (2:3)
* **Wide** (3:2)
* **Cinema** (16:9)
* **Ultrawide** (2.39:1)

### 3. The "Divisible by 8" Safety Net
No matter what multiplier or custom size you use, the node automatically calculates the nearest value divisible by 8. This ensures your VAE and Sampler never encounter dimension-mismatch errors.

### 4. Dynamic Multipliers & Custom Sizes
* **Multiplier:** Want to generate at 1.5x or 2x resolution for high-res fixing? Just move the slider.
* **Custom Mode:** Need a specific size? Switch to "Custom" to use the manual width/height sliders while still benefiting from the auto-rounding logic.
* **Random Mode:** Let the node roll the dice on a random aspect ratio for every generation to find new compositions.
* 

# 📺 Shaker Live Preview Mirror

The **Shaker Live Preview Mirror** is a specialized utility node designed to enhance the visibility of your generation process. In complex or sprawling ComfyUI workflows, the sampler—and its tiny native preview—is often buried or far away from your control center. This node acts as a "remote monitor" that you can place anywhere in your graph.

## 🚀 Why use this?

Standard ComfyUI previews are tethered to the sampler node itself. If you are using the **Shaker Main Console** and other control nodes in one area of your workspace, you usually have to scroll back and forth to see the progress of your image. 

The **Live Preview Mirror** allows you to stay focused on your prompt settings while maintaining a clear view of the sampling process in real-time.

---

## ✨ Key Features

### 1. Zero-Impact Performance
The node has no functional outputs and does not process tensors or latents. It acts as a visual bridge, meaning it adds **zero overhead** to your generation speed or VRAM usage.

### 2. Strategic Placement
Place the Mirror wherever you want - Even if your KSampler is ten screens away, you'll see every step of the denoising process as it happens.

## 🛠 How to Use

1. **Add the Node:** Find it under `ShakerNodes -> Utility -> Live Preview Mirror 📺`.
2. **Position It:** Place it wherever you spend the most time during generation (usually near your prompt nodes).
3. **Queue Prompt:** As soon as a sampler starts working anywhere in your workflow, the Mirror will automatically pick up the signal and display the live progress.

---

# 📺 Shaker Big Display

The **Shaker Big Display** is a high-visibility monitoring node designed to bring clarity to complex workflows. While standard ComfyUI text boxes are small and often difficult to read from a distance, the Big Display renders text directly onto the node’s foreground using customizable, high-contrast fonts.

## 🚀 Why use this?

In a "Shaker" workflow, your final prompt is often a mix of many different category selections and random rolls. The **Big Display** acts as a "Billboard" for your prompt, allowing you to see exactly what is being generated without having to zoom in or squint at tiny widget text.

---

## ✨ Key Features

### 1. Direct Canvas Rendering
Unlike standard nodes that use HTML text areas, this node draws text directly to the ComfyUI canvas. This ensures the text stays sharp and remains legible even when you are zoomed out to view your entire graph.

### 2. Automatic Text Cleaning
The node is specifically optimized for the ShakerNodes suite. If it receives a "Readable List" (e.g., `Artist: Annie Liebovitz`), it automatically strips away the category prefix and displays only the active value (`Annie Liebovitz`) for a cleaner look.

### 3. Customizable Aesthetics
You can customize the look of the display via the **Right-Click Properties** menu:
* **font_size:** Scale the text up for "Presentation Mode" or down for complex lists.
* **text_color:** Match the display to your workflow's theme (defaults to a high-visibility neon green).

### 4. No-Input "Ready" State
The node provides immediate visual feedback. When a workflow is idle or reset, the display shows a "Ready" status, letting you know the system is waiting for the next generation.

---

## 🛠 Inputs & Controls

| Input | Description |
| :--- | :--- |
| **input_data** | Accepts any input (String, Int, Float, or a Shaker List). |
| **Properties** | Access `font_size` and `text_color` by right-clicking the node and selecting "Properties". |

---

## 🚀 Common Use Cases

* **Prompt Monitoring:** Connect the `readable_list` from the **Main Console** to see your current "Recipe" in large text.
* **Seed Tracking:** Display the current seed or checkpoint name prominently.
* **Instruction Labels:** Use it as a large, dynamic label to explain different sections of a shared workflow.

# 📥 Shaker I/O: Advanced Loaders

The Shaker I/O suite provides high-performance loading utilities designed to handle large-scale batch processing and video workflows. These nodes solve the common ComfyUI bottleneck of manually selecting files by enabling automated folder monitoring and intelligent sequence handling.

---

## 🎥 Video Single Loader
Designed for precision work on individual video files. It provides a streamlined way to import video into your workflow with full support for ComfyUI's internal pathing.
* **Smart Detection:** Automatically filters the input directory for supported formats (`.mp4`, `.mov`, `.avi`, `.webm`, `.mkv`).
* **Frame-Accurate Metadata:** Outputs the full image batch alongside the original filename, the detected FPS, and the total frame count.
* **Native Integration:** Supports drag-and-drop file uploads directly onto the node.

## 📂 Folder Loader (Image Batching)
The ultimate tool for bulk processing. Instead of loading one image at a time, this node points to a directory and handles the iteration for you.
* **Recursive Search:** Optional toggle to scan subfolders, allowing you to organize your dataset into nested directories.
* **One-by-One Execution:** Uses `OUTPUT_IS_LIST` logic to trigger the workflow once for every image in the folder—perfect for automated upscaling or batch re-styling.
* **Automatic Orientation:** Uses EXIF transpose logic to ensure images are correctly rotated before they hit your sampler.

## 🎞️ Video Folder Loader
Combines batch processing with video handling. This node is built for high-volume video-to-video (Vid2Vid) workflows where you need to process multiple video files in a single queue.
* **Sequence Automation:** Points to a folder containing multiple video files and processes each one sequentially.
* **Independent FPS Handling:** Dynamically reads and outputs the FPS for each individual video in the batch, ensuring your final exports maintain their intended timing.
* **Full Batch Output:** Like the single loader, it converts each video into a standardized image tensor [Frames, H, W, C] ready for immediate use in any sampler or AnimateDiff pipeline.

---

## 🛠 Feature Comparison

| Feature | Video Single | Folder Loader | Video Folder |
| :--- | :--- | :--- | :--- |
| **Input Type** | File Selection | String Path | String Path |
| **Data Format** | Video Frames | Image List | Video Frame List |
| **Recursive Support** | No | Yes | Yes |
| **Primary Use** | Individual Clips | Bulk Image Processing | Batch Vid2Vid |

# 🔗 Shaker Concatenate Any

A dynamic, intelligent string concatenation node for **ComfyUI**. Part of the **ShakerNodes Suite**, this node is designed to merge multiple text inputs while automatically handling empty values, whitespace, and formatting.

---

## 🚀 Features

* **Dynamic Input Scaling**: Automatically expands from 4 up to 20 input slots as you connect them in the UI.
* **Smart Filtering**: Automatically ignores `None`, empty strings, or whitespace-only inputs to prevent "phantom" delimiters in your final text.
* **Custom Delimiters**: Define any string (e.g., `, `, ` - `, ` | `) to separate your inputs.
* **Linebreak Support**: Toggle a "Linebreak" mode to instantly switch from your custom delimiter to double newlines (`\n\n`)—ideal for combining prompts or notes.
* **Clean UI**: Includes a JavaScript extension to hide unused slots, keeping your workflow tidy and focused.

---

# 🛠 Shaker Pipe System

The **Shaker Pipe System** is a workflow organization utility for ComfyUI. It solves the "Spaghetti Problem" by allowing you to bundle multiple wires into a single connection, keeping your graph clean and manageable without sacrificing flexibility.

## 🚀 Why use this?

As workflows grow, you often find yourself dragging 10+ wires (Model, VAE, Positive, Negative, Latent, etc.) across the screen. If you move a group of nodes, you have to reorganize every single wire. 

The **Shaker Pipe** allows you to "pack" all those outputs into one single "pipe" wire, transport it across your graph, and "unpack" exactly what you need on the other side.

---

## ✨ Key Features

### 1. Flexible Packing
The **Pipe Pack** node accepts any data type (images, latents, conditioning, models, or strings). It doesn't care what you feed it—it just bundles it securely for transport.

### 2. High-Capacity Unpacking
The **Pipe Unpack** node provides up to 20 output slots. It remembers the order in which you packed your data, allowing you to pull out specific elements exactly when you need them.

### 3. Daisy-Chaining
The Unpack node features a **pipe_pass** output. This allows you to tap into the pipe to grab a few variables, then pass the entire bundle forward to the next section of your workflow.

---

## 🛠 How to Use

### Packing
1. Add a **Shaker Pipe Pack** node.
2. Plug your various outputs (e.g., your Model, Positive Prompt, and Latent) into the `in` slots.
3. Connect the `SHAKER_PIPE` output to your long-distance destination.

### Unpacking
1. Add a **Shaker Pipe Unpack** node at the end of your pipe.
2. The outputs will correspond to the order you plugged them into the Pack node.
3. Use the `pipe_pass` output if you need to send the bundle further down the line to another Unpack node.

---


# 🎚️ Shaker Sliders

The **Shaker Sliders** are a set of streamlined input nodes designed to replace standard number boxes with intuitive, draggable sliders. They are built for real-time adjustments and clear visual feedback within your ComfyUI workspace.

## 🚀 Why use this?

Standard ComfyUI primitive nodes require manual typing or clicking tiny arrows to change values. Shaker Sliders provide a dedicated UI handle for "feeling out" the right settings—whether you are adjusting CFG, Denoise strength, or specific prompt weights.

---

## ✨ Key Features

### 1. Visual Granularity
Each slider is configured with specific steps (e.g., 0.01 for floats) to ensure you have the precision needed for high-end generation without the friction of typing numbers.

### 2. Native Multi-Type Support
The suite includes three distinct slider types to cover any node input in your graph:
* **Integer Slider:** Optimized for whole numbers like Step Count, Batch Size, or Seed offsets.
* **Float Slider:** Perfect for percentage-based values like Denoise, CFG, or LoRA strengths (0.0 to 1.0 range).
* **String Slider:** A specialized utility that outputs a number as a string. This is useful for workflows that require numeric values to be injected directly into prompt strings or text-manipulation nodes.

### 3. Organized Categorization
All slider nodes are conveniently grouped under `ShakerNodes -> Sliders` in the search menu, keeping your utility nodes separated from your generation nodes.

---

## 🛠 Available Nodes

| Node Name | Data Type | Default Range |
| :--- | :--- | :--- |
| **Shaker Integer Slider** | `INT` | 0 to 100 (Step: 1) |
| **Shaker Float Slider** | `FLOAT` | 0.0 to 1.0 (Step: 0.01) |
| **Shaker String Slider** | `STRING` | 0.0 to 10.0 (Step: 0.1) |

---

## 🚀 Common Use Cases

* **Denoise Control:** Connect a Float Slider to your KSampler to quickly sweep through different levels of "creativity" on an upscale.
* **Prompt Weighting:** Use a String Slider to dynamically control the strength of a specific keyword within a formatted prompt.
* **Batch Management:** Use an Integer Slider to quickly set the number of images to generate without opening a primitive menu.



# 📦 Shaker Batch

The **Shaker Batch** node is a high-performance utility designed to consolidate multiple individual inputs into a single batched output. It is an essential tool for creating image grids, processing multiple variations through a single VAE/Upscaler, or preparing disparate images for video interpolation.

## 🚀 Why use this?

Standard ComfyUI batching often requires nodes that only accept two inputs at a time, leading to "staircase" layouts where you chain multiple nodes together to combine four or five images. 

**Shaker Batch** simplifies this by providing multiple optional inputs on a single node. It intelligently handles empty slots and different data types, ensuring your workflow stays clean and your batches remain consistent.

---

## ✨ Key Features

### 1. Multi-Slot Consolidation
The node features up to 10 optional input slots. You can plug in as many or as few as you need; the node automatically ignores any empty inputs and packs the active ones into a continuous sequence.

### 2. Intelligent Tensor Handling
Specifically optimized for image and latent tensors. It automatically detects the batch dimension and concatenates your inputs along that axis. This allows you to combine:
* **Single Images:** (e.g., combining 4 separate 1024x1024 images into one 4-frame batch).
* **Existing Batches:** (e.g., combining two 4-frame batches into one 8-frame batch).

### 3. Numerical Integrity
The node processes inputs in strict numerical order (`input_1` through `input_10`). This is critical for animation or sequential workflows where the order of frames must be preserved perfectly.

### 4. Zero-Overhead "Pass-Through"
If you only provide a single input, the node acts as a zero-latency pass-through. It only triggers the concatenation logic when multiple valid inputs are detected, saving computation time.

---

## 🛠 Inputs & Outputs

| Connection | Function |
| :--- | :--- |
| **input_1 ... 10** | **Optional.** Accepts Images, Latents, or any standard ComfyUI data type. |
| **batched_output** | A single unified batch containing all valid inputs in sequential order. |

---

## 🚀 Common Use Cases

* **Comparison Grids:** Batch 4 different generations of the same prompt to view them side-by-side in a preview bridge.
* **Vid2Vid Preparation:** Take individual frames processed in different sections of a graph and re-assemble them into a video-ready batch.
* **Resource Optimization:** Send a batch of 8 images through a single "Image Upscale" node simultaneously rather than using 8 separate upscalers.


# 🎞️ Shaker Gradual Color Match

The **Shaker Gradual Color Match** is a specialized image processing node designed primarily for video workflows and batch processing. It allows you to unify the color profile of an entire image sequence based on a single reference frame, with the unique ability to transition the strength of the effect over time.

## 🚀 Why use this?

In AI-generated video or long batch runs, color drift is a common issue—the lighting or palette often shifts as the sequence progresses. While standard color matching applies a static fix, the **Gradual Color Match** allows for a controlled "hand-off." You can start with 0% matching and slowly ramp up to 100% (or vice versa), making it an essential tool for smooth transitions between different scenes or styles.

---

## ✨ Key Features

### 1. Strength Interpolation
Unlike static matchers, this node calculates a unique strength for every single frame in your batch.
* **Linear:** A straight-line transition from your start strength to your end strength.
* **Smoothstep:** A curved, organic transition that starts slow, speeds up in the middle, and tapers off at the end—perfect for cinematic easing.

### 2. Dual Match Modes
* **RGB Mode:** Individually matches the Red, Green, and Blue histograms. This is the best choice for corrected color shifts and "grading" one image to look like another.
* **Luminance Mode:** Matches only the brightness values while preserving the original color data. This is ideal for fixing "flicker" or exposure inconsistencies without changing the actual colors of the shot.

### 3. Reference-Based Consistency
By picking one "Gold Standard" image (the `reference_image`), you can ensure that an entire batch of 100+ frames adheres to that specific look, drastically reducing visual popping in video animations.

---

## 🛠 Inputs & Controls

| Input | Description |
| :--- | :--- |
| **batch_images** | The sequence of images (video frames) you want to modify. |
| **reference_image** | The image whose color/lighting profile you want to copy. |
| **start_strength** | The match intensity for the first frame (0.0 to 1.0). |
| **end_strength** | The match intensity for the final frame (0.0 to 1.0). |
| **interpolation** | Choose between `linear` or `smoothstep` for the transition curve. |
| **match_mode** | `RGB` for full color matching, or `Luminance` for brightness-only matching. |

---

## 🚀 Common Use Cases

* **Deflickering:** Set `match_mode` to `Luminance` and use a clear frame as a reference to stabilize shaky exposure in AI video.
* **Scene Transitions:** Use `start_strength: 0.0` and `end_strength: 1.0` to gradually pull a sequence into the color palette of a new environment.
* **Batch Uniformity:** Keep both strengths at `1.0` to force every image in a large batch to match a specific photographic style.



# ⏱️ Shaker Timer

The **Shaker Timer** is a specialized diagnostic utility for ComfyUI that provides real-time visual feedback on generation duration. It is designed to help users benchmark their workflows and track performance across different models or hardware configurations.

## 🚀 Why use this?

Standard ComfyUI logs generation time in the console or terminal after the fact, which is often difficult to see while working. The **Shaker Timer** puts a high-visibility stopwatch directly on your canvas that activates the moment you hit "Queue Prompt" and stops precisely when the final image is saved.

---

## ✨ Key Features

### 1. Live Canvas Rendering
Unlike nodes that wait for a process to finish before updating, the Shaker Timer uses a JavaScript-driven animation loop to display a ticking clock directly on the node's face in real-time.

### 2. Global Execution Monitoring
The timer is connected to the ComfyUI API events. It automatically:
* **Starts** when `execution_start` is triggered.
* **Stops** when the graph execution finishes or encounters an error.
* **Persists** the final time of the last run so you can compare it after the process is done.

### 3. Customizable Visibility
To ensure the timer remains legible regardless of your workflow's complexity or zoom level, you can customize the display via the **Right-Click context menu**:
* **Font Size:** Scale from 40px up to 150px (Billboard size).
* **Font Color:** Choose from preset high-contrast colors (Neon Green, Cyber Blue, Gold, etc.).

### 4. Zero Performance Impact
The timer logic is handled by the browser's `requestAnimationFrame` and local timing. It does not put any load on your GPU or CPU processing during the sampling phase.

---

## 🛠 Inputs & Controls

| Input | Description |
| :--- | :--- |
| **Context Menu** | Right-click the node to access `Timer: Font Size` and `Timer: Font Color` sub-menus. |
| **Stopwatch Format** | Displays time in a standardized `HH:MM:SS` format. |

---

## 🚀 Common Use Cases

* **Hardware Benchmarking:** Compare how much faster your SDXL generations are on different TensorRT engines or GPU settings.
* **Workflow Optimization:** Identify which specific node groups are slowing down your process by watching the timer tick during active sampling.
* **Presentation & Recording:** Provide clear visual proof of generation speeds for tutorials or screen recordings.



# ONCE YOU'VE GOT THE HANG OF HOW THE SUITE WORKS - build whatever kind of UI you want, drag your category nodes where they make sense to you, pin presets to the top or bottom of the category node from the Preset Manager. 

HERE'S AN EXAMPLE OF A COMPACT WORKFLOW:


<img width="832" height="1248" alt="ShakerNodes-Compact" src="https://github.com/user-attachments/assets/fe31627a-98eb-452e-82b8-73df498b821d" />



<img width="1000" height="808" alt="5-Compact" src="https://github.com/user-attachments/assets/652aabe6-40fd-4903-9550-eca2f6a3a8c9" />
