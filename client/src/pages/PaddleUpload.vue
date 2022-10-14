<template>
  <v-card>
    <v-card-title>Upload Paddle</v-card-title>
    <v-icon color="accent" class="icon--close" @click="close()">mdi-close</v-icon>
    <v-card-text>
      <v-form v-model="valid" ref="paddleUploadForm">
        <v-text-field
          class="mb-4"
          v-model="name"
          label="Name"
          required
          filled
          outlined
          dense
          hide-details
        />
        <v-text-field
          class="text-field--small mb-4"
          v-model="distance"
          label="Distance"
          filled
          outlined
          single-line
          dense
          hide-details
          type="number"
          suffix="miles"
        />
        <v-text-field
          v-model="boatLaunchType"
          label="Boat Launch Type"
          class="mb-4"
          filled
          outlined
          single-line
          hide-details
          dense
        />
        <v-select
          v-model="type"
          :items="this.types"
          filled
          class="mb-4"
          outlined
          multiple
          hide-details
          chips
          dense
          label="Paddle Type"
        ></v-select>
        <v-text-field
          v-model="tags"
          label="Tags"
          hint="Enter as comma seperated"
          persistent-hint
          filled
          outlined
          dense
        />
        <v-file-input
          label="Route"
          chips
          small-chips
          hint="Upload route gpx or kml file"
          filled
          outlined
          persistent-hint
          dense
        ></v-file-input>
        <v-file-input
          label="Route"
          chips
          small-chips
          hint="Upload additional route gpx or kml file"
          filled
          outlined
          persistent-hint
          dense
          accept=".gpx,.kml"
        ></v-file-input>

        <v-btn
         class="mt-3"
         color="accent"
         block
         @click="submitPaddle()"
        >
        Submit
        </v-btn>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script>

  import {MainMap} from '../utils/mainMap';

  export default {
    name: 'PaddleUpload',
    components: {

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
      close() {
        this.$emit('close',true);
      },
      submitPaddle() {


      }
    },
    computed: {

    },
    data: () => ({
      name: '',
      distance: null,
      boatLaunchType: '',
      tags: '',
      type: '',
      types: ['Bayou','River','Open Water'],
      valid: false
    }),
  }
</script>

<style lang="scss" scoped>
  .v-card .icon--close {
    position: absolute;
    right: 10px;
    top: 12px;
    cursor:pointer;
  }
  .text-field--small {
    width:150px;
  }
  ::v-deep .v-text-field__suffix {
    font-size:12px;
  }
  ::v-deep .v-text-field.v-text-field--enclosed .v-text-field__details {
    margin-bottom:5px;
  }
</style>
