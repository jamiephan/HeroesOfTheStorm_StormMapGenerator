FROM seancheung/alpinewine:wine

RUN apk add nodejs npm

WORKDIR /app

COPY "." "."

RUN npm ci

EXPOSE 8080
ENTRYPOINT ["/app/entrypoint.sh"]