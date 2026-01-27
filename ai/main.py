from fastapi import FastAPI, UploadFile, File, Form
from ultralytics import YOLO
import cv2
import numpy as np
import tempfile
import os
import shutil
import time

# 1. 포즈 분석 클래스 (Logic Refactoring)
from pose_analyzer import DogPoseAnalyzer

app = FastAPI()

# 1. 모델 로드
MODEL_PATH = "model/best.pt"
try:
    model = YOLO(MODEL_PATH)
    print(f"✅ 모델 로드 성공: {MODEL_PATH}")
except Exception as e:
    print(f"❌ 모델 로드 실패: {e}")

# -----------------------------------------------------------------------------
# 3. API 엔드포인트
# -----------------------------------------------------------------------------
@app.post("/predict/dog")
async def predict_dog(file: UploadFile = File(...)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    results = model(img)
    detection_result = {"detected": False, "action": "stand"}
    
    for result in results:
        if result.keypoints is not None and len(result.keypoints.data) > 0:
            kpts = result.keypoints.data[0].cpu().numpy()
            analyzer = DogPoseAnalyzer(kpts)
            analysis = analyzer.analyze()
            
            detection_result["detected"] = True
            detection_result["action"] = analysis["action"]
            detection_result["analysis"] = analysis
            
            # [수정됨] 디버그 로그 키값 업데이트 (hip -> hock)
            print(f"🐶 Result: {analysis['action'].upper()}")
            print(f"   📏 Scale: {analysis['debug']['scale']}")
            print(f"   🦶 Hock Dist: {analysis['debug']['hock_dist']} (Ref: < {analysis['debug']['threshold_hock']})")
            print(f"   💪 Elbow Dist: {analysis['debug']['elbow_dist']} (Ref: < {analysis['debug']['threshold_elbow']})")
            break

    return detection_result

@app.post("/analyze/video")
async def analyze_video(
    file: UploadFile = File(...), 
    target_action: str = Form("sit"),
    duration_threshold: float = Form(2.0), 
    frame_step: int = Form(5)
):
    # 분석 시작 시간 기록
    start_time = time.time()

    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_file:
        shutil.copyfileobj(file.file, temp_file)
        temp_file_path = temp_file.name

    cap = cv2.VideoCapture(temp_file_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps == 0: fps = 30.0

    current_action_state = None
    state_start_time = 0.0
    success_logs = []
    
    frame_index = 0
    is_event_logged = False 

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        if frame_index % frame_step != 0:
            frame_index += 1
            continue
        
        current_time = frame_index / fps

        results = model(frame, stream=True, verbose=False)
        detected_action = "unknown"
        
        for result in results:
            if result.keypoints is not None and len(result.keypoints.data) > 0:
                kpts = result.keypoints.data[0].cpu().numpy()
                analyzer = DogPoseAnalyzer(kpts)
                detected_action = analyzer.analyze()["action"]
                break 

        if detected_action == current_action_state:
            duration = current_time - state_start_time
            if (detected_action == target_action and 
                duration >= duration_threshold and 
                not is_event_logged):
                
                success_logs.append({
                    "action": detected_action,
                    "timestamp": round(state_start_time, 2),
                    "duration": round(duration, 2),
                    "result": "SUCCESS"
                })
                is_event_logged = True
                print(f"🎉 Success! {detected_action} maintained for {duration:.2f}s")

        else:
            current_action_state = detected_action
            state_start_time = current_time
            is_event_logged = False 

        frame_index += 1

    cap.release()
    if os.path.exists(temp_file_path):
        os.unlink(temp_file_path)

    elapsed_time = time.time() - start_time

    is_success = len(success_logs) > 0
    return {
        "is_success": is_success,
        "processed_fps_interval": frame_step,
        "target_action": target_action,
        "required_duration": duration_threshold,
        "total_analysis_time_sec": float(round(elapsed_time, 2)),
        "logs": success_logs,
        "message": "훈련 성공!" if is_success else "목표 동작 유지 실패"
    }