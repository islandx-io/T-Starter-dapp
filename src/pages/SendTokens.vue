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
      <q-card class="authenticated">
        <q-btn :to="`/wallet/${accountName}`" flat round class="self-start">
          <q-icon
            class="hover-accent"
            name="fas fa-chevron-circle-left"
            style="font-size: 50px"
          />
        </q-btn>
        <div class="column">
          <div class="row items-center justify-center q-pa-sm">
            <h2>Send</h2>
            <div class="row items-center justify-center">
              <token-avatar :token="selectedToken" :avatarSize="55" />
              <h2>
                {{ selectedToken }}
              </h2>
            </div>
          </div>
          <div v-if="isAuthenticated" class="q-gutter-y-sm">
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
            <q-input
              outlined
              bottom-slots
              v-model="memo"
              label="Memo"
              counter
              maxlength="255"
            />
          </div>
          <div class="text-center">
            <q-btn
              class="hover-accent"
              size="xl"
              dense
              flat
              @click="send"
              :icon="roundSend"
            >
              <q-tooltip>Send</q-tooltip>
            </q-btn>
          </div>
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
import { roundSend } from "@quasar/extras/material-icons-round";

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

    //TODO get this info from chain?
    token_contract() {
      return this.wallet.find(a => a.token_sym === this.selectedToken)
        .token_contract;
    },

    token_decimals() {
      return this.wallet.find(a => a.token_sym === this.selectedToken).decimals;
    },

    avatar() {
      return this.wallet.find(a => a.token_sym === this.selectedToken).avatar;
    }
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
            quantity: `${parseFloat(this.amount).toFixed(this.token_decimals)} ${
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
  created() {
    this.roundSend = roundSend;
  },
  mounted() {
    if (this.$route.query.token_sym !== undefined)
      this.selectedToken = this.$route.query.token_sym;
  }
};
</script>

<style lang="scss" scoped>
.q-card {
  &.not-authenticated {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    min-height: 100px;
  }
  &.authenticated {
    display: grid;
    align-items: stretch;
    grid-template-columns: 50px auto 50px;
    padding-bottom: 40px;
    & div {
      margin: 0;
      @media only screen and (max-width: 585px) {
        grid-column-start: 1;
        grid-column-end: 4;
      }
    }
  }
}
.header-bg {
  height: 160px;
  margin-bottom: -50px;
}
h2 {
  line-height: 45px;
  margin: 0 10px;
  font-size: 35px;
}
</style>
