import cv2
import numpy as np

class DogVisualizer:
    # 시각화 색상 정의 (BGR 형식)
    COLOR_SKELETON = (255, 255, 255) # 흰색
    COLOR_JOINT = (0, 255, 255)      # 노란색
    COLOR_TEXT = (255, 255, 255)     # 흰색
    COLOR_BOX_BG = (0, 0, 0)         # 검은색 배경 (반투명용)
    
    # 상태별 색상 (BGR)
    COLOR_STATE = {
        "stand": (0, 255, 255),  # 노랑
        "sit": (0, 255, 0),      # 초록
        "down": (255, 0, 0),     # 파랑
        "paw": (255, 0, 255),    # 보라
        "undetected": (128, 128, 128) # 회색(인식 실패)
    }

    # 관절 연결 정보 (뼈대 그리기용)
    # [Start Index, End Index]
    # 0~2: RF, 3~5: RB, 6~8: LF, 9~11: LB
    # 12: TailBase, 13: TailTip, 14~19: Head
    CONNECTIONS = [
        # 다리 연결
        (0, 1), (1, 2),       # 오른 앞다리
        (3, 4), (4, 5),       # 오른 뒷다리
        (6, 7), (7, 8),       # 왼쪽 앞다리
        (9, 10), (10, 11),    # 왼쪽 뒷다리
        # 몸통/머리 연결 (가상 연결 포함)
        (18, 14), (14, 15), (15, 19),# 귀
        (16, 17), # 코-턱
        (12, 13), (5, 12), (11, 12)  # 꼬리
    ]

    def __init__(self, keypoints_data):
        """
        :param keypoints_data: YOLO keypoints (N, 3) -> [x, y, conf]
        """
        self.kpts = keypoints_data

    def draw(self, frame, analysis_result):
        """
        프레임 위에 스켈레톤과 분석 정보를 그립니다.
        :param frame: 원본 이미지 (cv2 frame)
        :param analysis_result: pose_analyzer.analyze()의 리턴값 (Dictionary)
        :return: 그려진 이미지
        """
        img = frame.copy()
        
        # 1. 스켈레톤(뼈대) 그리기
        self._draw_skeleton(img)
        
        # 2. 정보창(HUD) 그리기
        self._draw_hud(img, analysis_result)

        return img

    def _draw_skeleton(self, img):
        # 1. 관절(점) 그리기
        for i, (x, y, conf) in enumerate(self.kpts):
            if conf > 0.5:
                cv2.circle(img, (int(x), int(y)), 5, self.COLOR_JOINT, -1)

        # 2. 뼈(선) 그리기
        for idx1, idx2 in self.CONNECTIONS:
            pt1 = self.kpts[idx1]
            pt2 = self.kpts[idx2]
            
            # 두 점 다 신뢰도가 높을 때만 선 연결
            if pt1[2] > 0.5 and pt2[2] > 0.5:
                start = (int(pt1[0]), int(pt1[1]))
                end = (int(pt2[0]), int(pt2[1]))
                cv2.line(img, start, end, self.COLOR_SKELETON, 2)

    def _draw_hud(self, img, analysis):
        """
        화면 좌측 상단에 현재 상태와 판단 근거 수치를 띄웁니다.
        """
        action = analysis.get("action", "unknown")
        debug = analysis.get("debug", {})
        
        # 색상 선택
        color = self.COLOR_STATE.get(action, (255, 255, 255))
        
        # 배경 박스 (텍스트 잘 보이게)
        overlay = img.copy()
        cv2.rectangle(overlay, (10, 10), (350, 200), (0, 0, 0), -1)

        # 1. 메인 동작 텍스트
        cv2.putText(img, f"ACTION: {action.upper()}", (30, 50), 
                    cv2.FONT_HERSHEY_SIMPLEX, 1.2, color, 3)

        # 2. 디버그 수치 텍스트
        y_pos = 90
        gap = 30
        font_scale = 0.6
        
        if action == "undetected":
            cv2.putText(img, "WARNING: Low Confidence", (30, y_pos), 
                        cv2.FONT_HERSHEY_SIMPLEX, font_scale, (0, 0, 255), 1)
            cv2.putText(img, "Check Camera / Angle", (30, y_pos + gap), 
                        cv2.FONT_HERSHEY_SIMPLEX, font_scale, (0, 0, 255), 1)
        else:
            # 정상적인 수치 표시
            cv2.putText(img, f"Scale: {debug.get('scale', 0)}", (30, y_pos), 
                        cv2.FONT_HERSHEY_SIMPLEX, font_scale, self.COLOR_TEXT, 1)
            
            # Hock
            hock_val = debug.get('hock_dist', 0)
            hock_th = debug.get('threshold_hock', 0)
            hock_color = (0, 255, 0) if hock_val < hock_th else (0, 0, 255)
            y_pos += gap
            cv2.putText(img, f"Hock: {hock_val} (< {hock_th})", (30, y_pos), 
                        cv2.FONT_HERSHEY_SIMPLEX, font_scale, hock_color, 2)

            # Elbow
            elbow_val = debug.get('elbow_dist', 0)
            elbow_th = debug.get('threshold_elbow', 0)
            elbow_color = (0, 255, 0) if elbow_val < elbow_th else (0, 0, 255)
            y_pos += gap
            cv2.putText(img, f"Elbow: {elbow_val} (< {elbow_th})", (30, y_pos), 
                        cv2.FONT_HERSHEY_SIMPLEX, font_scale, elbow_color, 2)