# main.py
from fastapi import FastAPI, UploadFile, File
from ultralytics import YOLO
import shutil
import os
import cv2

app = FastAPI()

# 저장할 폴더 생성
UPLOAD_DIR = "uploaded_videos"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# 1. 모델 로드(초기 실행시 자동 다운로드)
# 아직은 사람의 포즈 모델로 테스트 가능한 수준임
print("AI 모델 로딩 중...")
model = YOLO('yolov8n-pose.pt')
print("AI 모델 로딩 완료!")

@app.get("/")
def read_root():
    return {"message": "멍쉘 AI 서버: 모델 적용 완료"}

@app.post("/analyze")
async def analyze_video(file: UploadFile = File(...)):
    # 1. 파일 저장
    file_location = f"{UPLOAD_DIR}/{file.filename}"
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    print(f"영상 저장 완료: {file_location}")

    # 2. OpenCV로 영상 읽기
    cap = cv2.VideoCapture(file_location)

    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps == 0:
        fps = 30.0
    
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    target_frame_idx = int(fps * 1)
    print(f"영상 정보: {fps} FPS, 총 {total_frames} 프레임")

    if target_frame_idx < total_frames:
        print(f"✅ 안정적인 분석을 위해 1초 시점({target_frame_idx}번 프레임)으로 이동합니다.")
        # 타임머신: 해당 프레임 위치로 비디오 포인터를 이동시킵니다.
        cap.set(cv2.CAP_PROP_POS_FRAMES, target_frame_idx)
    else:
        print("⚠️ 영상이 1초보다 짧습니다. 그냥 첫 프레임을 사용합니다.")
        cap.set(cv2.CAP_PROP_POS_FRAMES, 0)

    # 3. 추론(Interface) - 프레임 테스트
    # 일단 한 프레임의 좌표 반환만 확인. 이후 반복문으로 변경해야 함
    if cap.isOpened():
        ret, frame = cap.read()
        if ret:
            # YOLO 모델에 프레임 던지기
            results = model(frame)

            # COCO Keypoint 라벨 정의
            KEYPOINT_NAMES = [
                "코", "왼쪽 눈", "오른쪽 눈", "왼쪽 귀", "오른쪽 귀",
                "왼쪽 어깨", "오른쪽 어깨", "왼쪽 팔꿈치", "오른쪽 팔꿈치",
                "왼쪽 손목", "오른쪽 손목", "왼쪽 골반", "오른쪽 골반",
                "왼쪽 무릎", "오른쪽 무릎", "왼쪽 발목", "오른쪽 발목"
            ]

            # 결과 분석
            for result in results:
                # 관절 좌표 추출
                # xy 좌표가 Tensor 형태로 반환됨
                keypoints = result.keypoints.xy.cpu().numpy()

                print("\n========= [AI의 시선] ==========")
                if len(keypoints) > 0:
                    # 첫 번째 사람의 관절 정보
                    person_kpts = keypoints[0]
                    
                    for i, (x, y) in enumerate(person_kpts):
                        # x, y가 0이면 탐지 못한 부위입니다.
                        if x == 0 and y == 0:
                            continue
                            
                        # 보기 좋게 출력
                        name = KEYPOINT_NAMES[i]
                        print(f"{i:02d} {name}: ({x:.1f}, {y:.1f})")
                print("==========================================\n")
    
    cap.release()
    
    return {
        "filename": file.filename,
        "status": "completed",
        "message": "터미널 로그에 좌표가 찍혔는지 확인할 것"
    }