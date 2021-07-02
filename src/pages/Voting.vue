<template>
  <q-page>
    <section class="header-bg row content-center justify-center">
      <h2 class="text-white q-pt-xl">Voting</h2>
    </section>

    <section class="body-container">
      <q-card class="justify-between content-start q-mb-lg">
        <!-- Filters -->
        <div class="row q-px-lg q-pb-sm q-gutter-sm">
          <q-btn
            outline
            rounded
            :color="filter.value === `none` ? 'accent' : 'primary'"
            @click="filter.value = `none`"
            label="All"
          />
          <div v-for="chain in possibleChains" :key="chain.NETWORK_NAME">
            <q-btn
              outline
              rounded
              :color="
                filter.value === `chain:` + chain.NETWORK_NAME
                  ? 'accent'
                  : 'primary'
              "
              @click="filter.value = `chain:` + chain.NETWORK_NAME"
            >
              <template v-slot:default>
                <div style="padding: 0px 3px 0px 0px">
                  <token-avatar :token="chain.NETWORK_NAME" :avatarSize="20" />
                </div>
                {{ chain.NETWORK_NAME }}
              </template>
            </q-btn>
          </div>
          <q-btn
            class="hover-accent q-ml-md"
            color="primary"
            :label="
              filter.value === 'myballots' ? 'Reset filter' : 'My Ballots'
            "
            v-if="myBallots.length > 0"
            @click="
              filter.value === 'myballots'
                ? (filter.value = 'none')
                : (filter.value = 'myballots')
            "
          />
          <div class="col" />
          <q-btn
            class="hover-accent"
            color="primary"
            label="Create Ballot"
            :to="{ name: 'createballot' }"
          />
        </div>

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
            <q-tr class="text-grey-7" :props="props">
              <q-th
                v-for="col in props.cols.slice(0, 6)"
                :key="col.name"
                :props="props"
                style="font-size: 1.1rem"
              >
                {{ col.label }}
              </q-th>
              <q-th :props="props" :key="props.cols[6].name">
                <div class="row justify-center">
                  <div style="font-size: 1.1rem">
                    {{ props.cols[6].label }}
                  </div>
                  <q-icon name="fas fa-info-circle" class="q-pr-xs">
                    <q-tooltip
                      :offset="[0, 3]"
                      self="bottom middle"
                      anchor="top middle"
                    >
                      Successfull if Lead >
                      {{ (ballotConfig["TELOS"].lead * 100).toFixed(0) }}%
                    </q-tooltip>
                  </q-icon>
                </div>
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

              <!-- Chain -->
              <q-td :props="props" :key="props.cols[1].name">
                <div class="column items-center ">
                  <token-avatar
                    :token="props.row.chain"
                    :avatarSize="20"
                    class="q-mb-xs"
                    :svg="true"
                  />
                  <div>{{ props.cols[1].value }}</div>
                </div>
              </q-td>

              <!-- Info -->
              <q-td
                :props="props"
                v-for="col in props.cols.slice(2, 5)"
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
                <div class="row no-wrap q-gutter-x-sm">
                  <q-separator vertical inset size="0.1em" />
                  <upDownVote
                    :ballot="props.row"
                    :ballotConfig="ballotConfig[props.row.chain]"
                    :stakePool="stakePool[props.row.chain]"
                    @confirmChainSwitch="
                      confirmChainSwitch = true;
                      newChain = props.row.chain;
                    "
                  />
                </div>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </q-card>
    </section>
    <!-- Confirm chain switch -->
    <q-dialog v-model="confirmChainSwitch" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar color="primary" text-color="secondary" class="q-mr-sm">
            <q-icon name="fas fa-random" size="28px" />
          </q-avatar>
          <span class="text-h6">Switch Chain?</span>
        </q-card-section>
        <q-card-section>
          <span> Confirm switching to {{ this.newChain }} chain to vote? </span>
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
      polling: null,
      newChain: "",
      confirmChainSwitch: false,
      loading: false,
      pagination: { sortBy: "closesin", descending: false, rowsPerPage: 10 },
      columns: [
        {
          name: "name",
          required: true,
          label: "Name",
          align: "left",
          field: "title",
          format: val => `${val}`,
          sortable: true
        },
        {
          name: "chain",
          required: true,
          label: "Chain",
          align: "center",
          field: "chain",
          format: val => `${val}`
        },
        {
          name: "price",
          align: "center",
          label: "Price",
          field: row =>
            `${this.$chainToQty(row.swap_ratio.quantity)} ${this.$chainToSym(
              row.swap_ratio.quantity
            )} / ${this.$getSymFromAsset(row.base_token)}`
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
          field: row => row.votes
        }
      ],
      stakePool: {
        TELOS: 0,
        EOS: 0,
        WAX: 0
      },
      ballotConfig: {
        TELOS: {},
        EOS: {},
        WAX: {}
      },
      poolSettingsAllChains: {},
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
    ...mapGetters("blockchains", ["currentChain", "allBlockchains"]),

    possibleChains() {
      let blockchains = this.allBlockchains;
      let possibleChains = blockchains.filter(
        a => String(a.TEST_NETWORK) === process.env.TESTNET
      );
      return possibleChains;
    },

    myBallots() {
      return this.getAllBallots.filter(
        row =>
          row.owner === this.accountName &&
          row.chain === this.currentChain.NETWORK_NAME
      );
    }
  },
  methods: {
    ...mapActions("ballots", [
      "getAllChainBallots",
      "getChainBallotByID",
      "getBallotConfigAllChains"
    ]),
    ...mapActions("pools", ["getPoolsSettingsAllChains"]),
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
        return this.myBallots;
      } else if (this.filter.value.startsWith("chain:")) {
        let chain = this.filter.value.split(":")[1];
        return this.getUpcomingBallots.filter(row => row.chain === chain);
      } else {
        return this.getUpcomingBallots;
      }
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

    async switchChain() {
      this.$router.push({
        name: "voting",
        params: { chain: this.newChain.toLowerCase() }
      });
    }
  },
  async mounted() {
    await this.getAllChainBallots();
    this.ballotConfig = await this.getBallotConfigAllChains();
    this.poolSettingsAllChains = await this.getPoolsSettingsAllChains();
    for (const [networkName, poolSettings] of Object.entries(
      this.poolSettingsAllChains
    )) {
      this.stakePool[networkName] = this.$chainToQty(poolSettings.stake_pool);
    }

    // Start polling
    this.polling = setInterval(async () => {
      await this.getAllChainBallots();
      this.ballotConfig = await this.getBallotConfigAllChains();
      this.poolSettingsAllChains = await this.getPoolsSettingsAllChains();
      for (const [networkName, poolSettings] of Object.entries(
        this.poolSettingsAllChains
      )) {
        this.stakePool[networkName] = this.$chainToQty(poolSettings.stake_pool);
      }
    }, 30000);
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
.body-container .q-card {
  padding: 0;
  padding-top: 20px;
}
.q-td {
  font-size: 0.9rem;
}
</style>
