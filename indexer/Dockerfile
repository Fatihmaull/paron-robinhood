# Railway build. Set the service Root Directory to `indexer` so this file is the build context.
FROM node:24.21.0-bookworm-slim

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@12.9.1 --activate

# pnpm 12 reads allowBuilds only from pnpm-workspace.yaml. The package.json
# "pnpm" field is ignored, so esbuild's postinstall fails without this file.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

ENV PORT=42069
EXPOSE 42069

# `pnpm start` runs `ponder start` and binds $PORT (Railway injects PORT).
CMD ["pnpm", "start"]
