FROM node:alpine

RUN apk add curl

# RUN mkdir -p /home/node/openchirp
ADD src /home/node/openchirp/src
ADD config /home/node/openchirp/config
ADD bin /home/node/openchirp/bin
ADD package.json /home/node/openchirp
WORKDIR /home/node/openchirp
# install dependencies according to package.json
RUN npm install

# install dependencies according to package.json
# RUN npm install
ENV NODE_ENV=production
ENV PORT=7000
EXPOSE 7000


HEALTHCHECK CMD curl -f http://localhost:7000/api || exit 1
CMD [ "./bin/www" ]
