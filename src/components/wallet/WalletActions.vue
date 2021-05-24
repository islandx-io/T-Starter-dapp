<template>
  <div class="row justify-end">
    <div
      :class="`action-container ${truncateActions ? 'truncate-actions' : ''}`"
    >
      <!-- withdraw start -->
      <q-btn
        outline
        flat
        :padding="actionButtonPadding"
        icon="fas fa-wallet"
        @click.stop="tryReclaim(props)"
        v-if="isStart(props.row.token_sym) && props.row.liquid !== 0"
        class="hover-accent"
      >
        <q-tooltip>Withdraw</q-tooltip>
      </q-btn>
      <!-- withdraw liquid -->
      <q-btn
        outline
        flat
        :padding="actionButtonPadding"
        icon="fas fa-wallet"
        @click.stop="tryWithdraw(props)"
        v-if="!isStart(props.row.token_sym) && props.row.liquid !== 0"
        class="hover-accent"
      >
        <q-tooltip>Withdraw</q-tooltip>
      </q-btn>
      <!-- receive token -->
      <q-btn
        outline
        flat
        :padding="actionButtonPadding"
        icon="fas fa-sign-in-alt"
        :to="{
          name: 'receive',
          query: { token_sym: props.row.token_sym }
        }"
        v-if="baseTokenSymbols.includes(props.row.token_sym)"
        class="hover-accent"
        @click.stop
      >
        <!-- <q-btn
        outline
        flat
        :padding="actionButtonPadding"
        icon="fas fa-sign-in-alt"
        target="_blank"
        type="a"
        :href="pTokenBridgeLink(props.row.token_sym)"
        v-if="baseTokenSymbols.includes(props.row.token_sym)"
        class="hover-accent"
        @click.stop
      > -->
        <q-tooltip>Receive</q-tooltip>
      </q-btn>
      <!-- buy telos -->
      <q-btn
        outline
        flat
        :padding="actionButtonPadding"
        icon="far fa-credit-card"
        v-if="props.row.token_sym === 'TLOS'"
        class="hover-accent"
        type="a"
        target="_blank"
        href="https://telos.net/buy/"
      >
        <q-tooltip>Buy</q-tooltip>
      </q-btn>
      <!-- buy START -->
      <q-btn
        outline
        flat
        :padding="actionButtonPadding"
        icon="far fa-credit-card"
        type="a"
        target="_blank"
        :href="buyStartUrl"
        v-if="isStart(props.row.token_sym)"
        class="hover-accent"
        @click.stop
      >
        <q-tooltip>Buy</q-tooltip>
      </q-btn>
      <!-- update stake -->
      <q-btn
        outline
        flat
        :padding="actionButtonPadding"
        icon="fas fa-thumbtack"
        @click.stop="tryUpdateStake(props)"
        v-if="isStart(props.row.token_sym) && canRelease"
        class="hover-accent"
      >
        <q-tooltip>Reclaim released stake</q-tooltip>
      </q-btn>
      <!-- send tokens -->
      <q-btn
        outline
        flat
        :padding="actionButtonPadding"
        :icon="roundSend"
        :to="{
          name: 'send',
          query: { token_sym: props.row.token_sym }
        }"
        v-if="props.row.balance > 0"
        class="hover-accent"
        @click.stop
      >
        <q-tooltip>Send</q-tooltip>
      </q-btn>
    </div>
    <!-- more button -->
    <q-btn
      outline
      flat
      padding="5px 0"
      class="hover-accent"
      icon="fas fa-ellipsis-v"
      v-if="this.$children.length > 4"
      @click.stop="truncateActions = !truncateActions"
    >
      <q-tooltip>More</q-tooltip>
    </q-btn>
  </div>
</template>

<script>
import { roundSend } from "@quasar/extras/material-icons-round";
import { mapGetters, mapActions } from "vuex";

export default {
  data() {
    return {
      buyStartUrl: process.env.BUY_START_URL,
      baseTokenSymbols: ["TLOS", "PBTC", "PETH", "PUSDC", "PUSDT", "EOS"], // TODO make dynamic
      truncateActions: true,
      actionButtonPadding: "5px 8px"
    };
  },
  props: {
    props: {},
    accountName: { require: true },
    stakeData: {}
  },

  created() {
    this.roundSend = roundSend;
  },

  computed: {
    // TODO If staked tokens can be released. i.e. past release date
    canRelease() {
      let now = new Date().valueOf();
      let can_release = false;
      this.stakeData.forEach(el => {
        if (now > Date.parse(el.first + "Z")) {
          can_release = true;
        }
      });
      if (can_release === true) {
        return true;
      } else {
        return false;
      }
    }
  },

  methods: {
    ...mapActions("account", ["resetWallet", "resetLiquid"]),
    pTokenBridgeLink(sym) {
      if (sym === "TLOS") {
        return "https://dapp.ptokens.io/tlos-on-eth/issue-redeem";
      } else if (sym === "PBTC") {
        return "https://dapp.ptokens.io/pbtc-on-telos/issue-redeem";
      } else if (sym === "PETH") {
        return "https://dapp.ptokens.io/peth-on-telos/issue-redeem";
      }
    },

    isStart(val) {
      return val === "START";
    },

    async withdrawTokens(amount_str) {
      const actions = [
        {
          account: process.env.CONTRACT_ADDRESS,
          name: "withdraw",
          data: {
            account: this.accountName,
            quantity: amount_str
          }
        }
      ];
      const transaction = await this.$store.$api.signTransaction(actions);
    },

    async reclaimTokens(amount_str) {
      const actions = [
        {
          account: process.env.CONTRACT_ADDRESS,
          name: "reclaimstake",
          data: {
            account: this.accountName,
            quantity: amount_str
          }
        }
      ];
      const transaction = await this.$store.$api.signTransaction(actions);
    },

    async updateStake() {
      const actions = [
        {
          account: process.env.CONTRACT_ADDRESS,
          name: "updatestake",
          data: {
            account: this.accountName
          }
        }
      ];
      const transaction = await this.$store.$api.signTransaction(actions);
    },

    async tryWithdraw(props) {
      try {
        let amount_str = this.$toChainString(
          props.row.liquid,
          props.row.decimals,
          props.row.token_sym
        );
        await this.withdrawTokens(amount_str);
        await this.resetLiquid();
        await this.$listeners.reloadWalletInfo();
        this.$q.notify({
          color: "green-4",
          textColor: "white",
          icon: "cloud_done",
          message: "Tokens claimed"
        });
      } catch (error) {
        this.$errorNotification(error);
      }
    },

    async tryReclaim(props) {
      try {
        let amount_str = this.$toChainString(
          props.row.liquid,
          props.row.decimals,
          props.row.token_sym
        );
        await this.reclaimTokens(amount_str);
        await this.resetLiquid();
        await this.$listeners.reloadWalletInfo();
        this.$q.notify({
          color: "green-4",
          textColor: "white",
          icon: "cloud_done",
          message: "Tokens claimed"
        });
      } catch (error) {
        this.$errorNotification(error);
      }
    },

    async tryUpdateStake() {
      try {
        await this.updateStake();
        await this.resetLiquid();
        await this.$listeners.reloadWalletInfo();
        this.$q.notify({
          color: "green-4",
          textColor: "white",
          icon: "cloud_done",
          message: "Staked Tokens Updated"
        });
      } catch (error) {
        this.$errorNotification(error);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.truncate-actions.action-container .q-btn:nth-child(n + 5) {
  color: $primary;
  display: none;
}
.q-btn {
  font-size: 12px;
}
</style>
