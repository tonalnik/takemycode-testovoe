FROM node:22-bookworm-slim

WORKDIR /app
ENV PORT=80

COPY . ./

RUN node -v && \
    npm -v && \
    npm i && \
    cd /app/backend && \
    npm i && \
    cd /app/frontend && \
    npm i && \
    cd /app && \
    npm run build:frontend && \
    npm run build:backend

CMD [ "npm", "run","start:backend" ]
