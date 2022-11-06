import Component from './components/MyComponent.vue'

const version = __UI_VERSION__

function install(app) {
    app.component("my-component", Component)
}

export {
    version,
    Component,
    install,
}
