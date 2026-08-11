FROM node:24-bookworm-slim

ENV NODE_ENV=production
WORKDIR /workspace

COPY backend/runtime/hr-live-service/package.json ./backend/runtime/hr-live-service/package.json
RUN cd backend/runtime/hr-live-service && npm install --omit=dev --ignore-scripts
COPY backend/runtime/hr-live-service/server.mjs ./backend/runtime/hr-live-service/server.mjs
COPY backend/runtime/hr-live-service/dev-visual.mjs ./backend/runtime/hr-live-service/dev-visual.mjs
COPY backend/runtime/hr-live-service/user-admin.mjs ./backend/runtime/hr-live-service/user-admin.mjs
COPY backend/contracts ./backend/contracts
COPY backend/config/tya-live-hr-tab-registry.source-safe.json ./backend/config/tya-live-hr-tab-registry.source-safe.json
COPY tools/hr-source ./tools/hr-source
COPY tools/qa/tya-live-hr-read-probe-gate.mjs ./tools/qa/tya-live-hr-read-probe-gate.mjs

USER node
EXPOSE 8080
CMD ["node", "backend/runtime/hr-live-service/server.mjs"]
