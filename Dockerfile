FROM seancheung/alpinewine:wine

RUN apk add nodejs npm

WORKDIR /app

COPY "." "."

RUN npm ci

EXPOSE 8080

RUN chmod +x /app/entrypoint.sh
ENTRYPOINT ["/app/entrypoint.sh"]