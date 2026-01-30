pipeline {
    agent any

    options {
            skipDefaultCheckout()
        }

    // [전략] LFS 파일은 처음에 받지 않고(SKIP), 나중에 따로 받아서 타임아웃 방지
    environment {
        GIT_LFS_SKIP_SMUDGE = '1'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: scm.branches,
                    doGenerateSubmoduleConfigurations: false,
                    extensions: [
                        // LFS 제외하고 소스만 받으므로 시간 단축됨 (안전장치로 60분 유지)
                        [$class: 'CloneOption', timeout: 60, shallow: true, depth: 1, noTags: true, reference: '']
                    ],
                    userRemoteConfigs: scm.userRemoteConfigs
                ])
            }
        }

        // [핵심] 여기서 대용량 모델 파일(best.pt)을 별도로 다운로드
        stage('Fetch LFS Files') {
            steps {
                script {
                    echo "📡 LFS 대용량 파일(AI 모델) 다운로드 시작..."
                    // 젠킨스 에이전트에 git-lfs가 설치되어 있어야 함 (보통 되어 있음)
                    sh 'git lfs pull'
                }
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
                        # --- OpenVidu ---
                        echo "OPENVIDU_SECRET=${OV_SECRET}" > .env
                        echo "OPENVIDU_URL=https://i14c109.p.ssafy.io:4443/" >> .env
                        echo "OPENVIDU_PUBLIC_URL=https://i14c109.p.ssafy.io:4443/" >> .env
                        echo "DOMAIN_OR_PUBLIC_IP=i14c109.p.ssafy.io" >> .env

                        # --- DB / JWT ---
                        echo "DB_ROOT_PASSWORD=${DB_PW}" >> .env
                        echo "JWT_SECRET=${JWT_SECRET}" >> .env
                        echo "JWT_ACCESS_EXP_MIN=30" >> .env
                        echo "JWT_REFRESH_EXP_DAYS=14" >> .env

                        # --- Social Login ---
                        echo "GOOGLE_CLIENT_ID=${GOOGLE_ID}" >> .env
                        echo "GOOGLE_CLIENT_SECRET=${GOOGLE_PW}" >> .env
                        echo "KAKAO_CLIENT_ID=${KAKAO_ID}" >> .env
                        echo "KAKAO_CLIENT_SECRET=${KAKAO_PW}" >> .env
                        echo "NAVER_CLIENT_ID=${NAVER_ID}" >> .env
                        echo "NAVER_CLIENT_SECRET=${NAVER_PW}" >> .env

                        # --- Redis / Mail ---
                        echo "REDIS_HOST=redis-container" >> .env
                        echo "REDIS_PORT=6379" >> .env
                        echo "REDIS_PASSWORD=" >> .env
                        echo "MAIL_USERNAME=${MAIL_USERNAME}" >> .env
                        echo "MAIL_PASSWORD=${MAIL_PASSWORD}" >> .env

                        # --- AWS / GMS ---
                        echo "S3_ACCESS_KEY=${S3_ACCESS_KEY}" >> .env
                        echo "S3_SECRET_KEY=${S3_SECRET_KEY}" >> .env
                        echo "S3_BUCKET_NAME=${S3_BUCKET_NAME}" >> .env
                        echo "GMS_KEY=${MyGmsKey}" >> .env

                        # --- Others ---
                        echo "FRONT_OAUTH_REDIRECT_URL=https://i14c109.p.ssafy.io/oauth/callback" >> .env
                        echo "DOMAIN_URL=https://i14c109.p.ssafy.io" >> .env
                        echo "FRONT_RESET_PASSWORD_URL=https://i14c109.p.ssafy.io/reset-password" >> .env
                        echo "COOKIE_SECURE=true" >> .env
                        echo "COOKIE_SAMESITE=None" >> .env
                        """

                        // 2. 배포 실행
                        sh 'docker rm -f backend-server frontend-server ai-server || true'
                        sh 'docker-compose down || true'

                        // [중요 수정] --build 옵션을 추가해야 AI 서버 코드가 수정됐을 때 이미지를 새로 굽습니다!
                        sh 'docker-compose up -d --force-recreate --build'

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