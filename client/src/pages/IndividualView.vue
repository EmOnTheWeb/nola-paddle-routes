<template>
  <div>
    <v-dialog
      v-if="showShareLink"
      v-model="showShareLink"
      max-width="500"
      :hide-overlay="true"
      background="white">
      <v-card class="share-link-content">
        <v-icon color="accent" class="icon--close" @click="showShareLink = false">mdi-close</v-icon>
        Share this url to bring up the map zoomed in on this paddle.
        <div>
          {{paddleLink}}
          <v-spacer></v-spacer>
          <v-icon v-if="!urlCopied" color="accent" @click="copyURL">mdi-card-multiple-outline</v-icon>
          <v-icon v-if="urlCopied" color="accent" >mdi-check</v-icon>
        </div>
      </v-card>
    </v-dialog>
    <v-card>
      <v-card-title>
        {{paddle.name}}
        <v-icon @click="showShareLink = true" style="margin-left:10px;cursor:pointer;" color="accent">mdi-share</v-icon>
      </v-card-title>
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
        <v-btn
         class="icon-btn-locate"
         small
         color="accent"
         depressed
         @click="generateAndExportGPXFile()"
         >
          <v-icon color="accent">mdi-export</v-icon>&nbsp;Export Route
        </v-btn>
        <a target="_blank" :href="drivingDirectionsHref">
          <v-btn
           class="icon-btn-locate"
           small
           color="accent"
           depressed
           >
          <v-icon color="accent">mdi-car</v-icon>&nbsp;Get Directions
          </v-btn>
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
  </div>
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
      async copyURL() {
        try {
          await navigator.clipboard.writeText(this.paddleLink);
          this.urlCopied = true;
          setTimeout(() => {
            this.urlCopied = false;
          },3000)
        } catch(e) {
          console.log(e);
        }
      },
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
      paddleLink() {
        let location = window.location;
        return location.protocol + '//' + location.host + location.pathname + '?route=' + this.paddle.urlName;
      }
    },
    data: () => ({
      tab: null,
      comments: [
        // { text:'The paddle was quite overgrown and hurt my arm.' , user:'Emilie', date:'06/27/1989'},
        // { text:'The paddle was quite overgrown and hurt my arm.' , user:'Emilie', date:'06/27/1989'},
        // { text:'The paddle was quite overgrown and hurt my arm.' , user:'Emilie', date:'06/27/1989'}
      ],
      showShareLink:false,
      urlCopied: false
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
    margin-top: 15px;

    .v-btn {
      padding:7px!important;
      margin-right:10px;
      margin-bottom:5px;
      & + .v-btn {
        margin-right:0px;
      }
    }
    i {
      color:white!important;
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
  .share-link-content {
    font-size:14px;
    padding:15px;
    div {
      display:flex;
      background-color:#f0f0f0;
      padding:7px;
      margin-top:5px;
      margin-right:20px;
      .v-icon {
        transform: rotate(90deg);
        font-size: 20px;
        cursor:pointer;
      }
      .v-icon.mdi-check {
        transform:none;
      }
    }
  }
  // .comment-login-message {
  //   font-size: 0.85rem;
  //   vertical-align: middle;
  //   line-height: 30px;
  //   margin-left: 10px;
  //   color: var(--v-error--darken1);
  // }
</style>
