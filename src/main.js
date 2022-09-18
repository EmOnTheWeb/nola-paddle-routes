import Vue from 'vue'
import App from './App.vue'
import MainMap from './pages/MainMap.vue'
import IndividualView from './pages/IndividualView.vue'
import VueRouter from 'vue-router'
import vuetify from './plugins/vuetify'
import 'vuetify/dist/vuetify.min.css'

Vue.config.productionTip = false

const routes = [
  { path: '/', component: MainMap },
  { path: '/single-paddle-view/:name', component: IndividualView },
]

const router = new VueRouter({
  routes
});

Vue.use(VueRouter);

new Vue({
  vuetify,
  router,
  render: h => h(App)
}).$mount('#app')
