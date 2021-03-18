<template>
  <q-avatar :size="`${avatarSize}px`">
    <q-icon
      v-if="avatar === 'TLOS'"
      :size="`${avatarSize}px`"
      name="fas fa-circle"
      color="primary"
    />
    <q-img
      v-else-if="src"
      :src="src"
      alt="Avatar"
      :style="`width:${avatarSize}px; height:${avatarSize}px`"
    >
      <template v-slot:error>
        <div class="transparent" style="padding: 0" v-html="identicon" />
      </template>
      <template v-slot:loading>
        <q-spinner-puff color="primary" />
      </template>
    </q-img>
    <div v-else v-html="identicon" />
  </q-avatar>
</template>

<script>
import { toSvg } from "jdenticon";
export default {
  props: {
    avatar: {
      type: String,
      default: "",
      required: true
    },
    poolID: {
      type: Number,
      default: 0
    },
    avatarSize: {
      type: Number,
      default: 60,
      required: false
    }
  },
  computed: {
    identicon() {
      return toSvg(this.poolID, this.avatarSize);
    },
    src() {
      let result = this.avatar;
      if (this.avatar === "PETH") result = "/tokens/peth.png";
      else if (this.avatar === "PBTC") result = "/tokens/pbtc.png";
      return result;
    }
  }
};
</script>
