<template>
  <v-card>
    <v-overlay :value="overlay"></v-overlay>
    <v-card-title v-if="!isEdit">Upload Paddle</v-card-title>
    <v-card-title v-if="isEdit">Edit Paddle</v-card-title>
    <v-icon color="accent" class="icon--close" @click="close()">mdi-close</v-icon>
    <v-card-text>
      <v-form ref="paddleAddEditForm">
        <v-text-field
          class="mb-4"
          v-model="name"
          label="Name"
          :rules="nameRules"
          required
          filled
          outlined
          dense
          validate-on-blur
        />
        <v-text-field
          class="text-field--small mb-4"
          v-model="distance"
          label="Distance"
          :rules="distanceRules"
          filled
          outlined
          single-line
          dense
          required
          type="number"
          suffix="miles"
          validate-on-blur
          min="1"
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
        <template v-if="!isEdit">
          <v-file-input
            style="margin-top:14px;"
            label="Route"
            chips
            v-model="fileOne"
            :rules="fileOneRules"
            small-chips
            hint="Upload route gpx or kml file."
            filled
            required
            outlined
            persistent-hint
            dense
            validate-on-blur
            accept=".gpx,.kml"
          ></v-file-input>
          <v-file-input
            style="margin-top:14px;"
            label="Route"
            chips
            v-model="fileTwo"
            :rules="fileTwoRules"
            small-chips
            hint="If there is a second file for this route upload it here."
            filled
            outlined
            persistent-hint
            dense
            validate-on-blur
            accept=".gpx,.kml"
          ></v-file-input>
        </template>
        <template v-if="isEdit">
          <v-expansion-panels flat>
            <v-expansion-panel>
              <v-expansion-panel-header><div>Edit Route</div>
                <span class="v-label theme--light v-messages" style="line-height: 20px;">Upload files to overwrite the route</span>
              </v-expansion-panel-header>
              <v-expansion-panel-content>
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
                  style="margin-top:14px;"
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
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </template>
        <v-btn
         class="mt-6"
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
    name: 'AddEditPaddle',
    components: {

    },
    props: {
      show: Boolean,
      userIsLoggedIn: Boolean,
      userId: String,
      paddle: Object
    },
    mounted() {
      if (this.paddle) {
        this.isEdit = true; 
        
        this.name = this.paddle.name; 
        this.distance = this.paddle.distance; 
        this.boatLaunchType = this.paddle.launchType; 
        let theTypes = this.paddle.tags.filter((t) => this.types.indexOf(t) > -1); 
        this.type = theTypes[0]; 
        this.tags = this.paddle.tags.filter((t) => this.types.indexOf(t) == -1).join(','); 
      }
    },
    methods: {
      close() {
        this.$emit('close',true);
      },
      checkFormIsValid() {
        
          let isValid = this.$refs.paddleAddEditForm.validate();
          return isValid; 
      },
      submitPaddle() {
        let isValid = this.checkFormIsValid(); 
      
        if (!isValid) {
          return; 
        }
        
        this.overlay = true;

        let formData = {
          name: this.name,
          distance: this.distance,
          boatLaunchType: this.boatLaunchType,
          type: this.type,
          tags: this.tags,
          fileOne: this.fileOne,
          fileTwo: this.fileTwo
        }; 
        
        if (this.isEdit) {
          formData.idPaddle = this.paddle.id; 

          NODE_API.put('/paddles', formData, {
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
        } else {
          NODE_API.post('/paddles', formData, {
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
      }
    },
    computed: {
      fileTwoRules() {
        return [() => (this.fileOne) || 'Upload to file one first']; 
      },
    },
    data: () => ({
      name: '',
      distance: null,
      boatLaunchType: '',
      tags: '',
      type: '',
      types: ['Bayou','River','Open Water'],
      fileOne: null,
      fileTwo: null,
      overlay: false,
      isEdit: false,
      nameRules: [
        v => !!v || "Name is required"
      ],
      distanceRules: [
        v => !!v || "Distance is required"
      ],
      fileOneRules: [
        v => !!v || 'Route is required',
      ]
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
  .v-expansion-panel-header, ::v-deep .v-expansion-panel-content .v-expansion-panel-content__wrap {
    padding:0px; 
    min-height:30px; 
  }
  ::v-deep .v-text-field__details {
    display:none;
  }

  ::v-deep .v-input.error--text {
    margin-bottom:0px!important;
    .v-text-field__details{
      margin-top:1px;
      display:block;
      padding:0px;
    }
  }

  ::v-deep .v-file-input.error--text + .v-file-input
   {
    margin-top:0px!important;
  }
  ::v-deep .v-input__slot {
    margin-bottom:0px!important; 
  }
  .v-expansion-panel-header {
    margin-top:10px; 
    &.v-expansion-panel-header--active {
      margin-top:0px; 
    }
  }
</style>
