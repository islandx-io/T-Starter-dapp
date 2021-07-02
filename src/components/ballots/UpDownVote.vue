<template>
  <div class="row items-center no-wrap q-gutter-x-sm">
    <div class="row justify-center q-pr-xs" style="width: 80px">
      <div
        :class="
          ballotStatus.toLowerCase() +
            '-badge ballot-status text-weight-bold text-center'
        "
      >
        {{ (votingProgress * 100).toFixed(2) }} %
      </div>
      <q-tooltip :offset="[0, 5]">
        Lead
      </q-tooltip>
    </div>
    <!-- <q-separator vertical inset size="0.1rem" /> -->
    <div class="column items-start" :style="`width: ${voteBarWidth + 100}px`">
      <div class="row items-center ">
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
          @click.stop="confirmVoteDialog=true,voteType='upvote'"
        />
        <div class="upvote-percentage q-pl-xs">
          {{ (upvoteProgress * 100).toFixed(2) }}%
        </div>
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
          @click.stop="confirmVoteDialog=true,voteType='downvote'"
          :disable="!isAuthenticated"
        />
        <div class="downvote-percentage q-pl-xs">
          {{ (downvoteProgress * 100).toFixed(2) }}%
        </div>
      </div>
    </div>

    <!-- Confirm vote -->
    <q-dialog v-model="confirmVoteDialog" >
      <q-card>
        <q-card-section  class="self-stretch row justify-between q-py-sm">
          <div class="" style="width: 40px" />
          <span class="col text-center text-h6">Confirmation</span>
          <div class="text-center" style="width: 40px">
            <q-btn
              padding="xs"
              size="18px"
              flat
              color="secondary"
              text-color="black"
              icon="far fa-times-circle"
              class="hover-accent"
              round
              v-close-popup
            />
          </div>
        </q-card-section>
        <q-card-section class=" justify-center items-center ">
          <div class="text-body1 text-center">You are about to vote to <span class="text-bold">{{ ballot.title }}</span>.</div>
          <div class=" text-body1 text-center q-pb-sm">Please confirm that you are aware of spotting scams.</div>

          <div class="text-center">1. This project has purpose and potential <q-icon name="fas fa-check" class="text-green" style="font-size: 1rem;" /></div> 
          <div class="text-center">2. Github has active development activity <q-icon name="fas fa-check" class="text-green" style="font-size: 1rem;" /></div>
          <div class="text-center">3. Smart Contract audit results are positive <q-icon name="fas fa-check" class="text-green" style="font-size: 1rem;" /></div>
          <div class="text-center">4. Devs are not anon or I am comfortable with them <q-icon name="fas fa-check" class="text-green" style="font-size: 1rem;" /></div>
          <div class="text-center">5. Tokenomics are generally sound <q-icon name="fas fa-check" class="text-green" style="font-size: 1rem;" /></div>
          <div class="text-center">6. This does not look like a rug or scam <q-icon name="fas fa-check" class="text-green" style="font-size: 1rem;" /></div>
        </q-card-section>

        <q-card-actions align="center">
          <q-btn
            flat
            label="Confirm"
            color="primary"
            class="hover-accent"
            v-close-popup
            @click="vote(voteType)"
          /> 
        </q-card-actions>
      </q-card>
    </q-dialog>
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
      voteBarWidth: 70,
      confirmVoteDialog: false,
      voteType: 'downvote'
      // votesTable: []
    };
  },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName"]),
    ...mapGetters("blockchains", ["currentChain"]),
    votes() {
      if (this.ballot.votes.length > 0) {
        return this.ballot.votes;
      } else
        return [
          { key: "downvote", value: "0.0000 START" },
          { key: "totalvote", value: "0.0000 START" },
          { key: "upvote", value: "0.0000 START" }
        ];
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
    votingProgress() {
      if (this.votes.length > 0 && this.stakePool !== 0) {
        return (this.upvotes - this.downvotes) / this.stakePool;
      } else return 0;
    },
    upvoteProgress() {
      if (this.stakePool === 0) return 0;
      else return this.upvotes / this.stakePool;
    },
    downvoteProgress() {
      if (this.stakePool === 0) return 0;
      else return this.downvotes / this.stakePool;
    },
    totalProgress() {
      return this.upvoteProgress + this.downvoteProgress;
    },
    ballotStatus() {
      if (this.ballotConfig.lead !== undefined) {
        if (this.votingProgress > this.ballotConfig.lead) return "Succeeding";
        if (this.votingProgress < this.ballotConfig.lead) return "Failing";
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
          // await this.getAllChainBallots();
          await this.getChainBallotByID(this.ballot.id);
          this.$emit("voteSubmitted");
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
  // width: 95px;
  padding: 3px 9px;
  color: $secondary;
  border-radius: $card-corner-radius;
}
.failing-badge {
  background-color: $warning;
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
.upvote-percentage {
  margin-top: 10px;
}
.downvote-percentage {
  margin-bottom: 10px;
}
</style>
