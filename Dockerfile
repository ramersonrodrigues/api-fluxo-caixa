# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN node ace build

FROM base AS production
ENV NODE_ENV=production
COPY --from=build /app/build ./
RUN npm ci --omit=dev && npm cache clean --force && mkdir -p /app/tmp && chown -R node:node /app/tmp
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh && chmod +x /usr/local/bin/docker-entrypoint.sh
USER node
EXPOSE 3333
ENTRYPOINT ["docker-entrypoint.sh"]
