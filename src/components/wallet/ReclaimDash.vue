<template>
  <div>
    <div v-if="hasClaimable">
      <div class="row justify-center">
        Reclaiming tokens will create refunds to the connected address.
      </div>
      <div class="row justify-center">
        <q-table
          class="wallet-table q-pa-md row justify-center"
          :data="getReclaimableTokens"
          :columns="columns"
          :visible-columns="visibleColumns"
          row-key="id"
          hide-pagination
          style="width: 300px"
        >
          <template v-slot:body="props">
            <q-tr :props="props" :key="props.row.id">
              <!-- Chain -->
              <q-td :key="props.cols[0].name">
                <div class="row justify-start items-center">
                  <token-avatar
                    :token="chainIdToName(props.row.chain_id)"
                    :avatarSize="20"
                    class="q-mr-sm"
                  />
                  <div>{{ chainIdToName(props.row.chain_id) }}</div>
                </div>
              </q-td>
              <!-- Balance -->
              <q-td :props="props" :key="props.cols[1].name">
                {{ props.row.balance }}
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </div>

      <div
        v-if="getEvmAccountName !== ''"
        class="q-pa-md fit column wrap justify-center items-center"
      >
        <div>The refunds will be sent to:</div>
        <div
          class="evm-account ellipsis cursor-pointer vertical-center justify-center"
          style="max-width: 200px"
        >
          {{ getEvmAccountName }}
        </div>

        <div class="q-pt-md">
          <q-btn
            label="Reclaim Tokens"
            @click="tryReclaimTokens()"
            color="primary"
          />
        </div>
      </div>

      <div v-if="getEvmAccountName === ''" class="q-pa-md row justify-center">
        <q-btn
          label="CONNECT WALLET"
          @click="connectWeb3()"
          class="hover-accent"
          color="positive"
          outline
          no-shadow
          no-caps
        />
      </div>
    </div>
    <div v-if="!hasClaimable" class="row justify-center content-center">
      Nothing to reclaim
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import metamask from "src/components/Metamask";
import tokenAvatar from "src/components/TokenAvatar";

export default {
  // name: 'ComponentName',
  components: {
    tokenAvatar,
  },
  mixins: [metamask],
  data() {
    return {
      visibleColumns: ["chain_id", "balance"],
      columns: [
        {
          name: "id",
          field: "id",
          label: "ID",
          align: "center",
        },
        {
          name: "chain_id",
          field: "chain_id",
          label: "Chain",
          align: "center",
          headerStyle: "max-width: 50px",
          style: "max-width: 50px",
        },
        {
          name: "token_address",
          field: "token_address",
          label: "Chain",
          align: "center",
        },
        {
          name: "balance",
          field: "balance",
          label: "Amount",
          align: "right",
          headerStyle: "max-width: 50px",
          sortable: true,
          sort: "desc",
        },
      ],
    };
  },

  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName"]),
    ...mapGetters("blockchains", ["currentChain"]),
    ...mapGetters("xchain", ["getEvmAccountName", "getReclaimableTokens"]),

    hasClaimable() {
      if (this.getReclaimableTokens !== undefined) {
        return this.getReclaimableTokens.length > 0;
      } else {
        return false;
      }
    },
  },

  methods: {
    ...mapActions("xchain", ["updateReclaimableTokens"]),

    chainIdToName(chainId) {
      switch (chainId) {
        case 1:
          return "ETH";
          break;
        case 2:
          return "BSC";
          break;
        case 3:
          return "TELOS";
          break;
        default:
          return chainId;
          break;
      }
    },

    async reclaimTokens() {
      const actions = [
        {
          account: process.env.XCHAIN_ADDRESS,
          name: "reclaim",
          data: {
            owner: this.accountName,
            to_address: this.getEvmAccountName.slice(2),
          },
        },
      ];
      const transaction = await this.$store.$api.signTransaction(actions);
    },
    async tryReclaimTokens() {
      try {
        await this.reclaimTokens();
        this.$q.notify({
          color: "green-4",
          textColor: "white",
          icon: "cloud_done",
          message: "Tokens reclaimed",
        });
      } catch (error) {
        this.$errorNotification(error);
      }
    },
  },

  async mounted() {
    await this.updateReclaimableTokens(this.accountName);
  },
};
</script>
