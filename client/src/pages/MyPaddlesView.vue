<template>
  <v-container>
    <v-dialog v-if="showEditPaddle" v-model="showEditPaddle" max-width="350" :hide-overlay="true">
      <add-edit-paddle
        :userIsLoggedIn="true"
        :userId="userId"
        :paddle="paddleToEdit"
        @close="showEditPaddle = false"
      ></add-edit-paddle>
    </v-dialog>
    <div class="spinner-container"
      v-if="!myPaddlesLoaded">
      <v-progress-circular
         indeterminate
         color="accent"
      ></v-progress-circular>
    </div>
    <v-icon color="accent" class="icon--close" @click="close()">mdi-close</v-icon>
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
        <div class="edit-paddle" @click="editPaddle(item)">
          <v-icon
            class="mr-2"
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
  import AddEditPaddle from '../pages/AddEditPaddle.vue';

  export default {
    name: 'MyPaddlesView',
    components: {
      AddEditPaddle
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
      close() {
        this.$emit('close',true);
      },
      editPaddle(thePaddle) {
        this.paddleToEdit = thePaddle;
        this.showEditPaddle = true;
      }
    },
    computed: {

    },
    data: () => ({
      myPaddles: [],
      myPaddlesLoaded: false,
      paddleToEdit: {},
      overlay: false,
      headers: [
        {
          text: 'Name',
          value: 'name',
          class: 'name-col'
        },
        { text: 'Date Uploaded', value: 'dtUploaded', class: 'dtuploaded-col'},
        { text: 'Actions', value: 'actions', sortable: false },
      ],
      showEditPaddle: false
    }),
  }
</script>

<style lang="scss" scoped>
  .container {
    background-color:white;
    position:relative; 
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
  }
  .v-icon.icon--close {
    position: absolute;
    right: 10px;
    top: 12px;
    cursor:pointer;
  }

</style>
