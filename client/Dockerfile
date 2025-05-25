FROM node:22-alpine
WORKDIR /app
COPY .npmrc .npmrc
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev"]