<template>
  <v-card>
    <v-card-title>{{paddle.name}}</v-card-title>
    <v-icon color="accent" class="icon--close" @click="close()">mdi-close</v-icon>
    <v-card-text>
    <div class="info-block">
      <p><span style="font-weight:bold;margin-right:5px;">Distance:</span>{{paddle.distance}}&nbsp;miles</p>
      <p><span style="font-weight:bold;margin-right:5px;">Boat Launch Type:</span>{{paddle.launchType}}</p>

      <p>{{paddle.description}}</p>

      <div class="tags">
        <v-chip
          v-for="(tag,index) in paddle.tags"
          :key="index"
        >
          {{tag}}
        </v-chip>
      </div>
    </div>
    <div class="actions">
      <a @click="generateAndExportGPXFile()">
        <v-icon color="accent">mdi-export</v-icon>&nbsp;Export Route
      </a>
      <a target="_blank" :href="drivingDirectionsHref">
        <v-icon color="accent">mdi-car</v-icon>&nbsp;Get Directions
      </a>
    </div>

    </v-card-text>

    <v-tabs v-model="tab">
      <v-tab>Comments</v-tab>
      <!-- <span class="comment-login-message" v-if="!userIsLoggedIn">
        You must be signed in to comment
      </span> -->
      <!-- <a @click="emitShowSignIn()">Sign In
      </a> -->
    </v-tabs>
    <v-tabs-items v-model="tab">
      <v-tab-item
      >
      <comments
        @showLoginDialog="emitShowSignIn()"
        :comments="comments"
        :idPaddle="paddle.id"
        :userIsLoggedIn="userIsLoggedIn"
        :userId="userId"></comments>
      </v-tab-item>
    </v-tabs-items>

    </v-tabs>
  </v-card>
</template>

<script>

  import {MainMap} from '../utils/mainMap';
  import Comments from '../components/Comments.vue';

  export default {
    name: 'IndividualView',
    components: {
      Comments
    },
    props: {
      paddle: Object,
      show: Boolean,
      userIsLoggedIn: Boolean,
      userId: String
    },
    mounted() {
    },
    methods: {
      emitShowSignIn() {
        this.$emit('showLoginDialog');
      },
      close() {
        this.$emit('close',true);
      },
      generateAndExportGPXFile() {
        let result = '<gpx xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd" version="1.1" creator="runtracker"><metadata/><trk><name></name><desc></desc>';
        result += '<trkseg>';
        let coords = this.paddle.route;
        result += coords.reduce((accum,curr) => {
          let ptTag = `<trkpt lat="${curr[1]}" lon="${curr[0]}"></trkpt>`;
          return accum += ptTag;
        }, '');
        result += '</trkseg>'
        result += '</trk></gpx>';

        const url = 'data:text/json;charset=utf-8,' + result;
        const link = document.createElement('a');
        link.download = `${this.paddle.name}.gpx`;
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
        // { text:'The paddle was quite overgrown and hurt my arm.' , user:'Emilie', date:'06/27/1989'},
        // { text:'The paddle was quite overgrown and hurt my arm.' , user:'Emilie', date:'06/27/1989'},
        // { text:'The paddle was quite overgrown and hurt my arm.' , user:'Emilie', date:'06/27/1989'}
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
    justify-content: center;
    margin-top: 30px;
    a {
      display:flex; align-items:center;
      font-size:14px;
      color: var(--v-accent-base);
      text-decoration:none;
      font-weight:500;
      margin-bottom:3px;
    }
    a + a {
      margin-bottom:0px;
    }
  }
  .info {
    margin-top:5px; margin-bottom:5px;
  }
  .v-application .v-card {
    color: var(--v-primary--base);
  }
   .v-dialog>.v-card> .v-card__text {
    padding:0px 18px 10px;
    color: var(--v-primary--base);
  }
   .v-dialog>.v-card> .v-card__title {
    padding:20px 18px;
    color: var(--v-primary--base);
  }
  ::v-deep .v-tabs-bar {
    height:30px;
  }
  ::v-deep.v-tabs-items {
    padding: 0px 15px;
  }
  .v-tabs {
    margin-top: 20px;
    padding:0px 10px;
    .v-tab {
      background-color: white;
      border: 1px solid black;
      border-bottom: 0px;
      border-top-left-radius: 10px;
      border-top-right-radius: 10px;
      border:none;
      padding:0px;
      text-transform:none;
    }
  }
  ::v-deep .v-tabs-slider-wrapper {
    display:none;
  }
  .v-card .icon--close {
    position: absolute;
    right: 10px;
    top: 12px;
    cursor:pointer;
  }
  .info-block {

  }
  // .comment-login-message {
  //   font-size: 0.85rem;
  //   vertical-align: middle;
  //   line-height: 30px;
  //   margin-left: 10px;
  //   color: var(--v-error--darken1);
  // }
</style>
