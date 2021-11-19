FROM node:10
ENV DOCKERIZE_VERSION v0.6.1
RUN apt-get update
RUN apt-get install wget
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && rm dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz
RUN mkdir -p /app
WORKDIR /app
ADD myserver /app
RUN npm install
# RUN dockerize -wait tcp://postgres:5432 -timeout 60s
CMD ["npm", "start"]
EXPOSE 4242
