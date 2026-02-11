FROM node:24-bookworm-slim

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

COPY package.json pnpm-lock.yaml ./
COPY restaurant-marketplace ./restaurant-marketplace
RUN pnpm install --frozen-lockfile

COPY . .
RUN rm -rf .medusa && pnpm build

ENV NODE_ENV=production

CMD ["pnpm", "start"]
