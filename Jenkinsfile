pipeline {
    agent any

  stage('Checkout') {
      steps {
          checkout([
              $class: 'GitSCM',
              branches: scm.branches,
              doGenerateSubmoduleConfigurations: false,
              extensions: [

                  [$class: 'CloneOption', timeout: 60, shallow: true, depth: 1, noTags: true, reference: '']
              ],
              userRemoteConfigs: scm.userRemoteConfigs
          ])
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
                    string(credentialsId: 'DB_ROOT_PASSWORD', variable: 'DB_PW'),
                    string(credentialsId: 'OPENVIDU_SECRET_KEY', variable: 'OV_SECRET'),
                    string(credentialsId: 'JWT_SECRET', variable: 'JWT_SECRET'),
                    string(credentialsId: 'GOOGLE_CLIENT_ID', variable: 'GOOGLE_ID'),
                    string(credentialsId: 'GOOGLE_CLIENT_SECRET', variable: 'GOOGLE_PW'),
                    string(credentialsId: 'KAKAO_CLIENT_ID', variable: 'KAKAO_ID'),
                    string(credentialsId: 'KAKAO_CLIENT_SECRET', variable: 'KAKAO_PW'),
                    string(credentialsId: 'NAVER_CLIENT_ID', variable: 'NAVER_ID'),
                    string(credentialsId: 'NAVER_CLIENT_SECRET', variable: 'NAVER_PW'),
                    string(credentialsId: 'MAIL_USERNAME', variable: 'MAIL_USERNAME'),
                    string(credentialsId: 'MAIL_PASSWORD', variable: 'MAIL_PASSWORD'),
                    string(credentialsId: 'AWS_ACCESS_KEY', variable: 'S3_ACCESS_KEY'),
                    string(credentialsId: 'AWS_SECRET_KEY', variable: 'S3_SECRET_KEY'),
                    string(credentialsId: 'S3_BUCKET_NAME', variable: 'S3_BUCKET_NAME'),
                    string(credentialsId: 'GMS_KEY', variable: 'MyGmsKey')
                ]) {
                    script {
                        // 1. .env 파일 생성
                        sh """
                        # --- OpenVidu 설정 (도메인 주소로 수정) ---
                        echo "OPENVIDU_SECRET=${OV_SECRET}" > .env
                        echo "OPENVIDU_URL=https://i14c109.p.ssafy.io:4443/" >> .env
                        echo "OPENVIDU_PUBLIC_URL=https://i14c109.p.ssafy.io:4443/" >> .env
                        echo "DOMAIN_OR_PUBLIC_IP=i14c109.p.ssafy.io" >> .env

                        # --- DB 및 JWT 설정 ---
                        echo "DB_ROOT_PASSWORD=${DB_PW}" >> .env
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

                        # --- Redis 및 이메일 설정 ---
                        echo "REDIS_HOST=redis-container" >> .env
                        echo "REDIS_PORT=6379" >> .env
                        echo "REDIS_PASSWORD=" >> .env
                        echo "MAIL_USERNAME=${MAIL_USERNAME}" >> .env
                        echo "MAIL_PASSWORD=${MAIL_PASSWORD}" >> .env

                        # --- AWS S3 및 GMS 설정 ---
                        echo "S3_ACCESS_KEY=${S3_ACCESS_KEY}" >> .env
                        echo "S3_SECRET_KEY=${S3_SECRET_KEY}" >> .env
                        echo "S3_BUCKET_NAME=${S3_BUCKET_NAME}" >> .env
                        echo "GMS_KEY=${MyGmsKey}" >> .env

                        # --- 기타 배포 설정 (중요: HTTPS 도메인 반영) ---
                        echo "FRONT_OAUTH_REDIRECT_URL=https://i14c109.p.ssafy.io/oauth/callback" >> .env
                        echo "DOMAIN_URL=https://i14c109.p.ssafy.io" >> .env
                        echo "FRONT_RESET_PASSWORD_URL=https://i14c109.p.ssafy.io/reset-password" >> .env
                        echo "COOKIE_SECURE=true" >> .env
                        echo "COOKIE_SAMESITE=None" >> .env
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