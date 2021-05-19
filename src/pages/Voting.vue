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
      <!-- {{getPublishedBallots}} -->

      <!-- Search bar -->

      <!-- Table with pools -->
      <div class="q-pa-md">
        <q-table
          :data="getPublishedBallots"
          :columns="columns"
          row-key="name"
          :pagination="{ rowsPerPage: 20 }"
        >
          <template v-slot:body="props">
            <q-tr :props="props" :key="props.row.id">
              <!-- Avatar -->
              <!-- <q-td :props="props" :key="props.cols[0].name">
                <div class="row justify-start items-center">
                  <token-avatar
                    :token="props.row.token_sym"
                    :avatar="props.row.avatar"
                    :avatarSize="35"
                    class="q-mr-sm"
                  />
                  <div>{{ props.cols[0].value }}</div>
                </div>
              </q-td> -->

              <!-- Info -->
              <q-td
                :props="props"
                v-for="col in props.cols.slice(0, 4)"
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
                  :deadline="props.row.ballot_close"
                  :poolID="props.row.id"
                  @countdown-finished="getBallotByID(props.row.id)"
                />
              </q-td>

              <!-- Voting -->
              <q-td
                :props="props"
                :key="props.cols[props.cols.length - 1].name"
              >
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
import { mapGetters, mapActions } from "vuex";

export default {
  components: { TimeUntil },
  data() {
    return {
      columns: [
        {
          name: "name",
          required: true,
          label: "Name",
          align: "left",
          field: "title",
          format: val => `${val}`,
          sortable: true,
        },
        {
          name: "price",
          align: "left",
          label: "Price",
          field: row =>
            `1 ${this.$getSymFromAsset(row.base_token)}  = ${this.$chainToQty(
              row.swap_ratio.quantity
            )} ${this.$chainToSym(row.swap_ratio.quantity)}`
        },
        { name: "softcap", label: "Softcap", field: "soft_cap" },
        { name: "hardcap", label: "Hardcap", field: "hard_cap" },
        { name: "closesin", label: "Closes in", field: "ballot_close" },
        { name: "voting", label: "Voting", field: "sodium" }
      ]
    };
  },
  computed: {
    ...mapGetters("ballots", [
      "getAllBallotIDs",
      "getBallotByID",
      "getAllBallots",
      "getPublishedBallots"
    ]),
    ...mapGetters("account", ["isAuthenticated", "accountName"])
  },
  methods: {
    ...mapActions("ballots", ["getAllChainBallots", "getChainBallotByID"])
  },
  async mounted() {
    await this.getAllChainBallots();
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
