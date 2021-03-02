<template>
  <div>
    <div class="row">
      <q-input
        color="primary"
        label="Site Name"
        v-model="link.key"
        lazy-rules
        :rules="[val => (val && val.length > 1) || 'Enter site name']"
      >
      </q-input>
      <q-input
        color="primary"
        label="Site Link"
        v-model="link.value"
        lazy-rules
        :rules="[val => (val && val.length > 1) || 'Enter site link']"
      >
      </q-input>
      <q-btn
        round
        color="primary"
        icon="close"
        v-on:click="$emit('deleteThisLink', index)"
      />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    // siteName: {
    //   default: " "
    // },
    // siteLink: {
    //   default: " "
    // },
    link: {},
    index: {}
  },
  data() {
    return {};
  },
  computed: {},
  methods: {}
};
</script>
