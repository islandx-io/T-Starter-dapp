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
      <div
        class="vote-bar upvote-bar"
        :style="`width: ${voteBarWidth * (upvoteProgress / totalProgress)}px`"
      />
      <q-btn
        outline
        flat
        padding="5px 7px"
        icon="fas fa-thumbs-up"
        class="hover-accent"
        size="1rem"
        :color="userVote === 'upvote' ? 'positive' : 'black'"
        :disable="!isAuthenticated"
        @click.stop="checkChain(1)"
      />
      <q-btn
        outline
        flat
        padding="5px 7px"
        size="1rem"
        icon="fas fa-thumbs-down"
        class="hover-accent"
        :color="userVote === 'downvote' ? 'accent' : 'black'"
        @click.stop="checkChain(-1)"
        :disable="!isAuthenticated"
      />
      <div
        class="vote-bar downvote-bar"
        :style="`width: ${voteBarWidth * (downvoteProgress / totalProgress)}px`"
      />
    </div>
    <!-- <div :class="userVote === 'upvote' ? 'text-positive' : 'text-black'">
      {{ votes.find(a => a.key === "upvote") }}
    </div>
    <div :class="userVote === 'downvote' ? 'text-negative' : 'text-black'">
      {{ votes.find(a => a.key === "downvote") }}
    </div>
    <div>Voting progress: {{ votingProgress }}</div> -->
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
export default {
  props: {
    ballot: { type: Object },
    ballotConfig: { type: Object },
    stakeTotal: { type: Number }
  },
  data() {
    return {
      userVote: "none",
      voteBarWidth: 200
    };
  },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName"]),
    ...mapGetters("blockchains", ["currentChain"]),
    votes() {
      return this.ballot.votes;
    },
    votingProgress() {
      //(upvote - downvote) / stake_total > lead
      if (
        this.votes.length > 0 &&
        this.ballotConfig.lead !== undefined &&
        this.stakeTotal !== 0
      ) {
        return (
          (this.upvotes - this.downvotes) /
          this.stakeTotal /
          this.ballotConfig.lead
        );
      } else {
        return "Loading";
      }
    },
    upvotes() {
      return this.$chainToQty(this.votes.find(a => a.key === "upvote").value);
    },
    downvotes() {
      return this.$chainToQty(this.votes.find(a => a.key === "downvote").value);
    },
    upvoteProgress() {
      return this.upvotes / this.stakeTotal / this.ballotConfig.lead;
    },
    downvoteProgress() {
      return this.downvotes / this.stakeTotal / this.ballotConfig.lead;
    },
    totalProgress() {
      return this.upvoteProgress + this.downvoteProgress;
    },
    ballotStatus() {
      if (this.upvoteProgress > this.downvoteProgress) return "Succeeding";
      if (this.upvoteProgress < this.downvoteProgress) return "Failing";
      else return "Tie";
    }
  },
  methods: {
    ...mapActions("ballots", [
      "getAllChainBallots",
      "getChainBallotByID",
      "getBallotConfig"
    ]),
    async checkChain(vote) {
      console.log(this.currentChain);
      if (this.ballot.chain === this.currentChain.NETWORK_NAME) {
        await this.tryVote(vote, this.ballot.id);
      } else {
        //switch chain
        this.$emit("confirmChainSwitch");
      }
    },

    async tryVote(vote, id) {
      console.log({ vote, id });
      try {
        await this.vote(vote, id);
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
    },

    async vote(vote, id) {
      console.log({ vote, id });
      const actions = [
        {
          account: process.env.BALLOT_ADDRESS,
          name: "vote",
          data: {
            account: this.accountName,
            ballot_id: id,
            vote: vote
          }
        }
      ];
      console.log(actions);
      const transaction = await this.$store.$api.signTransaction(actions);
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
.vote-bar {
  height: 10px;
  &.upvote-bar {
    background: $positive;
  }
  &.downvote-bar {
    background: $negative;
  }
}
</style>
