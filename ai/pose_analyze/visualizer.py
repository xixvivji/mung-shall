import cv2
import numpy as np

class DogVisualizer:
    # --- [설정] 색상 팔레트 (BGR 포맷) ---
    COLOR_SKELETON = (240, 240, 240) # 뼈대 (밝은 회색)
    COLOR_JOINT = (0, 255, 255)      # 관절 (노랑)
    COLOR_TEXT = (255, 255, 255)     # 텍스트 (흰색)
    
    # 상태별 고유 색상
    COLOR_STATE = {
        "stand": (0, 255, 255),    # 노랑
        "sit": (0, 255, 0),        # 초록
        "down": (255, 100, 0),     # 파랑
        "playbow": (255, 0, 127),  # 보라/핑크
        "paw": (255, 0, 255),      # 마젠타
        "beg": (203, 192, 255),    # 연분홍
        "lying": (0, 165, 255),    # 주황
        "sniff": (128, 0, 128),    # 짙은 보라
        "undetected": (100, 100, 100) # 회색
    }

    # 스켈레톤 연결 정보 (COCO 포맷 기준)
    CONNECTIONS = [
        (0, 1), (1, 2),                # 오른 앞다리
        (3, 4), (4, 5), (5, 12),       # 오른 뒷다리~꼬리
        (6, 7), (7, 8),                # 왼 앞다리
        (9, 10), (10, 11), (11, 12),   # 왼 뒷다리~꼬리
        (14, 15), (16, 17), (12, 13),  # 얼굴, 꼬리 끝
        (14, 18), (15, 19)             # 귀
    ]

    def __init__(self, keypoints_data):
        self.kpts = keypoints_data

    def draw(self, frame, analysis_result):
        """
        메인 그리기 함수
        """
        img = frame.copy()
        
        # 1. 뼈대 그리기
        self._draw_skeleton(img)
        
        # 2. 정보창(HUD) 그리기
        self._draw_hud(img, analysis_result)
        
        return img

    def _draw_skeleton(self, img):
        """
        관절과 뼈대
        분석 로직이 복원한 낮은 신뢰도(0.2 이상)의 관절도
        """
        # (1) 뼈대 (Line) 먼저 그리기 (관절 뒤로 가도록)
        for idx1, idx2 in self.CONNECTIONS:
            # 인덱스 범위 체크
            if idx1 >= len(self.kpts) or idx2 >= len(self.kpts): continue

            pt1 = self.kpts[idx1]
            pt2 = self.kpts[idx2]
            
            # [수정] 복원된 관절도 시각화하기 위해 임계값을 0.2로 낮춤
            if pt1[2] > 0.2 and pt2[2] > 0.2:
                start = (int(pt1[0]), int(pt1[1]))
                end = (int(pt2[0]), int(pt2[1]))
                cv2.line(img, start, end, self.COLOR_SKELETON, 2)

        # (2) 관절 (Circle) 그리기
        for i, (x, y, conf) in enumerate(self.kpts):
            if conf > 0.2:
                cv2.circle(img, (int(x), int(y)), 4, self.COLOR_JOINT, -1)

    def _draw_hud(self, img, analysis):
        """
        좌측 상단에 상태 정보(HUD) 표시
        """
        action = analysis.get("action", "undetected")
        debug = analysis.get("debug", {})
        
        # 상태에 따른 색상 결정
        color = self.COLOR_STATE.get(action, (200, 200, 200))
        
        # --- HUD 배경 박스 ---
        # 텍스트 길이에 따라 박스 크기 조절하는 게 좋지만, 고정값 사용
        cv2.rectangle(img, (10, 10), (320, 130), (0, 0, 0), -1) 
        # 테두리 추가 (상태 색상)
        cv2.rectangle(img, (10, 10), (320, 130), color, 2)

        # --- 메인 텍스트 (ACTION) ---
        display_text = f"{action.upper()}"
        cv2.putText(img, display_text, (30, 60), 
                    cv2.FONT_HERSHEY_SIMPLEX, 1.2, color, 3)

        # --- 서브 텍스트 (DEBUG INFO) ---
        scale_val = debug.get('scale', 0)
        
        if action == "undetected":
            sub_text = "Tracking Lost / Low Conf"
            sub_color = (100, 100, 255) # 붉은색 경고
        else:
            sub_text = f"Scale: {scale_val} | Stable"
            sub_color = self.COLOR_TEXT

        cv2.putText(img, sub_text, (30, 100), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, sub_color, 1)