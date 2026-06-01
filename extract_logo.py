import cv2
import numpy as np
import json
import sys

def process_logo(image_path):
    img = cv2.imread(image_path)
    if img is None:
        return json.dumps({"error": "Image not found"})
    
    img = cv2.resize(img, None, fx=4, fy=4, interpolation=cv2.INTER_CUBIC)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.GaussianBlur(gray, (5, 5), 0) # Blur to smooth jagged edges
    
    # 因为Logo是黑色的（深色），背景是白色的，我们反转阈值提取深色区域
    _, thresh = cv2.threshold(gray, 128, 255, cv2.THRESH_BINARY_INV)
    
    contours, hierarchy = cv2.findContours(thresh, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    
    min_area = 200 # adjusted for 4x larger image
    valid_contours = []
    
    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area > min_area:
            epsilon = 0.0015 * cv2.arcLength(cnt, True)
            approx = cv2.approxPolyDP(cnt, epsilon, True)
            valid_contours.append(approx)
            
    if not valid_contours:
        return json.dumps({"error": "No contours found"})
        
    bboxes = [cv2.boundingRect(cnt) for cnt in valid_contours]
    
    # 假设图片是横向的（Logo在左，文字在右），我们通过 X 轴聚类只保留左侧的 Logo 块
    x_centers = [x + w/2 for (x, y, w, h) in bboxes]
    min_x_center = min(x_centers)
    max_x_center = max(x_centers)
    
    # Logo 应该集中在最左侧（比如左侧 30% 内，具体视截图而定）
    logo_contours = []
    threshold_x = min_x_center + (max_x_center - min_x_center) * 0.35
    
    for cnt, bbox in zip(valid_contours, bboxes):
        x, y, w, h = bbox
        if x + w/2 < threshold_x:
            logo_contours.append(cnt)
            
    if not logo_contours:
        logo_contours = valid_contours

    # 这里进行排序，让动画绘制有一个从上到下、或从左到右的顺序
    logo_contours = sorted(logo_contours, key=lambda c: cv2.boundingRect(c)[1])

    all_points = np.vstack(logo_contours).squeeze()
    min_x, min_y = np.min(all_points, axis=0)
    max_x, max_y = np.max(all_points, axis=0)
    
    width = max_x - min_x
    height = max_y - min_y
    scale = 100.0 / max(width, height)
    
    # 稍微留一点内边距 (padding = 5)
    padding = 5
    scale = 90.0 / max(width, height)
    
    svg_paths = []
    for cnt in logo_contours:
        pts = cnt.squeeze()
        if pts.ndim == 1:
            pts = [pts]
            
        path_str = []
        for i, pt in enumerate(pts):
            nx = (pt[0] - min_x) * scale + padding
            ny = (pt[1] - min_y) * scale + padding
            cmd = "M" if i == 0 else "L"
            path_str.append(f"{cmd} {nx:.1f} {ny:.1f}")
        path_str.append("Z")
        svg_paths.append(" ".join(path_str))
        
    return json.dumps({
        "success": True, 
        "paths": svg_paths, 
        "count": len(svg_paths),
        "viewBox": "0 0 100 100"
    })

if __name__ == "__main__":
    result = process_logo("/Users/xiong/Gaobei/asset/截屏2026-05-13 23.46.21.png")
    print(result)
