FROM python:3.10

WORKDIR /app

# 1. [시스템 패키지] 가장 안 바뀌는 부분 (맨 위로)
# 한 번 설치되면 계속 캐시됨
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# 2. [라이브러리 정의 파일] 먼저 복사
COPY requirements.txt .

# 3. [라이브러리 설치]
# requirements.txt가 안 바뀌면 이 단계는 패스 (캐시 사용)
RUN pip install --no-cache-dir -r requirements.txt

# 4. [소스 코드] 가장 자주 바뀌는 부분 (맨 마지막으로)
COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]