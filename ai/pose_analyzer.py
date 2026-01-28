import math
import numpy as np

# [NEW] 개별 관절을 추적하기 위한 칼만 필터 클래스
class SimpleKalmanFilter:
    def __init__(self):
        self.x, self.y = 0, 0      # 현재 위치
        self.vx, self.vy = 0, 0    # 현재 속도 (Velocity)
        self.initialized = False   # 초기화 여부

    def update(self, meas_x, meas_y, conf):
        """
        conf(신뢰도)가 높으면 측정값(Meas)을 믿고,
        conf가 낮으면 예측값(Prediction)을 더 믿는 구조
        """
        if not self.initialized:
            self.x, self.y = meas_x, meas_y
            self.vx, self.vy = 0, 0
            self.initialized = True
            return self.x, self.y

        # 1. 예측 (Prediction): 관성을 이용해 다음 위치 추측
        pred_x = self.x + self.vx
        pred_y = self.y + self.vy

        # 2. 보정 가중치 (Kalman Gain) 설정
        # 신뢰도가 0.5 이상이면 측정값을 90% 신뢰 (빠른 반응)
        # 신뢰도가 0.3~0.5면 측정값을 40%만 신뢰 (예측값 의존)
        if conf > 0.5:
            K = 0.9 
        elif conf > 0.3:
            K = 0.4 
        else:
            K = 0.0 # 측정값 무시 (순수 예측)

        # 3. 업데이트 (Update): 예측값과 측정값을 가중치로 섞음
        # 데이터가 아예 없으면(meas=0), 그냥 예측값 유지
        if meas_x == 0 and meas_y == 0:
            new_x, new_y = pred_x, pred_y
        else:
            new_x = pred_x + K * (meas_x - pred_x)
            new_y = pred_y + K * (meas_y - pred_y)

        # 4. 속도 업데이트 (감쇠 적용)
        # 0.8을 곱해 마찰력을 줌 (데이터가 끊겼을 때 무한정 날아가는 것 방지)
        self.vx = (new_x - self.x) * 0.8
        self.vy = (new_y - self.y) * 0.8

        self.x, self.y = new_x, new_y
        return self.x, self.y

    def predict(self):
        """데이터가 아예 없을 때 관성대로 이동"""
        if not self.initialized: return 0, 0
        
        self.x += self.vx
        self.y += self.vy
        self.vx *= 0.7 # 데이터 없으면 속도 빠르게 줄임
        self.vy *= 0.7
        return self.x, self.y


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
        self.missing_counter = {}   
        self.avg_scale = 0.0       
        self.last_center = None    
        self.valid_frames = 0      
        
        # [NEW] 관절별 칼만 필터 생성 (20개)
        self.filters = {i: SimpleKalmanFilter() for i in range(24)}

    def process_keypoints(self, raw_kpts):
        """
        [Smart Tracking + Kalman Filter]
        """
        # 1. 사람/노이즈 데이터인지 검증
        if not self._is_dog_data_valid(raw_kpts):
            # 데이터가 이상하면 강제로 예측 모드(Predict) 진입
            self._apply_kalman_filter(raw_kpts, force_predict=True)
            return

        # 2. 정상 데이터 업데이트 (Kalman Update)
        self._apply_kalman_filter(raw_kpts, force_predict=False)
        
        # 3. 트래커 정보 갱신
        self._update_tracker_info(self.kpts)

    def _is_dog_data_valid(self, kpts):
        # (기존 로직 유지)
        if self.valid_frames < 5 or self.avg_scale == 0: return True
        curr_scale = 0
        p_tail = kpts[12]
        p_ear = kpts[14]
        if p_tail[2] > 0.5 and p_ear[2] > 0.5:
            curr_scale = math.sqrt((p_tail[0]-p_ear[0])**2 + (p_tail[1]-p_ear[1])**2)
        
        if curr_scale > 0 and curr_scale > self.avg_scale * 1.5: return False
        if self.last_center is not None and p_tail[2] > 0.5:
            dist = math.sqrt((p_tail[0]-self.last_center[0])**2 + (p_tail[1]-self.last_center[1])**2)
            if dist > self.avg_scale * 1.0: return False
        return True

    def _apply_kalman_filter(self, raw_kpts, force_predict=False):
        """
        [NEW] 칼만 필터를 이용한 데이터 보정
        """
        processed_kpts = raw_kpts.copy()
        MAX_TTL = 5 

        for i, (x, y, conf) in enumerate(processed_kpts):
            if i not in self.filters:
                self.filters[i] = SimpleKalmanFilter()
            
            if i not in self.missing_counter: self.missing_counter[i] = 0
            
            kf = self.filters[i] # 해당 관절의 필터 가져오기

            # [상황 A] 데이터가 있고 신뢰할만한 경우 (0.3 이상)
            if not force_predict and conf > 0.1:
                # 칼만 필터 업데이트 (측정값 반영)
                # conf가 0.3~0.5 사이면 예측값 비중을 높여서 스무딩 처리됨 (Lag 해결)
                kx, ky = kf.update(x, y, conf)
                
                # 결과 적용 (필터링된 좌표 사용)
                processed_kpts[i] = [kx, ky, conf] # conf는 원본 유지하거나 보정 가능
                self.missing_counter[i] = 0
            
            # [상황 B] 데이터가 없거나 신뢰도가 낮은 경우 (0.3 이하)
            else:
                self.missing_counter[i] += 1
                
                # TTL 이내라면? -> 예측(Prediction) 사용
                if self.missing_counter[i] <= MAX_TTL:
                    # 측정값 없이 관성으로만 이동 (Predict)
                    px, py = kf.predict()
                    # 예측된 위치 적용 (단, 신뢰도는 0.5로 가짜 부여하여 로직 통과 유도)
                    processed_kpts[i] = [px, py, 0.5] 
                else:
                    # TTL 초과 -> 관측 실패 처리
                    processed_kpts[i] = [0, 0, 0.0] 
        
        self.kpts = processed_kpts

    def _update_tracker_info(self, kpts):
        curr_scale = 0
        if kpts[12][2] > 0.5 and kpts[14][2] > 0.5:
            curr_scale = math.sqrt((kpts[12][0]-kpts[14][0])**2 + (kpts[12][1]-kpts[14][1])**2)
        elif kpts[2][2] > 0.5 and kpts[0][2] > 0.5:
             curr_scale = math.sqrt((kpts[2][0]-kpts[0][0])**2 + (kpts[2][1]-kpts[0][1])**2) * 2.5
        if curr_scale > 0:
            if self.avg_scale == 0: self.avg_scale = curr_scale
            else: self.avg_scale = (self.avg_scale * 0.9) + (curr_scale * 0.1)
            self.valid_frames += 1
        if kpts[12][2] > 0.5: self.last_center = (kpts[12][0], kpts[12][1])

    # --- [Analyze Logic: 기존의 안정적인 로직 100% 유지] ---
    def _get_y(self, name): return self.kpts[self.KEYPOINTS_MAP[name]][1]
    def _get_pt(self, name): idx = self.KEYPOINTS_MAP[name]; return self.kpts[idx][:2]
    def _dist(self, name1, name2):
        x1, y1 = self._get_pt(name1); x2, y2 = self._get_pt(name2)
        return math.sqrt((x1-x2)**2 + (y1-y2)**2)
    def _is_valid(self, name_list):
        if isinstance(name_list, str): name_list = [name_list]
        for name in name_list:
            idx = self.KEYPOINTS_MAP[name]
            if self.kpts[idx][2] <= 0.5: return False # 분석 단계에선 엄격함 유지
        return True

    def analyze(self):
        if self.kpts is None: return self._result("undetected", 0)
        scale = self.avg_scale if self.avg_scale > 0 else 100
        candidate_points = ["R_F_PAW", "L_F_PAW", "R_B_PAW", "L_B_PAW", "R_F_ELBOW", "L_F_ELBOW", "TAIL_BASE", "NOSE"]
        valid_ys = [self._get_y(p) for p in candidate_points if self._is_valid(p)]
        ground_y = max(valid_ys) if valid_ys else 0
        if ground_y == 0: return self._result("undetected", scale)

        spine_y = self._get_y("TAIL_BASE") if self._is_valid("TAIL_BASE") else 0
        ear_ys = [self._get_y(e) for e in ["L_EAR_BASE", "R_EAR_BASE"] if self._is_valid(e)]
        avg_ear_y = sum(ear_ys)/len(ear_ys) if ear_ys else 0
        paws_y = [self._get_y(p) for p in ["R_F_PAW", "L_F_PAW", "R_B_PAW", "L_B_PAW"] if self._is_valid(p)]
        avg_paw_y = sum(paws_y)/len(paws_y) if paws_y else ground_y

        is_body_upright = False
        if spine_y > 0 and avg_ear_y > 0:
            if spine_y - avg_ear_y > (scale * 0.4): is_body_upright = True

        is_legs_above_spine = (spine_y > 0 and avg_paw_y < spine_y - (scale * 0.1))
        is_flat_on_ground = False
        if spine_y > 0 and avg_ear_y > 0:
            if abs(ground_y - spine_y) < (scale * 0.25) and abs(ground_y - avg_ear_y) < (scale * 0.25):
                if abs(spine_y - avg_ear_y) < (scale * 0.1): is_flat_on_ground = True

        if (is_legs_above_spine or is_flat_on_ground) and not is_body_upright:
            return self._result("lying", scale)

        hock_dists = []
        for p in ["R_B_HOCK", "L_B_HOCK"]:
            if self._is_valid(p): hock_dists.append(abs(ground_y - self._get_y(p)))
        
        IS_BACK_FOLDED = False
        min_hock_dist = scale 
        is_hip_grounded = False
        if spine_y > 0 and abs(ground_y - spine_y) < (scale * 0.35):
            is_hip_grounded = True
            IS_BACK_FOLDED = True 
            min_hock_dist = abs(ground_y - spine_y)

        if not is_hip_grounded and hock_dists:
            min_hock_dist = min(hock_dists)
            if min_hock_dist < (scale * 0.20): IS_BACK_FOLDED = True

        elbow_dists = []
        for p in ["R_F_ELBOW", "L_F_ELBOW"]:
            if self._is_valid(p): elbow_dists.append(abs(ground_y - self._get_y(p)))
        min_elbow_dist = min(elbow_dists) if elbow_dists else scale
        IS_FRONT_FOLDED = min_elbow_dist < (scale * 0.25)

        front_lifted_count = 0
        LIFT_THRESHOLD = scale * 0.20
        def check_paw_lift(paw_name):
            if not self._is_valid(paw_name): return False
            paw_y = self._get_y(paw_name)
            is_lifted = abs(ground_y - paw_y) > LIFT_THRESHOLD
            if is_body_upright and spine_y > 0:
                if paw_y > spine_y - (scale * 0.1): return False 
            return is_lifted

        if check_paw_lift("R_F_PAW"): front_lifted_count += 1
        if check_paw_lift("L_F_PAW"): front_lifted_count += 1

        action = "stand"
        if IS_BACK_FOLDED: action = "down" if IS_FRONT_FOLDED else "sit"
        else: action = "playbow" if IS_FRONT_FOLDED else "stand"

        if action == "playbow":
            if ear_ys and spine_y > 0 and spine_y > avg_ear_y: action = "down"
        if action == "playbow" and not self._is_valid("TAIL_BASE") and not hock_dists: action = "down"

        if action in ["sit", "stand"]:
            if front_lifted_count == 1: action = "paw"
            elif front_lifted_count == 2: action = "beg"
            elif is_body_upright: action = "beg"

        if action in ["stand", "down", "run", "walk"]:
            if self._is_valid("NOSE"):
                nose_y = self._get_y("NOSE")
                if abs(ground_y - nose_y) < (scale * 0.2):
                    if avg_ear_y > spine_y - (scale * 0.1):
                         return self._result("sniff", scale, min_hock_dist, min_elbow_dist)

        return self._result(action, scale, min_hock_dist, min_elbow_dist)

    def _calculate_scale(self):
        if self._is_valid(["L_EAR_BASE", "TAIL_BASE"]): return self._dist("L_EAR_BASE", "TAIL_BASE")
        if self._is_valid(["R_F_ELBOW", "R_F_PAW"]): return self._dist("R_F_ELBOW", "R_F_PAW") * 2.5
        return 0

    def _result(self, action, scale, hock=0, elbow=0):
        return {
            "action": action,
            "debug": {
                "scale": float(round(scale, 1)),
                "hock_dist": float(round(hock, 1)),
                "elbow_dist": float(round(elbow, 1)),
                "threshold_hock": float(round(scale * 0.20, 1)),
                "threshold_elbow": float(round(scale * 0.25, 1))
            }
        }