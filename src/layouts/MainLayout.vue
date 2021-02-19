<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>
          T-STARTER
        </q-toolbar-title>

        <login-button></login-button>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer elevated class="column">
      <div class="col-xl-4 row items-center justify-between ">
        <div class="col-sm-4">
          <h4>T-STARTER</h4>
          <p class="text-body1">
            The place to discover and back projects building on Telos
          </p>
        </div>
        <!-- <div class="col"></div> -->
        <div class="col-sm-3">
          <p class="text-weight-bolder">Contact Us</p>
          <div class="row justify-start">
            <q-btn type="a" href="#">
              <q-icon size="sm" name="fab fa-medium-m" />
            </q-btn>
            <q-btn type="a" href="#">
              <q-icon size="sm" name="fab fa-telegram-plane" />
            </q-btn>
          </div>
        </div>
      </div>
      <p class="self-center">Copyright 2021. T-STARTER. All Rights Reserved</p>
    </q-footer>
  </q-layout>
</template>

<script>
import LoginButton from "components/LoginButton.vue";

export default {
  name: "MainLayout",
  components: { LoginButton }
};
</script>
