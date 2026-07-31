FROM node:24-bookworm-slim

ENV NODE_ENV=production
WORKDIR /workspace

COPY backend/runtime/hr-live-service/package.json ./backend/runtime/hr-live-service/package.json
COPY backend/runtime/hr-live-service/server.mjs ./backend/runtime/hr-live-service/server.mjs
COPY backend/runtime/hr-live-service/dev-visual.mjs ./backend/runtime/hr-live-service/dev-visual.mjs
COPY backend/contracts ./backend/contracts
COPY backend/config/tya-live-hr-tab-registry.source-safe.json ./backend/config/tya-live-hr-tab-registry.source-safe.json
COPY tools/hr-source ./tools/hr-source
COPY tools/qa/tya-live-hr-read-probe-gate.mjs ./tools/qa/tya-live-hr-read-probe-gate.mjs

USER node
EXPOSE 8080
CMD ["node", "backend/runtime/hr-live-service/server.mjs"]
