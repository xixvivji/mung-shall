pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Backend Build') {
            steps {
                dir('backend') {  // 백엔드 코드 폴더로 이동
                    sh './gradlew clean build'  // Gradle 빌드
                }
            }
        }

        stage('Backend Test') {
            steps {
                dir('backend') {
                    sh './gradlew test'  // Gradle 테스트 단계
                }
            }
        }
    }

    post {
        success {
            echo "Backend build and test successful for branch: ${env.BRANCH_NAME}"
        }
        failure {
            echo "Backend build or test failed for branch: ${env.BRANCH_NAME}"
        }
    }
}