# 1. 베이스 이미지
FROM openjdk:17-jdk-slim

# 2. 작업 폴더 설정
WORKDIR /app

# 3. JAR 파일 복사
COPY build/libs/*.jar app.jar

# 4. 실행
ENTRYPOINT ["java", "-jar", "app.jar"]
ENV TZ=Asia/Seoul