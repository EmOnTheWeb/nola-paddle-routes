import Vue from 'vue';
import Vuetify from 'vuetify';

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    options: { customProperties: true },
    themes: {
      light: {
        primary: '#334E58',
        secondary: '#114B5F', 
        accent: '#A54657',
        warning: '#A54657'
      },
    },
  },
});
