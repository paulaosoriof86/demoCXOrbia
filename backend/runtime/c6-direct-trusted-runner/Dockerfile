FROM node:24-bookworm-slim

ENV NODE_ENV=production
WORKDIR /workspace

COPY backend/runtime/c6-direct-trusted-runner/package.json ./backend/runtime/c6-direct-trusted-runner/package.json
COPY backend/runtime/c6-direct-trusted-runner/server.mjs ./backend/runtime/c6-direct-trusted-runner/server.mjs

USER node
EXPOSE 8080
CMD ["node", "backend/runtime/c6-direct-trusted-runner/server.mjs"]
