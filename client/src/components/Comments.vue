<template>
  <v-list>
    <div class="comment-input-container">
      <v-textarea
       v-model="comment"
       filled
       auto-grow
       placeholder="Leave a comment. Include any notes about conditions."
       rows="2"
       row-height="20"
       hide-details
      ></v-textarea>
      <v-icon @click="checkLoginAndSubmitComment()" v-show="thereIsAComment" color="accent">mdi-send</v-icon>
    </div>
    <v-overlay :value="overlay"></v-overlay>
    <template v-if="!loadingComments">
        <v-list-item
          v-for="(comment, index) in comments"
          three-line
          :key="index"
        >
          <v-list-item-content>
            <v-list-item-content v-linkified>
              {{comment.comment}}
            </v-list-item-content>
            <v-list-item-subtitle>
              Posted by <span class="user-posted">{{comment.username}}</span> on <span class="date-posted">{{getFormattedDate(comment.dttimestamp)}}</span>
              <span class="delete-comment" v-if="userId == comment.uid" @click="deleteComment(comment.comment, index)">Delete</span>
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
    </template>
    <div style="position:absolute; left: 50%; top: 50%; transform: translate(-50%,-50%);" v-else>
      <v-progress-circular
         indeterminate
         color="accent"
         class="comments-loading-spinner"
      ></v-progress-circular>
    </div>
  </v-list>
</template>

<script>
  import NODE_API from '../utils/api';
  import Vue from 'vue';

export default {
  props: {
    userIsLoggedIn: Boolean,
    idPaddle: String,
    userId: String
  },
  destroyed() {

  },
  mounted() {
    NODE_API.get('/comment',{
      params: {
        idPaddle:this.idPaddle
      }
    }).then(response => {
      if(response.data.success) {
        this.comments = response.data.comments;
      }
      Vue.nextTick(() => {
        this.loadingComments = false;
      });
    })
    .catch(error => {
      console.log(error);
    });
  },
  methods: {
    deleteComment(commentText, index) {
      this.overlay = true;
      NODE_API.put('/comment', {comment:commentText, idPaddle:this.idPaddle}).then(response => {
        if (response.data.success) {
          this.comments.splice(index,1);
        }
        this.overlay = false;
      });
    },
    getFormattedDate(isoDate) {
      let dateObj = new Date(isoDate);
      let day = dateObj.getDate();
      let year = dateObj.getFullYear();
      let month = dateObj.getMonth();

      return `${month}/${day}/${year}`;
    },
    checkLoginAndSubmitComment() {
      if (!this.userIsLoggedIn) {
        this.$emit('showLoginDialog');
      } else {
        this.overlay = true;
        let reqObj = { comment: this.comment, idPaddle: this.idPaddle };
        NODE_API.post('/comment', reqObj).then(response => {
          if(response.data.success) {
            this.comments.unshift(response.data.comment);
            this.comment = '';
          }
          this.overlay = false;
        })
        .catch(error => {
          console.log(error);
        });
      }
    }
  },
  data() {
    return {
      count: 0,
      comment: '',
      comments: [],
      loadingComments: true,
      overlay: false
    }
  },
  computed: {
    thereIsAComment() {
      return this.comment.trim() !== '';
    },
  },
}
</script>

<style lang="scss" scoped>
  .delete-comment {
    font-weight:500;
    color: var(--v-primary-base);
    cursor:pointer;
    float:right;
  }
  .v-list-item {
    min-height:48px;
    padding: 7px 0px;
    margin-bottom: 5px;
    margin-top: 5px;
    border-bottom:1px solid var(--v-primary-base);
    .v-list-item__content {
      padding-top:0px; padding-bottom:0px;
        font-size:14px;
      .v-list-item__subtitle {
        font-size:12px;
        .date-posted, .user-posted {
          font-weight:500;
        }
      }
    }
  }
  .v-tab {
    padding:0px;
  }
  .v-tabs-bar {
    height:30px;
  }
  .v-input.v-textarea {
    margin-bottom:10px;
    font-size: 0.85rem;
    & + .v-btn {
      float:right;
      margin-top:-10px;
      border-radius:0px;
    }
  }
  ::v-deep .theme--light.v-text-field>.v-input__control>.v-input__slot:before {
        border-width:0px;
    }
  .v-tabs-items .v-sheet {
    padding-top:0px;
  }
  .comment-input-container {
    position:relative;
    .v-icon {
      position: absolute;
      right: 5px;
      bottom: 5px;
    }
  }

</style>
