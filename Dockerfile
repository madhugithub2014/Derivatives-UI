FROM node:16-alpine AS build
WORKDIR /app

COPY . .
RUN npm install express@latest --save --force
RUN npm run build
# Serve Application using Nginx Server
FROM nginx:alpine
COPY --from=build /app/dist/price-derivatives/ /usr/share/nginx/html
EXPOSE 80
