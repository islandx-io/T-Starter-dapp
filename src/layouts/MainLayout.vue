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
  </q-layout>
</template>

<script>
import LoginButton from "components/LoginButton.vue";

export default {
  name: "MainLayout",
  components: { LoginButton }
};
</script>
