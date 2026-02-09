# Mung-Shall
![메인](/uploads/f5a357990d40c7d030a2fa65728058c1/메인.png){width=590 height=331}

## 개요
본 프로젝트는 유기견 입양의 전(사전 검증)·중(입양 심사)·후(사후 관리)
전 과정을 하나의 시스템으로 통합하여, 입양 과정에서 발생하는 단절을 줄이고
유기견 파양률을 낮추는 것을 목표로 하는 AI 기반 유기견 입양 플랫폼입니다.

## 팀원 및 포지션
| 분류 | 이름 | 포지션 |
| --- | --- | --- |
| 팀장 | 김지원 | Infra |
| 팀원 | 문희성 | FrontEnd |
| 팀원 | 박정희 | FrontEnd |
| 팀원 | 손홍민 | AI & BackEnd |
| 팀원 | 정유찬 | BackEnd |
| 팀원 | 차민성 | BackEnd |

## 주요 기능 화면 설계
![화면_1](/uploads/23c1a2745d59ced7658014e5c2d86b8b/화면_1.png){width=547 height=231}
![화면_2](/uploads/71c919d8064f8fd172681227ecc3d352/화면_2.png){width=546 height=230}
![화면_3](/uploads/4edff8003b46a271c218d7f9bec8bfb1/화면_3.png){width=547 height=233}

## 기술 스택
| Category | Tech |
| --- | --- |
| Frontend | React, Vite, TypeScript, Tailwind CSS, Material-UI |
| Backend | Spring Boot, Java 17, Spring Data JPA, Spring Security, Spring Batch |
| AI Server | Python, FastAPI, Ultralytics(YOLO), OpenCV |
| Database | MySQL |
| Cache | Redis |
| CI/CD | Jenkins, Docker, Git |
| Monitoring | Prometheus, Grafana |
| Infra | AWS EC2, Nginx, OpenVidu |
| API Docs | SpringDoc (Swagger UI) |
| Auth | JWT, OAuth 2.0 |

## 시스템 아키텍쳐
본 시스템은 MSA(Microservice Architecture)를 일부 채용한 컨테이너 기반으로 설계되었으며,
각 컴포넌트는 Docker를 통해 격리/관리되고 Jenkins CI/CD 파이프라인을 통해 자동 배포된다.

서비스 간 통신은 REST API를 기반으로 하며,
주요 데이터는 MySQL에, 캐시 및 실시간 데이터는 Redis에 저장된다.
![시스템_아키텍쳐](/uploads/3be8e59a1e296605e916e551377ebdbb/시스템_아키텍쳐.png){width=531 height=265}
![image](/uploads/1ffe82acdfb096dc7c97d2a02766e481/image.png){width=585 height=261}
![자동화](/uploads/e4b2ba09bc35de04700c593afc67deeb/자동화.png){width=414 height=262}
![모니터링](/uploads/d7bea5fe3e3f3ca2b7b2df56c6877fd0/모니터링.png){width=544 height=226}

## 커밋 컨벤션
기본 구조
```
type : subject

body
```

type 종류
```
feat : 새로운 기능 추가
fix : 버그 수정
docs : 문서 수정
style : 코드 포맷팅, 세미콜론 누락, 코드 변경이 없는 경우
refactor : 코드 리펙토링
test : 테스트 코드, 리펙토링 테스트 코드 추가
chore : 빌드 업무 수정, 패키지 매니저 수정
```

커밋 예시
```
== ex1
✨Feat: BE - 회원 가입 기능 구현

== ex2
📚chore: docker-compose 수정
```


## ⚖️ 라이선스 및 출처 (License & Acknowledgements)

본 프로젝트는 **GNU Affero General Public License v3.0 (AGPL-3.0)** 라이선스를 따릅니다.

### 1. YOLOv8 (Ultralytics)
이 프로젝트는 [Ultralytics](https://github.com/ultralytics/ultralytics)에서 개발한 **YOLOv8** 모델을 기반으로 합니다.
- **라이선스:** AGPL-3.0
- **출처:** https://github.com/ultralytics/ultralytics
- 본 프로젝트는 YOLOv8의 라이선스 규정을 준수하여, 파인튜닝 코드 및 추론 로직을 오픈소스로 공개합니다.

### 2. Stanford Dogs Dataset
모델 학습 및 튜닝을 위해 **[Stanford Dogs Dataset](http://vision.stanford.edu/aditya86/ImageNetDogs/)**을 사용하였습니다.
- **사용 목적:** 해당 데이터셋은 **비상업적 연구 및 교육 목적**으로만 사용되었습니다.
- **인용:**
  > Khosla, Aditya, et al. "Novel dataset for fine-grained image categorization." *First Workshop on Fine-Grained Visual Categorization, IEEE Conference on Computer Vision and Pattern Recognition (CVPR)*, 2011.