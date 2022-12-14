process.env.NODE_ENV = 'production'

const parallel = require('os').cpus().length > 1
const runJob = parallel ? require('child_process').fork : require
const {join} = require('path')
const {createFolder} = require('./utils')
require('./script.app-ext.js').syncAppExt()
require('./script.clean.js')

console.log(` 📦 Building ${('v' + require('../package.json').version)}...${parallel ? (' [multi-threaded]') : ''}\n`)

createFolder('dist')

runJob(join(__dirname, './script.javascript.js'))
runJob(join(__dirname, './script.css.js'))
