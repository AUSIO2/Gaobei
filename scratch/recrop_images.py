import os
from PIL import Image

# Original source paths in the brain directory
orig_space = "/Users/xiong/.gemini/antigravity-ide/brain/3a3fae29-3e0a-4bbe-acbe-ae9c97d0b391/bg_space_clean_1780198489726.png"
orig_city = "/Users/xiong/.gemini/antigravity-ide/brain/3a3fae29-3e0a-4bbe-acbe-ae9c97d0b391/bg_city_clean_1780198514423.png"
orig_network = "/Users/xiong/.gemini/antigravity-ide/brain/3a3fae29-3e0a-4bbe-acbe-ae9c97d0b391/bg_network_clean_1780198538924.png"

dest_dir = "/Users/xiong/Gaobei/asset/front-slide"
os.makedirs(dest_dir, exist_ok=True)

def recrop(src_path, dest_filename, position):
    if not os.path.exists(src_path):
        print(f"Error: source {src_path} not found.")
        return
        
    img = Image.open(src_path)
    width, height = img.size
    
    # Crop to 1024x448 (16:7 aspect ratio)
    target_height = 448
    
    if position == "center":
        top = (height - target_height) // 2
        bottom = top + target_height
    elif position == "bottom":
        bottom = height
        top = height - target_height
    else:
        top = (height - target_height) // 2
        bottom = top + target_height
        
    left = 0
    right = width
    
    cropped_img = img.crop((left, top, right, bottom))
    cropped_img.save(os.path.join(dest_dir, dest_filename))
    print(f"Successfully recropped {dest_filename} (kept {position}, size: {cropped_img.size})")

if __name__ == "__main__":
    recrop(orig_space, "bg_1_space.png", "center")
    recrop(orig_city, "bg_2_city.png", "bottom")
    recrop(orig_network, "bg_3_network.png", "bottom")
