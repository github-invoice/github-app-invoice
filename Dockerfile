FROM node:21
WORKDIR /app
COPY . .
RUN npm install