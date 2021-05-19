<template>
  <q-list class="comments-tab">
    <div>
      <q-form
        @submit="submitNewComment"
        class="col row items-center q-gutter-x-sm q-py-sm"
      >
        <q-input
          class="col-sm col-xs-12"
          color="primary"
          v-model="newComment"
          label="Comment"
          lazy-rules
          :disable="!isAuthenticated"
          maxlength="255"
          outlined
          autogrow
          :loading="processingNew"
        />
        <div class="col-sm-shrink col-xs-12 row justify-center q-py-sm">
          <q-btn
            class="col-sm col-xs-7 hover-accent"
            color="primary"
            padding="sm md"
            :label="isAuthenticated ? 'Post' : 'Login to post'"
            :disable="!isAuthenticated"
            type="submit"
          />
        </div>
      </q-form>
    </div>
    <div
      class="comments-container q-px-sm scroll overflow-y"
      style="min-height: 60px; max-height: 800px"
    >
      <div v-if="comments.length === 0" class="text-grey-6 text-center q-pt-md">
        Be the first to post a comment!
      </div>
      <div v-else class="row" v-for="row in comments" :key="row.id">
        <div class="col-12 row no-wrap justify-between items-center">
          <div class="col-shrink row items-center q-gutter-x-md">
            <div class="text-subtitle1 text-weight-bold" lines="1">
              {{ row.account }}
            </div>
            <div class="text-grey-7">{{ toDate(row.timestamp) }}</div>
            <!-- TODO Make expandable -->
          </div>
          <q-btn-dropdown
            flat
            padding="2px 8px 2px 2px"
            dropdown-icon="fas fa-ellipsis-h"
            no-icon-animation
            v-if="row.account === accountName"
            class="self-start hover-accent text-grey-6 row"
            menu-anchor="bottom right"
            :menu-offset="[2, 5]"
          >
            <q-btn-group class="bg-secondary text-grey-6">
              <q-btn
                v-close-popup
                v-if="row.account === accountName"
                :icon="
                  row.id === editID ? 'fas fa-times-circle' : 'fas fa-edit'
                "
                class="hover-accent q-px-xs"
                size="sm"
                padding="sm"
                flat
                @click="toggleEdit(row.id)"
              />
              <q-separator vertical />
              <q-btn
                v-close-popup
                v-if="row.account === accountName"
                icon="fas fa-trash-alt"
                class="hover-accent q-px-xs"
                size="sm"
                padding="sm"
                flat
                @click="submitRemoveComment(row)"
              />
            </q-btn-group>
          </q-btn-dropdown>
        </div>
        <div
          class="col-12 row justify-between reverse-wrap q-gutter-x-sm q-pt-xs"
        >
          <!-- prettier-ignore -->
          <div
            v-if="row.id !== editID"
            class="col text-subtitle1"
            style="line-height: 20px; overflow-wrap: break-word; white-space: pre-line"
          >{{ row.comment }}</div>
          <q-form
            @submit="submitCommentUpdate(row)"
            v-if="row.id === editID"
            class="col row items-center q-gutter-x-sm q-pt-xs"
          >
            <q-input
              class="col-sm col-xs-12"
              color="primary"
              v-model="row.comment"
              lazy-rules
              :disable="!isAuthenticated"
              maxlength="255"
              outlined
              autogrow
              label="Edit Comment"
              :loading="processingUpdate"
            />
            <div
              class="col-sm-shrink col-xs-12 row justify-center q-py-sm q-gutter-x-sm"
            >
              <q-btn
                class="hover-accent"
                color="primary"
                :disable="!isAuthenticated"
                type="submit"
                label="Update"
              />
              <q-btn
                class="hover-accent"
                color="primary"
                label="Cancel"
                @click="editID = -1"
              />
            </div>
          </q-form>
        </div>
        <q-separator v-if="!isLastComment(row)" class="q-my-sm" />
      </div>
    </div>
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
    poolID: {
      required: true
    }
  },
  data() {
    return {
      newComment: "",
      insufficient_start_show: false,
      buyStartUrl: process.env.BUY_START_URL,
      editID: -1,
      pool: this.$defaultPoolInfo,
      comments: [],
      processingUpdate: false,
      processingNew: false,
      settings: {}
    };
  },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName", "wallet"]),
    ...mapGetters("pools", ["getPoolByID"]),
    START_info() {
      return this.wallet.find(el => (el.sym = "START"));
    }
  },
  watch: {
    async accountName() {
      this.settings = await this.getPoolsSettings();
      await this.getChainSTART(this.accountName);
    }
  },
  async mounted() {
    this.getChainInfo();
    this.settings = await this.getPoolsSettings();
  },
  methods: {
    ...mapActions("pools", [
      "updateCommentsByPoolID",
      "getChainSTART",
      "getPoolsSettings"
    ]),
    ...mapActions("account", ["getChainSTART"]),
    async getChainInfo() {
      await this.updateCommentsByPoolID(this.poolID);
      this.pool = await this.getPoolByID(this.poolID);
      this.comments = JSON.parse(JSON.stringify(this.pool.comments_table));
      this.getChainSTART(this.accountName);
    },
    toDate(timeStamp) {
      if (timeStamp === "Loading") return timeStamp;
      else return date.formatDate(timeStamp, "DD MMMM YYYY @ HH:mm");
    },
    toggleEdit(id) {
      if (id === this.editID) {
        // Cancel
        this.editID = -1;
        this.getChainInfo();
      } else this.editID = id; // Edit
    },
    errorNotification(error) {
      this.$q.notify({
        color: "red-5",
        textColor: "white",
        icon: "warning",
        message: `${error}`
      });
    },
    isLastComment(comment) {
      return comment.id === this.comments[this.comments.length - 1].id;
    },
    async submitNewComment() {
      // TODO Add try-catch
      this.processingNew = true;
      if (this.isAuthenticated && this.newComment !== "") {
        await this.getChainSTART(this.accountName);
        if (this.START_info.liquid < 1 && this.START_info.balance < 1) {
          this.insufficient_start_show = true;
        } else {
          const actions = [];
          if (this.START_info.liquid < 1) {
            actions.push(
              this.$startBalanceToLiquidAction(
                this.START_info,
                this.$chainToQty(this.settings.social_fee)
              )
            );
          }
          actions.push({
            account: process.env.CONTRACT_ADDRESS,
            name: "comment",
            data: {
              account: this.accountName,
              pool_id: this.poolID,
              memo: this.newComment
            }
          });
          try {
            const transaction = await this.$store.$api.signTransaction(actions);
            this.newComment = "";
          } catch (error) {
            this.errorNotification(error);
          }
          this.getChainInfo();
        }
      }
      this.processingNew = false;
    },
    async submitRemoveComment(comment) {
      if (this.isAuthenticated && comment.account === this.accountName) {
        const actions = [
          {
            account: process.env.CONTRACT_ADDRESS,
            name: "rmcomment",
            data: {
              pool_id: this.poolID,
              comment_id: comment.id
            }
          }
        ];
        try {
          const transaction = await this.$store.$api.signTransaction(actions);
        } catch (error) {
          this.errorNotification(error);
        }
        this.getChainInfo();
      }
    },
    async submitCommentUpdate(comment) {
      this.processingUpdate = true;
      if (this.isAuthenticated && comment.account === this.accountName) {
        const actions = [
          {
            account: process.env.CONTRACT_ADDRESS,
            name: "editcomment",
            data: {
              pool_id: this.poolID,
              comment_id: comment.id,
              memo: comment.comment
            }
          }
        ];
        try {
          const transaction = await this.$store.$api.signTransaction(actions);
        } catch (error) {
          this.errorNotification(error);
          this.getChainInfo();
        }
        this.editID = -1;
        this.getChainInfo();
      }
      this.processingUpdate = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.comments-container {
  /* custom scrollbar */
  &::-webkit-scrollbar {
    width: 20px;
  }
  &::-webkit-scrollbar-track {
    background-color: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #d6dee1;
    border-radius: 20px;
    border: 6px solid transparent;
    background-clip: content-box;
  }
  &::-webkit-scrollbar-thumb:hover {
    background-color: $secondary;
  }
}
</style>
