FROM node:10
RUN mkdir -p /app
WORKDIR /app
ADD myserver /app
RUN npm install
CMD ["npm", "start"]
EXPOSE 4242
