# Compile oc utility
FROM golang:alpine AS buildoc
RUN apk add --no-cache git
RUN go get -v github.com/openchirp/oc

FROM node:alpine

# Add the oc utility and the locahost occonfig.toml
COPY --from=buildoc /go/bin/oc /usr/local/bin
ENV FRAMEWORK_SERVER="http://localhost:7000"

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


HEALTHCHECK CMD oc check -e || exit 1
CMD [ "./bin/www" ]
