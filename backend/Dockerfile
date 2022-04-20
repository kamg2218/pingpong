FROM node:16
RUN mkdir -p /app
RUN mkdir -p /front
WORKDIR /front
ADD front /front
RUN npm install
RUN ls -al
RUN npm run build
RUN cp -R /front/build /app/views
WORKDIR /app
ADD myserver /app
RUN npm install
CMD ["npm", "start"]
EXPOSE 4242
