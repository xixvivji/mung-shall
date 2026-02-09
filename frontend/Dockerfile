FROM node:20-alpine as builder

WORKDIR /app

COPY package.json package-lock.json ./

# 의존성 설치
RUN npm install

# 소스 코드 전체 복사 및 빌드
COPY . .
RUN npm run build

FROM nginx:alpine

COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

# 80 포트 오픈
EXPOSE 80

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]