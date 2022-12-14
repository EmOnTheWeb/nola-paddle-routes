<template>
  <v-main class="grey lighten-3">
    <v-container>
      <div class="map-container" v-show="routeMapExpanded">
        <div class="btn-container">
          <v-btn color="primary" depressed
            @click="generateAndExportGPXFile()">
            Export Route
            <v-icon dark>
            mdi-file-export-outline
            </v-icon>
          </v-btn>
          <v-btn color="primary" depressed
            @click="showRouteMapPrintDialog()">
            Print Route Map
            <v-icon dark>
            mdi-printer
            </v-icon>
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

      <v-toolbar flat>
        <v-btn @click="goBack()" class="btn-back px-1 px-sm-4" depressed text-color="secondary" min-width="20">
          <v-icon dark left>mdi-arrow-left</v-icon><span class="d-none d-sm-inline">Back to Map</span>
        </v-btn>
        <h2>{{paddle.name}}</h2>
      </v-toolbar>
      <v-row>
        <v-col cols="12" sm="8" :style="routeMapExpanded ? 'width:100%!important' : ''">
          <h3>Description</h3>
          <p>{{paddle.description}}</p>
          <h3>Difficulty</h3>
          <p>{{paddle.difficulty}}</p>
          <h3>Distance</h3>
          <p>{{paddle.distance}}</p>
          <p><a target="_blank" :href="drivingDirectionsHref">Driving Directions</a></p>
          <div class="tags">
            <v-chip
              v-for="(tag,index) in paddle.tags"
              :key="index"
            >
              {{tag}}
            </v-chip>
          </div>
        </v-col>
        <v-col cols="12" sm="4" v-show="!routeMapExpanded">
          <div class="image-container">
            <v-img
              :src="require(`@/dummy/${paddle.imgSrc}`)"
            ></v-img>
            <v-icon
              dark
              class="toggle-mapsize-icon d-none d-sm-inline"
              @click="expandRouteMap()"
              >
              mdi-arrow-expand
            </v-icon>
          </div>
          <a class="small-map" @click="generateAndExportGPXFile()">Export Route
            <v-icon color="primary">
            mdi-file-export-outline
            </v-icon>
          </a>
          <a class="small-map" @click="showRouteMapPrintDialog()">Print Route Map
            <v-icon color="primary">
            mdi-printer
            </v-icon>
          </a>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols=12>
          <v-tabs>
            <v-tab>Comments</v-tab>
            <v-tab>Photos</v-tab>
          </v-tabs>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script>

  import {MainMap} from '../utils/mainMap';
  import {generateStaticMap} from '../utils/generateStaticMap';
  import geoJson from '../dummy/track.json';

  export default {
    name: 'IndividualViewOld',
    props: {
      paddle: Object,
      show: Boolean
    },
    mounted() {
      console.log(this.paddle);
    },
    methods: {
      goBack() {
        this.routeMapExpanded = false;
        this.$emit('back',true);
      },
      generateAndExportGPXFile() {

        let result = '<gpx xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd" version="1.1" creator="runtracker"><metadata/><trk><name></name><desc></desc>';
        result += '<trkseg>';
        let coords = geoJson.features[0].geometry.coordinates;
        result += coords.reduce((accum,curr) => {
          let ptTag = `<trkpt lat="${curr[1]}" lon="${curr[0]}"></trkpt>`;
          return accum += ptTag;
        }, '');
        result += '</trkseg>'
        result += '</trk></gpx>';

        const url = 'data:text/json;charset=utf-8,' + result;
        const link = document.createElement('a');
        link.download = `${this.$route.params.name}.gpx`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        link.remove();
      },
      showRouteMapPrintDialog() {
        let popup;
        function closePrint () {
            if ( popup ) {
                popup.close();
            }
        }

        popup = window.open( '/img/route.5d4a6144.png' );
        popup.onbeforeunload = closePrint;
        popup.onafterprint = closePrint;
        popup.focus(); // Required for IE
        popup.print();
      },
      collapseRouteMap() {
        this.routeMapExpanded = false;
      },
      expandRouteMap() {
        this.routeMapExpanded = true;
      },
    },
    computed: {
      drivingDirectionsHref() {
        return 'https://www.google.com/maps/dir/?api=1&destination=' + this.paddle.launch.coordinates.lat + ',' + this.paddle.launch.coordinates.long;
      },
    },
    data: () => ({
      routeMap: null,
      routeMapExpanded: false,
      mapIsLoaded: false,
      // paddle: {
      //   id: 4,
      //   name: 'Abita river out and back',
      //   description: 'Peaceful paddle down a winding river free from motorized boats. But then you encounter progressively worse blowdowns until its time to turn back, unless you want to do battle with branches',
      //   difficulty: 'Medium',
      //   distance: '6.5 miles',
      //   launch: {
      //     notes:'Put in from the grass to the side of the concrete ramp',
      //     coordinates:{ long:-90.10481683, lat:30.45592972 }
      //   },
      //   tags: [
      //     'Louisiana',
      //     'Medium Difficulty'
      //   ],
      //   imgSrc: 'route.png'
      // }
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
    font-size:14px;
  }
  a.small-map .v-icon {
    font-size:20px;
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
  div.tags {
    margin-top:25px;
  }
  .btn-back {
    position:absolute;
    left:5px;
    top: 50%;
    transform: translate(0,-50%);
  }
</style>
