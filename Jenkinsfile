#!groovy
    node("docker") {
        properties([
            parameters([
                choice(name: 'Spec', choices: ['js', 'feature'], description: 'Types de tests à exécuter (Node JS ou Gherkin), par défaut sur js'),
                choice(name: 'Navigateur', choices: ['electron', 'chrome', 'firefox', 'edge'], description: 'Navigateur sur lequel exécuter les tests, par défaut sur electron'),
                text(name: 'Test', defaultValue: '', description: 'Nom du test à exécuter (e2e/distributeur/test). Exemple : 2-e2e/maaf/adhesion-papier-complete.spec')
            ]),
            buildDiscarder(logRotator(artifactDaysToKeepStr: '', artifactNumToKeepStr: '', daysToKeepStr: '', numToKeepStr: '15')),
            pipelineTriggers([cron('H 8,14 * * 1-5 ')])
        ])

        checkout scm

        // Pour tester en local, lancer à la racine du projet :
        /* docker run -it -u $(id --user):$(id --group) \
               -v $(pwd)/build/docker-volumes/npm-cache:/.npm \
               -v $(pwd)/build/docker-volumes/cypress-cache:/.cache \
               -v $(pwd):/sesame-tests-local \
               -w /sesame-tests-local \
               -v $(pwd)/build/docker-volumes/home:/home/node/ \
               -e 'DEBUG=cypress:*' \
               cypress/base:14.10.1 \
               /bin/bash
        */
        docker.image("cypress/included:6.2.0")
            .inside("-v $WORKSPACE/build/docker-volumes/npm-cache:/.npm " +
                    "-v $WORKSPACE/build/docker-volumes/cypress-cache:/.cache " +
                    "-e PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true " +
                    "-e HOME=/tmp/home " // Pour l'installation de cypress, ne fonctionne pas sur jenkins avec un volume sur /home/node
            ) {
                stage('Install') {
                    timestamps {
                        ansiColor('xterm') {
                            sh 'rm -Rf reports/ || true' // Suppression des rapports de tests précédents
                            sh 'mkdir -p $HOME'
                            sh "npm ci"
                            sh "npm run cypress:verify"
                            sh 'export NODE_OPTIONS=–max_old_space_size=4096' // Pour éviter erreur JavaScript heap out of memory
                        }
                    }
                }
                stage('Tests Cypress') {
                    timestamps {
                        ansiColor('xterm') {
                            //def testExitCode = sh script: "npm run cypress:${params.Environnement}", returnStatus: true
                            //def testExitCode = sh script: "npm run cypress:test ${params.Environnement} ${params.Spec} ${params.Navigateur} ${params.Test}", returnStatus: true
                            def testExitCode = sh script: "node ./cypress_runner.js -s ${params.Spec} -b ${params.Navigateur} --ci-build-id ${BUILD_NUMBER} ${params.Test}", returnStatus: true
                            if(testExitCode) {
                                currentBuild.result = 'UNSTABLE'
                            }
                        }
                    }
                }
            }
    }