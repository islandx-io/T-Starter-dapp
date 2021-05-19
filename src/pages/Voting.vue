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

      <!-- Search bar -->

      <!-- Table with pools -->
      <div class="q-pa-md">
        <q-table
          :data="data"
          :columns="columns"
          row-key="name"
          :pagination="{ rowsPerPage: 20 }"
        >
        </q-table>
      </div>
    </section>
  </q-page>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  data() {
    return {
      columns: [
        {
          name: "name",
          required: true,
          label: "Name",
          align: "left",
          field: row => row.name,
          format: val => `${val}`,
          sortable: true,
          headerStyle: "font-size: 20px; color: gray"
        },
        {
          name: "price",
          align: "left",
          label: "Price",
          field: "calories"
        },
        { name: "softcap", label: "Softcap", field: "fat" },
        { name: "hardcap", label: "Hardcap", field: "carbs" },
        { name: "opensin", label: "Opens in", field: "protein" },
        { name: "voting", label: "Voting", field: "sodium" }
      ],
      data: [
        {
          name: "Frozen Yogurt",
          calories: 159,
          fat: 6.0,
          carbs: 24,
          protein: 4.0,
          sodium: 87,
          calcium: "14%",
          iron: "1%"
        },
        {
          name: "Ice cream sandwich",
          calories: 237,
          fat: 9.0,
          carbs: 37,
          protein: 4.3,
          sodium: 129,
          calcium: "8%",
          iron: "1%"
        },
        {
          name: "Eclair",
          calories: 262,
          fat: 16.0,
          carbs: 23,
          protein: 6.0,
          sodium: 337,
          calcium: "6%",
          iron: "7%"
        }
      ]
    };
  },
  computed: {
    ...mapGetters("ballots", [
      "getAllBallotIDs",
      "getBallotByID",
      "getAllBallots"
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
