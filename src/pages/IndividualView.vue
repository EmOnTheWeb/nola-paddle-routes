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
      <v-container>
        <v-row>
          <v-col cols="9">
            <v-card-subtitle>Description</v-card-subtitle>
            <v-card-text>{{paddle.description}}</v-card-text>
            <v-card-subtitle>Difficulty</v-card-subtitle>
            <v-card-text>{{paddle.difficulty}}</v-card-text>
            <v-card-subtitle>Distance</v-card-subtitle>
            <v-card-text>{{paddle.distance}}</v-card-text>
          </v-col>
          <v-col cols="3">
            <v-img
              max-height="250"
              max-width="350"
              src="staticImgPath"
            ></v-img>
          </v-col>
        </v-row>
      </v-container>
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
    computed: {
      staticImgPath() {
        return "./assets/" + this.paddle.imgSrc;
      }
    },
    data: () => ({
      paddle: {
        id: 2,
        name: 'Bay St. Louis Loop',
        description: 'Loop paddle through some marsh and the ocean.',
        difficulty: 'Medium',
        distance: '10 miles',
        tags: [
          'Louisiana',
          'Easy'
        ],
        imgSrc: 'kayak_loop.jpeg'
      },
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
  .v-card__subtitle {
    font-weight:bold;
  }

</style>
