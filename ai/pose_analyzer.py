import math

class DogPoseAnalyzer:
    KEYPOINTS_MAP = {
        "R_F_PAW": 0,   "R_F_WRIST": 1,   "R_F_ELBOW": 2,  
        "R_B_PAW": 3,   "R_B_HOCK": 4,    "R_B_KNEE": 5,   
        "L_F_PAW": 6,   "L_F_WRIST": 7,   "L_F_ELBOW": 8,  
        "L_B_PAW": 9,   "L_B_HOCK": 10,   "L_B_KNEE": 11,  
        "TAIL_BASE": 12, "TAIL_TIP": 13,
        "L_EAR_BASE": 14, "R_EAR_BASE": 15, "NOSE": 16,       
        "CHIN": 17, "L_EAR_TIP": 18,  "R_EAR_TIP": 19   
    }

    def __init__(self, keypoints_data):
        self.kpts = keypoints_data

    def _get_y(self, name):
        """특정 관절의 Y 좌표 반환"""
        idx = self.KEYPOINTS_MAP[name]
        return self.kpts[idx][1]

    def _dist(self, name1, name2):
        """두 관절 사이의 유클리드 거리 반환"""
        idx1, idx2 = self.KEYPOINTS_MAP[name1], self.KEYPOINTS_MAP[name2]
        x1, y1 = self.kpts[idx1][:2]
        x2, y2 = self.kpts[idx2][:2]
        return math.sqrt((x1-x2)**2 + (y1-y2)**2)

    def _is_valid(self, name_list):
        """리스트 내의 모든 관절이 신뢰도 0.5 이상인지 확인"""
        if isinstance(name_list, str): name_list = [name_list]
        for name in name_list:
            idx = self.KEYPOINTS_MAP[name]
            if self.kpts[idx][2] <= 0.5:
                return False
        return True

    def analyze(self):
        """
        사용자 피드백 반영: Hock-Based Sit/Down Logic
        """
        action = "stand"
        
        # ---------------------------------------------------------
        # [1] 스케일(Scale) 계산
        # ---------------------------------------------------------
        scale_candidates = []
        
        if self._is_valid(["R_F_ELBOW", "R_F_PAW"]):
             scale_candidates.append(self._dist("R_F_ELBOW", "R_F_PAW") * 2.5) 
        
        if self._is_valid(["L_F_ELBOW", "L_F_PAW"]):
             scale_candidates.append(self._dist("L_F_ELBOW", "L_F_PAW") * 2.5)

        scale = max(scale_candidates) if scale_candidates else 0
        if scale == 0: 
            if self._is_valid(["L_EAR_BASE", "NOSE"]):
                scale = self._dist("L_EAR_BASE", "NOSE") * 3.0
            else:
                scale = 100.0 

        # ---------------------------------------------------------
        # [2] 높이 및 거리 측정
        # ---------------------------------------------------------
        
        # A. 팔꿈치 높이 (Front Ground 기준)
        f_paws = []
        if self._is_valid("R_F_PAW"): f_paws.append(self._get_y("R_F_PAW"))
        if self._is_valid("L_F_PAW"): f_paws.append(self._get_y("L_F_PAW"))
        front_ground_y = max(f_paws) if f_paws else 0

        elbow_y_list = []
        if self._is_valid("R_F_ELBOW"): elbow_y_list.append(self._get_y("R_F_ELBOW"))
        if self._is_valid("L_F_ELBOW"): elbow_y_list.append(self._get_y("L_F_ELBOW"))
        avg_elbow_y = sum(elbow_y_list) / len(elbow_y_list) if elbow_y_list else 0
        
        elbow_dist = abs(front_ground_y - avg_elbow_y) if avg_elbow_y > 0 and front_ground_y > 0 else scale

        # B. 뒷꿈치 접힘 (Hock Grounded Check)
        hock_diffs = []
        if self._is_valid(["R_B_PAW", "R_B_HOCK"]):
            diff = abs(self._get_y("R_B_PAW") - self._get_y("R_B_HOCK"))
            hock_diffs.append(diff)
        if self._is_valid(["L_B_PAW", "L_B_HOCK"]):
            diff = abs(self._get_y("L_B_PAW") - self._get_y("L_B_HOCK"))
            hock_diffs.append(diff)
        
        min_hock_dist = min(hock_diffs) if hock_diffs else scale

        # ---------------------------------------------------------
        # [3] 자세 판별 로직
        # ---------------------------------------------------------
        
        # 서 있을 때(약 14%)와 앉을 때(약 8%)를 구분하기 위함
        THRESHOLD_HOCK = scale * 0.12 
        THRESHOLD_ELBOW = scale * 0.25

        # 뒷꿈치가 바닥에 붙었는가? (SIT/DOWN 공통 조건)
        IS_HOCK_GROUNDED = min_hock_dist < THRESHOLD_HOCK
        
        # 팔꿈치도 바닥에 붙었는가? (DOWN 조건)
        IS_ELBOW_LOW = elbow_dist < THRESHOLD_ELBOW

        # 1. 1차 분류: 뒷다리가 접혔는가?
        if IS_HOCK_GROUNDED:  # <--- [수정됨] IS_HIP_LOW 대신 IS_HOCK_GROUNDED 사용
            # 2. 2차 분류: 앞다리도 접혔는가?
            if IS_ELBOW_LOW:
                action = "down"
            else:
                action = "sit"
        else:
            action = "stand"

        # 2. PAW 판별 (Stand나 Sit 상태일 때만)
        if action in ["sit", "stand"]:
            if self._is_valid(["R_F_PAW", "L_F_PAW"]):
                paw_diff = abs(self._get_y("R_F_PAW") - self._get_y("L_F_PAW"))
                if paw_diff > (scale * 0.15):
                    action = "paw"

        # [필수] numpy float 에러 방지
        return {
            "action": action,
            "debug": {
                "scale": float(round(scale, 1)),
                "hock_dist": float(round(min_hock_dist, 1)),
                "elbow_dist": float(round(elbow_dist, 1)),
                "threshold_hock": float(round(scale * 0.2, 1)),
                "threshold_elbow": float(round(scale * 0.25, 1))
            }
        }