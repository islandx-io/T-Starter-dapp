<template>
  <div >
     <q-btn-dropdown
            no-caps
            flat
            class="q-ml-md bg-secondary"
            padding="xs"
            style="margin: 0px"
            color="black"
          >
            <template v-slot:label>
              <div class="flex items-center justify-center wrap q-pa-xs">
                <div class="row items-center justify-center">
                  <token-avatar :token="selectedChain" :avatarSize="23" />
                  <h2>
                    {{ selectedChain }}
                  </h2>
                </div>
              </div>
            </template>
            <q-list class="bg-secondary">
              <q-item
                clickable
                v-close-popup
                v-for="chain in chainOptions"
                :key="chain"
                @click="
                  selectedChain = chain;
                "
                flat
                size="lg"
                no-caps
                padding="xs"
              >
                <q-item-section avatar>
                  <token-avatar :token="chain" :avatarSize="23" />
                </q-item-section>
                <q-item-section>
                  <q-item-label style="font-weight: 500">
                    {{ chain }}
                  </q-item-label>
                </q-item-section>
                
              </q-item>
            </q-list>
          </q-btn-dropdown>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import tokenAvatar from "src/components/TokenAvatar";


export default {
  // name: 'ComponentName',
  components: {  tokenAvatar},

  data() {
    return {
      selectedChain: "TELOS",
      chainOptions: ["TELOS", "EOS"]
    };
  },

  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName"]),
    ...mapGetters("blockchains", ["currentChain"]),

  },

  methods: {
    ...mapActions("account", ["login", "logout", "autoLogin"]),
    ...mapActions("blockchains", ["setNewChain"]),

    switchChain() {
      this.setNewChain(this.selectedChain.toUpperCase());
    },

    capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
  },

  watch: {
    selectedChain() {
      if (this.selectedChain != localStorage.getItem("selectedChain")) {
        this.switchChain();
        this.logout();
        // this.$router.push({ path: "/" });
        this.$router.go();
      }
    }
  },

  mounted() {
    // if already saved in local storage
    if (
      localStorage.getItem("selectedChain") != null &&
      localStorage.getItem("selectedChain") != this.selectedChain
    ) {
      this.selectedChain = localStorage.getItem("selectedChain");
    }
    this.setNewChain(this.selectedChain.toUpperCase());
  }
};
</script>

<style lang="scss" scoped>
h2 {
  line-height: 1rem;
  margin: 0 -10px 0 5px;
  font-size: 1rem;
  font-weight: 500;
}
</style>
