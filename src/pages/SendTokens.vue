<template>
  <q-page>
    <section class="header-bg" />
    <section
      class="body-container"
      style="max-width: 580px"
      v-if="!isAuthenticated"
    >
      <q-card class="not-authenticated">
        <div class="text-subtitle1">Please login</div>
      </q-card>
    </section>
    <section class="body-container" style="max-width: 580px" v-else>
      <q-card>
      <q-btn :to="`/wallet/${accountName}`" flat round class="self-start">
        <q-icon name="fas fa-chevron-circle-left" style="font-size: 50px" />
      </q-btn>
        <div class="row items-center justify-center">

          <h2>
            Sending:
          </h2>
          <token-avatar :token="selectedToken" :avatar="this.avatar" :avatarSize="55" />
          <h2>
            {{ selectedToken }}
          </h2>
        </div>
        <div v-if="isAuthenticated">
          <q-input
            outlined
            autocapitalize="off"
            bottom-slots
            v-model="to"
            label="To"
            counter
            maxlength="12"
          />
          <q-input
            outlined
            bottom-slots
            :suffix="selectedToken"
            v-model="amount"
            label="Amount"
            counter
            type="number"
            maxlength="12"
          >
          </q-input>
          <q-input outlined bottom-slots v-model="memo" label="Memo" counter />
          <q-btn size="xl" round dense flat icon="send" @click="send" />
          <q-dialog v-model="showTransaction" confirm>
            <q-card>
              <q-card-section class="row">
                <q-avatar
                  icon="arrow_forward"
                  color="primary"
                  text-color="white"
                />
                <span class="q-ml-sm">
                  Transaction sent, click to view in block explorer.
                </span>
                <q-item
                  clickable
                  tag="a"
                  target="_blank"
                  :href="`${explorerUrl}/transaction/${transaction}`"
                  class="q-ml-sm"
                  >{{ transaction }}</q-item
                >
              </q-card-section>
              <q-card-actions align="right">
                <q-btn flat label="Ok" color="primary" v-close-popup></q-btn>
              </q-card-actions>
            </q-card>
          </q-dialog>
        </div>
      </q-card>
    </section>
  </q-page>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import tokenAvatar from "src/components/TokenAvatar";

export default {
  components: { tokenAvatar },
  data() {
    return {
      to: null,
      amount: null,
      memo: null,
      showTransaction: null,
      transaction: null,
      explorerUrl: process.env.NETWORK_EXPLORER,
      selectedToken: "TLOS"
    };
  },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName", "wallet"]),

    token_contract() {
      return this.wallet.find(a => a.token_sym === this.selectedToken).token_contract;
    },

    avatar() {
      return this.wallet.find(a => a.token_sym === this.selectedToken).avatar;
    },
  },
  methods: {
    ...mapActions("account", ["accountExists"]),

    async send() {
      if (!(await this.accountExists(this.to))) {
        this.$q.notify({
          type: "negative",
          message: `Account ${this.to} does not exist`
        });
        return;
      }

      const actions = [
        {
          account: this.token_contract,
          name: "transfer",
          data: {
            from: this.accountName.toLowerCase(),
            to: this.to,
            quantity: `${parseFloat(this.amount).toFixed(4)} ${
              this.selectedToken
            }`,
            memo: this.memo
          }
        }
      ];
      const transaction = await this.$store.$api.signTransaction(actions);
      if (transaction) {
        this.showTransaction = true;
        this.transaction = transaction.transactionId;
      }
    }
  },

  mounted() {
    if (this.$route.query.token_sym !== undefined)
      this.selectedToken = this.$route.query.token_sym;
  }
};
</script>

<style lang="scss" scoped>
.header-bg {
  height: 160px;
  margin-bottom: -50px;
}
</style>
