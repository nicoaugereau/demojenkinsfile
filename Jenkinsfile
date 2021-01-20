#!groovy
node("docker") {
    properties([
        parameters([
            choice(name: 'Spec', choices: ['js', 'feature'], description: 'Types de tests à exécuter (Node JS ou Gherkin), par défaut sur js'),
            choice(name: 'Navigateur', choices: ['electron', 'chrome', 'firefox'], description: 'Navigateur sur lequel exécuter les tests, par défaut sur electron'),
            text(name: 'Test', defaultValue: '', description: 'Nom du test à exécuter (e2e/distributeur/test). Exemple : 2-e2e/maaf/adhesion-papier-complete.spec')
        ]),
        buildDiscarder(logRotator(artifactDaysToKeepStr: '', artifactNumToKeepStr: '', daysToKeepStr: '', numToKeepStr: '15')),
        //pipelineTriggers([cron('H 14 * * 1-5 ')])
    ])

    checkout scm

    docker.image("cypress/included:6.2.0")
        .inside("--entrypoint='' " +
                "-v $WORKSPACE/build/docker-volumes/npm-cache:/.npm " +
                "-v $WORKSPACE/build/docker-volumes/cypress-cache:/.cache " +
                "-e PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true " +
                "-e HOME=/tmp/home "
        ) {
            stage('Install') {
                timestamps {
                    ansiColor('xterm') {
                        sh 'mkdir -p $HOME'
                        sh "npm ci"
                        //sh "npm run cypress:verify"
                        sh 'export NODE_OPTIONS=–max_old_space_size=4096' // Pour éviter erreur JavaScript heap out of memory
                    }
                }
            }
            stage('Tests Cypress') {
                timestamps {
                    ansiColor('xterm') {
                        def testExitCode = sh script: "node ./cypress_runner.js -s ${params.Spec} -b ${params.Navigateur} --ci-build-id ${BUILD_NUMBER} ${params.Test}", returnStatus: true
                        if(testExitCode) {
                            currentBuild.result = 'UNSTABLE'
                        }
                    }
                }
            }
            junit testResults: '**/target/surefire-reports/**/*.xml', allowEmptyResults: true
        }
}