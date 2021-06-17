<template>
  <q-page>
    <section class="header-bg row content-center justify-center">
      <h2 class="text-white q-pt-xl">Pool Voting</h2>
    </section>

    <section class="body-container">
      <q-btn
        color="primary"
        label="Create Ballot"
        :to="{ name: 'createballot' }"
      />
      <q-btn
        color="primary"
        label="My Ballots"
        @click="filter.value = 'myballots'"
      />
      <q-btn
        color="primary"
        label="Reset filter"
        @click="filter.value = 'none'"
      />
      <!-- {{ getPublishedBallots }} -->

      <!-- Search bar -->

      <!-- Table with pools -->
      <div class="q-pa-md">
        <q-table
          :data="getAllBallots"
          :columns="columns"
          row-key="name"
          :pagination.sync="pagination"
          :loading="loading"
          :filter="filter"
          :filter-method="ballotsFilter"
        >
          <!-- :sort-method="customSort"
          binary-state-sort -->
          <template v-slot:body="props">
            <q-tr
              :props="props"
              :key="props.row.id"
              @click="onRowClick(props.row)"
            >
              <!-- {{props}} -->
              <!-- Avatar -->
              <q-td :props="props" :key="props.cols[0].name">
                <div class="row justify-start items-center">
                  <token-avatar
                    :avatar="props.row.avatar"
                    :avatarSize="35"
                    class="q-mr-sm"
                  />
                  <div>{{ props.cols[0].value }}</div>
                </div>
              </q-td>

              <!-- Info -->
              <q-td
                :props="props"
                v-for="col in props.cols.slice(1, 4)"
                :key="col.name"
              >
                {{ col.value }}
              </q-td>

              <!-- Opens in -->
              <q-td
                :props="props"
                :key="props.cols[props.cols.length - 2].name"
              >
                <time-until
                  :deadline="
                    props.row.ballot_close > 0
                      ? props.row.ballot_close
                      : Date.now().valueOf()
                  "
                  :poolID="props.row.id"
                  @countdown-finished="
                    getBallotByIDChain(props.row.id, props.row.chain)
                  "
                />
              </q-td>

              <!-- Voting -->
              <q-td
                :props="props"
                :key="props.cols[props.cols.length - 1].name"
              >
                <!-- {{props.row.votes}} -->
                <div class="row q-gutter-x-sm">
                  <q-btn
                    outline
                    flat
                    padding="6px 8px"
                    icon="fas fa-thumbs-up"
                    class="hover-accent"
                    size="1.05rem"
                    :color="userVote === 'upvote' ? 'positive' : 'black'"
                    @click.stop="tryVote(1, props.row.id)"
                    :disable="!isAuthenticated"
                  />
                  <div
                    :class="
                      userVote === 'upvote' ? 'text-positive' : 'text-black'
                    "
                  >
                    {{ props.row.votes.find(a => a.key === "upvote") }}
                  </div>
                  <q-btn
                    outline
                    flat
                    padding="6px 8px"
                    size="1.05rem"
                    icon="fas fa-thumbs-down"
                    class="hover-accent"
                    :color="userVote === 'downvote' ? 'accent' : 'black'"
                    @click.stop="tryVote(-1, props.row.id)"
                    :disable="!isAuthenticated"
                  />
                  <div
                    :class="
                      userVote === 'downvote' ? 'text-negative' : 'text-black'
                    "
                  >
                    {{ props.row.votes.find(a => a.key === "downvote") }}
                  </div>
                  <div>
                    Voting progress: {{ votingProgress(props.row.votes) }}
                  </div>
                </div>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </div>
    </section>
  </q-page>
</template>

<script>
import TimeUntil from "src/components/ballots/time-until.vue";
import tokenAvatar from "src/components/TokenAvatar";
import { mapGetters, mapActions } from "vuex";

export default {
  components: { TimeUntil, tokenAvatar },
  data() {
    return {
      loading: false,
      pagination: { sortBy: 'closesin', descending: false, rowsPerPage: 5 },
      columns: [
        {
          name: "name",
          required: true,
          label: "Name",
          align: "left",
          field: "title",
          format: val => `${val}`,
          sortable: true,
          style: "max-width: 200px; min-width: 200px"
        },
        {
          name: "price",
          align: "left",
          label: "Price",
          field: row =>
            `1 ${this.$getSymFromAsset(row.base_token)} = ${this.$chainToQty(
              row.swap_ratio.quantity
            )} ${this.$chainToSym(row.swap_ratio.quantity)}`
        },
        {
          name: "softcap",
          label: "Softcap",
          field: row => this.$chainStrReformat(row.soft_cap)
        },
        {
          name: "hardcap",
          label: "Hardcap",
          field: row => this.$chainStrReformat(row.hard_cap)
        },
        {
          name: "closesin",
          label: "Voting ends in",
          field: "ballot_close",
          sortable: true,
          sort: (a, b) => a - b,
        },
        {
          name: "voting",
          label: "Voting",
          field: row => row.votes,
          align: "center"
        }
      ],
      userVote: "none",
      stakeTotal: 0,
      ballotConfig: {},
      poolSettings: {},
      filter: { value: "none" }
    };
  },
  computed: {
    ...mapGetters("ballots", [
      "getAllBallotIDs",
      "getBallotByID",
      "getBallotByIDChain",
      "getAllBallots",
      "getPublishedBallots",
      "getUpcomingBallots"
    ]),
    ...mapGetters("account", ["isAuthenticated", "accountName"])
  },
  methods: {
    ...mapActions("ballots", [
      "getAllChainBallots",
      "getChainBallotByID",
      "getBallotConfig"
    ]),
    ...mapActions("pools", ["getPoolsSettings"]),

    onRowClick(row) {
      // Here you can navigate to where ever you have to
      this.$router.push({
        name: "ballotdetails",
        params: { id: row.id, chain: row.chain.toLowerCase() }
      });
      // console.log(row);
    },

    ballotsFilter() {
      if (this.filter.value === "myballots") {
        return this.getAllBallots.filter(row => row.owner === this.accountName);
      }
      return this.getUpcomingBallots;
    },

    customSort(rows, sortBy, descending) {
      const data = [...rows];

      if (sortBy) {
        data.sort((a, b) => {
          const x = descending ? b : a;
          const y = descending ? a : b;

          if (sortBy === "name") {
            // string sort
            return x[sortBy] > y[sortBy] ? 1 : x[sortBy] < y[sortBy] ? -1 : 0;
          } else {
            // numeric sort
            return parseFloat(x[sortBy]) - parseFloat(y[sortBy]);
          }
        });
      }

      return data;
    },

    // Calculate voting progress
    votingProgress(voteTable) {
      //(upvote - downvote) / stake_total > lead
      if (
        voteTable.length > 0 &&
        this.ballotConfig.lead !== undefined &&
        this.stakeTotal !== 0
      ) {
        let upvote = this.$chainToQty(
          voteTable.find(a => a.key === "upvote").value
        );
        let downvote = this.$chainToQty(
          voteTable.find(a => a.key === "downvote").value
        );
        return (upvote - downvote) / this.stakeTotal / this.ballotConfig.lead;
      } else {
        return "Loading";
      }
    },

    // TODO get what the users voted on a pool?
    userSentiment() {
      let result = "none";
      if (this.pool.sentiment_table) {
        let sentiment = this.pool.sentiment_table.find(
          el => el.account === this.accountName
        );
        if (sentiment) {
          if (sentiment.vote > 0) result = "upvote";
          if (sentiment.vote < 0) result = "downvote";
        }
      }
      return result;
    },

    async vote(vote, id) {
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
      const transaction = await this.$store.$api.signTransaction(actions);
    },

    async tryVote(vote, id) {
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
        this.$q.notify({
          color: "red-5",
          textColor: "white",
          icon: "warning",
          message: `${error}`
        });
      }
    }
  },
  async mounted() {
    await this.getAllChainBallots();
    this.ballotConfig = await this.getBallotConfig();
    this.poolSettings = await this.getPoolsSettings();
    this.stakeTotal = this.$chainToQty(this.poolSettings.stake_pool);
  }
};
</script>

<style lang="scss" scoped>
.header-bg {
  height: 200px;
  margin-bottom: -50px;
}
.q-table__container.wallet-inner-table {
  background-color: $secondary;
  border: 1px solid #dbdddf;
  box-shadow: none;
  border-radius: $card-corner-radius;
}
</style>
