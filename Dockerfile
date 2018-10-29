FROM node:9.11.2

#Creates an app dir on the node image
WORKDIR usr/src/app

#Install dependencies from json spec
COPY package*.json ./
RUN npm install

#Copy src from working directory
COPY . .

#May need to expose a port here
#EXPOSE 3000

CMD ["npm", "start"]
