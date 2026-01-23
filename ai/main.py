# main.py
from fastapi import FastAPI, UploadFile, File
from ultralytics import YOLO
import cv2
import numpy as np
import io
from PIL import Image

app = FastAPI()

# 1. 모델 로드 (경로 확인 필수!)
# model 폴더 안에 튜닝된 best.pt 모델이 있어야 합니다.
MODEL_PATH = "model/best.pt"
try:
    model = YOLO(MODEL_PATH)
    print(f"✅ 모델 로드 성공: {MODEL_PATH}")
except Exception as e:
    print(f"❌ 모델 로드 실패: {e}")
    print("models 폴더에 best.pt 파일이 있는지 확인해주세요.")

# 2. 관절 매핑 (사진 분석 결과 적용)
KEYPOINTS = {
    "NOSE": 19,
    "R_F_PAW": 0,  "R_F_WRIST": 1,  "R_F_SHOULDER": 2,
    "R_B_PAW": 3,  "R_B_HOCK": 4,   "R_B_HIP": 5,
    "L_F_PAW": 6,  "L_F_WRIST": 7,  "L_F_SHOULDER": 8,
    "L_B_PAW": 9,  "L_B_HOCK": 10,  "L_B_HIP": 11,
    "SHOULDER_TOP": 20, # 등 (기준점)
    "CHEST_BOTTOM": 21,
    "BELLY_BOTTOM": 22,
    "HIP_TOP": 23       # 엉덩이 (앉을 때 내려감)
}

def analyze_pose(kpts):
    """
    좌표를 받아 '앉아', '손' 여부를 판단하는 핵심 로직
    """
    # 1. 좌표 추출 편의 함수
    def get_y(name):
        idx = KEYPOINTS[name]
        return kpts[idx][1] # y좌표 (높이)
    
    action = "stand" # 기본 동작은 stand

    # 좌표 가져오기
    shoulder_y = get_y("SHOULDER_TOP")
    hip_y = get_y("HIP_TOP")
    
    # 앞발 높이
    rf_y = get_y("R_F_PAW")
    lf_y = get_y("L_F_PAW")
    rb_y = get_y("R_B_PAW")
    lb_y = get_y("L_B_PAW")

    ground_y = max(rf_y, lf_y, rb_y, lb_y)

    # ---------------------------------------------------------
    # 1. 앉아(Sit) 판단
    # 조건 A: 엉덩이가 어깨보다 낮아야 함
    # 조건 B: 엉덩이가 바닥(뒷발)과 가까워야 함
    # ---------------------------------------------------------

    # 어깨와 엉덩이 부분의 지면으로부터의 높이 계산
    shoulder_height = ground_y - shoulder_y
    hip_height = ground_y - hip_y

    # 어깨 높이가 0이거나 너무 낮으면 0 나누기 방지를 위해 1로 조정
    if shoulder_height < 1: shoulder_height = 1

    # 어깨 높이에 대한 엉덩이 높이의 비율 계산
    sit_ratio = hip_height / shoulder_height

    # 비율로 판단: 엉덩이 높이가 몸통 길이보다 훨씬 작게(납작하게) 바닥에 붙어있으면 앉은 것
    # (수치는 테스트하며 조정 가능. 보통 앉으면 이 거리가 매우 짧아짐)
    # 100은 픽셀값이라 해상도 타니까, 나중엔 비율로 바꾸는 게 좋음. 일단 하드코딩.
    is_sit_pose = sit_ratio < 0.6

    if is_sit_pose:
        action = "sit"

    # ---------------------------------------------------------
    # 2. 손(Paw) 판단
    # 우선순위 높음(앉아서 손 할 수도 있으므로)
    # ---------------------------------------------------------
    paw_diff = abs(rf_y - lf_y)
    if paw_diff > (shoulder_height * 0.15): # 한쪽 발이 많이 올라감
        action = "paw"

    return {
        "action": action, # 최종 판단된 행동 문자열 바로 반환
        "details": {
            "sit_ratio": float(sit_ratio),
            "shoulder_h": float(shoulder_height),
            "hip_h": float(hip_height)
        }
    }

@app.post("/predict/dog")
async def predict_dog(file: UploadFile = File(...)):
    # 이미지 읽기
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # 추론
    results = model(img)
    
    # 결과 처리
    detection_result = {"detected": False, "action": "stand"} # 기본값
    
    for result in results:
        keypoints = result.keypoints.xy.cpu().numpy()
        
        if len(keypoints) > 0:
            kpts = keypoints[0] # 첫 번째 강아지
            
            # 포즈 분석 실행
            analysis = analyze_pose(kpts)
            
            detection_result["detected"] = True
            detection_result["analysis"] = analysis
            
            # 최종 판단
            detection_result["action"] = analysis["action"]
                
            # (디버깅용) 관절 좌표 로그 출력
            print(f"🐶 Action: {detection_result['action']}")
            
    return detection_result