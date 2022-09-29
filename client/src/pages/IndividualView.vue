<template>
  <v-card>
    <v-card-title>{{paddle.name}}</v-card-title>
    <v-icon class="icon--close" color="primary" @click="close()">mdi-close</v-icon>
    <v-card-text>
      <p>the description</p>
      <p>the distance</p>
      <p>boat launch type</p>
      <div class="tags-and-actions">
        <div class="tags">
          <v-chip
            v-for="(tag,index) in ['hard','open water']"
            :key="index"
          >
            {{tag}}
          </v-chip>
        </div>
        <div class="actions">
          <a target="_blank" :href="drivingDirectionsHref">Driving Directions</a>
          <a @click="generateAndExportGPXFile()">Export Route
            <!-- <v-icon color="primary">
            mdi-file-export-outline
            </v-icon> -->
          </a>
        </div>
      </div>
    </v-card-text>

    <v-tabs v-model="tab">
      <v-tab>Comments</v-tab>
    </v-tabs>
    <v-tabs-items v-model="tab">
      <v-tab-item
      >
      <comments :comments="comments"></comments>
      </v-tab-item>
    </v-tabs-items>

    </v-tabs>
  </v-card>
</template>

<script>

  import {MainMap} from '../utils/mainMap';
  import Comments from '../components/Comments.vue'

  export default {
    name: 'IndividualView',
    components: {
      Comments
    },
    props: {
      paddle: Object,
      show: Boolean
    },
    mounted() {

    },
    methods: {
      close() {
        this.$emit('close',true);
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
      }
    },
    computed: {
      drivingDirectionsHref() {
        return 'https://www.google.com/maps/dir/?api=1&destination=' + this.paddle.pin[1] + ',' + this.paddle.pin[0];
      },
    },
    data: () => ({
      tab: null,
      comments: [
        { text:'The paddle was quite overgrown and hurt my arm.' , user:'Emilie', date:'06/27/1989'},
        { text:'The paddle was quite overgrown and hurt my arm.' , user:'Emilie', date:'06/27/1989'},
        { text:'The paddle was quite overgrown and hurt my arm.' , user:'Emilie', date:'06/27/1989'}
      ]
    }),
  }
</script>

<style lang="scss" scoped>
  .v-application p {
    margin-bottom:0px;
  }
  .tags {
    margin-top:10px;
    span {
      margin-right:10px;
    }
  }
  .actions {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    a {
      color: #A54657;
      display:block;
      text-decoration:none;
      font-size:14px;
      &:hover {
        text-decoration:underline;
      }
    }
  }
  .tags-and-actions {
    display:flex;
    justify-content:space-between;
  }

   .v-dialog>.v-card> .v-card__text {
    padding:0px 18px 10px;
  }
   .v-dialog>.v-card> .v-card__title {
    padding:7px 18px;
  }
  ::v-deep .v-tabs-bar {
    height:30px;
  }
  .v-card .icon--close {
    position: absolute;
    right: 10px;
    top: 12px;
    cursor:pointer;
  }
</style>
