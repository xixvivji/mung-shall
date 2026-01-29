import math
import numpy as np
from collections import deque, Counter

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
        self.kpts = None
        self.avg_scale = 0.0
        self.valid_frames_count = 0
        
        # [상태 관성 시스템 변수]
        self.current_state = "undetected"   # 현재 출력되는 상태
        self.stable_counter = 0             # 현재 상태가 얼마나 유지됐는지 (신뢰도)
        self.grace_period_counter = 0       # 데이터가 튀었을 때 봐주는 카운트 (관성)
        
        # 설정: 0.3초(약 10프레임) 정도는 데이터가 사라져도 봐줌
        self.MAX_GRACE_FRAMES = 5
        # 설정: 5프레임 연속으로 같은 동작이 나와야 자세 변경 인정
        self.STABILITY_THRESHOLD = 5

    def process_keypoints(self, raw_kpts):
        """
        복잡한 필터링 제거. 순수한 데이터 업데이트 및 스케일 계산만 수행.
        """
        self.kpts = raw_kpts # 원본 데이터 그대로 사용
        self._update_scale(raw_kpts)

    def analyze(self):
        if self.kpts is None: return self._result(self.current_state) # 데이터 없으면 이전 상태 유지
        
        scale = self.avg_scale if self.avg_scale > 0 else 100
        ground_y = self._get_ground_y()
        
        # 1. [Raw Analysis] 현재 프레임만 보고 무식하게 판단 (튀든 말든)
        raw_action = self._get_raw_action(ground_y, scale)

        # 2. [State Manager] 관성(Inertia) 적용하여 최종 상태 결정
        final_action = self._apply_state_inertia(raw_action)

        return self._result(final_action)

    def _apply_state_inertia(self, raw_action):
        """
        [핵심 로직] 잠깐 튀는 데이터는 무시하고, 흐름을 유지함
        """
        # Case 1: 현재 상태와 같은 동작이 들어옴 (안정적)
        if raw_action == self.current_state:
            self.stable_counter += 1
            self.grace_period_counter = 0 # 봐주기 카운트 리셋
            return self.current_state

        # Case 2: 다른 동작(또는 Unknown)이 들어옴 -> 의심 시작
        else:
            # 아직 관성(Grace Period)이 남아있다면? -> 이전 상태 강제 유지
            if self.grace_period_counter < self.MAX_GRACE_FRAMES:
                self.grace_period_counter += 1
                # "잠깐 튄 거야. 무시해."
                return self.current_state
            
            # 관성이 다 떨어짐 (너무 오랫동안 다른 동작이 감지됨) -> 상태 변경 시도
            else:
                # 바로 바꾸지 않고, 새로운 동작도 일정 시간 유지되어야 바꿈 (Debouncing)
                # 여기서는 단순화를 위해 Grace Period가 끝나면 바로 변경하도록 처리
                # (더 정교하게 하려면 새로운 동작용 버퍼가 필요하지만, Grace Period만으로도 충분)
                self.current_state = raw_action
                self.stable_counter = 0
                self.grace_period_counter = 0
                return self.current_state

    def _get_raw_action(self, ground_y, scale):
        """
        기하학적 규칙으로 현재 프레임의 자세 판단 (Raw Data)
        """
        # 데이터가 너무 없으면 Unknown
        if ground_y == 0: return "undetected"

        spine_y = self._get_y("TAIL_BASE")
        ear_y = (self._get_y("L_EAR_BASE") + self._get_y("R_EAR_BASE")) / 2
        if ear_y == 0: ear_y = self._get_y("NOSE")

        # 엉덩이(TailBase)가 없으면? -> 뒷다리(Hock)라도 확인
        # 둘 다 없으면? -> "모름(undetected)" 처리 (관성 로직이 커버해줌)
        hip_y = spine_y
        if hip_y == 0: 
            hip_y = (self._get_y("R_B_HOCK") + self._get_y("L_B_HOCK")) / 2
        
        if hip_y == 0: return "undetected" # 엉덩이 정보 전멸

        # 1. 엉덩이 높이로 대분류 (가장 중요)
        # 엉덩이가 낮으면 SIT/DOWN/BEG, 높으면 STAND
        is_hip_low = abs(ground_y - hip_y) < (scale * 0.35)

        if is_hip_low:
            # 앉은 계열 (Sit, Down, Beg, Paw)
            
            # 손 들었나 확인
            lifted_paws = 0
            lift_threshold = ground_y - (scale * 0.15)
            if self._get_y("R_F_PAW") > 0 and self._get_y("R_F_PAW") < lift_threshold: lifted_paws += 1
            if self._get_y("L_F_PAW") > 0 and self._get_y("L_F_PAW") < lift_threshold: lifted_paws += 1

            if lifted_paws == 2: return "beg"
            if lifted_paws == 1: return "paw"
            
            # 손 안 들었으면 Sit vs Down (팔꿈치 높이)
            elbow_y = (self._get_y("R_F_ELBOW") + self._get_y("L_F_ELBOW")) / 2
            if elbow_y > 0 and abs(ground_y - elbow_y) < (scale * 0.2):
                return "down"
            else:
                return "sit"
        
        else:
            # 서 있는 계열 (Stand, Playbow, Run)
            elbow_y = (self._get_y("R_F_ELBOW") + self._get_y("L_F_ELBOW")) / 2
            
            # Playbow: 엉덩이 높고 앞다리 낮음
            if elbow_y > 0 and abs(ground_y - elbow_y) < (scale * 0.25):
                return "playbow"
            
            return "stand"

    # --- 유틸리티 ---
    def _update_scale(self, kpts):
        curr = 0
        if kpts[12][2] > 0.5 and kpts[14][2] > 0.5:
            curr = math.sqrt((kpts[12][0]-kpts[14][0])**2 + (kpts[12][1]-kpts[14][1])**2)
        
        if curr > 0:
            if self.avg_scale == 0: self.avg_scale = curr
            else: self.avg_scale = self.avg_scale * 0.95 + curr * 0.05
    
    def _get_y(self, name):
        idx = self.KEYPOINTS_MAP[name]
        if self.kpts[idx][2] <= 0.3: return 0 
        return self.kpts[idx][1]

    def _get_ground_y(self):
        ys = []
        for p in ["R_F_PAW", "L_F_PAW", "R_B_PAW", "L_B_PAW", "TAIL_BASE"]:
             y = self._get_y(p)
             if y > 0: ys.append(y)
        return max(ys) if ys else 0

    def _result(self, action):
        return {
            "action": action,
            "debug": { "scale": round(self.avg_scale, 1) }
        }