# Multipart build dockerfile to build and serve datagateway

FROM node:16-alpine as build
WORKDIR /datagateway
ENV PATH /datagateway/node_modules/.bin:$PATH

# TODO: use yarn install --production:
# https://github.com/ral-facilities/datagateway/issues/1155

# Install dependancies
COPY . .
RUN yarn install
RUN yarn build

# Put the output of the build into an apache server
FROM httpd:alpine
WORKDIR /usr/local/apache2/htdocs
COPY --from=build /datagateway/packages/ .
# example url: http://localhost:8080/datagateway-dataview/build/main.js

# Define virtual hosts so that the plugins can be deployed on different ports
WORKDIR /usr/local/apache2/conf
RUN sed -i '/Listen 80$/a\
\Listen 5001\n\
\Listen 5002\n\
\Listen 5003\n\
\n\
\<VirtualHost *:5001>\n\
\    DocumentRoot "/usr/local/apache2/htdocs/datagateway-dataview/build"\n\
\</VirtualHost>\n\
\n\
\<VirtualHost *:5002>\n\
\    DocumentRoot "/usr/local/apache2/htdocs/datagateway-download/build"\n\
\</VirtualHost>\n\
\n\
\<VirtualHost *:5003>\n\
\    DocumentRoot "/usr/local/apache2/htdocs/datagateway-search/build"\n\
\</VirtualHost>' httpd.conf
