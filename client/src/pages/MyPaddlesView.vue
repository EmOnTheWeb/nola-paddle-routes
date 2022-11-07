<template>
  <v-container>
    <div class="spinner-container"
      v-if="!myPaddlesLoaded">
      <v-progress-circular
         indeterminate
         color="accent"
      ></v-progress-circular>
    </div>
    <v-data-table
      v-if="myPaddlesLoaded"
      :headers="headers"
      :items="myPaddles"
      :disable-pagination="true"
      :hide-default-footer="true"
    >
      <template v-slot:top>
        <h2>My Paddles</h2>
          <v-spacer></v-spacer>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-icon
          small
          class="mr-2"
          @click="editItem(item)"
        >
          mdi-pencil
        </v-icon>
      </template>
      <template v-slot:no-data>
        You haven't uploaded any paddles. Go ahead and upload some!
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
  import NODE_API from '../utils/api';

  export default {
    name: 'MyPaddlesView',
    components: {

    },
    props: {
      userId: String
    },
    created() {
      if (this.userId !== '') {
        NODE_API.get(`/paddles/${this.userId}`).then(response => {
          this.myPaddles = response.data;
          this.myPaddlesLoaded = true;
        })
        .catch(error => {
          console.log(error);
        });
      }
    },
    mounted() {

    },
    methods: {

    },
    computed: {

    },
    data: () => ({
      myPaddles: [],
      myPaddlesLoaded: false,
      overlay: false,
      headers: [
        {
          text: 'Name',
          value: 'name',
          class: 'name-col'
        },
        { text: 'Date Uploaded', value: 'dtUploaded', class: 'dtuploaded-col'}
      ]
    }),
  }
</script>

<style lang="scss" scoped>
  .container {
    background-color:white;
  }
  .v-data-table h2{
    font-size:1rem;
    font-weight:500;
  }
  ::v-deep .name-col, ::v-deep .dtuploaded-col {
    span {
      font-size:0.85rem!important;
      color:var(--v-primary-base)!important;
    }
  }
  ::v-deep td {
    font-size:0.85rem!important;
    font-weight:500;
    color:var(--v-primary-lighten1);
  }
  .spinner-container {
    display:flex;
    justify-content:center;
    align-items:center;
    min-height:200px;
  }

</style>
