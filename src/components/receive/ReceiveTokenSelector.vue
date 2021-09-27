<template>
  <q-btn-dropdown
    no-caps
    flat
    class="q-ml-md bg-secondary"
    padding="xs"
    style="margin: 8px"
  >
    <template v-slot:label>
      <div class="flex items-center justify-center wrap q-pa-sm">
        <h2>
          Receive
        </h2>
        <div class="row items-center justify-center">
          <token-avatar :token="selectedToken" :avatarSize="55" />
          <h2>
            {{ selectedToken }}
          </h2>
        </div>
      </div>
    </template>
    <q-list class="bg-secondary">
      <q-item
        clickable
        v-close-popup
        v-for="token in tokens"
        :key="token"
        @click="$emit('update:selectedToken', token)"
        flat
        size="lg"
        no-caps
        padding="xs"
      >
        <q-item-section avatar>
          <token-avatar :token="token" :avatarSize="40" />
        </q-item-section>
        <q-item-section>
          <q-item-label style="font-weight: 500">
            {{ token }}
          </q-item-label>
        </q-item-section>
        <q-item-section side v-if="baseTokens.includes(token)">
          <q-btn
            icon="fas fa-external-link-alt"
            class="hover-accent"
            type="a"
            target="_blank"
            :href="pTokenBridgeLink(token)"
            size="12px"
            round
            flat
          />
          <q-tooltip>pTokens dapp</q-tooltip>
        </q-item-section>
      </q-item>
    </q-list>
  </q-btn-dropdown>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import tokenAvatar from "src/components/TokenAvatar";
import pTokensBridge from "src/components/receive/PTokensBridge";

export default {
  props: ["selectedToken"],
  components: { tokenAvatar },
  mixins: [pTokensBridge],
  computed: {
    ...mapGetters("blockchains", ["currentChain"]),
    ...mapGetters("tport", ["getTPortTokens"]),

    baseTokens() {
      if (this.currentChain.NETWORK_NAME === "TELOS") {
        return ["PBTC", "PETH", "TLOS", "PUSDC", "PUSDT"];
      } else if (this.currentChain.NETWORK_NAME === "EOS") {
        return ["PBTC", "PETH", "EOS"];
      } else {
        return ["PBTC", "PETH", "WAX"];
      }
    },

    tportTokens() {
      if (this.getTPortTokens.length > 0) {
        return this.getTPortTokens.map(el => el.token.sym);
      } else return [];
    },

    tokens() {
      return [...this.baseTokens, ...this.tportTokens];
    }
  }
};
</script>
