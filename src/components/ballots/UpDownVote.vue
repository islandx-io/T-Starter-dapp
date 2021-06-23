<template>
  <div class="row items-center no-wrap q-gutter-x-sm">
    <div
      :class="
        ballotStatus.toLowerCase() +
          '-badge ballot-status text-weight-bold text-center'
      "
    >
      {{ ballotStatus }}
    </div>
    <q-separator vertical inset size="0.1rem" />
    <div class="column items-start" :style="`width: ${voteBarWidth}px`">
      <div class="row items-center">
        <div
          class="vote-bar upvote-bar"
          :style="`width: ${voteBarWidth * upvoteProgress}px`"
        />
        <q-btn
          outline
          flat
          padding="5px 7px"
          icon="fas fa-thumbs-up"
          class="hover-accent"
          size="1rem"
          :color="userVote === 'upvote' ? 'positive' : 'grey-8'"
          :disable="!isAuthenticated"
          @click.stop="vote('upvote')"
        />
      </div>
      <div class="row items-center">
        <div
          class="vote-bar downvote-bar"
          :style="`width: ${voteBarWidth * downvoteProgress}px`"
        />
        <q-btn
          outline
          flat
          padding="5px 7px"
          size="1rem"
          icon="fas fa-thumbs-down"
          class="hover-accent"
          :color="userVote === 'downvote' ? 'accent' : 'grey-8'"
          @click.stop="vote('downvote')"
          :disable="!isAuthenticated"
        />
      </div>
    </div>
    <!-- <div>{{ ballot.votes_table }}</div> -->
    <!-- <div>
      stakePool:
      {{ stakePool }} upvoteProgress: {{ upvoteProgress }} upvotes:
      {{ upvotes }}
    </div> -->
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
export default {
  props: {
    ballot: { type: Object },
    ballotConfig: { type: Object },
    stakePool: { type: Number }
  },
  data() {
    return {
      voteBarWidth: 100
      // votesTable: []
    };
  },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName"]),
    ...mapGetters("blockchains", ["currentChain"]),
    votes() {
      return this.ballot.votes;
    },
    userVote() {
      let result = "none";
      if (this.ballot.votes_table) {
        let v = this.ballot.votes_table.find(
          el => el.account === this.accountName
        );
        if (v) {
          if (v["vote"] > 0) result = "upvote";
          if (v["vote"] < 0) result = "downvote";
        }
      }
      return result;
    },
    upvotes() {
      return this.$chainToQty(this.votes.find(a => a.key === "upvote").value);
    },
    downvotes() {
      return this.$chainToQty(this.votes.find(a => a.key === "downvote").value);
    },
    upvoteProgress() {
      return this.upvotes / this.stakePool;
    },
    downvoteProgress() {
      return this.downvotes / this.stakePool;
    },
    totalProgress() {
      return this.upvoteProgress + this.downvoteProgress;
    },
    ballotStatus() {
      if (
        this.votes.length > 0 &&
        this.ballotConfig.lead !== undefined &&
        this.stakePool !== 0
      ) {
        let votingProgress = (this.upvotes - this.downvotes) / this.stakePool;
        if (votingProgress > this.ballotConfig.lead) return "Succeeding";
        if (votingProgress < this.ballotConfig.lead) return "Failing";
        else return "Tie";
      } else {
        return "Loading";
      }
    }
  },
  methods: {
    ...mapActions("ballots", [
      "getAllChainBallots",
      "getChainBallotByID",
      "getBallotConfig"
    ]),

    async vote(side) {
      if (this.ballot.chain === this.currentChain.NETWORK_NAME) {
        try {
          let vote = 0; // abstain
          if (side === "upvote" && this.userVote !== "upvote") vote = 1;
          else if (side === "downvote" && this.userVote !== "downvote")
            vote = -1;
          const actions = [
            {
              account: process.env.BALLOT_ADDRESS,
              name: "vote",
              data: {
                account: this.accountName,
                ballot_id: this.ballot.id,
                vote: vote
              }
            }
          ];
          // console.log(actions);
          const transaction = await this.$store.$api.signTransaction(actions);
          this.$q.notify({
            color: "green-4",
            textColor: "white",
            icon: "cloud_done",
            message: "Voted"
          });
          await this.getAllChainBallots();
        } catch (error) {
          this.$errorNotification(error);
        }
      } else {
        this.$emit("confirmChainSwitch"); //switch chain
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.ballot-status {
  width: 95px;
  padding: 8px 8px;
  color: $secondary;
  border-radius: $card-corner-radius;
}
.failing-badge {
  background-color: $negative;
}
.succeeding-badge {
  background-color: $positive;
}
.tie-badge {
  background-color: $primary;
}
.loading-badge {
  background-color: $loading;
}
.vote-bar {
  height: 12px;
  border-radius: 2px;
  &.upvote-bar {
    background: $positive;
    margin-top: 10px;
    margin-right: -5px;
  }
  &.downvote-bar {
    background: $negative;
    margin-bottom: 10px;
    margin-right: -5px;
  }
}
</style>
