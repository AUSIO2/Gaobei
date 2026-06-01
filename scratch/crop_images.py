import os
from PIL import Image

dir_path = "/Users/xiong/Gaobei/asset/front-slide"

def crop_image(filename, position):
    filepath = os.path.join(dir_path, filename)
    if not os.path.exists(filepath):
        print(f"Error: {filename} does not exist.")
        return
    
    img = Image.open(filepath)
    width, height = img.size
    
    # Target aspect ratio: 32:9 (approx 3.556)
    target_height = int(width / (32 / 9))
    
    if position == "center":
        # Keep the middle part vertically
        top = (height - target_height) // 2
        bottom = top + target_height
    elif position == "bottom":
        # Keep the bottom part vertically
        bottom = height
        top = height - target_height
    else:
        # Default to center
        top = (height - target_height) // 2
        bottom = top + target_height

    left = 0
    right = width
    
    cropped_img = img.crop((left, top, right, bottom))
    cropped_img.save(filepath)
    print(f"Successfully cropped {filename} (kept {position}, new size: {cropped_img.size})")

if __name__ == "__main__":
    crop_image("bg_1_space.png", "center")
    crop_image("bg_2_city.png", "bottom")
    crop_image("bg_3_network.png", "bottom")
