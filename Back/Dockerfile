FROM node:24

WORKDIR /app

RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package.json ./
COPY prisma ./prisma

RUN npm install
RUN npx prisma generate

COPY . .


EXPOSE 3000

CMD ["npm", "run", "dev"]
