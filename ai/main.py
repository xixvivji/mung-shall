from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import FileResponse
from ultralytics import YOLO
import cv2
import numpy as np
import tempfile
import os
import shutil
import time

# 모듈 임포트
# 1. 포즈 분석 클래스
from pose_analyzer import DogPoseAnalyzer
# 2. 시각화 클래스
from visualizer import DogVisualizer

app = FastAPI()

# 모델 로드
MODEL_PATH = "model/best.pt"
try:
    model = YOLO(MODEL_PATH)
    print(f"✅ 모델 로드 성공: {MODEL_PATH}")
except Exception as e:
    print(f"❌ 모델 로드 실패: {e}")

# -----------------------------------------------------------------------------
# API 엔드포인트
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
        input_path = temp_file.name

    output_path = input_path.replace(".mp4", "result.mp4")

    cap = cv2.VideoCapture(input_path)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps == 0: fps = 30.0

    # 비디오 라이터 설정(결과 영상)
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    # 상태 관리 변수
    current_action_state = None
    state_start_time = 0.0
    
    frame_index = 0

    # 프레임 건너뛰기 시 이전 데이터를 그리기 위한 변수
    last_valid_kpts = None
    last_valid_analysis = {"action": "unknown", "debug": {}}

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        # ---------------------------------------------------------
        # [A] AI 분석 (frame_step 간격으로만 수행)
        # ---------------------------------------------------------
        if frame_index % frame_step == 0:
            results = model(frame, stream=True, verbose=False)
            
            # 이번 프레임에서 개를 찾았는지 확인
            found_dog = False
            for result in results:
                if result.keypoints is not None and len(result.keypoints.data) > 0:
                    # 데이터 추출
                    kpts = result.keypoints.data[0].cpu().numpy()
                    
                    # 1. 자세 분석 실행
                    analyzer = DogPoseAnalyzer(kpts)
                    analysis = analyzer.analyze()
                    
                    # 2. 다음 프레임을 위해 저장 (Persistence)
                    last_valid_kpts = kpts
                    last_valid_analysis = analysis
                    found_dog = True
                    
                    # 3. 성공/실패 로직 (State Machine)
                    detected_action = analysis["action"]
                    current_time = frame_index / fps

                    if detected_action == current_action_state:
                        duration = current_time - state_start_time
                        # 화면에 표시하기 위해 duration 정보를 analysis에 추가해줄 수도 있음
                        last_valid_analysis["duration"] = round(duration, 1)
                        
                        if detected_action == target_action and duration >= duration_threshold:
                            last_valid_analysis["is_success"] = True # 시각화용 플래그
                    else:
                        current_action_state = detected_action
                        state_start_time = current_time
                        last_valid_analysis["duration"] = 0.0
                        last_valid_analysis["is_success"] = False
                    
                    break # 한 마리만 처리
            
            # 개를 못 찾았으면 이전 데이터 초기화 혹은 유지 (여기서는 유지)
            if not found_dog:
                pass 

        # ---------------------------------------------------------
        # [B] 시각화 (모든 프레임 수행)
        # ---------------------------------------------------------
        # 분석을 건너뛴 프레임이어도, 가장 최근의 last_valid 데이터를 이용해 그립니다.
        final_frame = frame.copy()
        
        if last_valid_kpts is not None:
            # Visualizer 생성 및 그리기
            visualizer = DogVisualizer(last_valid_kpts)
            final_frame = visualizer.draw(final_frame, last_valid_analysis)

        # ---------------------------------------------------------
        # [C] 영상 저장
        # ---------------------------------------------------------
        out.write(final_frame)
        frame_index += 1

    # 자원 해제
    cap.release()
    out.release()
    
    # 원본 입력 파일 삭제 (청소)
    if os.path.exists(input_path):
        os.unlink(input_path)

    print(f"🎥 영상 처리 완료: {time.time() - start_time:.2f}초 소요")

    # 결과 동영상 파일 반환
    return FileResponse(
        output_path, 
        media_type="video/mp4", 
        filename="analyzed_result.mp4"
    )