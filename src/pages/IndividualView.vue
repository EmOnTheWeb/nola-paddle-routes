<template>
  <v-main class="grey lighten-3">
    <v-container>
      <div class="map-container" v-show="routeMapExpanded">
        <div class="btn-container">
          <v-btn color="primary" depressed>
            <a>
              Export Route
              <v-icon dark>
              mdi-file-export-outline
              </v-icon>
            </a>
          </v-btn>
          <v-btn color="primary" depressed>
            <a>
              Print Route Map
              <v-icon dark>
              mdi-printer
              </v-icon>
            </a>
          </v-btn>
        </div>
        <v-icon
          dark
          class="toggle-mapsize-icon"
          @click="collapseRouteMap()"
          >
          mdi-arrow-expand
        </v-icon>
        <v-img
          :src="require(`@/dummy/${paddle.imgSrc}`)"
        ></v-img>
      </div>

      <v-toolbar flat><h2>{{paddle.name}}</h2></v-toolbar>
      <v-row>
        <v-col cols="8" :style="routeMapExpanded ? 'width:100%!important' : ''">
          <h3>Description</h3>
          <p>{{paddle.description}}</p>
          <h3>Difficulty</h3>
          <p>{{paddle.difficulty}}</p>
          <h3>Distance</h3>
          <p>{{paddle.distance}}</p>
          <v-chip
            v-for="(tag,index) in paddle.tags"
            :key="index"
          >
            {{tag}}
          </v-chip>
        </v-col>
        <v-col cols="4" v-show="!routeMapExpanded">
          <div class="image-container">
            <v-img
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
          <a class="small-map">Export Route
            <v-icon color="primary">
            mdi-file-export-outline
            </v-icon>
          </a>
          <a class="small-map">Print Route Map
            <v-icon color="primary">
            mdi-printer
            </v-icon>
          </a>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script>

  import {MainMap} from '../utils/mainMap';
  import {generateStaticMap} from '../utils/generateStaticMap';

  export default {
    name: 'IndividualView',
    props: {
      initialData: Object,
      show: Boolean
    },
    mounted() {
      generateStaticMap();

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
        imgSrc: 'route.png'
      }
    }),
  }
</script>

<style scoped>
  .map-container {
    position:relative;
    margin-bottom:30px;
  }
  .map-container .v-image {
    width:100%;
  }
  a.small-map {
    display:block;
    margin:2.5px 0px;
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
    margin-bottom:10px;
  }
  .image-container .v-icon {
    position: absolute;
    top: 5px;
    right: 5px;
  }
  .toggle-mapsize-icon {
    background-color:#1976d2!important;
    cursor:pointer;
  }
  .map-container .toggle-mapsize-icon {
    position:absolute;
    top: 5px;
    right:5px;
    z-index:5;
  }
  .map-container .btn-container {
    display: inline-block;
    position: absolute;
    z-index: 5;
    left: 5px;
    top: 5px;
  }
  .map-container .btn-container button {
      margin-right:5px;
  }
  .map-container .btn-container button a {
    background:transparent;
    color:#fff; 
  }
</style>
