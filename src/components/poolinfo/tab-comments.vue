<template>
  <q-list class="comments-tab">
    <q-item
      v-for="row in pool.comments_table"
      :key="row.id"
      style="min-height: 60px"
    >
      <q-item-section>
        <q-item-label class="text-subtitle1 text-weight-bold" lines="1">
          {{ row.account }}
        </q-item-label>
        <q-item-label v-if="row.id !== editID" class="text-subtitle1" lines="2">
          {{ row.comment }}
        </q-item-label>
        <q-form
          @submit="updateUserComment(row)"
          v-if="row.id === editID"
          class="row items-center q-gutter-x-xs q-pt-sm"
        >
          <q-input
            class="col"
            color="primary"
            :value="row.comment"
            @input="editComment"
            lazy-rules
            :disable="!isAuthenticated"
            maxlength="255"
            outlined
            autogrow
          />
          <q-btn
            class="hover-accent"
            color="primary"
            padding="sm md"
            :disable="!isAuthenticated"
            type="submit"
            label="Update"
          />
        </q-form>
        <!-- TODO Make expandable -->
        <!-- FIXME Vuex state mutation error -->
      </q-item-section>
      <q-item-section side top>
        <q-item-label>
          {{ toDate(row.timestamp) }}
        </q-item-label>
        <div class="row q-gutter-x-xs q-pt-xs">
          <q-btn
            v-if="row.account === accountName"
            :icon="row.id === editID ? 'fas fa-times-circle' : 'fas fa-edit'"
            class="hover-accent"
            size="sm"
            padding="sm"
            flat
            @click="cencelEdit(row.id)"
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
          autogrow
        />
        <q-btn
          class="hover-accent"
          color="primary"
          padding="sm md"
          :label="isAuthenticated ? 'Post' : 'Login to post'"
          :disable="!isAuthenticated"
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
      editID: -1, // for none
      updatedComment: ""
    };
  },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName"])
  },
  methods: {
    ...mapActions("pools", ["getBalanceFromChain", "getChainPoolByID"]),
    ...mapActions("account", ["getChainSTART"]),
    toDate(timeStamp) {
      if (timeStamp === "Loading") return timeStamp;
      else return date.formatDate(timeStamp, "DD MMMM YYYY @ HH:mm");
    },
    cencelEdit(id) {
      if (id === this.editID) this.editID = -1;
      else this.editID = id;
    },
    errorNotification(error) {
      this.$q.notify({
        color: "red-5",
        textColor: "white",
        icon: "warning",
        message: `${error}`
      });
    },
    editComment(value) {
      this.updatedComment = value;
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
    },
    async updateUserComment(comment) {
      if (this.isAuthenticated && comment.account === this.accountName) {
        const actions = [
          {
            account: process.env.CONTRACT_ADDRESS,
            name: "editcomment",
            data: {
              pool_id: this.pool.id,
              comment_id: comment.id,
              memo: this.updatedComment
            }
          }
        ];
        try {
          const transaction = await this.$store.$api.signTransaction(actions);
        } catch (error) {
          this.errorNotification(error);
        }
        this.$emit("transaction-complete");
        this.editID = -1;
      }
    }
  }
};
</script>

<style lang="scss" scoped></style>
