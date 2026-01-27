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

    def __init__(self, keypoints_data):
        self.kpts = keypoints_data

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
            if self.kpts[idx][2] <= 0.5: return False
        return True

    def analyze(self):
        # 1. [기본] 스케일(Scale) 및 바닥(Ground) 정의
        scale = self._calculate_scale()
        
        # 스케일조차 계산 불가하면 인식 실패
        if scale == 0:
            return self._result("undetected", 0)

        # [NEW] 동적 바닥 정의: 감지된 모든 신체 부위 중 가장 낮은 점(Y값이 큰 점)
        # 발, 팔꿈치, 뒷꿈치, 꼬리뿌리, 가슴(어깨) 후보군
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
        # 조건 A: 척추(TailBase)가 바닥에 거의 붙어 있음
        spine_y = self._get_y("TAIL_BASE") if self._is_valid("TAIL_BASE") else 0
        is_spine_grounded = False
        if spine_y > 0:
            # 척추가 바닥에서 스케일의 20% 이내로 가까움
            if abs(ground_y - spine_y) < (scale * 0.2):
                is_spine_grounded = True

        # 조건 B: 발이 척추보다 위에 있음 (Y축 역전 - 벌러덩)
        # 발들의 평균 Y값 계산
        paws_y = [self._get_y(p) for p in ["R_F_PAW", "L_F_PAW", "R_B_PAW", "L_B_PAW"] if self._is_valid(p)]
        avg_paw_y = sum(paws_y)/len(paws_y) if paws_y else ground_y
        
        is_upside_down = False
        if spine_y > 0 and avg_paw_y < spine_y - (scale * 0.1): # 발이 등보다 10% 이상 위에 있음
            is_upside_down = True

        if is_spine_grounded or is_upside_down:
            return self._result("lying", scale)

        # ---------------------------------------------------------
        # 3. [상태 플래그 계산] 다리 상태 분석
        # ---------------------------------------------------------
        
        # (1) 뒷다리 상태 (Hock Grounded?)
        # 뒷꿈치(Hock)가 바닥(Ground_Y)과 가까운가?
        hock_dists = []
        for p in ["R_B_HOCK", "L_B_HOCK"]:
            if self._is_valid(p): hock_dists.append(abs(ground_y - self._get_y(p)))
        
        # 뒷다리 관절이 없으면 추론: 엉덩이(TailBase)가 낮으면 접힌 것
        if not hock_dists:
            hip_dist = abs(ground_y - spine_y) if spine_y > 0 else scale
            min_hock_dist = hip_dist # 대체
        else:
            min_hock_dist = min(hock_dists)

        # 임계값: 스케일의 15% 이내면 바닥에 붙은 것으로 간주
        IS_BACK_FOLDED = min_hock_dist < (scale * 0.15)

        # (2) 앞다리 상태 (Elbow Grounded?)
        # 팔꿈치(Elbow)가 바닥과 가까운가?
        elbow_dists = []
        for p in ["R_F_ELBOW", "L_F_ELBOW"]:
            if self._is_valid(p): elbow_dists.append(abs(ground_y - self._get_y(p)))
        
        # 앞다리 관절 없으면 스케일(높음)로 대체
        min_elbow_dist = min(elbow_dists) if elbow_dists else scale
        
        # 임계값: 스케일의 25% 이내면 엎드린 팔
        IS_FRONT_FOLDED = min_elbow_dist < (scale * 0.25)

        # (3) 앞발 들림 개수 (Paw Lift Count) - BEG/PAW/WALK 판별용
        front_lifted_count = 0
        LIFT_THRESHOLD = scale * 0.20 # 바닥에서 20% 이상 떨어지면 든 것으로 간주
        
        # 각 발이 바닥에서 얼마나 떨어졌는지 체크
        if self._is_valid("R_F_PAW"):
            if abs(ground_y - self._get_y("R_F_PAW")) > LIFT_THRESHOLD: front_lifted_count += 1
        if self._is_valid("L_F_PAW"):
            if abs(ground_y - self._get_y("L_F_PAW")) > LIFT_THRESHOLD: front_lifted_count += 1

        # (4) 공중 부양 여부 (Airborne) - RUN/JUMP 판별용
        # 네 발 모두 바닥에서 떨어져 있는가?
        all_paws_lifted = True
        for p in ["R_F_PAW", "L_F_PAW", "R_B_PAW", "L_B_PAW"]:
            if self._is_valid(p):
                # 하나라도 바닥에 붙어있으면(거리 작음) Airborne 아님
                if abs(ground_y - self._get_y(p)) < LIFT_THRESHOLD:
                    all_paws_lifted = False
                    break
        # 발이 하나도 안 보이면 Airborne 아님 (보수적 판단)
        if not paws_y: all_paws_lifted = False

        # ---------------------------------------------------------
        # 4. [중분류] 동작 결정 매트릭스
        # ---------------------------------------------------------
        action = "stand" # Default

        # 대분류 3: 동적 상태 (Walk/Run)
        if all_paws_lifted:
            return self._result("run", scale)

        # 상태 조합에 따른 분류
        if IS_BACK_FOLDED:
            if IS_FRONT_FOLDED:
                action = "down"      # 뒤 접힘 + 앞 접힘
            else:
                action = "sit"       # 뒤 접힘 + 앞 펴짐
        else:
            if IS_FRONT_FOLDED:
                action = "playbow"   # 뒤 펴짐 + 앞 접힘
            else:
                action = "stand"     # 뒤 펴짐 + 앞 펴짐

        # 특수 행동 (BEG / PAW / WALK) - SIT이나 STAND 상태일 때만
        if action in ["sit", "stand"]:
            if front_lifted_count == 2:
                action = "beg"       # 두 앞발 다 듦
            elif front_lifted_count == 1:
                action = "paw"       # 한 앞발 듦
            elif action == "stand" and front_lifted_count == 1:
                # 서 있는데 한 발만 들었다? -> 걷는 중일 확률 높음 (PAW와 모호하지만 WALK로 분류 가능)
                # 여기서는 PAW 우선순위를 위해 일단 PAW로 둠, 혹은 WALK로 변경 가능
                pass

        # ---------------------------------------------------------
        # 5. [소분류] SNIFF (냄새 맡기) - 최우선 순위 덮어쓰기
        # ---------------------------------------------------------
        # 조건: 코가 바닥에 거의 붙어 있음 (SIT/BEG 상태가 아닐 때 유효)
        if action in ["stand", "down", "run", "walk"]:
            if self._is_valid("NOSE"):
                nose_y = self._get_y("NOSE")
                # 코와 바닥의 거리가 매우 가까움 (스케일 20% 이내)
                if abs(ground_y - nose_y) < (scale * 0.2):
                    # 추가 조건: 머리(귀)가 척추보다 낮거나 비슷해야 함 (BEG 상태 오인 방지)
                    ear_y = self._get_avg_y(["L_EAR_BASE", "R_EAR_BASE"])
                    if ear_y > 0 and spine_y > 0:
                        # Y좌표가 클수록 아래쪽 -> 귀가 척추보다 아래(값 큼)거나 비슷해야 함
                        if ear_y > spine_y - (scale * 0.1):
                             return self._result("sniff", scale)

        return self._result(action, scale, min_hock_dist, min_elbow_dist)

    # --- [헬퍼 함수] ---
    def _calculate_scale(self):
        # 1순위: 척추 길이 (목~꼬리)
        if self._is_valid(["L_EAR_BASE", "TAIL_BASE"]):
            return self._dist("L_EAR_BASE", "TAIL_BASE")
        # 2순위: 앞다리 길이 * 2.5
        if self._is_valid(["R_F_ELBOW", "R_F_PAW"]):
            return self._dist("R_F_ELBOW", "R_F_PAW") * 2.5
        return 0

    def _get_avg_y(self, names):
        ys = [self._get_y(n) for n in names if self._is_valid(n)]
        return sum(ys)/len(ys) if ys else 0

    def _result(self, action, scale, hock=0, elbow=0):
        # float 형변환 필수
        return {
            "action": action,
            "debug": {
                "scale": float(round(scale, 1)),
                "hock_dist": float(round(hock, 1)),
                "elbow_dist": float(round(elbow, 1)),
                "threshold_hock": float(round(scale * 0.15, 1)),  # Debug 정보용
                "threshold_elbow": float(round(scale * 0.25, 1))
            }
        }