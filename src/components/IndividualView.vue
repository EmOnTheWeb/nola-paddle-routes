<template>
  <v-dialog
    v-model="show"
    transition="fade-transition"
    fullscreen
  >
    <v-card>
      <v-card-title>
        {{initialData.name}}

          <v-icon
            right
            dark
            color="warning"
            @click="closeIndividualView()"
            >
            mdi-close-thick
          </v-icon>

      </v-card-title>

    </v-card>
  </v-dialog>
</template>

<script>
  export default {
    name: 'IndividualView',
    props: {
      initialData: Object,
      show: Boolean
    },
    methods: {
      closeIndividualView() {
        this.$emit("close");
      }
    },
    data: () => ({
      ecosystem: [
        {
          text: 'vuetify-loader',
          href: 'https://github.com/vuetifyjs/vuetify-loader',
        },
        {
          text: 'github',
          href: 'https://github.com/vuetifyjs/vuetify',
        },
        {
          text: 'awesome-vuetify',
          href: 'https://github.com/vuetifyjs/awesome-vuetify',
        },
      ],
      importantLinks: [
        {
          text: 'Documentation',
          href: 'https://vuetifyjs.com',
        },
        {
          text: 'Chat',
          href: 'https://community.vuetifyjs.com',
        },
        {
          text: 'Made with Vuetify',
          href: 'https://madewithvuejs.com/vuetify',
        },
        {
          text: 'Twitter',
          href: 'https://twitter.com/vuetifyjs',
        },
        {
          text: 'Articles',
          href: 'https://medium.com/vuetify',
        },
      ],
      whatsNext: [
        {
          text: 'Explore components',
          href: 'https://vuetifyjs.com/components/api-explorer',
        },
        {
          text: 'Select a layout',
          href: 'https://vuetifyjs.com/getting-started/pre-made-layouts',
        },
        {
          text: 'Frequently Asked Questions',
          href: 'https://vuetifyjs.com/getting-started/frequently-asked-questions',
        },
      ],
    }),
  }
</script>

<style lang="scss" scoped>
  .v-card__title {
    display: flex;
    justify-content: center;
    .v-icon {
      position:absolute;
      right:20px;
    }
  }

</style>
