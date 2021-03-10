<template>
  <div>
    <q-table
      title="Allocation History"
      :data="data"
      :columns="columns"
      row-key="name"
    />
  </div>
</template>

<script>
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
          name: "id",
          required: true,
          label: "ID",
          align: "left",
          field: row => row.id,
          format: val => `${val}`,
          sortable: true,
          // body td:
          // style: "width: 500px",
          // classes: "my-special-class",

          // (v1.3+) header th:
          // headerStyle: "width: 500px",
          // headerClasses: "my-special-class"
        },
        {
          name: "date",
          align: "center",
          label: "Date",
          field: "date",
          sortable: true
        },
        { name: "spent", label: "Spent", field: "spent", sortable: true },
        { name: "bought", label: "Tokens Bought", field: "bought" },
        { name: "staked", label: "Tokens staked", field: "staked" },
        { name: "transactionid", label: "Transaction", field: "transactionid" },
      ],
      data: [
        {
          id: 1,
          date: Date.now(),
          spent: 0.2,
          bought: 24,
          staked: 4.0,
          transactionid: "abcd"
        }
      ]
    };
  }
};
</script>
