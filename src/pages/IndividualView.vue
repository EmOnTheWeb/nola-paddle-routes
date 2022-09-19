<template>
  <v-main class="grey lighten-3">
    <v-container>
      <div class="map-container" v-show="routeMapExpanded">
        <div id="map"></div>
        <v-icon
          dark
          class="toggle-mapsize-icon"
          @click="collapseRouteMap()"
          >
          mdi-arrow-expand
        </v-icon>
      </div>
      <div>
        <v-toolbar flat><h2>{{paddle.name}}</h2></v-toolbar>
        <v-row>
          <v-col cols="8" :style="routeMapExpanded ? 'width:100%!important' : ''">
            <h3>Description</h3>
            <p>{{paddle.description}}</p>
            <h3>Difficulty</h3>
            <p>{{paddle.difficulty}}</p>
            <h3>Distance</h3>
            <p>{{paddle.distance}}</p>
            <v-chip v-for="(tag) in paddle.tags" color="primary">
              {{tag}}
            </v-chip>
          </v-col>
          <v-col cols="4" v-show="!routeMapExpanded">
            <div class="image-container">
              <v-img
                height="300"
                :src="require(`@/dummy/${paddle.imgSrc}`)"
              ></v-img>
              <v-icon
                dark
                class="toggle-mapsize-icon"
                @click="expandRouteMap()"
                >
                mdi-arrow-expand
              </v-icon>
            </div>
          </v-col>
        </v-row>
      </div>
    </v-container>
  </v-main>
</template>

<script>

  import {MainMap} from '../utils/mainMap';

  export default {
    name: 'IndividualView',
    props: {
      initialData: Object,
      show: Boolean
    },
    methods: {
      collapseRouteMap() {
        this.routeMapExpanded = false;         
      },
      expandRouteMap() {
        this.routeMapExpanded = true;

        if (!this.mapIsLoaded) {
          this.$nextTick(() => {
            this.initMapAndDrawRoute();
          });

          this.mapIsLoaded = true;
        }
      },
      async initMapAndDrawRoute() {
        this.routeMap = new MainMap();
        await this.routeMap.initMap();
      }
    },
    computed: {

    },
    data: () => ({
      routeMap: null,
      routeMapExpanded: false,
      mapIsLoaded: false,
      paddle: {
        id: 4,
        name: 'Abita river out and back',
        description: 'Peaceful paddle down a winding river free from motorized boats. But then you encounter progressively worse blowdowns until its time to turn back, unless you want to do battle with branches',
        difficulty: 'Medium',
        distance: '6.5 miles',
        tags: [
          'Louisiana',
          'Medium Difficulty'
        ],
        imgSrc: 'kayak_loop.jpeg'
      }
    }),
  }
</script>

<style scoped>
  .map-container {
    width:100%;
    padding-top:50%;
    position:relative;
  }
  #map {
    position:absolute;
    top:0;
    right:0;
    left:0;
    bottom:0;
  }
  @media (min-width: 1264px) {
    .container {
        max-width: 1024px;
    }
  }
  .container {
    background-color:#fff;
    min-height:100vh;
  }
  /deep/ .v-toolbar__content {
    justify-content: center;
  }
  .v-chip {
    margin-right:10px;
  }
  .image-container {
    position:relative;
  }
  .image-container .v-icon {
    position: absolute;
    bottom: 5px;
    left: 5px;
  }
  .toggle-mapsize-icon {
    background-color:#1976d2!important;
    cursor:pointer;
  }
  .map-container .v-icon {
    position:absolute;
    top: 5px;
    right:5px;
  }
</style>
