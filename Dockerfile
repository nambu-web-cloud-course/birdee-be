FROM node:18
# 컨테이너 작업공간 위치
WORKDIR /app

# 호스트 계정에 있는 package.json, package-lock.json 파일을 컨테이너 작업 공간에 복사
COPY package*.json ./
# 앱 의존성 설치
RUN npm install 

# 호스트 계정에 있는 소스파일 전체를 컨테이너로 복사
COPY . . 

# binding port 3000
EXPOSE 3000 

# 서버 실행
CMD ["npm", "start"] 