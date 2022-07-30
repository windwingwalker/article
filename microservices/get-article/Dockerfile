FROM public.ecr.aws/lambda/nodejs:14
# FROM node:14-buster

WORKDIR ${LAMBDA_TASK_ROOT}
COPY package*.json ./
COPY node_modules/ ./
# RUN npm install

COPY dist/ ./

CMD [ "microservices/get-article/src/remote-controller.lambdaHandler" ]
