<template>
  <v-app id="inspire">
    <v-app-bar
      app
      color="white"
      flat
    >
      <v-container fluid class="pa-0 fill-height">
        <v-col cols="2">
        </v-col>
        <v-col cols="10">
          <v-row class="toolbar-row">
            <v-toolbar-title>Location</v-toolbar-title>
            <v-autocomplete
              v-model="select"
              @change="hideShowMarkers()"
              :items="items"
              item-text="name"
              item-value="location"
              cache-items
              class="mx-4"
              flat
              hide-no-data
              hide-details
              label="Enter a city"
              solo-inverted
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
              color="primary"
            >use my location
              <v-icon
                right
                dark
                >
                mdi-crosshairs-gps
              </v-icon>
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

    <v-main class="grey lighten-3">
      <v-container fluid>
        <v-row>
          <v-col cols="2">
            <v-sheet rounded="lg">
              <v-list color="transparent">
                <v-list-item
                  v-for="(paddle, index) in filteredPaddles"
                  :key="index"
                  link
                >
                  <v-list-item-content>
                    <v-list-item-title>
                      {{ paddle.name }}
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-sheet>
          </v-col>

          <v-col>
            <v-sheet
              height="calc(100vh - 124px)"
              rounded="lg"
              style="position:relative; margin-left:-10px;"
            >
              <div id="map"></div>
            </v-sheet>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
  import {MainMap} from './utils/mainMap';
  import {LouisianaTowns} from './assets/louisianaTowns.js';

  export default {
    async mounted() {
      try {

        this.mainMap = new MainMap();
        await this.mainMap.initMap();
        this.mainMap.addMapMarkers(this.paddles);

      } catch (error) {
        console.error(error);
      }
    },
    methods: {
      hideShowMarkers() {
        let filteredPaddleIds = this.filteredPaddles.map((p) => p.id);
        this.mainMap.getMapMarkers().forEach((m) => {
          if (filteredPaddleIds.includes(m.get('paddle_id'))) {
            m.setVisible(true);
          } else {
            m.setVisible(false);
          }
        });
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
        if ( distanceInMiles < resultsWithin ) {
          return true;
        } else {
          return false;
        }
      }
    },
    computed: {
      filteredPaddles() {

        let filteredPaddles = [];

        if (!this.select) {
          return this.paddles;
        }

        let { latitude, longitude } = this.select;
        const searchCoordinates = {lat: latitude.toFixed(1), lng: longitude.toFixed(1)};
        const resultsWithin = this.resultsWithinDistance;

        filteredPaddles = this.paddles.filter((paddle) => {
          let {lat, lng} = paddle.location.coordinates;
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
      resultsWithinDistance: 100,
      mainMap: {},
      paddles: [
        {
          id: 1,
          name: 'Bay St. Louis Loop',
          location: {
            state: 'MS',
            coordinates: {lat: 30.2988043, lng: -89.4077829}
          },
          tags: [
            'Mississipi',
            'Medium',
            'Open water'
          ]
        },
        {
          id: 2,
          name: 'Bayou St. John',
          location: {
            state: 'LA',
            coordinates: {lat: 29.9761767, lng: -90.0936546}
          },
          tags: [
            'Louisiana',
            'Easy'
          ]
        },
        {
          id:3,
          name: 'Cane Bayou',
          location: {
            state: 'LA',
            coordinates: {lat: 30.3374409,lng: -90.006356}
          },
          tags: [
            'Louisiana',
            'Easy'
          ]
        }
      ],
      select: null,
      keyword: '',
      items: LouisianaTowns
    }),
  }


</script>

<style scoped>
  .v-list-item__title {
    font-size: 0.85rem;
  }
  #map {
    position:absolute;
    top:0;bottom:0;right:0;left:0;
  }
  .toolbar-row {
    align-items:center;
  }
  .toolbar-row + .toolbar-row {
    padding-top:8px;
  }
  .v-main {
    padding-top: 100px!important;
  }
  .v-app-bar, /deep/ .v-toolbar__content{
    height:100px!important;
  }
  .v-input__slider /deep/ .v-input__slot {
    margin-bottom:0px;
  }
  .v-input__slider /deep/ .v-messages {
    display:none;
  }

</style>
