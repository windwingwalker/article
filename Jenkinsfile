pipeline{
  agent any
  environment {
    AWS_ACCESS_KEY_ID          = credentials('aws_access_key_id')
    AWS_SECRET_ACCESS_KEY      = credentials('aws_secret_access_key')
    AWS_ACCOUNT_ID             = credentials('aws_account_id')
    
    PROJECT_NAME               = "article"

    TF_VAR_project_name        = "${PROJECT_NAME}"
    TF_VAR_image_tag           = "${env.BUILD_NUMBER}"
    TF_VAR_aws_account_id      = "${AWS_ACCOUNT_ID}"
    TF_VAR_aws_region          = "us-east-1"

    HOME                       = "." //For npm install path
  }
  tools {
    terraform 'TerraformDefault'
  }
  options {
    ansiColor('xterm')
  }
  stages{
    // stage('Gather Files'){
    //   steps{
    //     sh "rsync -av model/ microservices/${MS_NAME}/model"
    //   }
    // }
    stage('Build Code'){
      agent {
        docker {
          image 'node:18-buster'
          reuseNode true
        }
      }
      steps{
        dir("dist/"){}
        sh 'npm install'
        sh 'npm run build'
        // stash includes: 'dist/**/*', name: 'distJs'
        sh 'ls -al'
      }
    }
    stage('Build Image'){
      steps{
        sh 'ls -al'
        // dir("microservices/${MS_NAME}/dist"){
        //   unstash 'distJs'
        // }
        script{
          image = docker.build("${AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/${PROJECT_NAME}:${TF_VAR_image_tag}")
        }
      }
    }
    stage('Provision pre-development infrastructure'){
      steps{
        sh 'ls'
      }
    }
    stage('Push Image'){
      steps{
        script{
          docker.withRegistry("https://${AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com", "ecr:us-east-1:aws_credentials") {
            image.push()
          }
        }
      }
    }
    // stage('Provision development infrastructure'){
    //   steps{
    //     dir("terraform/development"){
    //       sh 'terraform init -input=false'
    //       sh 'terraform plan -out=tfplan -input=false'
    //       sh 'terraform apply -input=false -auto-approve tfplan'
    //     }
    //     sh 'rm -rf dist/' 
    //   }
    // }
    // stage('Approve on promotion'){

    // }
    // stage('Provision production infrastructure'){
    //   steps{
    //     dir("terraform/productino"){
    //       sh 'terraform init -input=false'
    //       sh 'terraform plan -out=tfplan -input=false'
    //       sh 'terraform apply -input=false -auto-approve tfplan'
    //     }
    //     sh 'rm -rf dist/' 
    //   }
    // }
  }
}