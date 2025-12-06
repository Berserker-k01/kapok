# Dockerfile pour le serveur Node.js
FROM node:18-alpine

WORKDIR /app

# Installation des dépendances
COPY package*.json ./
RUN npm install --production

# Copie du code source
COPY . .

# Exposition du port
EXPOSE 5000

# Commande de démarrage
CMD ["npm", "start"]
