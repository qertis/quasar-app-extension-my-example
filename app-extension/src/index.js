/*
 * Quasar App Extension index/runner script
 * (runs on each dev/build)
 */

const extendConf = (conf) => {
    // register our boot file
    conf.boot.push('~quasar-app-extension-my-example/src/boot/register.js')

    // make sure app extension files & ui package gets transpiled
    conf.build.transpileDependencies.push(/quasar-app-extension-my-example[\\/]src/)

    // make sure the stylesheet goes through webpack to avoid SSR issues
    conf.css.push('~quasar-ui-my-example/src/index.scss')
}

module.exports = function (api) {
    // Quasar compatibility check; you may need
    // hard dependencies, as in a minimum version of the "quasar"
    // package or a minimum version of "@quasar/app-*" CLI
    api.compatibleWith('quasar', '2.x')

    if (api.hasWebpack) {
        api.compatibleWith('@quasar/app-webpack', '3.x')
    }

    api.extendQuasarConf(extendConf)
}
