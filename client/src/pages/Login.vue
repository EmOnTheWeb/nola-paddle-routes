<template>
  <div>
    <!--sign in form -->
    <v-card v-show="!showSignUp">
      <v-card-title>Sign in</v-card-title>
      <v-icon color="accent" class="icon--close" @click="close()">mdi-close</v-icon>
      <v-card-text>
        <v-form v-model="valid" ref="signinForm">
          <!-- <div id="g-btn-div"></div>
          <div style="text-align:center;margin:13px 0px;"> or </div> -->

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

          <v-list
            v-if="signInErrors.length"
            color="transparent"
            text-color="error"
          >
            <v-list-item
              v-for="(error,index) in signInErrors"
              :key="index"
            >
              {{error}}
            </v-list-item>
          </v-list>

          <v-btn
           class="mb-1"
           :disabled="!valid"
           color="accent"
           block
           @click="validateAndSubmitSignin()"
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
      <div v-if="!showSignUpSuccessMessage">
        <v-card-title>Sign up</v-card-title>
        <v-icon color="accent" class="icon--close" @click="close()">mdi-close</v-icon>
        <v-card-text>
          <v-form ref="signupForm">
            <!-- <div id="g-btn-div2"></div>
            <div style="text-align:center;margin:13px 0px;"> or </div> -->
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
            <v-list
              v-if="signUpErrors.length"
              color="transparent"
              text-color="error"
            >
              <v-list-item
                v-for="(error,index) in signUpErrors"
                :key="index"
              >
                {{error}}
              </v-list-item>
            </v-list>
            <v-btn
             class="mb-1"
             @click="validateAndSubmitSignup()"
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
      </div>
      <div v-else>
        <v-card-text class="sign-up-success-message">
          Thanks for signing up!
          <a @click="close()">&nbsp;Back to Paddles</a>
        </v-card-text>
      </div>
    </v-card>
  </div>
</template>

<script>
  import Vue from 'vue';
  import NODE_API from '../utils/api';

  export default {
    name: 'Login',
    props: {
      show: Boolean
    },
    mounted() {
      // google.accounts.id.initialize({
      //   client_id: "391860046963-d7m4ajreb15t9bj2dakrfh5gm4as798s.apps.googleusercontent.com",
      //   callback: this.handleCredentialResponse
      // });
      // google.accounts.id.renderButton(
      //   document.getElementById("g-btn-div"),
      //   { theme: "outline", width:"318"}  // customization attributes
      // );
      // google.accounts.id.renderButton(
      //   document.getElementById("g-btn-div2"),
      //   { theme: "outline", text: "signup_with"}  // customization attributes
      // );
    },
    methods: {
      handleCredentialResponse(response) {
        console.log("Encoded JWT ID token: " + response.credential);
      },
      validateAndSubmitSignin() {
        let isValid = this.$refs.signinForm.validate();
        if (isValid) {
          let reqObj = {
            "email":this.email,
            "password":this.password
          }

          NODE_API.post('/signin', reqObj).then(response => {
            if(response.data.success === false) {
              this.signInErrors = response.data.errors;
            } else {
              this.$emit('close',response.data);
            }
          })
          .catch(error => {
            console.log(error);
          });
        }

      },
      validateAndSubmitSignup() {
        let isValid = this.$refs.signupForm.validate();
        if (isValid) {

          let reqObj = {
            "username":this.signupUsername,
            "email":this.signupEmail,
            "password":this.signupPassword
          }

          NODE_API.post('/user', reqObj).then(response => {
            if(response.data.success === false) {
              this.signUpErrors = response.data.errors;
            } else if (response.data.success === true) {
              this.showSignUpSuccessMessage = true;
              this.$emit('setUserData',response.data);
            }
          })
          .catch(error => {
            console.log(error);
          });
        }
      },
      close() {
        this.$emit('close');
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
      showSignUp: false,
      signUpErrors: [],
      showSignUpSuccessMessage: false,
      signInErrors: []
    }),
  }
</script>

<style lang="scss" scoped>
  .v-list {
    padding:0px;
    margin-top:-7px;
  }
  .v-list-item {
    min-height:0px;
    color: var(--v-error-base)!important;
    padding:0px;
    font-size:12px;
    line-height:15px;
  }
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

  .sign-up-success-message a {
    text-decoration:none;
    font-size:14px;
    color: var(--v-accent-base);
    font-weight:500;
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
      padding:0px;
    }
  }

  ::v-deep div.v-input__slot {
    margin-bottom:0px!important;
  }


</style>
