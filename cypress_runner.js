/** 
 * Cypress runner
 * 
 * Command : npm run cypress <env> <spec> <browser> [option: test]
 * 
 * https://medium.com/cypress-io-thailand/generate-a-beautiful-test-report-from-running-tests-on-cypress-io-371c00d7865a
 */
const v8 = require('v8');
const totalHeapSize = v8.getHeapStatistics().total_available_size;
const totalHeapSizeGb = (totalHeapSize / 1024 / 1024 / 1024).toFixed(2);
console.log('totalHeapSizeGb: ', totalHeapSizeGb);

const cypress = require('cypress')
const yargs = require('yargs')
const devices = require('./config/devices.json')
const argv = yargs.scriptName("cypress_runner")
.usage("Usage: $0 -e [environnement] -b [browser] -d [device] -o [orientation] -s [spec]")
.example(
"npm run cypress -e r1 -b chrome -s js 2-e2e/maaf/adhesion-papier-2a-3p-obtention-decision.spec")
.options({
    'browser': {
        alias: 'b',
        describe: 'choisir le navigateur',
        default: 'electron',
        choices: ['chrome', 'electron', 'firefox', 'edge']
    },
    'device': {
        alias: 'd',
        describe: 'résolution écran souhaitée pour les tests',
        type: 'string'
    },
    'orientation': {
        alias: 'o',
        describe: 'orientation affichage écran : défaut, portrait ou paysage',
        default: 'défaut',
        choices: ['défaut','portrait', 'paysage']
    },
    'spec': {
        alias: 's',
        describe: 'format des tests exécutés',
        default: 'js',
        choices: ['js', 'feature']
    }
}).help()
  .argv


const specs = argv._ != '' ? 'cypress/integration/' + argv._ + '.' + argv.spec : 'cypress/integration/**/*.' + argv.spec

let configOptions
let device = devices.sizes.hasOwnProperty(argv.device)
 // add custom folder for mobile testing: integrationFolder: "cypress/integration/mobile"
device = (device == true
    ? argv.orientation != ''
        ?  argv.orientation == 'paysage'
            ? configOptions = {
                userAgent: devices.sizes[argv.device].useragent,
                viewportWidth: devices.sizes[argv.device].viewportWidth,
                viewportHeight: devices.sizes[argv.device].viewportHeight
            }
            : argv.orientation == 'portrait' 
            ? configOptions = {
                userAgent: devices.sizes[argv.device].useragent,
                viewportWidth: devices.sizes[argv.device].viewportHeight,
                viewportHeight: devices.sizes[argv.device].viewportWidth
            }
            : configOptions = {
                userAgent: devices.sizes[argv.device].useragent,
                viewportWidth: devices.sizes[argv.device].viewportWidth,
                viewportHeight: devices.sizes[argv.device].viewportHeight
            }
        : configOptions = {
            // si viewport trouvé mais sans mode, mode par défaut du device
            userAgent: devices.sizes[argv.device].useragent,
            viewportWidth: devices.sizes[argv.device].viewportWidth,
            viewportHeight: devices.sizes[argv.device].viewportHeight
        }
    : configOptions = {
        // si viewport non trouvé ou non renseigné, mode par défaut
        viewportWidth: 1280,
        viewportHeight: 720
    }
)
console.log(configOptions)

cypress.run({
    browser: argv.browser,
    spec: specs,
    config: configOptions
}).catch((error) => {
    console.error('errors: ', error)
    process.exit(1)
})