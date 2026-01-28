import math
import numpy as np

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

    def __init__(self):
        """
        초기화: 이제 데이터를 __init__에서 받지 않고, 내부 저장소만 초기화합니다.
        """
        self.kpts = None
        self.keypoint_history = {} # { index: [x, y, conf] }

    def process_keypoints(self, raw_kpts):
        """
        [핵심 로직] Zero-Order Hold 적용
        새로운 키포인트가 들어오면:
        1. 신뢰도가 높으면 -> 현재 값 사용 & 역사(History) 업데이트
        2. 신뢰도가 낮으면(사라지면) -> 역사에 저장된 과거 값 불러오기
        """
        # 원본 데이터 보존을 위해 복사
        processed_kpts = raw_kpts.copy()
        
        for i, (x, y, conf) in enumerate(processed_kpts):
            if conf > 0.5:
                # [CASE 1] 잘 보임: 역사에 기록하고 현재 값 사용
                self.keypoint_history[i] = [x, y, conf]
            else:
                # [CASE 2] 안 보임(가려짐/인식실패): 역사 확인
                if i in self.keypoint_history:
                    # 과거의 좌표와 신뢰도를 그대로 가져옴 (Zero-Order Hold)
                    # 이렇게 하면 _is_valid() 통과 가능
                    processed_kpts[i] = self.keypoint_history[i]
        
        # 보정된 데이터를 멤버 변수에 저장
        self.kpts = processed_kpts

    # --- [유틸리티 함수] ---
    def _get_y(self, name):
        return self.kpts[self.KEYPOINTS_MAP[name]][1]
    
    def _get_pt(self, name):
        idx = self.KEYPOINTS_MAP[name]
        return self.kpts[idx][:2]

    def _dist(self, name1, name2):
        x1, y1 = self._get_pt(name1)
        x2, y2 = self._get_pt(name2)
        return math.sqrt((x1-x2)**2 + (y1-y2)**2)

    def _is_valid(self, name_list):
        if isinstance(name_list, str): name_list = [name_list]
        for name in name_list:
            idx = self.KEYPOINTS_MAP[name]
            # process_keypoints에서 보정된 self.kpts를 사용하므로
            # 과거에 보였던 관절은 여기서 True가 됨
            if self.kpts[idx][2] <= 0.5: return False
        return True

    def analyze(self):
        """
        분석 로직 (로직 자체는 이전과 동일하지만, 입력 데이터가 보정됨)
        """
        # 데이터가 없으면 실행 불가
        if self.kpts is None:
            return self._result("undetected", 0)

        # 1. [기본] 스케일(Scale) 및 바닥(Ground) 정의
        scale = self._calculate_scale()
        if scale == 0:
            return self._result("undetected", 0)

        candidate_points = [
            "R_F_PAW", "L_F_PAW", "R_B_PAW", "L_B_PAW",
            "R_F_ELBOW", "L_F_ELBOW", "R_B_HOCK", "L_B_HOCK",
            "TAIL_BASE", "NOSE"
        ]
        valid_ys = [self._get_y(p) for p in candidate_points if self._is_valid(p)]
        ground_y = max(valid_ys) if valid_ys else 0
        
        if ground_y == 0: return self._result("undetected", scale)

        # ---------------------------------------------------------
        # 2. [대분류] LYING (누움/뒤집힘) 판단
        # ---------------------------------------------------------
        spine_y = self._get_y("TAIL_BASE") if self._is_valid("TAIL_BASE") else 0
        paws_y = [self._get_y(p) for p in ["R_F_PAW", "L_F_PAW", "R_B_PAW", "L_B_PAW"] if self._is_valid(p)]
        avg_paw_y = sum(paws_y)/len(paws_y) if paws_y else ground_y
        
        if spine_y > 0 and avg_paw_y < spine_y - (scale * 0.1): 
            return self._result("lying", scale)

        # ---------------------------------------------------------
        # 3. [상태 플래그 계산] 다리 상태 분석
        # ---------------------------------------------------------
        # (A) 뒷다리 상태 (Back Folded?)
        hock_dists = []
        for p in ["R_B_HOCK", "L_B_HOCK"]:
            if self._is_valid(p): hock_dists.append(abs(ground_y - self._get_y(p)))
        
        IS_BACK_FOLDED = False
        min_hock_dist = scale 

        if hock_dists:
            min_hock_dist = min(hock_dists)
            if min_hock_dist < (scale * 0.15): 
                IS_BACK_FOLDED = True
        else:
            # Fallback: 엉덩이 높이
            if spine_y > 0:
                hip_height = abs(ground_y - spine_y)
                if hip_height < (scale * 0.4):
                    IS_BACK_FOLDED = True
                    min_hock_dist = hip_height 

        # (B) 앞다리 상태 (Front Folded?)
        elbow_dists = []
        for p in ["R_F_ELBOW", "L_F_ELBOW"]:
            if self._is_valid(p): elbow_dists.append(abs(ground_y - self._get_y(p)))
        
        min_elbow_dist = min(elbow_dists) if elbow_dists else scale
        IS_FRONT_FOLDED = min_elbow_dist < (scale * 0.25)

        # (C) 앞발 들림 개수
        front_lifted_count = 0
        LIFT_THRESHOLD = scale * 0.20
        
        if self._is_valid("R_F_PAW") and abs(ground_y - self._get_y("R_F_PAW")) > LIFT_THRESHOLD: 
            front_lifted_count += 1
        if self._is_valid("L_F_PAW") and abs(ground_y - self._get_y("L_F_PAW")) > LIFT_THRESHOLD: 
            front_lifted_count += 1

        # (D) 공중 부양 여부
        all_paws_lifted = True
        if not paws_y: all_paws_lifted = False
        else:
            for p in ["R_F_PAW", "L_F_PAW", "R_B_PAW", "L_B_PAW"]:
                if self._is_valid(p) and abs(ground_y - self._get_y(p)) < LIFT_THRESHOLD:
                    all_paws_lifted = False
                    break

        # ---------------------------------------------------------
        # 4. [중분류] 동작 결정 매트릭스
        # ---------------------------------------------------------
        if all_paws_lifted:
            return self._result("run", scale, min_hock_dist, min_elbow_dist)

        action = "stand" 

        if IS_BACK_FOLDED:
            if IS_FRONT_FOLDED:
                action = "down"
            else:
                action = "sit"
        else:
            if IS_FRONT_FOLDED:
                action = "playbow"
            else:
                action = "stand"

        # [Safety Guard] PLAYBOW 검증
        if action == "playbow":
            ear_ys = [self._get_y(e) for e in ["L_EAR_BASE", "R_EAR_BASE"] if self._is_valid(e)]
            if ear_ys and spine_y > 0:
                avg_ear_y = sum(ear_ys) / len(ear_ys)
                if spine_y > avg_ear_y: 
                    action = "down"

        # [Safety Guard] PLAYBOW 데이터 부족 시
        if action == "playbow" and not self._is_valid("TAIL_BASE") and not hock_dists:
             action = "down"

        # 특수 행동
        if action in ["sit", "stand"]:
            if front_lifted_count == 2:
                action = "beg"
            elif front_lifted_count == 1:
                action = "paw"

        # ---------------------------------------------------------
        # 5. [소분류] SNIFF
        # ---------------------------------------------------------
        if action in ["stand", "down", "run", "walk"]:
            if self._is_valid("NOSE"):
                nose_y = self._get_y("NOSE")
                if abs(ground_y - nose_y) < (scale * 0.2):
                    ear_ys = [self._get_y(e) for e in ["L_EAR_BASE", "R_EAR_BASE"] if self._is_valid(e)]
                    if ear_ys and spine_y > 0:
                        avg_ear_y = sum(ear_ys) / len(ear_ys)
                        if avg_ear_y > spine_y - (scale * 0.1):
                             return self._result("sniff", scale, min_hock_dist, min_elbow_dist)

        return self._result(action, scale, min_hock_dist, min_elbow_dist)

    def _calculate_scale(self):
        if self._is_valid(["L_EAR_BASE", "TAIL_BASE"]):
            return self._dist("L_EAR_BASE", "TAIL_BASE")
        if self._is_valid(["R_F_ELBOW", "R_F_PAW"]):
            return self._dist("R_F_ELBOW", "R_F_PAW") * 2.5
        return 0

    def _result(self, action, scale, hock=0, elbow=0):
        return {
            "action": action,
            "debug": {
                "scale": float(round(scale, 1)),
                "hock_dist": float(round(hock, 1)),
                "elbow_dist": float(round(elbow, 1)),
                "threshold_hock": float(round(scale * 0.15, 1)),
                "threshold_elbow": float(round(scale * 0.25, 1))
            }
        }