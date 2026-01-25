# main.py
from fastapi import FastAPI, UploadFile, File
from ultralytics import YOLO
import cv2
import numpy as np
import tempfile
import os
import shutil

app = FastAPI()

# 1. 모델 로드
MODEL_PATH = "model/best.pt" 
try:
    model = YOLO(MODEL_PATH)
    print(f"✅ 모델 로드 성공: {MODEL_PATH}")
except Exception as e:
    print(f"❌ 모델 로드 실패: {e}")

# 2. 관절 매핑
KEYPOINTS = {
    # --- 다리 (Legs) ---
    "R_F_PAW": 0,   "R_F_WRIST": 1,   "R_F_ELBOW": 2,  
    "R_B_PAW": 3,   "R_B_HOCK": 4,    "R_B_KNEE": 5,   
    "L_F_PAW": 6,   "L_F_WRIST": 7,   "L_F_ELBOW": 8,  
    "L_B_PAW": 9,   "L_B_HOCK": 10,   "L_B_KNEE": 11,  
    
    # --- 꼬리 (Tail) ---
    "TAIL_BASE": 12, "TAIL_TIP": 13,
    
    # --- 얼굴 (Head) - 사용자 정의 ---
    "L_EAR_BASE": 14, # 왼쪽 귀 뿌리
    "R_EAR_BASE": 15, # 오른쪽 귀 뿌리
    "NOSE": 16,       # 코
    "CHIN": 17,       # 턱
    "L_EAR_TIP": 18,  # 왼쪽 귀 끝
    "R_EAR_TIP": 19   # 오른쪽 귀 끝
}

def analyze_pose(kpts):
    # kpts는 이제 [x, y, conf] 형태를 가집니다.
    
    def get_y(name):
        return kpts[KEYPOINTS[name]][1]
    
    # 신뢰도 확인 함수 (이제 에러 안 남)
    def is_valid(name):
        # [2]번째 값인 conf가 있는지 확인하고, 0.5 이상인지 체크
        return kpts[KEYPOINTS[name]][2] > 0.5 

    action = "stand"
    
    # -----------------------------------------------------------------
    # [1] 척도(Scale) 설정: 앞다리 길이 (기준)
    # -----------------------------------------------------------------
    rf_len = abs(get_y("R_F_PAW") - get_y("R_F_ELBOW"))
    lf_len = abs(get_y("L_F_PAW") - get_y("L_F_ELBOW"))
    scale_len = max(rf_len, lf_len) 
    
    if scale_len < 1: scale_len = 1 

    # -----------------------------------------------------------------
    # [2] 앉아(Sit) 판단: "뒷발 기준" 상대 높이 (원근법 해결)
    # -----------------------------------------------------------------
    
    # A. 뒷꿈치(Hock) 접힘 여부 check
    r_hock_dist = abs(get_y("R_B_PAW") - get_y("R_B_HOCK"))
    l_hock_dist = abs(get_y("L_B_PAW") - get_y("L_B_HOCK"))
    
    valid_hocks = []
    if is_valid("R_B_PAW") and is_valid("R_B_HOCK"): valid_hocks.append(r_hock_dist)
    if is_valid("L_B_PAW") and is_valid("L_B_HOCK"): valid_hocks.append(l_hock_dist)
    
    # 감지된 뒷다리가 없으면 scale_len(큰 값)을 넣어 Stand로 유도
    min_hock_dist = min(valid_hocks) if valid_hocks else scale_len 

    # B. 엉덩이(Tail Base) 낮음 여부 check
    back_paws_y = []
    if is_valid("R_B_PAW"): back_paws_y.append(get_y("R_B_PAW"))
    if is_valid("L_B_PAW"): back_paws_y.append(get_y("L_B_PAW"))
    
    avg_back_paw_y = sum(back_paws_y) / len(back_paws_y) if back_paws_y else 0
    hip_to_back_paw = abs(avg_back_paw_y - get_y("TAIL_BASE"))

    # --- [최종 판단 로직] ---
    # 조건: 뒷꿈치가 뒷발에 바짝 붙어 있거나(20% 이내) OR 엉덩이가 뒷발 높이까지 내려옴(40% 이내)
    is_hock_folded = min_hock_dist < (scale_len * 0.2)
    is_hip_low = hip_to_back_paw < (scale_len * 0.4)
    
    if is_hock_folded or is_hip_low:
        action = "sit"

    # -----------------------------------------------------------------
    # [3] 손(Paw) 판단 (우선순위 최상)
    # -----------------------------------------------------------------
    rf_y = get_y("R_F_PAW")
    lf_y = get_y("L_F_PAW")
    paw_diff = abs(rf_y - lf_y)
    
    if paw_diff > (scale_len * 0.2):
        action = "paw"

    return {
        "action": action,
        "details": {
            "scale": float(scale_len),
            "hock_dist": float(min_hock_dist),
            "hip_dist": float(hip_to_back_paw),
            "is_folded": bool(is_hock_folded),
            "is_hip_low": bool(is_hip_low)
        }
    }

@app.post("/predict/dog")
async def predict_dog(file: UploadFile = File(...)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    results = model(img)
    detection_result = {"detected": False, "action": "stand"}
    
    for result in results:
        # [수정된 부분] .xy 대신 .data를 써야 (x, y, conf) 3개가 다 들어옵니다!
        # .xy -> [N, 2] (x, y)
        # .data -> [N, 3] (x, y, conf)
        keypoints = result.keypoints.data.cpu().numpy()
        
        if len(keypoints) > 0:
            kpts = keypoints[0] # 첫 번째 강아지
            
            analysis = analyze_pose(kpts)
            
            detection_result["detected"] = True
            detection_result["action"] = analysis["action"]
            detection_result["analysis"] = analysis
            
            # 로그 출력
            print(f"🐶 Action: {detection_result['action']}")
            print(f"   📏 Scale: {analysis['details']['scale']:.1f}")
            print(f"   🦶 Hock Dist: {analysis['details']['hock_dist']:.1f} (Sit < {analysis['details']['scale']*0.2:.1f})")
            print(f"   🍑 Hip Dist: {analysis['details']['hip_dist']:.1f} (Sit < {analysis['details']['scale']*0.4:.1f})")
            
    return detection_result

@app.post("/analyze/video")
async def analyze_video(file: UploadFile = File(...), target_action: str = "sit", duration_threshold: float = 2.0):
    """
    비디오를 받아 target_action이 duration_threshold(초) 이상 유지되었는지 판단
    """
    # 1. 임시 파일 저장
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_file:
        shutil.copyfileobj(file.file, temp_file)
        temp_file_path = temp_file.name

    cap = cv2.VideoCapture(temp_file_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps == 0: fps = 30.0 # fallback

    # 상태 추적 변수들
    current_action_state = None
    state_start_frame = 0
    success_logs = []
    
    frame_index = 0
    is_event_logged = False # 중복 기록 방지 플래그

    # 2. 프레임 루프
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        
        # YOLO 추론 (stream=True로 메모리 최적화)
        results = model(frame, stream=True, verbose=False)
        
        detected_action = "unknown"
        
        # 결과 처리
        for result in results:
            if result.keypoints is not None and len(result.keypoints.data) > 0:
                kpts = result.keypoints.data[0].cpu().numpy() # 첫 번째 강아지
                analysis = analyze_pose(kpts)
                detected_action = analysis["action"]
                break # 한 마리만 분석하고 종료

        # 3. 지속 시간 판단 로직 (State Machine)
        if detected_action == current_action_state:
            # 동작이 유지 중일 때
            current_duration = (frame_index - state_start_frame) / fps
            
            # 목표 동작이고, 기준 시간을 넘겼으며, 아직 로그에 안 남겼다면 -> 성공 기록
            if (detected_action == target_action and 
                current_duration >= duration_threshold and 
                not is_event_logged):
                
                success_logs.append({
                    "action": detected_action,
                    "timestamp": round(state_start_frame / fps, 2),
                    "duration": round(current_duration, 2),
                    "result": "SUCCESS"
                })
                is_event_logged = True # 현재 이벤트 기록 완료 처리
                print(f"🎉 Success! {detected_action} maintained for {current_duration:.2f}s")

        else:
            # 동작이 바뀌었을 때 -> 상태 리셋
            current_action_state = detected_action
            state_start_frame = frame_index
            is_event_logged = False # 새로운 동작이 시작되었으므로 플래그 초기화

        frame_index += 1

    # 4. 정리
    cap.release()
    os.unlink(temp_file_path) # 임시 파일 삭제

    # 최종 결과 반환
    is_success = len(success_logs) > 0
    return {
        "is_success": is_success,
        "target_action": target_action,
        "required_duration": duration_threshold,
        "logs": success_logs, # 성공한 시점들의 기록
        "message": "훈련 성공!" if is_success else "목표 동작 유지 실패"
    }