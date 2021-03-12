<template>
  <div>
    <q-table
      title="Allocation"
      :data="data"
      :columns="columns"
      row-key="name"
    />
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
      columns: [
        {
          name: "bid",
          label: "Bid",
          field: "bid"
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
      data: [ ]
    };
  },

  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName"]),
  },

  methods: {
    ...mapActions("pools", ["getAllocationByPool"]),
  },

  async mounted() {
    let payload = {account: this.accountName, poolID: this.pool.id}
    this.data = [await this.getAllocationByPool(payload)];
  }
};
</script>
