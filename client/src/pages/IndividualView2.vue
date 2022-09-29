<template>
  <v-card>
    <v-card-text>
     Let Google help apps determine location. This means sending anonymous location data to Google, even when no apps are running.
    </v-card-text>

       <v-card-actions>
         <v-spacer></v-spacer>

         <v-btn
           color="green darken-1"
           text
           @click="dialog = false"
         >
           Disagree
         </v-btn>

         <v-btn
           color="green darken-1"
           text
           @click="dialog = false"
         >
           Agree
         </v-btn>
       </v-card-actions>
     </v-card>
</template>

<script>

  import {MainMap} from '../utils/mainMap';

  export default {
    name: 'IndividualView2',
    props: {
      paddle: Object,
      show: Boolean
    },
    mounted() {
      console.log(this.paddle);
    },
    methods: {
      goBack() {
        this.routeMapExpanded = false;
        this.$emit('back',true);
      },
    },
    computed: {
      drivingDirectionsHref() {
        return 'https://www.google.com/maps/dir/?api=1&destination=' + this.paddle.launch.coordinates.lat + ',' + this.paddle.launch.coordinates.long;
      },
    },
    data: () => ({

    }),
  }
</script>

<style lang="scss" scoped>

</style>
