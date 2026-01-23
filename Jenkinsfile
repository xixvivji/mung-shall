pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "backend-image"
        CONTAINER_NAME = "backend-server"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Backend Build') {
            steps {
                dir('backend') {
                    sh 'chmod +x gradlew' // 실행 권한 주기
                    sh './gradlew clean build -x test' // 테스트 제외하고 빌드
                }
            }
        }



        stage('Deploy') {
            steps {
                script {
                    echo " 도커 배포 시작..."

                    // 1. 기존 컨테이너 삭제
                    sh "docker stop ${CONTAINER_NAME} || true"
                    sh "docker rm ${CONTAINER_NAME} || true"

                    // 2. 도커 이미지 빌드
                    dir('backend') {
                        sh "docker build -t ${DOCKER_IMAGE} ."
                    }

                    // 3. 컨테이너 실행
                    sh "docker run -d --name ${CONTAINER_NAME} -p 8080:8080 ${DOCKER_IMAGE}"
                }
            }
        }
    }

    post {
        success {
            echo " 배포 성공! (Branch: ${env.BRANCH_NAME})"
        }
        failure {
            echo " 배포 실패... (Branch: ${env.BRANCH_NAME})"
        }
    }
}