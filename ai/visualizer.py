import cv2
import numpy as np

class DogVisualizer:
    COLOR_SKELETON = (255, 255, 255)
    COLOR_JOINT = (0, 255, 255)
    COLOR_TEXT = (255, 255, 255)
    
    # 상태별 색상 (BGR)
    COLOR_STATE = {
        "stand": (0, 255, 255),   # 노랑
        "sit": (0, 255, 0),       # 초록
        "down": (255, 0, 0),      # 파랑
        "paw": (255, 0, 255),     # 보라
        "lying": (0, 165, 255),   # 주황 (새로 추가)
        "sniff": (128, 0, 128),   # 짙은 보라/갈색 (새로 추가)
        "undetected": (128, 128, 128) # 회색
    }

    CONNECTIONS = [
        (0, 1), (1, 2), 
        (3, 4), (4, 5), (5, 12),
        (6, 7), (7, 8), 
        (9, 10), (10, 11), (11, 12),
        (14, 15), (16, 17), (12, 13), (14, 18), (15, 19)
    ]

    def __init__(self, keypoints_data):
        self.kpts = keypoints_data

    def draw(self, frame, analysis_result):
        img = frame.copy()
        self._draw_skeleton(img)
        self._draw_hud(img, analysis_result)
        return img

    def _draw_skeleton(self, img):
        for i, (x, y, conf) in enumerate(self.kpts):
            if conf > 0.5:
                cv2.circle(img, (int(x), int(y)), 5, self.COLOR_JOINT, -1)
        for idx1, idx2 in self.CONNECTIONS:
            pt1 = self.kpts[idx1]
            pt2 = self.kpts[idx2]
            if pt1[2] > 0.5 and pt2[2] > 0.5:
                start = (int(pt1[0]), int(pt1[1]))
                end = (int(pt2[0]), int(pt2[1]))
                cv2.line(img, start, end, self.COLOR_SKELETON, 2)

    def _draw_hud(self, img, analysis):
        action = analysis.get("action", "unknown")
        debug = analysis.get("debug", {})
        
        color = self.COLOR_STATE.get(action, (255, 255, 255))
        
        # 배경 박스
        cv2.rectangle(img, (10, 10), (350, 200), (0, 0, 0), -1)

        # 메인 동작
        cv2.putText(img, f"ACTION: {action.upper()}", (30, 50), 
                    cv2.FONT_HERSHEY_SIMPLEX, 1.0, color, 3)

        # 디버그 정보
        y_pos = 90
        gap = 30
        font_scale = 0.6
        
        if action == "undetected":
            cv2.putText(img, "WARNING: Low Confidence", (30, y_pos), 
                        cv2.FONT_HERSHEY_SIMPLEX, font_scale, (0, 0, 255), 1)
        elif action == "lying":
            cv2.putText(img, "State: Lying / Rolling", (30, y_pos), 
                        cv2.FONT_HERSHEY_SIMPLEX, font_scale, color, 1)
        elif action == "sniff":
             cv2.putText(img, "State: Sniffing (Head Low)", (30, y_pos), 
                        cv2.FONT_HERSHEY_SIMPLEX, font_scale, color, 1)
        else:
            # 일반 수치 표시
            cv2.putText(img, f"Scale: {debug.get('scale', 0)}", (30, y_pos), 
                        cv2.FONT_HERSHEY_SIMPLEX, font_scale, self.COLOR_TEXT, 1)
            
            y_pos += gap
            cv2.putText(img, f"Hock: {debug.get('hock_dist', 0)}", (30, y_pos), 
                        cv2.FONT_HERSHEY_SIMPLEX, font_scale, self.COLOR_TEXT, 1)

            y_pos += gap
            cv2.putText(img, f"Elbow: {debug.get('elbow_dist', 0)}", (30, y_pos), 
                        cv2.FONT_HERSHEY_SIMPLEX, font_scale, self.COLOR_TEXT, 1)