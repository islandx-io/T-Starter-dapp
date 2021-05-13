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
        <!-- TODO Make expandable -->
      </q-item-section>
      <q-item-section side top>
        <q-item-label>
          {{ toDate(row.timestamp) }}
        </q-item-label>
        <div class="row q-gutter-x-xs">
          <q-btn
            v-if="row.account === accountName"
            icon="fas fa-edit"
            class="hover-accent"
            size="sm"
            padding="sm"
            flat
          />
          <q-btn
            v-if="row.account === accountName"
            icon="fas fa-trash-alt"
            class="hover-accent"
            size="sm"
            padding="sm"
            flat
            @click="removeUserComment(row)"
          />
        </div>
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
    START_info: {
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
      buyStartUrl: process.env.BUY_START_URL,
      editID: -1 // for none
    };
  },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName"]),
    ...mapGetters("pools", ["getPoolByID"])
  },
  methods: {
    ...mapActions("pools", ["getBalanceFromChain", "getChainPoolByID"]),
    ...mapActions("account", ["getChainSTART"]),
    toDate(timeStamp) {
      if (timeStamp === "Loading") return timeStamp;
      else return date.formatDate(timeStamp, "DD MMMM YYYY @ HH:mm");
    },
    errorNotification(error) {
      this.$q.notify({
        color: "red-5",
        textColor: "white",
        icon: "warning",
        message: `${error}`
      });
    },
    async postUserComment() {
      // TODO Add try-catch
      if (this.isAuthenticated && this.userComment !== "") {
        await this.getChainSTART(this.accountName);
        if (this.START_info.liquid < 1 && this.START_info.balance < 1) {
          this.insufficient_start_show = true;
        } else {
          const actions = [];
          if (this.START_info.liquid < 1) {
            actions.push(this.$startBalanceToLiquidAction(this.START_info));
          }
          actions.push({
            account: process.env.CONTRACT_ADDRESS,
            name: "comment",
            data: {
              account: this.accountName,
              pool_id: this.pool.id,
              memo: this.userComment
            }
          });
          try {
            const transaction = await this.$store.$api.signTransaction(actions);
            this.userComment = "";
          } catch (error) {
            this.errorNotification(error); // FIXME Unexpected error messages
          }
          this.$emit("transaction-complete");
        }
      }
    },
    async removeUserComment(comment) {
      if (this.isAuthenticated && comment.account === this.accountName) {
        const actions = [
          {
            account: process.env.CONTRACT_ADDRESS,
            name: "rmcomment",
            data: {
              pool_id: this.pool.id,
              comment_id: comment.id
            }
          }
        ];
        try {
          const transaction = await this.$store.$api.signTransaction(actions);
        } catch (error) {
          this.errorNotification(error);
        }
        this.$emit("transaction-complete");
      }
    }
  }
};
</script>

<style lang="scss" scoped></style>
