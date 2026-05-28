#!/bin/bash
 
echo "운동 추천 서비스를 시작합니다..."
 
# Docker 실행 확인
if ! docker info > /dev/null 2>&1; then
    echo "Docker가 실행중이지 않습니다. Docker를 먼저 실행해주세요."
    exit 1
fi
 
# 기존 컨테이너 종료
echo "기존 컨테이너를 종료합니다..."
docker-compose down
 
# 새로 빌드 및 실행
echo "서비스를 시작합니다..."
docker-compose up --build -d
 
echo "서비스가 시작됐습니다!"
echo "접속 주소: http://localhost:5000"