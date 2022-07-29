# FROM public.ecr.aws/lambda/nodejs:14

# WORKDIR ${LAMBDA_TASK_ROOT}

# COPY package*.json ./
# RUN ["npm", "install"]

# COPY src/ src/
# COPY tsconfig.json ./
# RUN ["npm", "run", "build"]

# # COPY dist/ ./

# CMD [ "dist/remote-controller.lambdaHandler" ]

FROM public.ecr.aws/lambda/nodejs:14

WORKDIR ${LAMBDA_TASK_ROOT}
COPY package*.json ./
COPY node_modules/ ./
# RUN npm install

COPY dist/ ./

CMD [ "remote-controller.lambdaHandler" ]
