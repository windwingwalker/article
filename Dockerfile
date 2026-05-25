FROM public.ecr.aws/lambda/nodejs:24

WORKDIR ${LAMBDA_TASK_ROOT}
COPY package*.json ./
COPY node_modules/ ./
# RUN npm install

COPY dist/ ./

CMD [ "src/controller.lambdaHandler" ]
