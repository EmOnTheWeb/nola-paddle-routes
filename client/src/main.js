import Vue from 'vue'
import App from './App.vue'
import MainMap from './pages/MainMap.vue'
import IndividualView from './pages/IndividualView.vue'
import VueRouter from 'vue-router'
import vuetify from './plugins/vuetify'
import 'vuetify/dist/vuetify.min.css'
import linkify from 'vue-linkify'; 

Vue.config.productionTip = false

const routes = [
  { path: '/', component: MainMap },
  { path: '/single-paddle-view/:id/:name', component: IndividualView },
]

const router = new VueRouter({
  mode: 'history',
  routes
});

Vue.use(VueRouter);

Vue.directive('linkified', linkify);

new Vue({
  vuetify,
  router,
  render: h => h(App)
}).$mount('#app')
