FROM public.ecr.aws/lambda/nodejs:14
# FROM node:14-buster

WORKDIR ${LAMBDA_TASK_ROOT}
COPY package*.json ./
COPY node_modules/ ./
# RUN npm install

COPY dist/ ./

CMD [ "remote-controller.lambdaHandler" ]
