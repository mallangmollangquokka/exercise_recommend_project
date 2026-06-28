# 운동 추천 웹사이트

사용자의 운동 목적, 부위, 도구, 난이도에 따라 맞춤 운동을 추천하고 유튜브 영상과 연동하는 웹 서비스입니다.

## 주요 기능

- **조건별 운동 추천**: 목적(웨이트/유산소), 부위, 도구, 난이도를 선택하면 조건에 맞는 운동 3개를 랜덤으로 추천
- **난이도별 세트/횟수 제공**: 초급(10회×2세트), 중급(15회×3세트), 고급(20회×4세트)
- **유튜브 영상 연동**: 추천된 운동의 시범 영상을 화면 안에서 바로 재생
- **즐겨찾기**: 마음에 드는 운동을 저장하고 모아보기
- **루틴 저장 및 주간 통계**: 오늘의 루틴을 저장하고 이번 주 운동 횟수와 피드백 확인
- **루틴 기록**: 날짜별로 저장한 운동 기록 조회

## 기술 스택

- **Backend**: Flask, SQLite
- **Frontend**: HTML, CSS, JavaScript
- **Infra**: Docker, Docker Compose, Nginx

## 프로젝트 구조

```
exercise_project/
├── docker-compose.yml
├── start.sh
├── stop.sh
├── backend/
│   ├── app.py
│   ├── init_db.py
│   ├── exercise.csv
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
└── nginx/
    ├── Dockerfile
    └── default.conf
```

## 실행 방법

### 준비물
- Docker, Docker Compose 설치 필요

### 실행
```bash
git clone https://github.com/mallangmollangquokka/exercise_recommend_project.git
cd exercise_recommend_project
docker-compose up --build
```

### 접속
```
http://localhost:8081
```

### 종료
```bash
docker-compose down
```

## API 명세

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/recommend` | 조건별 운동 추천 (body_part, equipment, goal, level) |
| POST | `/save_routine` | 오늘의 루틴 저장 |
| GET | `/get_routines` | 저장된 루틴 기록 조회 |
| GET | `/weekly_stats` | 이번 주 운동 횟수 및 피드백 조회 |
