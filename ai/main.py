# Copyright (c) 2024 YourName
# Licensed under the GNU Affero General Public License v3.0

from fastapi import FastAPI, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse
import uvicorn
import cv2
import numpy as np
import tempfile
import os
import json
import time
from ultralytics import YOLO
from collections import defaultdict

# 모듈 임포트
from pose_analyzer import DogPoseAnalyzer
from visualizer import DogVisualizer

app = FastAPI()

# ---------------------------------------------------------
# 1. 모델 로드
# ---------------------------------------------------------
print("⏳ Loading YOLO model...")
try:
    model = YOLO('model/best.pt') 
    print("✅ Model loaded successfully! Ready to analyze.")
except Exception as e:
    print(f"❌ Failed to load model: {e}")
    model = None 

# ---------------------------------------------------------
# 2. 파일 삭제 유틸리티
# ---------------------------------------------------------
def remove_file(path: str):
    try:
        if os.path.exists(path):
            os.remove(path)
    except Exception as e:
        print(f"⚠️ Error removing file {path}: {e}")

# ---------------------------------------------------------
# 3. 비디오 처리 로직 (미션 판독 기능 추가)
# ---------------------------------------------------------
def process_video(input_path, output_path, target_action: str, target_duration: float):
    """
    영상 분석 + 챌린지 성공 여부 판단
    """
    if model is None:
        raise RuntimeError("YOLO Model is not loaded.")

    process_start_time = time.time()
    cap = cv2.VideoCapture(input_path)
    
    # 영상 정보
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps == 0: fps = 30.0
    
    print(f"\n▶ Start Mission Challenge: '{target_action}' for {target_duration}s")
    print(f"  - Video Info: {width}x{height} @ {fps:.1f} FPS")

    fourcc = cv2.VideoWriter_fourcc(*'mp4v') 
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    analyzer = DogPoseAnalyzer() 
    action_counts = defaultdict(int)
    total_frames = 0

    # [NEW] 미션 추적 변수
    target_action = target_action.lower() # 소문자 통일
    current_stream_frames = 0     # 목표 동작 연속 프레임 수
    mission_success = False       # 미션 성공 여부
    max_duration_achieved = 0.0   # 해당 동작 최대 유지 시간 (기록용)

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        
        total_frames += 1

        # 1. YOLO 추론
        results = model(frame, verbose=False, conf=0.3)[0] 
        raw_kpts = []
        if results.keypoints is not None and len(results.keypoints.data) > 0:
            raw_kpts = results.keypoints.data[0].cpu().numpy()

        # 2. 포즈 분석 (안정화 로직 적용됨)
        if len(raw_kpts) > 0:
            analyzer.process_keypoints(raw_kpts)
        
        analysis_result = analyzer.analyze()
        current_action = analysis_result.get("action", "undetected")

        # 3. 통계 및 미션 판독
        action_counts[current_action] += 1

        # [미션 로직] 현재 동작이 목표 동작과 일치하는가?
        if current_action == target_action:
            current_stream_frames += 1
        else:
            # 동작이 끊기면 카운터 리셋
            # (DogPoseAnalyzer 내부의 관성/버퍼링 덕분에 1~2프레임 튀는 건 이미 보정되어 넘어옴)
            current_stream_frames = 0
        
        # 현재 유지 시간 계산
        current_duration = current_stream_frames / fps
        
        # 최대 기록 갱신 (로그용)
        if current_duration > max_duration_achieved:
            max_duration_achieved = current_duration

        # 목표 시간 달성 체크 (한 번이라도 달성하면 성공)
        if not mission_success and current_duration >= target_duration:
            print(f"  ✨ [SUCCESS] Target '{target_action}' maintained for {target_duration}s!")
            mission_success = True
            # 시각화 객체에 성공 메시지 전달 (선택 사항)
            analysis_result["mission_cleared"] = True 

        # 4. 시각화
        if analyzer.kpts is not None:
            visualizer = DogVisualizer(analyzer.kpts)
            processed_frame = visualizer.draw(frame, analysis_result)
        else:
            processed_frame = frame
        
        # (옵션) 미션 성공 시 화면에 텍스트 추가
        if mission_success:
            cv2.putText(processed_frame, "MISSION SUCCESS!", (width//2 - 100, 50), 
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 3)

        out.write(processed_frame)

    cap.release()
    out.release()

    total_process_time = time.time() - process_start_time
    
    # 요약 정보 생성
    summary = {action: round(count / fps, 2) for action, count in action_counts.items()}
    
    # 대표 동작 찾기
    valid_actions = {k: v for k, v in summary.items() if k != "undetected"}
    main_action = max(valid_actions, key=valid_actions.get) if valid_actions else "undetected"

    print(f"✅ Analysis Completed in {total_process_time:.2f}s")
    print(f"  - Mission Result: {'SUCCESS' if mission_success else 'FAIL'}")
    print(f"  - Max Duration ({target_action}): {max_duration_achieved:.2f}s")
    print("-" * 50 + "\n")

    return summary, main_action, mission_success

# ---------------------------------------------------------
# 4. 영상 분석 API 엔드포인트
# ---------------------------------------------------------
@app.post("/analyze/video")
async def analyze_video_endpoint(
    background_tasks: BackgroundTasks, 
    file: UploadFile = File(...),
    target_action: str = Form(...),    # [NEW] 목표 행동 (예: sit)
    target_duration: float = Form(...) # [NEW] 목표 시간 (예: 3.0)
):
    """
    [Spring Boot -> FastAPI]
    - Multipart Form Data로 영상과 목표값을 함께 받음
    - 분석 후 미션 성공 여부를 헤더에 담아 반환
    """
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as input_tmp:
        input_tmp.write(await file.read())
        input_path = input_tmp.name

    output_path = input_path.replace(".mp4", "_processed.mp4")

    try:
        # process_video에 목표값 전달
        summary, main_action, is_success = process_video(
            input_path, output_path, target_action, target_duration
        )
        
        # 헤더 결과 JSON 구성
        result_data = {
            "mission_success": is_success,     # [핵심] 미션 성공 여부
            "target_action": target_action,    # 요청받은 목표
            "target_duration": target_duration,# 요청받은 시간
            "main_action": main_action,        # 영상 전체 대표 동작
            "details": summary,                # 전체 동작별 시간 요약
        }
        json_header = json.dumps(result_data, ensure_ascii=True)

        background_tasks.add_task(remove_file, output_path)

        return FileResponse(
            path=output_path,
            media_type="video/mp4",
            filename=f"analyzed_{file.filename}",
            headers={"X-Analysis-Result": json_header}
        )

    except Exception as e:
        print(f"❌ Error processing video: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"error": str(e), "success": False}
        )

    finally:
        remove_file(input_path)

# ---------------------------------------------------------
# 5. 사진 분석 API (유지)
# ---------------------------------------------------------
@app.post("/predict/dog")
async def predict_dog_snapshot(file: UploadFile = File(...)):
    # (기존 코드와 동일)
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if frame is None:
            return JSONResponse(status_code=400, content={"error": "Invalid image file"})

        results = model(frame, verbose=False, conf=0.3)[0]

        raw_kpts = []
        if results.keypoints is not None and len(results.keypoints.data) > 0:
            raw_kpts = results.keypoints.data[0].cpu().numpy()

        analyzer = DogPoseAnalyzer()
        
        if len(raw_kpts) > 0:
            analyzer.process_keypoints(raw_kpts) 
            result = analyzer.analyze_snapshot() 
        else:
            result = {"action": "undetected", "debug": {}}

        return {
            "success": True,
            "filename": file.filename,
            "result": result
        }

    except Exception as e:
        print(f"❌ Error predicting image: {e}")
        return JSONResponse(status_code=500, content={"error": str(e), "success": False})

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)