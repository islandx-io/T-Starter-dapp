<template>
  <q-btn-dropdown
    no-caps
    flat
    class="bg-secondary"
    padding="sm"
    style="margin: 0px"
    color="black"
    outline
  >
    <template v-slot:label>
      <div class="flex items-center justify-center wrap">
        <div class="row items-center justify-center">
          <token-avatar :token="selectedNetwork" :avatarSize="23" />
          <div class="text-subtitle1 q-pl-xs">
            {{ selectedNetwork }}
          </div>
        </div>
        <q-tooltip anchor="top middle" self="bottom middle">
          To Network
        </q-tooltip>
      </div>
    </template>
    <q-list class="bg-secondary">
      <q-item
        clickable
        v-close-popup
        v-for="network in networkOptions"
        :key="network"
        flat
        size="lg"
        no-caps
        @click="$emit('changeNetwork', network)"
      >
        <div class="flex items-center justify-center wrap">
          <div class="row items-center justify-center">
            <token-avatar :token="network" :avatarSize="23" />
            <div class="text-subtitle1 q-pl-xs">
              {{ network }}
            </div>
          </div>
        </div>
      </q-item>
    </q-list>
  </q-btn-dropdown>
</template>

<script>
import tokenAvatar from "src/components/TokenAvatar";
export default {
  components: { tokenAvatar },
  data() {
    return {};
  },
  props: {
    selectedNetwork: String,
    networkOptions: Array
  }
};
</script>
