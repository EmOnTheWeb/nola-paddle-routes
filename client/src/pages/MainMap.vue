<template>
  <div>
    <v-dialog :fullscreen="true" v-model="showIndividualView">
      <individual-view @back="showIndividualView = false"></individual-view>
    </v-dialog>
    <v-app-bar
      app
      color="white"
      flat
    >
      <v-container fluid class="pa-0 fill-height">
        <!--<v-col cols="2" class="d-none d-sm-flex">
        </v-col>-->
        <v-col cols="12" >
          <v-row class="toolbar-row">
            <v-autocomplete
              v-model="select"
              @change="hideShowMarkers()"
              :items="items"
              item-text="name"
              item-value="location"
              cache-items
              class="mr-2 mb-0 mr-sm-2"
              flat
              hide-no-data
              hide-details
              label="Location"
              solo-inverted
              min-height="28"
            >
              <template v-slot:selection="data">
                {{data.item.name}}, {{data.item.adminCode}}
              </template>
              <template v-slot:item="data">
                  {{ data.item.name }}, {{ data.item.adminCode }}
              </template>
            </v-autocomplete>
            <v-btn
              outlined
              small
              color="primary"
              @click="useCurrentLocation()"
            >
              <span class="d-none d-sm-inline">use my location</span>
              <v-icon
                right
                dark
                v-show="!isGettingLocation"
                >
                mdi-crosshairs-gps
              </v-icon>
              <v-progress-circular
                 v-show="isGettingLocation"
                 indeterminate
                 size="18"
                 width="2"
                 style="margin-left:8px;"
               ></v-progress-circular>
            </v-btn>
          </v-row>
          <v-row class="toolbar-row">
              <span style="font-size:0.85rem; width:200px;">
                Show results within <span style="font-size:1.25rem;">{{resultsWithinDistance}}</span> miles
              </span>

              <v-slider
               v-model="resultsWithinDistance"
               step="10"
               ticks
               tick-size="4"
                max="500"
                min="0"
                @input="hideShowMarkers"
              ></v-slider>
          </v-row>
        </v-col>

      </v-container>
    </v-app-bar>

    <v-main class="grey lighten-3 main-map">
      <v-container fluid>
        <v-row>
          <v-col cols="2" class="d-none d-sm-block pr-0 pl-0 pt-0 pb-0">
            <v-sheet class="pt-1" style="height:100%;">
              <v-list color="transparent">
                <v-list-item class="mb-1">
                  <v-checkbox dense hide-details
                    v-model="aPaddleRouteIsShowing"
                    color="orange darken-3"
                    :disabled="!aPaddleRouteIsShowing"
                    @click="hideAllRoutes()"
                  ></v-checkbox>
                  <h4>Paddles</h4>
                  <!-- <v-icon
                    color="primary">
                    mdi-close-box-outline
                  </v-icon> -->
                </v-list-item>
                <v-list-item
                  v-for="(paddle, index) in filteredPaddles"
                  :key="index"
                  link
                  min-height="0"
                  @click="togglePaddleRoute(paddle)"
                  :class="paddleRoutesShowing[paddle.id] ? 'route-showing':''"
                >
                  <v-checkbox
                    v-model="paddleRoutesShowing[paddle.id]"
                    dense
                    hide-details
                    color="orange darken-3"
                    style="pointer-events:none;"
                  >
                  </v-checkbox>
                  <v-list-item-content>
                    <v-list-item-title>
                      {{ paddle.name }}
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-sheet>
          </v-col>
          <v-col cols="12" sm="10" class="pr-0 pl-0 pt-0 pb-0">
            <v-sheet
              height="calc(100vh - 72px)"
              rounded="lg"
              style="position:relative;"
            >
              <v-progress-circular
                 v-if="!mapMarkersAdded"
                 indeterminate
                 color="warning"
                 class="map-loading-spinner"
              ></v-progress-circular>
              <div id="map"></div>
              <v-btn class="center-on-location" small depressed
                @click="resetMap()">
                <v-icon
                  dark
                  color="primary">
                  mdi-restart
                </v-icon>
              </v-btn>
            </v-sheet>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </div>
</template>

<script>
  import {MainMap} from '../utils/mainMap';
  import {LouisianaTowns} from '../assets/louisianaTowns.js';
  import IndividualView from '../pages/IndividualView.vue';
  import NODE_API from '../utils/api';
  import Vue from 'vue';

  export default {
    components: {
      IndividualView,
    },
    created() {

      NODE_API.get('/getMapPins').then(response => {
        this.paddles = response.data;
      })
      .catch(error => {
        console.log(error);
      });
    },
    async mounted() {

      try {
        this.mainMap = new MainMap();
        await this.mainMap.initMap();
      } catch (error) {
        console.error(error);
      } finally {
        this.componentHasMounted = true;
      }
    },
    methods: {
      hideAllRoutes() {
        this.paddleRoutesShowing = {};
      },
      togglePaddleRoute(paddle) {
        if(!this.paddleRoutesShowing.hasOwnProperty(paddle.id) || this.paddleRoutesShowing[paddle.id] === false) {
          Vue.set(this.paddleRoutesShowing, paddle.id, true);
          this.mainMap.showPaddleRoute(paddle);
        } else {
          Vue.set(this.paddleRoutesShowing, paddle.id, false);
        }
      },
      hideShowMarkers() {

        let filteredPaddleIds = this.filteredPaddles.map((p) => p.id);
        this.mainMap.hideShowMarkers(filteredPaddleIds);
      },
      calcCrow(coords1, coords2)  {
        //This function takes in latitude and longitude of two locations
        // and returns the distance between them as the crow flies (in meters)
        // var R = 6.371; // km
        let R = 6371000;
        let dLat = this.toRad(coords2.lat-coords1.lat);
        let dLon = this.toRad(coords2.lng-coords1.lng);
        let lat1 = this.toRad(coords1.lat);
        let lat2 = this.toRad(coords2.lat);

        let a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        let d = R * c;
        return d;
      },
      toRad(Value) {
        return Value * Math.PI / 180;
      },
      paddleWithinSearchRadius(searchCoords,resultsWithin,paddleCoords) {

        let distanceInMeters = this.calcCrow(searchCoords,paddleCoords);
        let distanceInMiles = distanceInMeters/1609.344;
        if ( distanceInMiles <= resultsWithin ) {
          return true;
        } else {
          return false;
        }
      },
      getAndSetClosestCity(locationCoords) {

        let closestDistance = null;
        let closestTown;
        for(let i = 0; i < LouisianaTowns.length; i++) {
          let {latitude, longitude} = LouisianaTowns[i].location;
          let distanceInMeters = this.calcCrow(locationCoords,{lat: latitude,lng:longitude});
          if (distanceInMeters < closestDistance || closestDistance === null) {
            closestDistance = distanceInMeters;
            closestTown = LouisianaTowns[i];
          }
        }
        this.select = closestTown.location;
      },
      resetMap() {
        this.mainMap.centerOnLocation(); 
      },
      useCurrentLocation(goToOnly = false) {

        if (!goToOnly) {
          this.isGettingLocation = true;
        }

        const options = {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 0
        };

        const success = (pos) => {
          const coords = pos.coords;

          let {latitude, longitude} = coords;
          let adjustedCoords = { lat:latitude, lng:longitude};
          this.isGettingLocation = false;

          if (!goToOnly) {
            this.getAndSetClosestCity(adjustedCoords);
          }

          this.mainMap.centerOnLocation(adjustedCoords);
        }

        const error = (err) => {
          this.isGettingLocation = false;
          console.warn(`ERROR(${err.code}): ${err.message}`);
        }

        navigator.geolocation.getCurrentPosition(success, error, options);
      },
      goToIndividualView(paddleObj) {
        this.showIndividualView = true;
        // let slug = paddleObj.name.replace(/\s+/g, '-').replace(/\./g,'').toLowerCase();
        // this.$router.push('/single-paddle-view/' + paddleObj.id + '/' + slug);
      },
    },
    computed: {
      aPaddleRouteIsShowing: {
         get(){
           for (const paddleId in this.paddleRoutesShowing) {
             if (this.paddleRoutesShowing[paddleId]) {
               return true;
             }
           }
           return false;
         },
         set(val){
           return val;
         }
      },
      mapMarkersAdded() {

        if (!this.componentHasMounted) {
          return false;
        }
        if (!this.mainMap.hasOwnProperty('map') || this.paddles === []) {
          return false;
        }

        const callback = (paddleId) => {
          let clickedPaddle = this.paddles.find((p) => p.id == paddleId);
          this.goToIndividualView(clickedPaddle);
        }

        this.mainMap.addMapMarkers(this.paddles,callback);
        return true;
      },
      filteredPaddles() {
        if (this.paddles === []) {
          return [];
        }

        let filteredPaddles = [];

        if (!this.select) {
          return this.paddles;
        }

        let { latitude, longitude } = this.select;
        const searchCoordinates = {lat: latitude.toFixed(1), lng: longitude.toFixed(1)};
        const resultsWithin = this.resultsWithinDistance;

        filteredPaddles = this.paddles.filter((paddle) => {
          let [lng,lat]= paddle.pin;

          const paddleCoordinates = {lat: lat.toFixed(1), lng: lng.toFixed(1)};
          if(this.paddleWithinSearchRadius(
            searchCoordinates,
            resultsWithin,
            paddleCoordinates
          )) {
            return true;
          } else {
            return false;
          }
        });

        return filteredPaddles;
      }
    },
    data: () => ({
      isGettingLocation: false,
      resultsWithinDistance: 100,
      componentHasMounted: false,
      paddles: [],
      select: null,
      keyword: '',
      items: LouisianaTowns,
      showIndividualView: false,
      paddleRoutesShowing: {}
    }),
  }


</script>

<style lang="scss" scoped>
  .v-list-item {
    min-height:0px;
  }
  .v-list-item__content {
    padding-top:2.5px; padding-bottom:2.5px;
  }
  .v-list-item__title {
    font-size: 0.85rem;
  }
  #map {
    position:absolute;
    top:0;bottom:0;right:0;left:0;
  }
  .v-toolbar {
    padding-top:2px;
  }
  .toolbar-row {
    align-items:center;
    & + .toolbar-row {
      padding-top:2px;
    }
  }
  .main-map .v-list-item {
    padding-left:4px;
    ::v-deep .v-input--selection-controls__input {
      margin-right:4px;
    }
  }
  .v-main.main-map {
    padding-top: 72px!important;
  }
  .v-app-bar, .main-map ::v-deep .v-toolbar__content{
    height:72px!important;
  }
  .v-input__slider ::v-deep .v-input__slot {
    margin-bottom:0px;
  }
  .v-input__slider ::v-deep .v-messages {
    display:none;
  }
  .v-dialog .v-main {
    padding-top:0px!important;
  }
  .map-loading-spinner {
    position: absolute;
    z-index: 1;
    left: 50%;
    top: 50%;
    transform: translate(-50%,-50%);
  }
  .center-on-location {
    position:absolute;
    z-index: 1000;
    right:10px;
    bottom:30px;
  }
  ::v-deep .v-text-field.v-autocomplete .v-input__control,
  .v-sheet.v-select-list ::v-deep .v-list-item {
    min-height:30px!important;
  }
  .v-input--hide-details.v-input--checkbox {
    margin-top:0px; padding-top:0px;
  }
  .route-showing.v-list-item--link:before{
    opacity:0.04;
  }
  ::v-deep .marker {
    background-image: url('../assets/mapbox-icon.png');
    background-size: cover;
    width: 20px;
    height: 28px;
    cursor: pointer;
    margin-left:-10px;
  }
</style>
