<template>
  <div>
    <v-overlay :value="overlay"></v-overlay>
    <v-dialog v-if="showIndividualView" v-model="showIndividualView" max-width="600" :hide-overlay="true">
      <individual-view
        :userIsLoggedIn="userData.isLoggedIn"
        :userId="userData.uid"
        :paddle="paddleClicked"
        @close="showIndividualView = false"
        @showLoginDialog="showLoginDialog = true"
      ></individual-view>
    </v-dialog>
    <v-dialog v-if="showPaddleUpload" v-model="showPaddleUpload" max-width="350" :hide-overlay="true">
      <paddle-upload
        :userIsLoggedIn="userData.isLoggedIn"
        :userId="userData.uid"
        @close="showPaddleUpload = false"
      ></paddle-upload>
    </v-dialog>
    <v-dialog eager v-model="showLoginDialog" max-width="350" :hide-overlay="false">
      <login
        @close="(data) => handleLoginDialogClose(data)"
        @setUserData="(data) => setUserData(data)">
      </login>
    </v-dialog>
    <!-- desktop app bar-->
    <v-app-bar
      app
      color="white"
      flat
      class="d-none d-md-block"
    >
      <v-container fluid class="pa-0 fill-height">
        <v-col cols="2" style="flex-wrap:wrap; ">

        </v-col>
        <v-col cols="10" >
          <v-row class="toolbar-row">
              <section class="filter--location">
                <v-autocomplete
                  v-model="select"
                  @change="hideShowMarkers()"
                  :items="items"
                  item-text="name"
                  item-value="location"
                  cache-items
                  class="mb-0 mr-md-2"
                  flat
                  dense
                  hide-no-data
                  hide-details
                  outlined
                  label="Location"
                  solo-inverted
                  min-height="28"
                >
                  <template v-slot:selection="data">
                    {{data.item.name}}, {{data.item.adminCode}}
                    <span style="font-size:0.8rem;position:absolute;right:30px;" v-if="data">&nbsp;&nbsp;(within {{resultsWithinDistance}} miles)</span>
                  </template>
                  <template v-slot:item="data">
                      {{ data.item.name }}, {{ data.item.adminCode }}
                  </template>
                </v-autocomplete>
                <v-btn
                 class="icon-btn-locate"
                 small
                 color="transparent"
                 depressed
                 @click="useCurrentLocation()"
                 title="Get your location to use in the search bar"
                 >
                 <!-- <span class="d-none d-sm-inline">use my location</span> -->
                 <v-icon
                   dark
                   color="accent"
                   v-show="!isGettingLocation"
                   >
                   mdi-crosshairs-gps
                 </v-icon>
                 <v-progress-circular
                    v-show="isGettingLocation"
                    indeterminate
                    size="18"
                    width="2"
                    color="accent"
                  ></v-progress-circular>
               </v-btn>


               <v-menu
               bottom
               left
               offset-y
              :close-on-content-click="false"
               >
               <template v-slot:activator="{ on, attrs }">
                 <v-icon
                  v-bind="attrs"
                  v-on="on"
                  color="accent"
                  style="cursor:pointer;">
                  mdi-filter-variant
                 </v-icon>
               </template>


               <div class="filter--location__slider">
                 <span style="font-size: 0.8rem;width: 105px;line-height:1;">
                   Show results within <span class="results-within-number">{{resultsWithinDistance}}</span> miles
                 </span>

                 <v-slider
                  v-model="resultsWithinDistance"
                  step="10"
                  ticks
                  tick-size="2"
                  color="accent"
                  height="25"
                   max="300"
                   min="0"
                   @input="hideShowMarkers"
                 ></v-slider>
               </div>
               </v-menu>
            </section>
            <section class="filter--tags">
              <v-select
                v-model="type"
                :items="this.types"
                filled
                outlined
                multiple
                chips
                dense
                @change="hideShowMarkers()"
                hide-details
                label="Paddle Type"
              ></v-select>
            </section>
            <v-btn v-if="this.type.length !==0  || this.select" @click="clearFilters()" text-color="primary" small depressed color="transparent">clear</v-btn>
            <div class="login-btns" v-show="userDataLoaded">
              <v-btn v-if="!userData.isLoggedIn" @click="showLoginDialog = true" small depressed color="accent">Sign In</v-btn>
              <v-menu bottom offset-y open-on-hover>
                <template v-slot:activator="{ on, attrs }">
                  <span style="display:flex; align-items:center;" v-show="userData.isLoggedIn" v-bind="attrs" v-on="on">
                    <v-icon
                      dark
                      color="accent"
                      >
                      mdi-account
                    </v-icon>
                    <span class="account-text">{{userData.username}}</span>
                  </span>
                </template>
                <v-list>
                  <v-list-item @click="logout()">
                    <v-list-item-title>Logout</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </v-row>
        </v-col>

      </v-container>
    </v-app-bar>
    <!-- mobile app bar-->
    <v-navigation-drawer
        v-model="mobileDrawer"
        absolute
        left
      >
      <v-list color="transparent" text-color="primary">
        <span style="display: block;padding-left: 10px;font-size: 14px;margin-bottom: 6px;" v-if="paddles.length">Showing {{filteredPaddles.length}} of {{paddles.length}}</span>
        <v-list-item class="mb-1">
          <v-checkbox dense hide-details
            v-model="aPaddleRouteIsShowing"
            :disabled="!aPaddleRouteIsShowing"
            @click="hideAllRoutes()"
          ></v-checkbox>
          <h4 style="font-weight:500;">Paddles</h4>
          <v-icon
            class="upload-btn"
            color="primary"
            @click="showPaddleUploadDialog()">
            mdi-upload
          </v-icon>
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
            style="pointer-events:none;"
          >
          </v-checkbox>
          <v-list-item-content @click="(evt)=>ifRouteShowingShowIndividualView(paddle,evt)">
            <v-list-item-title>
              {{ paddle.name }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar
      app
      color="white"
      flat
      class="d-md-none v-app-bar--mobile"
    >
      <v-container fluid class="pa-0 fill-height">
        <v-icon
         color="accent"
         style="cursor:pointer;margin-right: auto;margin-left: 10px;"
         @click="mobileDrawer = !mobileDrawer">
         mdi-menu
        </v-icon>
        <v-menu
          bottom
          left
          offset-y
         :close-on-content-click="false"
        >
        <template v-slot:activator="{ on, attrs }">
          <v-icon
           v-bind="attrs"
           v-on="on"
           color="accent"
           style="cursor:pointer;">
           mdi-filter-variant
          </v-icon>
        </template>
        <div class="mobile-filters">
          <section class="filter--location">
            <v-autocomplete
              v-model="select"
              @change="hideShowMarkers()"
              :items="items"
              item-text="name"
              item-value="location"
              cache-items
              class="mb-0"
              flat
              dense
              hide-no-data
              hide-details
              outlined
              label="Location"
              solo-inverted
              min-height="28"
            >
              <template v-slot:selection="data">
                {{data.item.name}}, {{data.item.adminCode}}
                <span style="font-size:0.8rem;position:absolute;right:30px;" v-if="data">&nbsp;&nbsp;(within {{resultsWithinDistance}} miles)</span>
              </template>
              <template v-slot:item="data">
                  {{ data.item.name }}, {{ data.item.adminCode }}
              </template>
            </v-autocomplete>
            <v-btn
             class="icon-btn-locate"
             small
             color="transparent"
             depressed
             @click="useCurrentLocation()"
             title="Get your location to use in the search bar"
             >
             <!-- <span class="d-none d-sm-inline">use my location</span> -->
               <v-icon
                 dark
                 color="accent"
                 v-show="!isGettingLocation"
                 >
                 mdi-crosshairs-gps
               </v-icon>
               <v-progress-circular
                  v-show="isGettingLocation"
                  indeterminate
                  size="18"
                  width="2"
                  color="accent"
                ></v-progress-circular>
              </v-btn>
            </section>
            <div class="filter--location__slider">
              <span style="font-size: 0.8rem;width: 105px;line-height:1;">
                Show results within <span class="results-within-number">{{resultsWithinDistance}}</span> miles
              </span>

              <v-slider
               v-model="resultsWithinDistance"
               step="10"
               ticks
               tick-size="2"
               color="accent"
               height="25"
                max="300"
                min="0"
                @input="hideShowMarkers"
              ></v-slider>
            </div>
            <section class="filter--tags">
              <v-select
                v-model="type"
                :items="this.types"
                filled
                outlined
                multiple
                chips
                dense
                @change="hideShowMarkers()"
                hide-details
                label="Paddle Type"
              ></v-select>
            </section>
          </div>
        </v-menu>
        <v-menu bottom offset-y class="mobile-account">
          <template v-slot:activator="{ on, attrs }">
            <span style="display:flex; align-items:center;" v-bind="attrs" v-on="on">
              <v-icon
                dark
                color="accent"
                >
                mdi-account
              </v-icon>
            </span>
          </template>
          <v-list>
            <v-list-item v-if="userData.isLoggedIn" @click="logout()">
              <v-list-item-title>Logout</v-list-item-title>
            </v-list-item>
            <v-list-item v-else @click="logout()">
              <v-list-item-title v-if="!userData.isLoggedIn" @click="showLoginDialog = true" small depressed color="accent">Sign In</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-container>
    </v-app-bar>
    <v-main class="grey lighten-3 main-map">
      <v-container fluid>
        <v-row>
          <v-col cols="2" class="d-none d-md-block pr-0 pl-0 pt-0 pb-0">
            <v-sheet class="pt-1" style="height:100%;">
              <v-list color="transparent" text-color="primary">
                <span style="display: block;padding-left: 10px;font-size: 14px;margin-bottom: 6px;" v-if="paddles.length">Showing {{filteredPaddles.length}} of {{paddles.length}}</span>
                <v-list-item class="mb-1">
                  <v-checkbox dense hide-details
                    v-model="aPaddleRouteIsShowing"
                    :disabled="!aPaddleRouteIsShowing"
                    @click="hideAllRoutes()"
                  ></v-checkbox>
                  <h4 style="font-weight:500;">Paddles</h4>
                  <v-icon
                    class="upload-btn"
                    color="primary"
                    @click="showPaddleUploadDialog()">
                    mdi-upload
                  </v-icon>
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
                    style="pointer-events:none;"
                  >
                  </v-checkbox>
                  <v-list-item-content @click="(evt)=>ifRouteShowingShowIndividualView(paddle,evt)">
                    <v-list-item-title>
                      {{ paddle.name }}
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-sheet>
          </v-col>

          <v-col cols="12" md="10" class="pr-0 pl-0 pt-0 pb-0">
            <v-sheet
              height="calc(100vh - 52px)"
              rounded="lg"
              style="position:relative;"
            >
              <v-progress-circular
                 v-if="!mapMarkersAdded"
                 indeterminate
                 color="accent"
                 class="map-loading-spinner"
              ></v-progress-circular>
              <v-btn class="map-icon zoom-in" small depressed
                @click="mainMap.zoomIn()"
                title="Zoom in">
                <v-icon
                  dark
                  color="accent darken-2">
                  mdi-plus-thick
                </v-icon>
              </v-btn>
              <v-btn class="map-icon zoom-out" small depressed
                @click="mainMap.zoomOut()"
                title="Zoom out">
                <v-icon
                  dark
                  color="accent darken-2">
                  mdi-minus-thick
                </v-icon>
              </v-btn>
              <v-btn class="map-icon printer" small depressed
                title="Print">
                <v-icon
                  dark
                  color="accent darken-2">
                  mdi-printer
                </v-icon>
              </v-btn>
              <div id="map"></div>
              <v-btn class="map-icon center-on-location" small depressed
                @click="resetMap()"
                title="Zoom out to map's original position">
                <v-icon
                  dark
                  color="accent darken-2">
                  mdi-magnify-minus-cursor
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
  import PaddleUpload from '../pages/PaddleUpload.vue';
  import Login from '../pages/Login.vue';
  import NODE_API from '../utils/api';
  import Vue from 'vue';
  // import length from '@turf/length';
  // import * as helpers from '@turf/helpers';

  export default {
    components: {
      IndividualView,
      Login,
      PaddleUpload
    },
    created() {

      NODE_API.get('/user').then(response => {
        this.setUserData(response.data);
        this.userDataLoaded = true;
      });

      NODE_API.get('/getMapPins').then(response => {
        this.paddles = response.data;

        // this.paddles.forEach((p) => {
        //   var line = helpers.lineString(p.route);
        //   let theLength = length(line, {units: 'miles'});
        //
        //   console.log('NAME:',p.name);
        //   console.log('LENGTH',theLength);
        //   console.log('.....................');
        // });
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
      clearFilters() {
        this.type = [];
        this.select = null;
      },
      showPaddleUploadDialog() {
        if (this.userData.isLoggedIn) {
          this.showPaddleUpload = true;
        } else {
          this.showLoginDialog = true;
        }
      },
      logout() {
        this.overlay = true;
        NODE_API.post('/logout').then(response => {
          this.userData = {};
          this.$set(this.userData,'isLoggedIn',false);
          this.overlay = false;
        })
        .catch(error => {
          console.log(error);
        });
      },
      setUserData(userData) {
        this.$set(this.userData,'isLoggedIn', userData.loggedIn);
        this.$set(this.userData,'username', userData.username);
        this.$set(this.userData,'uid',userData.uid);
      },
      handleLoginDialogClose(data) {
        this.showLoginDialog = false;
        if (data) {
          this.setUserData(data);
          this.userDataLoaded = true;
        }
      },
      ifRouteShowingShowIndividualView(paddle,evt) {
        if (this.paddleRoutesShowing[paddle.id]) {
          evt.stopPropagation();
          //if not in bounds -- this.mainMap.flyToFitRouteBounds(paddle);
          //else
          this.paddleClicked = this.paddles.find((p) => p.id ===paddle.id);
          this.showIndividualView = true;
        }
      },
      hideAllRoutes() {
        this.paddleRoutesShowing = {};
        this.mainMap.removeAllRoutes();
      },
      togglePaddleRoute(paddle,clickOriginatedOnPin = false) {

        let paddleToggledOn = false;
        if(!this.paddleRoutesShowing.hasOwnProperty(paddle.id) || this.paddleRoutesShowing[paddle.id] === false) {
          Vue.set(this.paddleRoutesShowing, paddle.id, true);
          paddleToggledOn = true;
        } else {
          Vue.set(this.paddleRoutesShowing, paddle.id, false);
        }

        const handlePaddleRouteClicked = (paddleName) => {
          this.paddleClicked = this.paddles.find((p) => p.name.toLowerCase() === paddleName.toLowerCase());
          this.showIndividualView = true;
        }

        let idPaddleRoutesToShow = this.getIdPaddleRoutesShowing();
        this.mainMap.drawPaddleRoutes(idPaddleRoutesToShow,this.paddles,handlePaddleRouteClicked);

        if(paddleToggledOn) {
          let [lng,lat] = paddle.pin;
          let coords = {lng:lng, lat:lat};
          let dontZoom = true;
          if (!clickOriginatedOnPin) {
            this.mainMap.centerOnLocation(coords,dontZoom);
          }
          // this.mainMap.flyToFitRouteBounds(paddle);
          // this.mainMap.showMoreInfoButton(paddle.id);
        }
      },
      getIdPaddleRoutesShowing() {
        let paddleRoutesToShow = [];
        for (let paddleId in this.paddleRoutesShowing) {
          if (this.paddleRoutesShowing[paddleId]) {
            paddleRoutesToShow.push(paddleId);
          }
        }
        return paddleRoutesToShow;
      },
      hideShowMarkers() {
        let filteredPaddleIds = this.filteredPaddles.map((p) => p.id);
        this.mainMap.hideShowMarkers(filteredPaddleIds);
      },
      paddleMatchesTypeFilter(paddle) {
        if (this.type.length === 0) {
          return true;
        } else {
          if (paddle.tags) {
            let adjustedTags = paddle.tags.map((t) => {
              return t.toLowerCase().trim();
            });

            let isATag = (e) => adjustedTags.includes(e.toLowerCase());
            return this.type.some(isATag);
          } else {
            return false;
          }
        }
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
        let coords = false;
        if (this.myLocation.lat !== undefined) {
          coords = this.myLocation
        }

        this.mainMap.centerOnLocation(coords);
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
          //save for later -- if user hits back button (bottom left) it will take them back here.
          this.myLocation = adjustedCoords;
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
          if (this.paddleRoutesShowing[paddleId]) {
            this.paddleClicked=clickedPaddle;
            this.showIndividualView=true;
          } else {
            let clickOriginatedOnPin = true;
            this.togglePaddleRoute(clickedPaddle,clickOriginatedOnPin);
          }
        }

        this.mainMap.addMapMarkers(this.paddles,callback);
        return true;
      },
      filteredPaddles() {
        if (this.paddles === []) {
          return [];
        }

        if (!this.select && this.type.length === 0) {
          return this.paddles;
        }

        let filteredPaddles = this.paddles;

        if (this.select) {
          //filter by search radius
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
        }

        if (this.type.length) {
          filteredPaddles = filteredPaddles.filter((paddle) => {
            return this.paddleMatchesTypeFilter(paddle);
          });
        }

        return filteredPaddles;
    }
  },
    data: () => ({
      // distanceRange: '',
      // distanceRanges: [],
      type: [],
      types: ['Bayou','River','Open Water'],
      isGettingLocation: false,
      resultsWithinDistance: 300,
      componentHasMounted: false,
      paddles: [],
      select: null,
      keyword: '',
      items: LouisianaTowns,
      showIndividualView: false,
      paddleRoutesShowing: {},
      myLocation: {},
      paddleClicked: {},
      showLoginDialog: false,
      userData: {},
      userDataLoaded: false,
      showPaddleUpload: false,
      overlay: false,
      mobileDrawer: false
    }),
  }


</script>

<style lang="scss" scoped>
  .account-text {
    font-size: 0.85rem; font-weight:500;
    margin-left:5px;
    margin-right:1px;
  }
  .v-list-item {
    min-height:0px;
  }
  .v-list-item__content {
    padding-top:2.5px; padding-bottom:2.5px;
  }
  .v-list-item__title {
    font-size: 0.85rem;
    font-weight:500;
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
    justify-content:space-between;
    flex-wrap:nowrap;
    & + .toolbar-row {
      padding-top:2px;
    }
  }
  .main-map .v-list-item {
    padding-left:4px;
    margin-bottom:-5px;
    ::v-deep .v-input--selection-controls__input {
      margin-right:4px;
    }
  }
  .v-main.main-map {
    padding-top: 52px!important;
  }
  .v-app-bar, ::v-deep .v-toolbar__content{
    height:52px!important;
  }
  ::v-deep .v-toolbar__content {
    padding-left:0px; padding-right:0px;
  }
  ::v-deep .v-slider--horizontal { margin-left:0px; margin-right:0px; }
  .v-input__slider {
    ::v-deep .v-input__slot {
      margin-bottom:0px;
    }
    ::v-deep .v-messages {
      display:none;
    }
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
  button.map-icon.v-btn {
    padding: 0px 0px;
    min-width: 28px;
    position:absolute;
    z-index: 5;
    &.center-on-location {
      right:10px;
      bottom:30px;
    }
    &.zoom-in {
      top: 50px;
      left: 5px;
    }
    &.zoom-out {
      top: 85px;
      left: 5px;
    }
    &.printer {
      top:150px;
      left:5px;
    }
  }
  .theme--light.v-icon:focus:after {
    opacity:0;
  }
  // ::v-deep .v-text-field.v-autocomplete .v-input__control,
  // .v-sheet.v-select-list ::v-deep .v-list-item,
  // .v-text-field.v-text-field--enclosed:not(.v-text-field--rounded)>.v-input__control>.v-input__slot {
  //   min-height:30px!important;
  // }
  // ::v-deep .v-text-field--filled>.v-input__control>.v-input__slot,
  // ::v-deep .v-text-field--full-width>.v-input__control>.v-input__slot,
  // ::v-deep .v-text-field--outlined>.v-input__control>.v-input__slot {
  //   min-height:30px !important;
  // }
  //
  // .v-select.v-select--chips:not(.v-text-field--single-line).v-text-field--box ::v-deep .v-select__selections,
  // .v-select.v-select--chips:not(.v-text-field--single-line).v-text-field--enclosed ::v-deep .v-select__selections {
  //   min-height:30px!important;
  // }
  .filter--location {
    width:350px;
    position:relative;
    display:flex;
    flex-direction:row;
    .icon-btn-locate {
      position:absolute;
      top:7px;
      left:3px;
    }
  }
  .filter--location__slider {
    padding: 20px;
    background-color: white;
    width:225px;
  }
  .filter--tags {
    width:300px;
    margin-left: 8px;
  }
  .v-autocomplete ::v-deep .v-select__slot{
    padding-left:25px;
    label {
      left:25px !important;
    }
  }
  .v-autocomplete {
    & + button.v-size--small {
      padding-left: 0px;
      padding-right: 0px;
      min-width: 30px;
      i { font-size:19px; }
      &:hover.theme--light.v-btn {
        color:transparent;
      }
    }
    max-width:400px;

  }
  .v-input--hide-details.v-input--checkbox {
    margin-top:0px; padding-top:0px;
  }
  .route-showing.v-list-item--link:before{
    opacity:0.04;
  }
  ::v-deep .marker {
    background-size: cover;
    width: 20px;
    height: 32px;
    cursor: pointer;
    margin-left:-10px;
    margin-top:4px;
  }
  ::v-deep .marker.marker--green{
    background-image: url('../assets/marker-icon-green.png');
  }
  ::v-deep .marker.marker--red{
    background-image: url('../assets/marker-icon-red.png');
  }
  ::v-deep .marker.marker--yellow{
    background-image: url('../assets/marker-icon-orange.png');
  }
  .login-btns {
    cursor:pointer;
    border-left:1px solid var(--v-primary-lighten5);
    padding:0px 10px;
  }
  ::v-deep .mdi-menu-down.v-icon.theme--light   {
    color:var(--v-accent-base);
  }
  .results-within-number {
    font-size:1.2rem;
    color:var(--v-accent-base);
    font-weight:500
  }
  .upload-btn {
    margin-left:auto;
    cursor:pointer;
    display:block;
  }
  /* mobile styles */
  .mobile-filters {
    padding:10px;
    background:white;
    .filter--location__slider {
      padding:10px; padding-left:0px;
      width:auto;
    }
    .filter--tags {
      margin-left:0px;
      width:auto;
    }
  }
  .v-app-bar--mobile {
    .container {
      justify-content:flex-end;
      .v-icon {
        margin-right:10px;
      }
    }
  }
  .v-navigation-drawer--is-mobile {
    z-index: 8;
  }
</style>
