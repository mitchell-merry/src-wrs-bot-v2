FROM node:17

WORKDIR /usr/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 80 443

CMD [ "npm", "start" ]