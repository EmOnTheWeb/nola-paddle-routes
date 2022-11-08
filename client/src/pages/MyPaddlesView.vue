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
        <div class="edit-paddle">
          <v-icon
            class="mr-2"
            @click="editPaddle()"
          >
            mdi-pencil
          </v-icon>
          Edit
        </div>
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
      editPaddle() {


      }
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
        { text: 'Date Uploaded', value: 'dtUploaded', class: 'dtuploaded-col'},
        { text: 'Actions', value: 'actions', sortable: false },
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
  ::v-deep .name-col, ::v-deep .dtuploaded-col, ::v-deep th, ::v-deep td {
    span {
      font-size:0.85rem!important;
      color:rgba(0,0,0,.87)!important;
      font-weight:500;
    }
  }
  ::v-deep .v-data-table>.v-data-table__wrapper>table>tbody>tr>td {
    height:30px;
    font-size:0.875; 
    .v-icon {
      color: var(--v-primary-lighten1);
    }
  }
  .edit-paddle {
    display: flex;
    align-items: center;
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    .v-icon {
      margin-right: 2px!important;
    }
  }
  .spinner-container {
    display:flex;
    justify-content:center;
    align-items:center;
    min-height:200px;
  }

</style>
