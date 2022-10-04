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
      <v-icon v-show="thereIsAComment" color="accent">mdi-send</v-icon>
    </div>
    <v-list-item
      v-for="(comment, index) in comments"
      three-line
      :key="index"
    >
      <v-list-item-content>
        <v-list-item-title>
          Emilie <span class="date-posted">12/2/1980</span>
        </v-list-item-title>
        <v-list-item-subtitle>
          {{comment.text}}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
  </v-list>
</template>

<script>
export default {
  props: {
    comments: []
  },
  mounted() {

  },
  data() {
    return {
      count: 0,
      comment: ''
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
  .v-list-item {
    min-height:48px;
    .v-list-item__content {
      padding-top:0px; padding-bottom:0px;
    }
  }
  .v-list-item__title {
    font-size: 0.85rem;
    font-weight:bold;
    .date-posted {
      font-size:0.75rem;
      color: rgba(0,0,0,.6);
    }
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
