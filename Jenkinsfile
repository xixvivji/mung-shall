pipeline {
    agent any

    // 1. 젠킨스 기본 체크아웃 비활성화
    options {
        skipDefaultCheckout()
    }

    stages {
        stage('Checkout') {
            steps {
                deleteDir() // 깨끗한 상태에서 시작
                withEnv(['GIT_LFS_SKIP_SMUDGE=1']) {
                    checkout([
                        $class: 'GitSCM',
                        branches: scm.branches,
                        doGenerateSubmoduleConfigurations: false,
                        extensions: [
                            // 타임아웃을 120분으로 설정
                            [$class: 'CloneOption', timeout: 120, shallow: true, depth: 1, noTags: true, reference: ''],
                            [$class: 'CheckoutOption', timeout: 120]
                        ],
                        userRemoteConfigs: scm.userRemoteConfigs
                    ])
                }
            }
        }

        stage('Build & Docker Image') {
            parallel {
                stage('Backend Build') {
                    steps {
                        dir('backend') {
                            sh 'chmod +x ./gradlew'
                            sh './gradlew build -x test'
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
                        echo "OPENVIDU_URL=https://host.docker.internal:5443" >> .env
                        echo "OPENVIDU_PUBLIC_URL=https://i14c109.p.ssafy.io/openvidu" >> .env
                        echo "DOMAIN_OR_PUBLIC_IP=i14c109.p.ssafy.io" >> .env
                        echo "OPENVIDU_CERTIFICATE_TYPE=owncert" >> .env
                        echo "COTURN_SHARED_SECRET_KEY=${OV_SECRET}" >> .env
                        echo "COTURN_IP=auto-ipv4" >> .env
                        echo "COTURN_PORT=3478" >> .env
                        echo "COTURN_MIN_PORT=60000" >> .env
                        echo "COTURN_MAX_PORT=60100" >> .env
                        echo "OPENVIDU_RECORDING_PATH=/opt/openvidu/recordings" >> .env
                        echo "OPENVIDU_RECORDING_CUSTOM_LAYOUT=/opt/openvidu/custom-layout" >> .env
                        echo "OPENVIDU_CDR_PATH=/opt/openvidu/cdr" >> .env

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

                        // 2. prometheus.yml 파일 생성 (폴더 내부에 생성)
                        sh '''
                        mkdir -p monitoring
                        # 기존 파일/폴더 삭제 후 새로 생성 (안전장치)
                        rm -rf monitoring/prometheus.yml

                        cat <<EOF > monitoring/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  # - job_name: 'ai-server'
  #   metrics_path: '/metrics'
  #   static_configs:
  #     - targets: ['ai-server:8000']
EOF
                        '''

                        // 3. 배포 실행
                        sh 'docker rm -f backend-server frontend-server openvidu-server openvidu-coturn kms || true'
                        sh 'docker-compose down || true'

                        sh 'docker-compose up -d --force-recreate backend frontend openvidu-server kms coturn mysql redis prometheus grafana node-exporter'
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
