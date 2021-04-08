<template>
  <q-avatar :size="`${avatarSize}px`">
    <q-spinner-puff
      v-if="src(avatar) === 'Loading'"
      :style="avatarStyle"
      color="primary"
    />
    <q-img
      v-else-if="src(avatar)"
      :src="src(avatar)"
      alt="Avatar"
      :style="avatarStyle"
    >
      <template v-slot:error>
        <div class="transparent" style="padding: 0" v-html="identicon" />
      </template>
      <template v-slot:loading>
        <q-spinner-puff color="primary" :style="avatarStyle" />
      </template>
    </q-img>
    <div v-else v-html="identicon" />
  </q-avatar>
</template>

<script>
import { toSvg } from "jdenticon";
export default {
  props: {
    token: {
      type: String,
      default: ""
    },
    avatar: {
      type: String,
      default: ""
    },
    avatarSize: {
      type: Number,
      default: 60
    }
  },
  computed: {
    identicon() {
      let val = this.avatar;
      if (val === "") val = this.token;
      return toSvg(val, this.avatarSize);
    },
    avatarStyle() {
      return `width:${this.avatarSize}px; height:${this.avatarSize}px`;
    }
  },
  methods: {
    src(avatar) {
      let result = avatar;
      if (result === "") {
        let token = this.token.toUpperCase();
        if (token === "PETH") result = "/tokens/peth.png";
        else if (token === "PBTC") result = "/tokens/pbtc.png";
        else if (token === "START") result = "/tokens/start.png";
        else if (token === "TLOS") result = "/tokens/tlos.png";
      }
      return result;
    }
  }
};
</script>
