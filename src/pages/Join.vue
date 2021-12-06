<template>
  <q-page>
    <!-- content -->
    <section class="header-bg" />
    <section class="body-container">
      <q-card
        v-if="pool.pool_status !== 'open' && !hasHeadstart"
        style="min-height: 100px"
        class="row justify-center content-center "
      >
        <div
          v-if="
            ['upcoming', 'completed', 'filled', 'cancelled'].includes(
              pool.pool_status
            )
          "
        >
          Cannot join {{ pool.pool_status }} pools
        </div>
      </q-card>
      <q-card v-else class="card-container">
        <q-btn
          :to="{ name: 'pooldetails', params: { id: poolID } }"
          flat
          round
          class="self-start"
        >
          <q-icon name="fas fa-chevron-circle-left" style="font-size: 50px;" />
        </q-btn>
        <q-form @submit="onSubmit" ref="joinForm">
          <div>
            <div class="row justify-center">
              <h2 style="line-height: 45px; text-align: center">
                {{ pool.title }}
              </h2>
            </div>
            <div class="row justify-center">
              <net-selector
                :selectedNetwork="selectedNetwork"
                :networkOptions="networkOptions"
                @changeNetwork="changeNetwork($event)"
              >
              </net-selector>
              <q-tooltip anchor="top middle" self="bottom middle">
                From Network
              </q-tooltip>
            </div>

            <!---------------->
            <!-- From telos -->
            <!---------------->
            <div v-if="selectedNetwork === this.currentChain.NETWORK_NAME">
              <div
                class="row justify-between items-end"
                style="padding: 0px 20px 0px 0px"
              >
                <q-item dense class="text-h6">From</q-item>
                <div style="padding: 0px 0px 2px 15px">
                  Balance: {{ balance }} {{ BaseTokenSymbol }}
                </div>
              </div>
              <q-card flat bordered class="inner-card row ">
                <div class="row q-gutter-x-md items-center">
                  <q-input
                    class="col input-amount q-my-sm"
                    color="primary"
                    v-model="amount"
                    :rules="[validateInput]"
                    borderless
                    @input="restrictDecimal"
                    placeholder="0"
                  />
                  <div class="column items-end justify-between q-my-sm">
                    <div class="row q-gutter-x-sm">
                      <q-btn
                        class="col-shrink"
                        label="Max"
                        @click="setMax"
                        color="positive"
                        outline
                      />
                      <token-avatar :token="BaseTokenSymbol" :avatarSize="40" />
                      <div class="text-h4">{{ BaseTokenSymbol }}</div>
                    </div>
                  </div>
                </div>
              </q-card>
              <div
                class="row justify-between q-gutter-x-md"
                style="padding: 5px 20px"
              >
                <div>
                  Min:
                  {{ zeroNaN($chainToQty(pool.minimum_swap)) }}
                  {{ BaseTokenSymbol }}
                </div>
                <div>
                  Max:
                  {{
                    this.$toFixedDown(
                      maxAllocation,
                      this.$getDecimalFromAsset(this.pool.base_token)
                    )
                  }}
                  {{ BaseTokenSymbol }}
                </div>
                <div>
                  Buyable:
                  {{
                    this.$toFixedDown(
                      availableBuy,
                      this.$getDecimalFromAsset(this.pool.base_token)
                    )
                  }}
                  {{ BaseTokenSymbol }}
                </div>
              </div>
            </div>

            <!---------------->
            <!-- From ETH -->
            <!---------------->
            <div v-if="selectedNetwork !== this.currentChain.NETWORK_NAME">
              <div class="full-width row  justify-center">
                <div
                  class="evm-account col ellipsis cursor-pointer"
                  style="max-width: 200px"
                  v-if="getEvmAccountName !== ''"
                  @click="copyEvmAccount"
                >
                  {{ getEvmAccountName }}
                </div>
              </div>
              <div
                class="row justify-between items-end"
                style="padding: 0px 20px 0px 0px"
              >
                <q-item dense class="text-h6">From</q-item>
                <div style="padding: 0px 0px 2px 15px">
                  Balance: {{ balance }} {{ xchainTokenSymbol }}
                </div>
              </div>
              <q-card flat bordered class="inner-card row ">
                <div class="row q-gutter-x-md items-center">
                  <!-- <q-btn
                    v-if="getEvmAccountName === ''"
                    label="CONNECT"
                    @click="connectWeb3()"
                    class="hover-accent"
                    color="positive"
                    outline
                    no-shadow
                    no-caps
                  /> -->

                  <q-input
                    class="col input-amount q-my-sm"
                    color="primary"
                    v-model="amount"
                    :rules="[validateInput]"
                    borderless
                    @input="restrictDecimal"
                    placeholder="0"
                  />
                  <div class="column items-end justify-between q-my-sm">
                    <div class="row q-gutter-x-sm">
                      <q-btn
                        class="col-shrink"
                        label="Max"
                        @click="setMax"
                        color="positive"
                        outline
                      />
                      <token-selector
                        :tokenOptions="possiblexchainTokens"
                        :xchainToken.sync="xchainToken"
                      ></token-selector>
                    </div>
                  </div>
                </div>
              </q-card>

              <div
                class="row justify-between q-gutter-x-md"
                style="padding: 5px 20px"
              >
                <div>
                  Min:
                  {{ zeroNaN($chainToQty(pool.minimum_swap)) }}
                  {{ xchainTokenSymbol }}
                </div>
                <div>
                  Max:
                  {{
                    this.$toFixedDown(
                      maxAllocation,
                      this.$getDecimalFromAsset(this.pool.base_token)
                    )
                  }}
                  {{ xchainTokenSymbol }}
                </div>
                <div>
                  Buyable:
                  {{
                    this.$toFixedDown(
                      availableBuy,
                      this.$getDecimalFromAsset(this.pool.base_token)
                    )
                  }}
                  {{ xchainTokenSymbol }}
                </div>
              </div>
            </div>

            <q-item class="justify-center">
              <q-icon name="fas fa-arrow-down" size="50px" color="primary" />
            </q-item>
            <!-------->
            <!-- To -->
            <!-------->
            <q-item dense class="text-h6">To</q-item>
            <q-card flat bordered class="inner-card row ">
              <div class="col row justify-between items-center ">
                <div class="col input-amount q-pr-lg">
                  {{ tokenToAmount }}
                </div>
                <div class="column items-end justify-between content-end">
                  <div class="row q-gutter-x-sm content-end">
                    <token-avatar :token="pool.avatar" :avatarSize="40" />
                    <div class="text-h4">{{ TokenSymbol }}</div>
                  </div>
                </div>
              </div>
            </q-card>
            <div class="row justify-between" style="padding: 5px 20px">
              <div>
                1 {{ BaseTokenSymbol }} =
                {{ zeroNaN($chainToQty(pool.swap_ratio.quantity)) }}
                {{ TokenSymbol }}
              </div>
              <div>
                Remaining:
                {{ zeroNaN($chainToQty(pool.remaining_offer).toFixed(0)) }}
                {{ TokenSymbol }}
              </div>
            </div>

            <!------------>
            <!-- Submit -->
            <!------------>
            <q-item class="q-py-lg">
              <q-item-section>
                <q-btn
                  :label="`Approve`"
                  color="primary"
                  @click="approveToken()"
                  v-if="
                    !hasAllowance &&
                      selectedNetwork !== currentChain.NETWORK_NAME
                  "
                />
                <q-btn
                  label="Join Pool"
                  type="submit"
                  color="primary"
                  :disable="
                    (!isAuthenticated ||
                      pool.pool_status !== `open` ||
                      balance <= $chainToQty(pool.minimum_swap) ||
                      not_enough_start ||
                      joining ||
                      !isWhitelisted ||
                      allocationReached) &&
                      !hasHeadstart
                  "
                  v-if="selectedNetwork === currentChain.NETWORK_NAME"
                />
                <q-btn
                  label="Join Pool"
                  type="submit"
                  color="primary"
                  v-if="
                    selectedNetwork !== currentChain.NETWORK_NAME &&
                      hasAllowance
                  "
                />
                <div
                  v-if="canBuyWithUSD"
                  style="text-align: center;"
                  class="q-py-xs"
                >
                  OR
                </div>
                <!-- Moonpay button -->
                <!-- <q-btn
                  v-if="canBuyWithUSD"
                  label="Join with Moonpay"
                  color="primary"
                  @click="doUSDPayment(moonpayCurrencyCode)"
                  :disable="
                    (!isAuthenticated ||
                      balance <= $chainToQty(pool.minimum_swap) ||
                      pool.pool_status !== `open` ||
                      not_enough_start ||
                      joining ||
                      !isWhitelisted ||
                      allocationReached) &&
                      !hasHeadstart
                  "
                /> -->
                <!-- Moonpay waiting for TX -->
                <!-- <moonpay-processing
                  :moonpayTx="moonpayTx"
                  :moonpayActive="moonpayActive"
                /> -->
                <div
                  v-if="not_enough_start"
                  class="q-pt-sm self-center warning"
                >
                  You do not have enough START tokens to participate in this
                  pool.
                  <a target="_blank" :href="currentChain.BUY_START_URL">
                    Get here
                  </a>
                </div>
              </q-item-section>
              <q-tooltip :offset="joinTooltipOffset" v-if="!isAuthenticated">
                Connect wallet
              </q-tooltip>
              <q-tooltip
                v-else-if="not_enough_start"
                :offset="joinTooltipOffset"
              >
                Not enough START
              </q-tooltip>
              <q-tooltip
                v-else-if="
                  isAuthenticated && balance <= $chainToQty(pool.minimum_swap)
                "
                :offset="joinTooltipOffset"
              >
                Zero balance
              </q-tooltip>
              <q-tooltip v-else-if="!isWhitelisted" :offset="joinTooltipOffset">
                Not whitelisted for this pool
              </q-tooltip>
              <q-tooltip
                v-else-if="allocationReached"
                :offset="joinTooltipOffset"
              >
                Maximum allocation reached
              </q-tooltip>
            </q-item>
          </div>
        </q-form>

        <!-- Legal disclaimer -->
        <q-dialog v-model="disclaimer_show">
          <q-card>
            <q-card-section>
              <div class="text-h6">Disclaimer</div>
            </q-card-section>

            <q-card-section class="q-pt-none">
              T-Starter is a smart contract based token swap and sale platform.
              Although the smart contracts, interfaces, code and logic
              (altogether, the Service) that are available for use on T-Starter
              have been audited by 3rd parties, T-Starter makes no express
              warranties as to the completeness, safety, absense of bugs or
              errors in the Service. T-Starter further disclaims all liability
              or loss from its users due to the users' own negligence, lack of
              knowledge, or lack of adequate safety measures on the part of the
              users. In no way shall T-Starter be held liable for loss of funds
              due to users' own malfeasance, ignorance, negligence, or due to
              unforeseen network costs such as gas fees or fluctuations in
              price. The platform and the Services are presented "as is", and by
              utilising the Service, users warrant that they are aware of the
              risks associated with interacting with smart contracts,
              cryptocurrency, cryptocurrency wallets, and blockchain based
              systems. Users' transactions cannot be reversed once sent, and
              users have the sole responsibility to verify all information,
              including but not limited to smart contract addresses and network
              addresses, prior to interacting with or participating in the
              Service. By clicking "Agree" below, the user expressly warrants
              that he/she has read this Disclaimer and agrees to be bound by the
              covenants set herein.
            </q-card-section>

            <q-card-actions align="right">
              <q-btn flat label="Agree" color="primary" v-close-popup />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <!-- Not enough START to participate in premium pool -->
        <q-dialog v-model="stake_warning">
          <q-card>
            <q-card-section class="row items-center">
              <q-icon
                name="fas fa-exclamation-circle"
                size="lg"
                class="q-pr-sm"
                color="primary"
              />
              <div class="text-h6">Premium pool</div>
            </q-card-section>

            <q-card-section class="q-pt-none">
              You don't have enough START tokens to participate in a premium
              pool.
            </q-card-section>

            <q-card-actions align="right">
              <q-btn
                outline
                type="a"
                target="_blank"
                :href="currentChain.BUY_START_URL"
                label="Buy START"
                color="accent"
                class="hover-accent"
              />
              <q-btn flat label="OK" color="primary" v-close-popup />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <!-- Confirm stake dialog -->
        <q-dialog v-model="confirm_stake" persistent>
          <q-card>
            <q-card-section class="row items-center">
              <q-avatar color="primary" text-color="secondary" class="q-mr-sm">
                <q-icon name="fas fa-coins" size="28px" />
              </q-avatar>
              <span class="text-h6">Confirm stake</span>
            </q-card-section>
            <q-card-section>
              <span>
                Confirm staking additional
                {{ this.$chainStrReformat(this.premium_access_fee) }} tokens for
                premium access?
              </span>
            </q-card-section>

            <q-card-actions align="right">
              <q-btn
                flat
                label="Cancel"
                color="primary"
                v-close-popup
                @click="joining = false"
              />
              <q-btn
                flat
                label="Confirm"
                color="primary"
                @click="tryTransaction"
                v-close-popup
              />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <!-- Transaction sent dialog -->
        <q-dialog v-model="showTransaction" confirm>
          <q-card>
            <q-card-section class="row items-center">
              <q-icon
                name="fas fa-arrow-circle-right"
                size="lg"
                class="q-pr-sm"
                color="primary"
                text-color="white"
              />
              <span class="text-h6">
                Transaction placed
              </span>
            </q-card-section>
            <q-card-section>
              <q-item>
                <q-item-label lines="1">
                  {{ transaction }}
                </q-item-label>
              </q-item>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn
                type="a"
                target="_blank"
                :href="`${explorerUrl}/transaction/${transaction}`"
                label="Bloks.io"
                color="primary"
                flat
              />
              <q-btn
                flat
                label="View Allocation"
                color="primary"
                @click="toAllocationsPage"
                v-close-popup
              />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <!-- Moonpay dialog -->
        <!--    `https://buy-staging.moonpay.com?apiKey=${process.env.MOONPAY_KEY}&currencyCode=${moonpayCurrencyCode}&baseCurrencyAmount=${this.amountUSD}&baseCurrencyCode=usd&externalCustomerId=${this.accountName}&externalTransactionId=${this.externalTransactionId}&walletAddress=${this.accountName}&walletAddress=${this.accountName}&currencyCode=${moonpayCurrencyCode}` -->
        <q-dialog v-model="moonpayDialog">
          <div
            class="bg-white"
            style="border-radius: 10px; overflow: hidden; text-align:center;"
          >
            <iframe
              allow="accelerometer; autoplay; camera; gyroscope; payment"
              height="600"
              width="350"
              :src="
                `https://buy-staging.moonpay.com?baseCurrencyCode=usd&apiKey=${moonpayKey}&baseCurrencyAmount=${this.amountUSD}&externalCustomerId=${this.accountName}&externalTransactionId=${this.externalTransactionId}`
              "
              allowfullscreen
              frameBorder="0"
            >
              <p>Your browser does not support iframes.</p>
            </iframe>
          </div>
        </q-dialog>
      </q-card>
      <!-- Processing xchain tx -->
      <q-card
        v-if="
          selectedNetwork !== currentChain.NETWORK_NAME &&
            xchainProgress.submitted
        "
        class="q-mt-md fit column wrap content-center"
      >
        <div class="text-h6 row">
          Transaction Progress
          <!-- <div class="col text-overline q-ml-sm"> eta: 2 min</div> -->
        </div>
        <div class="text-center">
          Transaction submitted
          <q-icon
            v-if="xchainProgress.submitted"
            name="fas fa-check-circle"
            size="xs"
            class="q-pr-sm"
            color="positive"
          />
          <q-spinner v-else />
        </div>
        <div class="text-center">
          Transaction confirmed
          <q-icon
            v-if="xchainProgress.confirmed"
            name="fas fa-check-circle"
            size="xs"
            class="q-pr-sm"
            color="positive"
          />
          <q-spinner v-else />
        </div>
        <div class="text-center">
          Reporters confirmed
          <q-icon
            v-if="xchainProgress.reported"
            name="fas fa-check-circle"
            size="xs"
            class="q-pr-sm"
            color="positive"
          />
          <q-spinner v-else />
        </div>
        <!-- <div class="text-center">Allocation confirmed <q-spinner /></div> -->
        <div v-if="xchainProgress.success === 1" class="text-center">
          Success
          <q-icon
            name="fas fa-check-circle"
            size="xs"
            class="q-pr-sm"
            color="positive"
          />
        </div>
        <div v-if="xchainProgress.success === -1" class="text-center">
          Failed
          <q-icon
            name="fas fa-times-circle"
            size="xs"
            class="q-pr-sm"
            color="negative"
          />
        </div>
        <div v-if="xchainProgress.success === -1" style="color: red">
          Failed to bridge transaction. Please claim your refund from the pool's
          allocations tab.
        </div>
      </q-card>
    </section>
  </q-page>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import tokenAvatar from "src/components/TokenAvatar";
import { uid } from "uid";
import MoonpayProcessing from "src/components/MoonpayProcessing.vue";
import metamask from "src/components/Metamask";
import { copyToClipboard } from "quasar";
import netSelector from "src/components/NetSelector";
import TokenSelector from "src/components/TokenSelector.vue";

export default {
  mixins: [metamask],
  data() {
    return {
      poolID: Number(this.$route.params.id),
      pool: this.$defaultPoolInfo,
      balance: 0,
      amount: "",
      amountUSD: 0,
      allocation: 0,
      alreadyStaked: false,
      confirm_stake: false,
      stake_warning: false,
      disclaimer_show: false,
      not_enough_start: false,
      joining: false,
      premium_access_fee: {},
      platform_token: { sym: "4,START", contract: "token.start" },
      base_token_symbol: "",
      showTransaction: false,
      transaction: null,
      accountStakeInfo: {},
      tiersTable: [],
      joinTooltipOffset: [0, -45],
      moonpayDialog: false,
      moonpayActive: false,
      moonpayTx: {},
      currentUID: uid(),
      pollingMoonpay: null,
      moonpayKey: process.env.MOONPAY_KEY,
      networkOptions: ["TELOS", "ETHEREUM", "BSC"],
      selectedNetwork: "TELOS",
      xchainToken: {},
      possiblexchainTokens: [],
      hasAllowance: false,
      joinPoolTx: {},
      xchainProgress: {
        submitted: false,
        confirmed: false,
        reported: false,
        success: 0
      }
    };
  },
  components: { tokenAvatar, netSelector, TokenSelector },
  computed: {
    ...mapGetters("pools", [
      "getAllPools",
      "getPoolByID",
      "getAllPoolIDs",
      "getPoolByIDChain"
    ]),
    ...mapGetters("account", ["isAuthenticated", "accountName", "wallet"]),
    ...mapGetters("blockchains", ["currentChain"]),
    ...mapGetters("xchain", ["getEvmRemoteId"]),

    externalTransactionId() {
      return this.accountName + "-" + this.currentUID;
    },

    currentURL() {
      let url = new URL(location.href);
      console.log(url);
      return url;
    },

    START_info() {
      return this.wallet.find(el => (el.sym = "START"));
    },

    explorerUrl() {
      return this.currentChain.NETWORK_EXPLORER;
    },

    isWhitelisted() {
      if (
        this.pool.whitelist.length > 0 &&
        this.pool.whitelist.includes(this.accountName)
      ) {
        return true;
      } else if (this.pool.whitelist.length === 0) {
        return true;
      } else {
        return false;
      }
    },
    BaseTokenSymbol() {
      let idx = this.pool.base_token.sym.indexOf(",") + 1;
      return this.pool.base_token.sym.slice(idx);
    },
    BaseTokenDecimals() {
      let idx = this.pool.base_token.sym.indexOf(",");
      return Number(this.pool.base_token.sym.slice(0, idx));
    },
    TokenSymbol() {
      let idx = this.pool.swap_ratio.quantity.indexOf(" ") + 1;
      return this.pool.swap_ratio.quantity.slice(idx);
    },
    tokenToAmount() {
      let swap_qty = this.pool.swap_ratio.quantity;
      let result = 0;
      if (swap_qty) {
        result = this.zeroNaN(this.amount * this.$chainToQty(swap_qty));
        let decimals = this.$chainToDecimals(swap_qty);
        result = this.$toFixedDown(result, decimals);
      }
      return result;
    },

    allocationReached() {
      if (
        this.$chainToQty(this.allocation.bid) >=
        this.$chainToQty(this.pool.maximum_swap)
      ) {
        return true;
      } else {
        return false;
      }
    },

    hasHeadstart() {
      // console.log(this.accountStakeInfo)indefined
      if (Object.keys(this.accountStakeInfo).length > 0) {
        if (
          this.accountStakeInfo.tier > 0 &&
          Date.now().valueOf() < this.pool.pool_open &&
          Date.now().valueOf() > this.pool.pool_open - 3 * 60 * 60 * 1000
        ) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    },

    maxAllocation() {
      if (this.hasHeadstart) {
        if (Object.keys(this.accountStakeInfo).length > 0) {
          let max_allocation = 0;
          let account_tier = this.accountStakeInfo.tier;
          let denominator = 0;
          for (const tier of [...this.tiersTable].reverse()) {
            denominator += tier.members;
            let weight = tier.weight / 10000.0;
            let tier_allocation =
              denominator === 0
                ? 0.0
                : (this.$chainToQty(this.pool.hard_cap) / denominator) * weight;

            if (account_tier >= tier.id) {
              max_allocation += tier_allocation;
            }
          }

          // return max_allocation;
          return this.$toFixedDown(
            max_allocation,
            this.$getDecimalFromAsset(this.pool.base_token)
          );
        } else {
          return 0;
        }
      } else {
        return this.zeroNaN(this.$chainToQty(this.pool.maximum_swap));
      }
    },

    availableBuy() {
      if (this.$chainToQty(this.allocation.allocation) !== undefined) {
        if (this.$chainToQty(this.allocation.allocation) > this.maxAllocation) {
          return 0;
        } else {
          return (
            this.maxAllocation - this.$chainToQty(this.allocation.allocation)
          );
        }
      } else {
        return this.maxAllocation;
      }
    },

    moonpayCurrencyCode() {
      if (this.currentChain.NETWORK_NAME === "EOS") {
        return "eos";
      } else if (this.currentChain.NETWORK_NAME === "WAX") {
        return "waxp";
      } else {
        return "tlos";
      }
    },

    canBuyWithUSD() {
      if (this.moonpayCurrencyCode === "tlos") {
        return false;
      } else {
        return true;
      }
    },

    // xchain things
    // TODO dynamically get these
    supportedEvmChains() {
      return ["ETHEREUM", "BSC"];
    },

    xchainTokenSymbol() {
      if (this.xchainToken.remote_token_symbol) {
        return this.xchainToken.remote_token_symbol.split(",")[1];
      } else {
        return "";
      }
    }
  },

  methods: {
    ...mapActions("pools", [
      "getChainPoolByID",
      "getChainAccountInfo",
      "getBalanceFromChain",
      "getPremiumStake",
      "checkStakedChain",
      "getAllocationByPool",
      "getPlatformToken",
      "getPoolsSettings"
    ]),
    ...mapActions("account", [
      "getChainSTART",
      "getChainAccountStakeInfo",
      "getChainTiersTable"
    ]),

    restrictDecimal() {
      this.amount = this.$toFixedDown(
        this.amount,
        this.$getDecimalFromAsset(this.pool.base_token)
      );
    },

    zeroNaN(val) {
      if (isNaN(val)) return 0;
      else return val;
    },
    getPoolInfo() {
      this.pool = this.getPoolByIDChain(
        this.poolID,
        this.currentChain.NETWORK_NAME
      );
    },

    validateInput(val) {
      return (
        (val >= this.$chainToQty(this.pool.minimum_swap) &&
          val <= this.$chainToQty(this.pool.maximum_swap)) ||
        `Must be between minimum and maximum`
      );
    },

    async getAllocations() {
      let payload = { account: this.accountName, poolID: this.pool.id };
      this.allocation = await this.getAllocationByPool(payload);
      // console.log("Allocation:");
      // console.log(this.allocation);
      // show disclaimer if user hasn't participated yet
      if (this.$chainToQty(this.allocation.allocation) > 0) {
        this.disclaimer_show = false;
      } else {
        this.disclaimer_show = true;
      }
    },

    async getBalance() {
      // if selected network is current chain, get balance from chain
      if (this.selectedNetwork !== this.currentChain.NETWORK_NAME) {
        const { injectedWeb3, web3 } = await this.$web3();
        if (this.xchainToken.remote_token_address) {
          const tokenContract = new web3.eth.Contract(
            this.$erc20Abi,
            "0x" + this.xchainToken.remote_token_address
          );
          let rawBalance = await tokenContract.methods
            .balanceOf(this.getEvmAccountName)
            .call();
          this.balance = Number(
            rawBalance /
              10 ** this.xchainToken.remote_token_symbol.split(",")[0]
          );
        }
      } else {
        let payload = {
          address: this.pool.base_token.contract,
          sym: this.BaseTokenSymbol,
          accountName: this.accountName
        };
        // console.log(await this.getBalanceFromChain(payload));
        this.balance = this.$chainToQty(
          await this.getBalanceFromChain(payload)
        );
      }
    },

    setMax() {
      if (this.balance >= this.maxAllocation) {
        this.amount = this.availableBuy;
      } else {
        this.amount = this.balance;
      }
      this.amount = this.$toFixedDown(
        this.amount,
        this.$getDecimalFromAsset(this.pool.base_token)
      );
      // if (
      //   this.amount >
      //   this.maxAllocation -
      //     this.$chainToQty(this.allocation.bid)
      // ) {
      //   this.amount =
      //     this.maxAllocation -
      //     this.$chainToQty(this.allocation.bid);
      //     console.log(this.amount)
      // }
    },

    checkAllowed() {
      // TODO check if whitelisted, joinable, premium, public, balance (start tokens),
    },

    async loadChainData() {
      await this.getChainPoolByID(this.poolID);
    },

    async joinPoolTransaction() {
      const actions = [];
      if (Date.now() < this.pool.private_end && !this.alreadyStaked) {
        actions.push(
          // send start if premium
          {
            account: this.platform_token.contract,
            name: "transfer",
            data: {
              from: this.accountName,
              to: process.env.CONTRACT_ADDRESS,
              quantity: this.premium_access_fee,
              memo: "Premium Pool Staking"
            }
          }
        );
      }
      actions.push(
        // transfer tokens
        {
          account: this.pool.base_token.contract,
          name: "transfer",
          data: {
            from: this.accountName,
            to: process.env.CONTRACT_ADDRESS,
            quantity: this.$toChainString(
              this.amount,
              this.BaseTokenDecimals,
              this.BaseTokenSymbol
            ),
            memo: "Join pool"
          }
        }
      );
      actions.push(
        // transfer to contract
        {
          account: process.env.CONTRACT_ADDRESS,
          name: "joinpool",
          data: {
            account: this.accountName,
            pool_id: this.poolID,
            quantity: this.$toChainString(
              this.amount,
              this.BaseTokenDecimals,
              this.BaseTokenSymbol
            )
          }
        }
      );
      const transaction = await this.$store.$api.signTransaction(actions);
      if (transaction) {
        this.showTransaction = true;
        this.transaction = transaction.transactionId;
      }
    },

    toAllocationsPage() {
      this.$router.push({
        name: "pooldetails",
        params: { id: this.poolID },
        query: { tab: "allocations" }
      });
    },

    async tryTransaction() {
      this.joining = true;
      clearInterval(this.pollingMoonpay);
      console.log(this.pollingMoonpay);
      try {
        if (this.selectedNetwork === this.currentChain.NETWORK_NAME) {
          await this.joinPoolTransaction();
        } else {
          await this.joinPoolTransactionOnXchain();
        }
        this.$q.notify({
          color: "green-4",
          textColor: "white",
          icon: "cloud_done",
          message: "Submitted"
        });
        this.joining = false;
      } catch (error) {
        this.$errorNotification(error);
        this.joining = false;
      }
    },

    async onSubmit() {
      this.joining = true;
      if (!this.isAuthenticated) {
        this.$q.notify({
          color: "red-5",
          textColor: "white",
          icon: "warning",
          message: "You need to login first"
        });
      } else {
        // this.checkAllowed();
        if (!this.alreadyStaked && Date.now() < this.pool.private_end) {
          this.confirm_stake = true;
        } else {
          this.tryTransaction();
        }
      }
    },

    async checkBalances() {
      if (this.isAuthenticated) {
        this.getBalance();
      }
      this.premium_access_fee = await this.getPremiumStake();
      this.platform_token = await this.getPlatformToken();

      // check stake if premium pool
      this.alreadyStaked = await this.checkStakedChain({
        account: this.accountName,
        poolID: this.poolID
      });

      // if START balance not enough and is premium pool, show dialog to buy
      let start_balance = this.START_info.balance;
      if (
        start_balance < this.$chainToQty(this.premium_access_fee) &&
        Date.now() < this.pool.private_end &&
        !this.alreadyStaked
      ) {
        this.stake_warning = true;
        this.not_enough_start = true;
      } else {
        this.stake_warning = false;
        this.not_enough_start = false;
      }
    },

    async doUSDPayment(tokenSymbol) {
      if (await this.$refs.joinForm.validate()) {
        this.moonpayActive = true;
        let req = await this.$store.$moonpay.getUSDofToken(tokenSymbol);
        let usd = req.data.USD;
        this.amountUSD = usd * this.amount;

        this.moonpayDialog = true;

        // Start pollingMoonpay
        this.pollingMoonpay = setInterval(async () => {
          try {
            this.moonpayTx = (
              await this.$store.$moonpay.getTransaction(
                this.externalTransactionId
              )
            ).data[0];
            // this.moonpayTx = (
            //   await this.$store.$moonpay.getTransaction(
            //     "fuzzytestnet-e92d477ef98"
            //   )
            // ).data[0];
          } catch (error) {
            this.moonpayTx = {};
          }
          console.log(this.moonpayTx);
          await this.checkBalances();

          if (this.moonpayTx.status === "completed") {
            console.log(this.joining);
            if (!this.joining) {
              this.tryTransaction();
            }
          }
        }, 10000);
      }
    },

    copyEvmAccount() {
      copyToClipboard(this.getEvmAccountName).then(() => {
        this.$q.notify({
          color: "green-4",
          textColor: "secondary",
          message: "Copied address to clipboard",
          timeout: 1000
        });
      });
    },

    // --------------------------------------------------------------
    // xchain methods
    // --------------------------------------------------------------

    async changeNetwork(network) {
      this.selectedNetwork = network;
      if (this.supportedEvmChains.includes(this.selectedNetwork)) {
        await this.switchMetamaskNetwork(this.selectedNetwork);
        await this.connectWeb3();
        this.updatePossibleXchainTokens();
        this.checkAllowance();
      }
    },

    async joinPoolTransactionOnXchain() {
      const { injectedWeb3, web3 } = await this.$web3();
      const BN = web3.utils.toBN;

      let tokenAddress = "0x" + this.xchainToken.remote_token_address;
      let thisChainID = 0; //TODO get dynamically eos,wax
      let decimals = this.xchainToken.remote_token_symbol.split(",")[0];
      let tokenAmount = new BN(this.amount).mul(BN(10).pow(BN(decimals)));

      if (injectedWeb3) {
        // Do pegIn ethereum transaction
        console.log("Doing pegIn");

        const vaultContract = new web3.eth.Contract(
          this.$vaultAbi,
          process.env.VAULT_ADDRESS
        );

        const pegIn = await vaultContract.methods
          .pegIn(
            tokenAmount,
            tokenAddress,
            this.accountName,
            this.poolID,
            thisChainID
          )
          .send({ from: this.getEvmAccountName }, (err, txHash) => {
            if (err) {
              console.log(err);
            } else {
              console.log(txHash);
              this.xchainProgress.submitted = true;
            }
          });

        this.joinPoolTx = pegIn;
        this.xchainProgress.confirmed = true;
        this.checkReportersStatus();
      }
    },

    async approveToken() {
      const { injectedWeb3, web3 } = await this.$web3();

      if (injectedWeb3) {
        // Do approve on erc20
        console.log("Doing approve");
        const tokenContract = new web3.eth.Contract(
          this.$erc20Abi,
          "0x" + this.xchainToken.remote_token_address
        );

        const approve = await tokenContract.methods
          .approve(process.env.VAULT_ADDRESS, "0xFFFFFFFFFFFFFFFF")
          .send({ from: this.getEvmAccountName });
        console.log(approve);
      }
    },

    async checkAllowance() {
      // Check allowance
      const { injectedWeb3, web3 } = await this.$web3();
      const BN = web3.utils.toBN;
      if (this.xchainToken.remote_token_address) {
        console.log("0x" + this.xchainToken.remote_token_address);
        const tokenContract = new web3.eth.Contract(
          this.$erc20Abi,
          "0x" + this.xchainToken.remote_token_address
        );
        let allowance = await tokenContract.methods
          .allowance(this.getEvmAccountName, process.env.VAULT_ADDRESS)
          .call();
        console.log("Allowance:", BN(allowance).toString());

        if (BN(allowance).gte(BN("0xFFFFFFFFFFFFFFF"))) {
          this.hasAllowance = true;
        } else {
          this.hasAllowance = false;
        }
      }
    },

    async updatePossibleXchainTokens() {
      // Get token address from the tokens table
      const res = await this.$store.$api.getTableRows({
        code: process.env.XCHAIN_ADDRESS,
        scope: process.env.XCHAIN_ADDRESS,
        table: "tokens",
        limit: 100
      });
      this.possiblexchainTokens = res.rows.filter(
        token =>
          token.enabled === 1 &&
          token.remote_chain_id === this.getEvmRemoteId &&
          this.$getSymFromAsset(token.token_info) === this.BaseTokenSymbol
      );
      this.xchainToken = this.possiblexchainTokens[0];
    },

    async checkReportersStatus() {
      // start polling table
      let pollingXchain = setInterval(async () => {
        // Check reporters status
        const res = await this.$store.$api.getTableRows({
          code: process.env.XCHAIN_ADDRESS,
          scope: process.env.XCHAIN_ADDRESS,
          table: "reports",
          limit: 1000,
          reverse: true,
          key_type: "sha256",
          index_position: 2,
          lower_bound: this.joinPoolTx.transactionHash.slice(2),
          upper_bound: this.joinPoolTx.transactionHash.slice(2)
        });
        // console.log(res);
        let report = res.rows;
        if (report.length > 0) {
          console.log("Found report");
          if (report[0].executed === 1) {
            console.log("Report executed");
            this.xchainProgress.reported = true;
            this.xchainProgress.success = 1;
            clearInterval(pollingXchain);
          } else if (report[0].failed === 1) {
            console.log("Report failed");
            this.xchainProgress.reported = true;
            this.xchainProgress.success = -1;
            clearInterval(pollingXchain);
          }
        }
      }, 10000);
    }
  },

  async mounted() {
    await this.loadChainData();
    await this.getPoolInfo();
    await this.getAllocations();
    await this.checkBalances();
    // await this.getChainStakeWallet(this.accountName);
    this.accountStakeInfo = await this.getChainAccountStakeInfo(
      this.accountName
    );
    this.tiersTable = await this.getChainTiersTable();

    // TODO get balances/allowance if xchain
  },

  watch: {
    async accountName() {
      await this.loadChainData();
      await this.getPoolInfo();
      await this.getChainSTART(this.accountName);
      await this.checkBalances();
      // await this.getChainStakeWallet(this.accountName);
      this.accountStakeInfo = await this.getChainAccountStakeInfo(
        this.accountName
      );
      this.tiersTable = await this.getChainTiersTable();
    },
    async selectedNetwork() {},
    async getEvmAccountName() {
      this.checkAllowance();
    },
    async xchainToken() {
      this.checkAllowance();
      await this.getBalance();
    }
  },

  beforeDestroy() {
    clearInterval(this.pollingMoonpay);
  }
};
</script>

<style lang="scss" scoped>
.body-container {
  max-width: 700px;
}
.card-container {
  display: grid;
  // grid-gap: 20px;
  align-items: stretch;
  grid-template-columns: 50px auto 50px;
  // grid-template-rows: min-content;
}
.header-bg {
  height: 160px;
  // min-width: 490px;
  margin-bottom: -50px;
}
.inner-card {
  border: 1px solid rgb(194, 194, 194);
  padding: 15px 20px;
}
// .q-field__control {
//   display: flex;
//   align-items: flex-end;
// }
.input-amount {
  font-size: 50px;
  font-size: 4.5vh;
  color: $primary;
}
.q-field,
.input-amount {
  min-width: 200px;
}
// .input-info div {
//   min-width: 150px;
// }
a {
  text-decoration: none;
  color: $primary;
}
.warning {
  color: $negative;
}
@media only screen and (max-width: 650px) {
  .q-form {
    grid-column-start: 1;
    grid-column-end: 4;
  }
}
@media only screen and (max-width: 425px) {
  .card-container {
    // grid-template-columns: 10px auto 10px;
  }
}
</style>
