FROM node:24.0.1-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

ARG NEXT_PUBLIC_DIRECTUS_URL
ENV NEXT_PUBLIC_DIRECTUS_URL=$NEXT_PUBLIC_DIRECTUS_URL

RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]
