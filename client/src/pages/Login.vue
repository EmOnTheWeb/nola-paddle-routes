<template>
  <div>
    <!--sign in form -->
    <v-card v-show="!showSignUp">
      <v-card-title>Sign in</v-card-title>
      <v-icon color="accent" class="icon--close" @click="close()">mdi-close</v-icon>
      <v-card-text>
        <v-form v-model="valid">
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
            validate-on-blur
          ></v-text-field>

          <v-text-field
            v-model="password"
            :rules="passwordRules"
            label="Password"
            class="mb-2"
            required
            filled
            outlined
            dense
            validate-on-blur
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
            <p>Don't have an account?<a @click="showSignUp = true">&nbsp;Sign Up</a></p>
          </section>
        </v-form>
      </v-card-text>
    </v-card>
    <!--sign up form-->
    <v-card v-show="showSignUp">
      <v-card-title>Sign up</v-card-title>
      <v-icon color="accent" class="icon--close" @click="close()">mdi-close</v-icon>
      <v-card-text>
        <v-form v-model="signupValid">
          <div id="g-btn-div2"></div>
          <div style="text-align:center;margin:13px 0px;"> or </div>
          <v-text-field
            v-model="signupUsername"
            :rules="usernameRules"
            label="Username"
            class="mb-2"
            required
            filled
            outlined
            dense
            validate-on-blur
          ></v-text-field>

          <v-text-field
            v-model="signupEmail"
            :rules="emailRules"
            label="E-mail"
            class="mb-2"
            required
            filled
            outlined
            dense
            validate-on-blur
          ></v-text-field>

          <v-text-field
            v-model="signupPassword"
            :rules="passwordRules"
            label="Password"
            class="mb-2"
            required
            filled
            outlined
            dense
            validate-on-blur
          ></v-text-field>

          <v-text-field
            v-model="confirmPassword"
            :rules="passwordRules.concat(confirmPasswordRules)"
            label="Confirm Password"
            class="mb-2"
            required
            filled
            outlined
            dense
            validate-on-blur
          ></v-text-field>

          <v-btn
           class="mb-1"
           :disabled="!signupValid"
           color="accent"
           block
          >
          Sign Up
          </v-btn>
          <section class="footer">
            <p>Already have an account?<a @click="showSignUp = false">&nbsp;Sign In</a></p>
          </section>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
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
        { theme: "outline", width:"318"}  // customization attributes
      );
      google.accounts.id.renderButton(
        document.getElementById("g-btn-div2"),
        { theme: "outline", text: "signup_with"}  // customization attributes
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
      confirmPasswordRules() {
        return () => (this.signupPassword === this.confirmPassword) || 'Password must match'
      },
    },
    data: () => ({
      valid: false,
      password: '',
      email: '',
      signupValid: false,
      signupUsername: '',
      signupEmail: '',
      signupPassword: '',
      confirmPassword: '',
      usernameRules: [
        v => !!v || "Username is required"
      ],
      passwordRules: [
        v => !!v || "Password is required"
      ],
      emailRules: [
        v => !!v || 'E-mail is required',
        v => /.+@.+/.test(v) || 'E-mail must be valid'
      ],
      showSignUp: false
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

  ::v-deep .v-text-field__details {
    display:none;
  }

  ::v-deep .v-input.error--text {
    margin-bottom:0px!important;
    .v-text-field__details{
      margin-top:1px;
      display:block;
    }
  }

  ::v-deep div.v-input__slot {
    margin-bottom:0px!important;
  }


</style>
