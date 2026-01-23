pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "frontend-image"
        CONTAINER_NAME = "frontend-server"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Frontend Deploy') {
            steps {
                script {

                    dir('frontend') {
                        echo "프론트엔드 폴더 진입..."

                        // 1. 기존 컨테이너 청소
                        sh "docker stop ${CONTAINER_NAME} || true"
                        sh "docker rm ${CONTAINER_NAME} || true"

                        // 2. 이미지 빌드 (현재 폴더의 Dockerfile 사용)
                        sh "docker build -t ${DOCKER_IMAGE} ."

                        // 3. 실행 (컨테이너 80번 포트를 외부 3000번으로 연결)
                        // 나중에 접속할 때: http://i14c109.p.ssafy.io:3000
                        sh "docker run -d --name ${CONTAINER_NAME} -p 3000:80 ${DOCKER_IMAGE}"
                    }
                }
            }
        }
    }
}