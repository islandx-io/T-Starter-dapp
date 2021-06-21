<template>
  <q-page>
    <section class="header-bg row content-center justify-center">
      <h2 class="text-white q-pt-xl">Voting</h2>
    </section>

    <section class="body-container">
      <q-card class="justify-between content-start q-mb-lg">
        <div class="row q-px-lg q-pb-sm q-gutter-sm">
          <q-btn
            class="hover-accent"
            color="primary"
            label="My Ballots"
            @click="filter.value = 'myballots'"
          />
          <q-btn
            class="hover-accent"
            color="primary"
            label="Reset filter"
            @click="filter.value = 'none'"
          />
          <div class="col" />
          <q-btn
            class="hover-accent"
            color="primary"
            label="Create Ballot"
            :to="{ name: 'createballot' }"
          />
        </div>
        <!-- {{ getPublishedBallots }} -->

        <!-- Search bar -->

        <!-- Table with pools -->
        <q-table
          class="voting-table"
          :data="getAllBallots"
          :columns="columns"
          row-key="name"
          :pagination.sync="pagination"
          :loading="loading"
          :filter="filter"
          :filter-method="ballotsFilter"
          dense
        >
          <!-- :sort-method="customSort"
          binary-state-sort -->
          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                style="font-size: 20px; color: gray"
              >
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>
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
                  <div class="text-bold">{{ props.cols[0].value }}</div>
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
                <upDownVote
                  :ballot="props.row"
                  :ballotConfig="ballotConfig"
                  :stakeTotal="stakeTotal"
                  @confirmChainSwitch="
                    confirmChainSwitch = true;
                    newChain = props.row.chain;
                  "
                />
              </q-td>
            </q-tr>
          </template>
        </q-table>

        <!-- Confirm chain switch -->
        <q-dialog v-model="confirmChainSwitch" persistent>
          <q-card>
            <q-card-section class="row items-center">
              <q-avatar color="primary" text-color="secondary" class="q-mr-sm">
                <q-icon name="fas fa-random" size="28px" />
              </q-avatar>
              <span class="text-h6">Confirm Switching Chains?</span>
            </q-card-section>
            <q-card-section>
              <span>
                Confirm switching to {{ this.newChain }} chain to vote?
              </span>
            </q-card-section>

            <q-card-actions align="right">
              <q-btn flat label="Cancel" color="primary" v-close-popup />
              <q-btn
                flat
                label="Confirm"
                color="primary"
                @click="switchChain()"
                v-close-popup
              />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </q-card>
    </section>
  </q-page>
</template>

<script>
import TimeUntil from "src/components/ballots/time-until.vue";
import tokenAvatar from "src/components/TokenAvatar";
import upDownVote from "src/components/ballots/UpDownVote";
import { mapGetters, mapActions } from "vuex";

export default {
  components: { TimeUntil, tokenAvatar, upDownVote },
  data() {
    return {
      newChain: "",
      confirmChainSwitch: false,
      loading: false,
      pagination: { sortBy: "closesin", descending: false, rowsPerPage: 5 },
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
          align: "center",
          label: "Price",
          field: row =>
            `1 ${this.$getSymFromAsset(row.base_token)} = ${this.$chainToQty(
              row.swap_ratio.quantity
            )} ${this.$chainToSym(row.swap_ratio.quantity)}`
        },
        {
          name: "softcap",
          align: "center",
          label: "Softcap",
          field: row => this.$chainStrReformat(row.soft_cap)
        },
        {
          name: "hardcap",
          align: "center",
          label: "Hardcap",
          field: row => this.$chainStrReformat(row.hard_cap)
        },
        {
          name: "closesin",
          align: "center",
          label: "Deadline",
          field: "ballot_close",
          sortable: true,
          sort: (a, b) => a - b
        },
        {
          name: "voting",
          align: "center",
          label: "Voting",
          field: row => row.votes,
          align: "center"
        }
      ],
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
    ...mapGetters("account", ["isAuthenticated", "accountName"]),
    ...mapGetters("blockchains", ["currentChain"])
  },
  methods: {
    ...mapActions("ballots", [
      "getAllChainBallots",
      "getChainBallotByID",
      "getBallotConfig"
    ]),
    ...mapActions("pools", ["getPoolsSettings"]),
    ...mapActions("blockchains", ["setNewChain"]),

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

    // TODO get what the users voted on a pool?
    // userSentiment() {
    //   let result = "none";
    //   if (this.pool.sentiment_table) {
    //     let sentiment = this.pool.sentiment_table.find(
    //       el => el.account === this.accountName
    //     );
    //     if (sentiment) {
    //       if (sentiment.vote > 0) result = "upvote";
    //       if (sentiment.vote < 0) result = "downvote";
    //     }
    //   }
    //   return result;
    // },

    async switchChain() {
      this.$router.push({
        name: "voting",
        params: { chain: this.newChain.toLowerCase() }
      });
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
.q-card {
  padding-left: 0;
  padding-right: 0;
}
</style>
