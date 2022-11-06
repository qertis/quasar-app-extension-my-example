import {boot} from 'quasar/wrappers'
import VuePlugin from 'quasar-ui-my-example'

export default boot(({app}) => {
    app.use(VuePlugin)
})
