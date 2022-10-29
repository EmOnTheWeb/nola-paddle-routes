<template>
  <v-card>
    <v-overlay :value="overlay"></v-overlay>
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
          required
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
          required
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
          v-model="fileOne"
          small-chips
          hint="Upload route gpx or kml file."
          filled
          required
          outlined
          persistent-hint
          dense
          accept=".gpx,.kml"
        ></v-file-input>
        <v-file-input
          label="Route"
          chips
          v-model="fileTwo"
          small-chips
          hint="If there is a second file for this route upload it here."
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
  import NODE_API from '../utils/api';

  export default {
    name: 'PaddleUpload',
    components: {

    },
    props: {
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
        this.overlay = true;

        let formData = {
          name: this.name,
          distance: this.distance,
          boatLaunchType: this.boatLaunchType,
          type: this.type,
          tags: this.tags,
          fileOne: this.fileOne,
          fileTwo: this.fileTwo
        }

        NODE_API.post('/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }).then(response => {
          if(response.data.success) {
            this.$router.go();
          }
        })
        .catch(error => {
          console.log(error);
        });

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
      valid: false,
      fileOne: null,
      fileTwo: null,
      overlay: false
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
