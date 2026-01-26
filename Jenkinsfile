pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build & Docker Image') {
            parallel {

                stage('Backend Build') {
                    steps {
                        dir('backend') {
                            sh 'chmod +x ./gradlew'
                            sh './gradlew clean build -x test --refresh-dependencies'
                            sh 'docker build -t backend-image:latest .'
                        }
                    }
                }

                stage('Frontend Build') {
                    steps {
                        dir('frontend') {
                            sh 'docker build -t frontend-image:latest .'
                        }
                    }
                }
            }
        }

        stage('Deploy') {
            when {
                anyOf {
                    branch 'develop'
                    branch 'master'
                }
            }
            steps {
                withCredentials([
                    string(credentialsId: 'OPENVIDU_SECRET_KEY', variable: 'OV_SECRET'),
                    string(credentialsId: 'JWT_SECRET', variable: 'JWT_SECRET'),
                    string(credentialsId: 'GOOGLE_CLIENT_ID', variable: 'GOOGLE_ID'),
                    string(credentialsId: 'GOOGLE_CLIENT_SECRET', variable: 'GOOGLE_PW'),
                    string(credentialsId: 'KAKAO_CLIENT_ID', variable: 'KAKAO_ID'),
                    string(credentialsId: 'KAKAO_CLIENT_SECRET', variable: 'KAKAO_PW'),
                    string(credentialsId: 'NAVER_CLIENT_ID', variable: 'NAVER_ID'),
                    string(credentialsId: 'NAVER_CLIENT_SECRET', variable: 'NAVER_PW')
                ]) {
                    script {
                        // 1. .env 파일 생성 (서버 환경에 맞게 값 조정)
                        sh """
                        # --- OpenVidu 설정 ---
                        echo "OPENVIDU_SECRET=${OV_SECRET}" > .env
                        echo "OPENVIDU_PUBLIC_URL=https://13.125.3.38:4443/" >> .env
                        echo "DOMAIN_OR_PUBLIC_IP=13.125.3.38" >> .env

                        # --- DB 설정 ---
                        echo "DB_ROOT_PASSWORD=root" >> .env

                        # --- JWT 설정 ---
                        echo "JWT_SECRET=${JWT_SECRET}" >> .env
                        echo "JWT_ACCESS_EXP_MIN=30" >> .env
                        echo "JWT_REFRESH_EXP_DAYS=14" >> .env

                        # --- 소셜 로그인 설정 ---
                        echo "GOOGLE_CLIENT_ID=${GOOGLE_ID}" >> .env
                        echo "GOOGLE_CLIENT_SECRET=${GOOGLE_PW}" >> .env
                        echo "KAKAO_CLIENT_ID=${KAKAO_ID}" >> .env
                        echo "KAKAO_CLIENT_SECRET=${KAKAO_PW}" >> .env
                        echo "NAVER_CLIENT_ID=${NAVER_ID}" >> .env
                        echo "NAVER_CLIENT_SECRET=${NAVER_PW}" >> .env

                        # ---  Redis 설정 ---
                        echo "REDIS_HOST=redis-container" >> .env
                        echo "REDIS_PORT=6379" >> .env
                        echo "REDIS_PASSWORD=" >> .env

                        echo "FRONT_OAUTH_REDIRECT_URL=http://13.125.3.38/oauth/callback" >> .env
                        echo "COOKIE_SECURE=false" >> .env
                        echo "COOKIE_SAMESITE=Lax" >> .env
                        """

                        // 2. 배포 실행
                        sh 'docker-compose down || true'
                        sh 'docker-compose up -d --force-recreate'
                        sh 'docker image prune -f'
                    }
                }
            }
        }
    }

    post {
   success {
           mattermostSend (
               color: 'good',
               message: "✅ 배포 성공!: ${env.JOB_NAME} #${env.BUILD_NUMBER} (<${env.BUILD_URL}|상세보기>)"
           )
       }
       failure {
           mattermostSend (
               color: 'danger',
               message: "🚨 배포 실패(확인요망): ${env.JOB_NAME} #${env.BUILD_NUMBER} (<${env.BUILD_URL}|상세보기>)"
           )
       }
        }
}