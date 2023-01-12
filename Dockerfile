FROM node:17-alpine
COPY src/ /app/
WORKDIR /app

RUN apk update && apk upgrade
RUN apk add chromium 
RUN npm install -g yarn --force
RUN yarn install
EXPOSE 3000
CMD ["yarn", "start"]
