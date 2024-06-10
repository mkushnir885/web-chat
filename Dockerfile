FROM alpine

RUN apk add --no-cache nodejs npm

WORKDIR /app

COPY package*.json .
RUN npm clean-install --omit=dev

COPY . .

ENTRYPOINT ["npm", "run"]
