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
          <token-avatar :token="getSymbol(xchainToken)" :avatarSize="23" />
          <div class="text-subtitle1 q-pl-xs">
            {{ getSymbol(xchainToken) }}
          </div>
        </div>
      </div>
    </template>
    <q-list class="bg-secondary">
      <q-item
        clickable
        v-close-popup
        v-for="token in tokenOptions"
        :key="token.id"
        flat
        size="lg"
        no-caps
        @click="$emit('update:xchainToken', token)"
      >
        <div class="flex items-center justify-center wrap">
          <div class="row items-center justify-center">
            <token-avatar
              :token="getSymbol(token)"
              :avatarSize="23"
            />
            <div class="text-subtitle1 q-pl-xs">
              {{ getSymbol(token) }}
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
  methods: {
    getSymbol(token) {
      if (token.remote_token_symbol) {
        return token.remote_token_symbol.split(",")[1];
      } else {
        return "";
      }
    }
  },
  props: {
    xchainToken: Object,
    tokenOptions: Array
  }
};
</script>
