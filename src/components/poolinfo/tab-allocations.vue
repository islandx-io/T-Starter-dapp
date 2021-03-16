<template>
  <div class="text-weight-light">
    <q-table
      v-if="Object.keys(data[0]).length > 0"
      :data="data"
      :columns="columns"
      row-key="name"
    />
    <p class="q-pt-md" v-else>No allocations to show.</p>
    <q-inner-loading :showing="loadingData">
      <q-spinner-puff size="50px" color="primary" />
    </q-inner-loading>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "tab-allocations",
  props: {
    pool: {
      required: true
    }
  },
  data() {
    return {
      loadingData: true,
      columns: [
        {
          name: "bid",
          label: "Bid",
          field: "bid",
          align: "left"
        },
        {
          name: "allocation",
          label: "Allocation",
          field: "allocation"
        }
        // {
        //   name: "id",
        //   required: true,
        //   label: "ID",
        //   align: "left",
        //   field: row => row.id,
        //   format: val => `${val}`,
        //   sortable: true
        // },
        // {
        //   name: "date",
        //   align: "center",
        //   label: "Date",
        //   field: "date",
        //   sortable: true
        // },
        // { name: "spent", label: "Spent", field: "spent", sortable: true },
        // { name: "bought", label: "Tokens Bought", field: "bought" },
        // { name: "staked", label: "Tokens staked", field: "staked" },
        // { name: "transactionid", label: "Transaction", field: "transactionid" }
      ],
      data: [{}]
    };
  },

  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName"])
  },

  methods: {
    ...mapActions("pools", ["getAllocationByPool"])
  },
  async mounted() {
    // FIXME If the account name is undefined, the table will never update
    let payload = { account: this.accountName, poolID: this.pool.id };
    this.loadingData = true;
    this.data = [await this.getAllocationByPool(payload)];
    this.loadingData = false;
  }
};
</script>

<style lang="scss" scoped>
.q-table__container {
  padding: 20px 20px;
  // border: 1px solid gray;
  // border-radius: $card-corner-radius;
  box-shadow: none;
  background-color: $secondary;
}
</style>
