<template>
  <v-list>
    <v-textarea
     filled
     auto-grow
     placeholder="Leave a comment. Include any notes about conditions."
     rows="2"
     row-height="20"
     hide-details
    ></v-textarea>
    <v-btn color="accent" depressed small>Comment</v-btn>
    <v-list-item
      v-for="(comment, index) in comments"
      two-line
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
  data() {
    return {
      count: 0
    }
  }
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
</style>