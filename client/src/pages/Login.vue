<template>
  <v-card>
    <v-card-title>Sign in</v-card-title>
    <v-icon color="accent" class="icon--close" @click="close()">mdi-close</v-icon>
    <v-card-text>
      <v-form v-model="valid" lazy-validation>
        <div id="g-btn-div"></div>
        <div style="text-align:center;margin:13px 0px;"> or </div>

        <v-text-field
          v-model="email"
          :rules="emailRules"
          label="E-mail"
          class="mb-2"
          required
          filled
          outlined
          dense
          hide-details
        ></v-text-field>

        <v-text-field
          v-model="password"
          label="Password"
          class="mb-2"
          required
          filled
          outlined
          dense
          hide-details
        ></v-text-field>
        <v-btn
         class="mb-1"
         :disabled="!valid"
         color="accent"
         block
        >
        Sign In
        </v-btn>
        <p><a style="font-size:0.75rem;">Forgot your password?</a></p>
        <section class="footer">
          <p>Don't have an account?<a>&nbsp;Sign Up</a></p>
        </section>
      </v-form>
    </v-card-text>
  </v-card>
  <!-- <v-card v-show>
    <v-progress-circular
       indeterminate
       color="accent"
    ></v-progress-circular>
  </v-card> -->
</template>

<script>
  import Vue from 'vue';

  export default {
    name: 'Login',
    props: {
      show: Boolean
    },
    mounted() {
      google.accounts.id.initialize({
        client_id: "391860046963-d7m4ajreb15t9bj2dakrfh5gm4as798s.apps.googleusercontent.com",
        callback: this.handleCredentialResponse
      });
      google.accounts.id.renderButton(
        document.getElementById("g-btn-div"),
        { theme: "outline", width: "300"}  // customization attributes
      );
    },
    methods: {
      handleCredentialResponse(response) {
        console.log("Encoded JWT ID token: " + response.credential);
      },
      close() {
        this.$emit('close',true);
      }
    },
    computed: {

    },
    data: () => ({
      valid: false,
      // username: '',
      // nameRules: [
      //   v => !!v || 'Name is required',
      //   v => v.length <= 30 || 'Name must be less than 30 characters',
      // ],
      password: '',
      email: '',
      emailRules: [
        v => !!v || 'E-mail is required',
        v => /.+@.+/.test(v) || 'E-mail must be valid',
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
  ::v-deep .v-text-field__details {
    margin-bottom:0px !important;
  }

  .v-card p {
    margin-bottom:0px;
    color: var(--v-primary-base);
    a {
     text-decoration:none;
     font-size:14px;
     color: var(--v-accent-base);
     font-weight:500;
    }
  }

  .v-card .footer p {
    text-align:center;
    margin-top:20px;
    margin-bottom:4px;
  }


</style>
