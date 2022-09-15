<template>
  <v-app id="inspire">
    <v-app-bar
      app
      color="white"
      flat
    >
      <v-container fluid class="pa-0 fill-height">
        <v-row>
          <v-col cols="2">
          </v-col>

          <v-col>
            <v-row>
              <v-select
                class="pr-0 pr-sm-2 pb-2 pb-sm-0 filter-bar__input"
                label="State"
                v-model="select"
                @change="hideShowMarkers"
                :items="items"
                item-text="state"
                item-value="abbr"
                dense
                flat
                hide-details
                solo-inverted
              ></v-select>

              <v-text-field
                class="pl-0 pl-sm-2 pr-0 pr-sm-2 filter-bar__input"
                label="Keyword Search"
                v-model="keyword"
                @input="hideShowMarkers"
                :append-icon="'mdi-map-marker'"
                dense
                flat
                hide-details
                solo-inverted
              ></v-text-field>
            </v-row>
          </v-col>
        </v-row>
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
              height="80vh"
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
      keywordMatches(paddleObj,keyword) {

        if (
          paddleObj.name.toLowerCase().indexOf(keyword) > -1 ||
          paddleObj.tags.map(tag => tag.toLowerCase())
                        .includes(keyword)
        ) {
          return true;
        } else {
          return false;
        }
      },
      hideShowMarkers() {
        let filteredPaddleIds = this.filteredPaddles.map((p) => p.id);
        this.mainMap.getMapMarkers().forEach((m) => {
          if (filteredPaddleIds.includes(m.get('paddle_id'))) {
            m.setVisible(true);
          } else {
            m.setVisible(false);
          }
        });
      }
    },
    computed: {
      filteredPaddles() {
        if (!this.select && !this.keyword) {
          return this.paddles;
        }

        let keywordLwr = this.keyword.toLowerCase().trim();
        let filteredPaddles = this.paddles.filter((paddle) => {

          if (
            ( !this.select && this.keywordMatches(paddle,keywordLwr) ) ||
            ( this.select === paddle.location.state && this.keywordMatches(paddle,keywordLwr) ) ||
            ( this.select === paddle.location.state && !this.keyword )
          ) {
            return true;
          } else {
            return false;
          }
        });

        return filteredPaddles;
      }
    },
    data: () => ({
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
      items: [
        { state: 'Louisiana', abbr: 'LA' },
        { state: 'Mississipi', abbr: 'MS' },
      ]
    }),
  }


</script>

<style scoped>
  .v-list-item__title {
    font-size: 0.75rem;
  }
  #map {
    position:absolute;
    top:0;bottom:0;right:0;left:0;
  }
  .filter-bar__input {
    flex-basis:50%;
    min-width:240px;
    .v-input__control {
      cursor: pointer;
    }
  }
</style>
