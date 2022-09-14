FROM --platform=linux/amd64 seancheung/alpinewine:wine
RUN apk add --update nodejs nodejs-npm
WORKDIR /app
COPY "." "."

RUN npm config set unsafe-perm true && \
    npm ci && \
    npm run build && \
    rm -rf client

EXPOSE 8080

RUN chmod +x /app/entrypoint.sh
ENTRYPOINT ["/app/entrypoint.sh"]