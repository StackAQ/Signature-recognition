from skimage.metrics import structural_similarity as ssim
import cv2
import numpy as np

def compare_signatures(path1, path2):
    img1 = cv2.imread(path1, cv2.IMREAD_GRAYSCALE)
    img2 = cv2.imread(path2, cv2.IMREAD_GRAYSCALE)

    orb = cv2.ORB_create()

    kp1, des1 = orb.detectAndCompute(img1, None)
    kp2, des2 = orb.detectAndCompute(img2, None)

    bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)

    if des1 is None or des2 is None:
        return 0.0

    matches = bf.match(des1, des2)

    matches = sorted(matches, key=lambda x: x.distance)

    good_matches = [m for m in matches if m.distance < 70]

    score = len(good_matches) / max(len(kp1), 1) * 100

    return round(score, 2)