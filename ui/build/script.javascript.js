const path = require('path')
const rollup = require('rollup')
const uglify = require('uglify-js')
const buble = require('@rollup/plugin-buble')
const json = require('@rollup/plugin-json')
const {nodeResolve} = require('@rollup/plugin-node-resolve')
const replace = require('@rollup/plugin-replace')
const css = require('rollup-plugin-css-only')
const vue = require('rollup-plugin-vue')
const {version} = require('../package.json')
const buildConf = require('./config')
const buildUtils = require('./utils')

const pathResolve = (_path) => path.resolve(__dirname, _path)

const rollupPlugins = [
    replace({
        preventAssignment: false,
        values: {
            __UI_VERSION__: `'${version}'`
        }
    }),
    nodeResolve({
        extensions: ['.js'],
        preferBuiltins: false
    }),
    css(),
    vue({css: false}),
    json(),
    buble({
        objectAssign: 'Object.assign'
    })
]

const builds = [
    {
        rollup: {
            input: {
                input: pathResolve('../src/index.js')
            },
            output: {
                file: pathResolve('../dist/index.js'),
                format: 'es'
            }
        },
        build: {
            minified: true
        }
    },
]

const build = (builds) => Promise
    .all(builds.map(genConfig).map(buildEntry))
    .catch(buildUtils.logError)

function genConfig(opts) {
    Object.assign(opts.rollup.input, {
        plugins: rollupPlugins,
        external: ['vue', 'quasar']
    })

    Object.assign(opts.rollup.output, {
        banner: buildConf.banner,
        globals: {vue: 'Vue', quasar: 'Quasar'}
    })

    return opts
}

function addExtension(filename, ext = 'min') {
    const insertionPoint = filename.lastIndexOf('.')
    return `${filename.slice(0, insertionPoint)}.${ext}${filename.slice(insertionPoint)}`
}

function buildEntry(config) {
    return rollup
        .rollup(config.rollup.input)
        .then(bundle => bundle.generate(config.rollup.output))
        .then(({output}) => {
            const code = config.rollup.output.format === 'umd'
                ? injectVueRequirement(output[0].code)
                : output[0].code

            return config.build.unminified
                ? buildUtils.writeFile(config.rollup.output.file, code)
                : code
        })
        .then(code => {
            if (!config.build.minified) {
                return code
            }

            const minified = uglify.minify(code, {
                compress: {
                    pure_funcs: ['makeMap']
                }
            })

            if (minified.error) {
                return Promise.reject(minified.error)
            }

            return buildUtils.writeFile(
                config.build.minExt === true
                    ? addExtension(config.rollup.output.file)
                    : config.rollup.output.file,
                buildConf.banner + minified.code,
                true
            )
        })
        .catch(err => {
            console.error(err)
            process.exit(1)
        })
}

function injectVueRequirement(code) {
    // eslint-disable-next-line
    const index = code.indexOf(`Vue = Vue && Vue.hasOwnProperty('default') ? Vue['default'] : Vue`)

    if (index === -1) {
        return code
    }

    const checkMe = ` if (Vue === void 0) {
      console.error('[ Quasar ] Vue is required to run. Please add a script tag for it before loading Quasar.')
      return
    }`

    return code.substring(0, index - 1) +
        checkMe +
        code.substring(index)
}

build(builds)