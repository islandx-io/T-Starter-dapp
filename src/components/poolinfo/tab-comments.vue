<template>
  <q-list class="comments-tab">
    <q-item v-for="row in pool.comments_table" :key="row.id">
      <q-item-section>
        <q-item-label class="text-subtitle1 text-weight-bold" lines="1">{{
          row.account
        }}</q-item-label>
        <q-item-label class="text-subtitle1" lines="2">
          {{ row.comment }}
        </q-item-label>
      </q-item-section>
      <q-item-section side top>
        {{ toDate(row.timestamp) }}
      </q-item-section>
    </q-item>
    <q-item>
      <q-form
        @submit="postUserComment"
        class="col row items-center q-gutter-x-sm"
      >
        <q-input
          class="col"
          color="primary"
          v-model="userComment"
          label="Comment"
          lazy-rules
          :disable="!isAuthenticated"
          maxlength="255"
          outlined
        />
        <q-btn
          class="hover-accent"
          color="primary"
          padding="sm md"
          :label="isAuthenticated ? 'Post' : 'Login to post'"
          :disable="!isAuthenticated"
          @click="postUserComment"
          type="submit"
        />
      </q-form>
    </q-item>
    <q-dialog v-model="insufficient_start_show">
      <q-card>
        <q-card-section>
          <div class="text-h6">Insufficient START</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          You don't have enough START to complete this action.
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            class="hover-accent"
            flat
            label="Cancel"
            color="primary"
            v-close-popup
          />
          <q-btn
            flat
            class="hover-accent"
            label="Buy START"
            color="primary"
            v-close-popup
            type="a"
            target="_blank"
            :href="buyStartUrl"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-list>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { date } from "quasar";
export default {
  name: "tab-comments",
  props: {
    platform_token: {
      required: true
    },
    pool: {
      required: true
    }
  },
  data() {
    return {
      userComment: "",
      insufficient_start_show: false,
      buyStartUrl: process.env.BUY_START_URL
    };
  },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName"])
  },
  methods: {
    ...mapActions("pools", ["getBalanceFromChain"]),
    toDate(timeStamp) {
      if (timeStamp === "Loading") return timeStamp;
      else return date.formatDate(timeStamp, "DD MMMM YYYY @ HH:mm");
    },
    async postUserComment() {
      if (this.isAuthenticated && this.userComment !== "") {
        let payload = {
          address: this.platform_token.contract,
          sym: "START",
          accountName: this.accountName
        };
        let start_balance = this.$chainToQty(
          await this.getBalanceFromChain(payload)
        );
        if (start_balance > 1) {
          const actions = [];
          actions.push({
            account: process.env.CONTRACT_ADDRESS,
            name: "comment",
            data: {
              account: this.accountName,
              pool_id: this.pool.id,
              memo: this.userComment
            }
          });
          const transaction = await this.$store.$api.signTransaction(actions);
          await this.loadChainData();
          this.getPoolInfo();
        } else this.insufficient_start_show = true;
      }
    }
  }
};
</script>

<style lang="scss" scoped></style>
