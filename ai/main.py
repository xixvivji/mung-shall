# main.py
from fastapi import FastAPI, UploadFile, File
import shutil
import os

app = FastAPI()

# 저장할 폴더 생성
UPLOAD_DIR = "uploaded_videos"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.get("/")
def read_root():
    return {"message": "멍쉘 AI 서버 (Conda 버전) 정상 작동 중!"}

@app.post("/analyze")
async def analyze_video(file: UploadFile = File(...)):
    # 1. 파일 저장 경로 설정
    file_location = f"{UPLOAD_DIR}/{file.filename}"
    
    # 2. 파일 저장
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    print(f"영상 저장 완료: {file_location}")

    # --- [나중에 여기에 AI 분석 로직 추가] ---
    
    return {
        "filename": file.filename,
        "status": "received",
        "message": "영상 수신 성공"
    }