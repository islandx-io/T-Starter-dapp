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
    </section>
  </q-page>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  data() {
    return {};
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
