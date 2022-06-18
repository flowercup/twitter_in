FROM node:14.16.0-alpine3.10
COPY --chown=www-data:www-data ./ /application
WORKDIR /application
RUN npm install
CMD ["npm", "run", "dev"]
RUN npm run start
