pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'your-registry.com'
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        NODE_VERSION = '20'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Backend Tests') {
            agent {
                docker {
                    image "node:${NODE_VERSION}-alpine"
                    args '-v /var/run/docker.sock:/var/run/docker.sock'
                }
            }
            steps {
                dir('backend') {
                    sh 'npm ci'
                    sh 'npx prisma generate'
                    sh 'npm run lint || true'
                    sh 'npm test'
                }
            }
            post {
                always {
                    publishTestResults testResultsPattern: 'backend/coverage/**/*.xml'
                    publishCoverage adapters: [coberturaAdapter('backend/coverage/cobertura-coverage.xml')]
                }
            }
        }
        
        stage('Frontend Tests') {
            agent {
                docker {
                    image "node:${NODE_VERSION}-alpine"
                }
            }
            steps {
                dir('frontend') {
                    sh 'npm ci'
                    sh 'npm run build -- --mode test || true'
                }
            }
        }
        
        stage('Build Backend Image') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                script {
                    def backendImage = docker.build("${DOCKER_REGISTRY}/backend:${IMAGE_TAG}", "--file backend/Dockerfile backend/")
                    backendImage.push()
                    backendImage.push("${DOCKER_REGISTRY}/backend:latest")
                }
            }
        }
        
        stage('Build Frontend Image') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                script {
                    def frontendImage = docker.build("${DOCKER_REGISTRY}/frontend:${IMAGE_TAG}", "--file frontend/Dockerfile frontend/")
                    frontendImage.push()
                    frontendImage.push("${DOCKER_REGISTRY}/frontend:latest")
                }
            }
        }
        
        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                script {
                    sshagent(credentials: ['staging-ssh-credentials']) {
                        sh """
                            ssh user@staging-server << 'EOF'
                                cd /path/to/app
                                docker-compose pull
                                docker-compose up -d
                                docker-compose ps
                            EOF
                        """
                    }
                }
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                input message: 'Deploy to Production?', ok: 'Deploy'
                script {
                    sshagent(credentials: ['production-ssh-credentials']) {
                        sh """
                            ssh user@production-server << 'EOF'
                                cd /path/to/app
                                docker-compose pull
                                docker-compose up -d
                                docker-compose ps
                            EOF
                        """
                    }
                }
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline succeeded!'
        }
        failure {
            echo 'Pipeline failed!'
        }
        always {
            cleanWs()
        }
    }
}

