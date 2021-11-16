<template>
  <q-page>
    <section class="header-bg row content-center justify-center">
      <h2 class="text-white q-pt-xl">List Project</h2>
    </section>

    <section class="body-container column">
      <q-card>
        <div
          v-if="this.$route.params.id != undefined && accountName != pool.owner"
          class="text-center"
        >
          You are not the owner of this pool
        </div>
        <div
          v-else-if="this.$route.params.id === undefined && !isAuthenticated"
          class="text-center"
        >
          Please login to continue
        </div>
        <q-form v-else @submit="onSubmit" @reset="onReset" ref="updateForm">
          <!-- tokens and adresses -->
          <div class="row">
            <q-list dense class="col-xs-12 col-sm-12 col-md-6 q-mb-md">
              <q-item>
                <q-item-section>
                  <q-input
                    color="primary"
                    v-model="pool.title"
                    label="Title *"
                    lazy-rules
                    :rules="[
                      val => (val && val.length > 1) || 'Must specify the title'
                    ]"
                    outlined
                  />
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-input
                    color="primary"
                    v-model="pool.swap_ratio.contract"
                    label="Token contract address *"
                    lazy-rules
                    :disable="
                      pool.status !== 'draft' &&
                        this.$route.params.id != undefined
                    "
                    :readonly="
                      pool.status !== 'draft' &&
                        this.$route.params.id != undefined
                    "
                    :rules="[val => !!val || 'Must specify the token contract']"
                    outlined
                  >
                  </q-input>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section top>
                  <q-input
                    color="primary"
                    v-model="token_symbol"
                    label="Token Symbol *"
                    lazy-rules
                    :disable="
                      pool.status !== 'draft' &&
                        this.$route.params.id != undefined
                    "
                    :readonly="
                      pool.status !== 'draft' &&
                        this.$route.params.id != undefined
                    "
                    :rules="[checkTokenContract]"
                    outlined
                    debounce="1000"
                    class="col"
                    input-style
                  />
                </q-item-section>
                <q-item-section class="col-shrink q-pb-md">To</q-item-section>
                <q-item-section top>
                  <q-select
                    v-model="base_token_symbol"
                    :options="base_token_options.map(a => a.sym)"
                    :disable="
                      pool.status !== 'draft' &&
                        this.$route.params.id != undefined
                    "
                    :readonly="
                      pool.status !== 'draft' &&
                        this.$route.params.id != undefined
                    "
                    label="Base token *"
                    outlined
                  />
                </q-item-section>
              </q-item>
              <!-- Swap ratio -->
              <q-item>
                <q-item-section side class="q-pb-md"
                  >1 {{ base_token_symbol }} =
                </q-item-section>
                <q-item-section>
                  <q-input
                    color="primary"
                    v-model="pool.swap_ratio.quantity"
                    :disable="
                      pool.status !== 'draft' &&
                        this.$route.params.id != undefined
                    "
                    :readonly="
                      pool.status !== 'draft' &&
                        this.$route.params.id != undefined
                    "
                    :label="`Swap ratio (${tokenSymbolReformat}) *`"
                    lazy-rules
                    :rules="[val => !!val || 'Must specify the swap ratio']"
                    outlined
                  >
                  </q-input>
                </q-item-section>
              </q-item>
              <!-- Quantities -->
              <!-- <h3>Quantities</h3> -->
              <q-item>
                <q-item-section>
                  <q-input
                    color="primary"
                    v-model="pool.soft_cap"
                    :label="`Soft cap (${baseTokenSymbolReformat}) *`"
                    lazy-rules
                    :disable="
                      pool.status !== 'draft' &&
                        this.$route.params.id != undefined
                    "
                    :readonly="
                      pool.status !== 'draft' &&
                        this.$route.params.id != undefined
                    "
                    :rules="[val => !!val || 'Must specify the amount']"
                    outlined
                  />
                </q-item-section>
                <q-item-section>
                  <q-input
                    color="primary"
                    v-model="pool.hard_cap"
                    :label="`Hard cap (${baseTokenSymbolReformat}) *`"
                    lazy-rules
                    :disable="
                      pool.status !== 'draft' &&
                        this.$route.params.id != undefined
                    "
                    :readonly="
                      pool.status !== 'draft' &&
                        this.$route.params.id != undefined
                    "
                    :rules="[val => !!val || 'Must specify the amount']"
                    outlined
                  />
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-input
                    color="primary"
                    v-model="pool.minimum_swap"
                    :label="`Minimum allocation (${baseTokenSymbolReformat}) *`"
                    lazy-rules
                    :disable="
                      pool.status !== 'draft' &&
                        this.$route.params.id != undefined
                    "
                    :readonly="
                      pool.status !== 'draft' &&
                        this.$route.params.id != undefined
                    "
                    :rules="[val => !isNaN(val) || 'Must specify the amount']"
                    outlined
                  />
                </q-item-section>
                <q-item-section>
                  <q-input
                    color="primary"
                    v-model="pool.maximum_swap"
                    :label="`Maximum allocation (${baseTokenSymbolReformat}) *`"
                    lazy-rules
                    :disable="
                      pool.status !== 'draft' &&
                        this.$route.params.id != undefined
                    "
                    :readonly="
                      pool.status !== 'draft' &&
                        this.$route.params.id != undefined
                    "
                    :rules="[val => !!val || 'Must specify the amount']"
                    outlined
                  />
                </q-item-section>
              </q-item>
              <!-- Dates -->
              <!-- <q-item>
                <q-item-section>
                  <q-select
                    outlined
                    class="q-pb-md"
                    v-model="accessType"
                    :options="accessOptions"
                    label="Access Type"
                    :disable="
                      pool.status !== 'draft' &&
                        this.$route.params.id != undefined
                    "
                    :readonly="
                      pool.status !== 'draft' &&
                        this.$route.params.id != undefined
                    "
                  />
                </q-item-section>
                <q-item-section v-if="accessType === 'Premium'">
                  <q-select
                    outlined
                    class="q-pb-md"
                    v-model="premiumDuration"
                    :options="premiumDurationOptions"
                    label="Premium duration (Hours)"
                    :disable="
                      pool.status !== 'draft' &&
                        this.$route.params.id != undefined
                    "
                    :readonly="
                      pool.status !== 'draft' &&
                        this.$route.params.id != undefined
                    "
                  />
                </q-item-section>
              </q-item> -->
              <q-item>
                <q-item-section>
                  <q-select
                    outlined
                    class="q-pb-md"
                    v-model="ballot_close"
                    :options="votingTimeOptions"
                    label="Voting duration"
                    :disable="
                      pool.status !== 'draft' &&
                        this.$route.params.id != undefined
                    "
                  />
                  <!-- Keep for dev purposed -->
                  <!-- <datetime-field
                    class="q-pb-md"
                    :value.sync="ballot_close"
                    :pool="pool"
                    :label="`Voting closing time (GMT${localTimeZone}) *`"
                  /> -->
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section>
                  <datetime-field
                    class="q-pb-md"
                    :value.sync="pool_open"
                    :pool="pool"
                    :label="`Pool opening time (GMT${localTimeZone}) *`"
                  />
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <datetime-field
                    class="q-pb-md"
                    :value.sync="public_end"
                    :pool="pool"
                    :label="`Pool ending time (GMT${localTimeZone}) *`"
                  />
                </q-item-section>
              </q-item>

              <!-- Vesting -->
              <q-item>
                <q-checkbox
                  v-model="vesting"
                  label="Vesting"
                  :disable="
                    pool.status !== 'draft' &&
                      this.$route.params.id != undefined
                  "
                />
              </q-item>

              <q-item v-if="vesting">
                <q-item-section>
                  <q-input
                    v-model="lockup_fraction"
                    label="Lockup fraction"
                    outlined
                    :disable="
                      pool.status !== 'draft' &&
                        this.$route.params.id != undefined
                    "
                    :readonly="
                      pool.status !== 'draft' &&
                        this.$route.params.id != undefined
                    "
                  >
                  </q-input>
                  <div class="q-px-xs">
                    <q-slider
                      v-model="lockup_fraction"
                      :min="0"
                      :max="1"
                      :step="0.05"
                      label
                      color="primary"
                      :disable="
                        pool.status !== 'draft' &&
                          this.$route.params.id != undefined
                      "
                    >
                    </q-slider>
                  </div>
                </q-item-section>
                <q-item-section top>
                  <q-input
                    v-model="lockup_period"
                    label="Lockup period (Days)"
                    outlined
                    :disable="
                      pool.status !== 'draft' &&
                        this.$route.params.id != undefined
                    "
                    :readonly="
                      pool.status !== 'draft' &&
                        this.$route.params.id != undefined
                    "
                    :rules="[val => val > 29 || 'Must be more than 30 days']"
                  />
                </q-item-section>
              </q-item>
              <!-- <div class="col column">
                <div>Type</div>
                <q-radio v-model="pool.pool_type" val="fixed" label="Fixed" />
              </div> -->
              <!-- Image -->
            </q-list>
            <q-list class="col-xs-12 col-sm-12 col-md-6 " dense>
              <q-item>
                <q-item-section>
                  <q-input
                    color="primary"
                    v-model="pool.avatar"
                    label="Avatar image link *"
                    lazy-rules
                    :rules="[
                      val =>
                        (val && val.length > 1) || 'Must specify the image link'
                    ]"
                    outlined
                  />
                </q-item-section>
                <q-item-section side v-if="pool.avatar !== ''">
                  <q-avatar size="50px" class="q-mb-md">
                    <q-img :src="pool.avatar" style="height: 50px">
                      <template v-slot:loading>
                        <q-spinner-puff color="primary" />
                      </template>
                      <template v-slot:error>
                        <div
                          class="absolute-full flex flex-center text-negative transparent text-weight-bold"
                        >
                          ?
                        </div>
                      </template>
                    </q-img>
                  </q-avatar>
                </q-item-section>
              </q-item>

              <!-- web links -->
              <q-item class="weblink-container">
                <div v-for="link in webLinks.slice(0, -1)" :key="link.key">
                  <q-input
                    outlined
                    v-model="link.value"
                    :label="capitalize(link.key)"
                    :rules="[validURL]"
                  />
                </div>
              </q-item>
              <!-- <q-item v-for="link in webLinks" :key="link.key">
                <q-item-section>
                  <q-input
                    outlined
                    v-model="link.value"
                    :label="capitalize(link.key)"
                  />
                </q-item-section>
              </q-item> -->
              <!-- tag-line -->
              <q-item>
                <q-item-section>
                  <q-input
                    v-model="pool.tag_line"
                    autogrow
                    label="Tag line *"
                    lazy-rules
                    :rules="[val => val.length > 1 || 'Must specify']"
                    counter
                    maxlength="230"
                    outlined
                    debounce="500"
                  />
                </q-item-section>
              </q-item>
              <!-- description -->
              <q-item>
                <q-item-section>
                  <q-input
                    v-model="pool.description"
                    autogrow
                    label="Description *"
                    lazy-rules
                    :rules="[val => val.length > 1 || 'Must specify']"
                    outlined
                    debounce="1000"
                    type="textarea"
                    counter
                    maxlength="4000"
                  />
                </q-item-section>
              </q-item>

              <!-- Whitelist -->
              <q-item>
                <q-checkbox v-model="haveWhitelist" el="haveWhitelist">
                  Whitelist?
                </q-checkbox>
              </q-item>

              <q-item v-if="haveWhitelist">
                <q-item-section>
                  <!-- FIXME make dynamic, find doesn't work -->
                  <q-input
                    v-model="webLinks[6].value"
                    label="Whitelist Application URL"
                    outlined
                    :rules="[validURL]"
                  />
                </q-item-section>
              </q-item>
              <q-item v-if="haveWhitelist">
                <q-item-section>
                  <q-input
                    v-model="pool.whitelist"
                    autogrow
                    label="Whitelist (CSV)"
                    outlined
                    :rules="[whitelistValidate]"
                    debounce="500"
                    placeholder="Leave empty if no whitelist needed"
                  /> </q-item-section
              ></q-item>
            </q-list>
          </div>

          <!-- Terms and Conditions -->
          <q-list>
            <q-item>
              <q-checkbox v-model="accept" el="accept">
                I agree to the
                <a :href="TermsandConditionsURL" target="_blank" @click.stop
                  >Terms and Conditions</a
                >
              </q-checkbox>
            </q-item>

            <q-item class="justify-start">
              <q-item-section class="col-auto">
                <q-btn
                  class="hover-accent"
                  v-if="this.$route.params.id === undefined"
                  :label="'Create'"
                  @click="confirm_fee = true"
                  color="primary"
                />
                <q-btn
                  v-else
                  :label="'Update'"
                  @click="onUpdate"
                  color="primary"
                />
              </q-item-section>
              <q-item-section class="col-auto">
                <q-btn
                  label="Fund"
                  @click="onFund"
                  :disable="
                    pool.status === 'published' ||
                      this.funded ||
                      this.getBallotByIDChain(
                        this.poolID,
                        this.currentChain.NETWORK_NAME
                      ).title == ''
                  "
                  v-if="pool.status === 'draft'"
                  color="primary"
                />
                <q-tooltip v-if="pool.status === 'published'">
                  Already published
                </q-tooltip>
                <q-tooltip v-if="this.funded">
                  Already funded
                </q-tooltip>
              </q-item-section>
              <q-item-section class="col-auto">
                <q-btn
                  label="Publish"
                  @click="onPublish"
                  :disable="!this.funded || pool.status === 'published'"
                  v-if="pool.status === 'draft' && funded"
                  color="primary"
                />
                <q-tooltip v-if="!funded">
                  Not funded
                </q-tooltip>
                <q-tooltip v-if="pool.status === 'published'">
                  Already published
                </q-tooltip>
              </q-item-section>

              <!-- Close pool button -->
              <q-item-section class="col-auto">
                <q-btn
                  label="Complete Voting"
                  @click="onClosePool"
                  color="accent"
                  v-if="
                    Date.now() > pool.ballot_close &&
                      pool.status === 'published'
                  "
                />
              </q-item-section>
              <q-item-section>
                <div>
                  <status-badge
                    :poolStatus="pool.status"
                    :badgeText="poolStatusText"
                  />
                </div>
              </q-item-section>
              <q-item-section class="col-auto justify-between">
                <q-btn
                  label="Cancel Ballot"
                  @click="onBallotCancel"
                  color="accent"
                  v-if="pool.status === 'published' || pool.status === 'draft'"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-form>
        <!-- <div v-else style="min-height: 80px">
          <q-inner-loading :showing="pool.owner === 'Loading'">
            <q-spinner-puff size="50px" color="primary" />
          </q-inner-loading>
        </div> -->
        <q-separator class="q-my-md" />
        <div class="items-center q-px-md">
          <div class="text-subtitle1 q-pb-xs">Special requests?</div>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSeQE7zDFlxxWmAN-pKDfik6OcgtReJ8oiviIpCUkOAGk6Ez7Q/viewform"
            target="_blank"
            class="hover-accent "
            >Apply for a listing
          </a>
          <!-- <q-btn
            flat
            color="primary"
            label="Apply for listing"
            class="hover-accent"
            no-caps
          ></q-btn> -->
          on our Google form.
        </div>
      </q-card>

      <div class="text-center q-pt-md  text-grey-7 ">
        <q-btn
          no-caps
          flat
          class="hover-accent"
          size="0.75rem"
          @click="explainProcessDialog = true"
        >
          <div class="text-caption">
            <q-icon name="fas fa-info-circle" class="q-pr-xs" size="1em" />
            For more information about the listing process, click here
          </div>
        </q-btn>
      </div>

      <!-- Confirm stake dialog -->
      <q-dialog v-model="confirm_fee" persistent>
        <q-card>
          <q-card-section class="row items-center">
            <q-avatar color="primary" text-color="secondary" class="q-mr-sm">
              <q-icon name="fas fa-coins" size="28px" />
            </q-avatar>
            <span class="text-h6">Confirm application</span>
          </q-card-section>
          <q-card-section>
            <span>
              Confirm sending additional
              {{ this.$chainStrReformat(this.settings.listing_fee) }} tokens for
              application fee?
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
              @click="onSubmit()"
              v-close-popup
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Confirm ballot cancel dialog -->
      <q-dialog v-model="dialog_cancel_ballot">
        <q-card>
          <q-card-section class="row items-center">
            <q-avatar color="accent" text-color="secondary" class="q-mr-sm">
              <q-icon name="fas fa-exclamation-circle" size="28px" />
            </q-avatar>
            <span class="text-h6">Cancel ballot</span>
          </q-card-section>
          <q-card-section>
            <span>
              Confirm cancelling ballot? Funded tokens will be refunded
              (excluding START).
            </span>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="No" color="primary" v-close-popup />
            <q-btn
              flat
              label="Confirm"
              color="primary"
              @click="tryBallotCancel()"
              v-close-popup
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Under process dialog -->
      <q-dialog v-model="explainProcessDialog">
        <q-card class="col-shrink slim-scrollbar" style="max-width: 80ch">
          <q-card-section class="row items-center justify-center">
            <div class="text-h6">
              Project Listing Process
              <q-icon
                name="fas fa-clipboard-list"
                class="text-green"
                style="font-size: 1em;"
              />
            </div>
          </q-card-section>

          <q-card-section>
            <div class="text-subtitle1">
              Step 1 : Create a ballot
              <q-icon
                name="fas fa-check"
                class="text-green"
                style="font-size: 1rem;"
              />
            </div>
            <p class="q-pt-sm">
              A ballot is used to allow the T-Starter community to evaluate your
              project and decide if it should proceed to sale. Create a ballot
              as follows:
            </p>
            <ul>
              <li>
                Complete the ballot creation form detailing your proposed sale.
              </li>
              <li>
                Pay 1000 START ballot fee and save your ballot draft to the
                blockchain.
              </li>
              <li>
                Review your sale parameters and refine if necessary. Once you
                are happy with your sale parameters, open your sale to voting as
                follows.
              </li>
              <li>
                Use the “fund sale” option to move project sale tokens to
                T-Starter
              </li>
              <li>
                “Publish” the sale to start the voting process. Voting begins
                immediately after the ballot is published.
              </li>
            </ul>

            <div class="text-subtitle1">
              Step 2 : Close ballot and start the token sale
              <q-icon
                name="fas fa-check"
                class="text-green"
                style="font-size: 1rem;"
              />
            </div>
            <ul>
              <li>Voting ends if the voting period is over.</li>
              <li>
                If the ballot is successful, a pool is created and published
                automatically once the ballot closes.
              </li>
              <li>
                If the ballot is unsuccessful, it is removed without creating a
                pool.
              </li>
            </ul>
            <div class="row justify-center q-py-sm">
              <q-btn
                class="hover-accent"
                label="Continue"
                color="primary"
                v-close-popup
              />
            </div>
          </q-card-section>

          <q-separator class="" />
          <q-card-section>
            <div class="text-subtitle1 q-pb-xs">Special requests?</div>
            If this self-listing process does not satisfy your project's needs,
            you can apply for a listing.
            <div class="row justify-center q-pt-md">
              <q-btn
                class="hover-accent"
                label="Apply for listing"
                color="primary"
                href="https://docs.google.com/forms/d/e/1FAIpQLSeQE7zDFlxxWmAN-pKDfik6OcgtReJ8oiviIpCUkOAGk6Ez7Q/viewform"
                target="_blank"
                v-close-popup
              />
            </div>
          </q-card-section>
        </q-card>
      </q-dialog>
    </section>
  </q-page>
</template>

<script>
import datetimeField from "src/components/poolcreation/datetime-field.vue";
import { mapGetters, mapActions } from "vuex";
import statusBadge from "src/components/poolinfo/status-badge";
import { date } from "quasar";

export default {
  components: { datetimeField, statusBadge },
  data() {
    return {
      TermsandConditionsURL: "",
      explainProcessDialog: false,
      confirm_fee: false,
      haveWhitelist: false,
      customDate: "",
      poolID: Number(this.$route.params.id),
      pool: this.$defaultBallotInfo,
      settings: {},
      weekInMs: 7 * 24 * 60 * 60 * 1000,
      ballot_close: {
        label: "2 Weeks",
        date: this.toDateStringLocal(Date.now() + 2 * 7 * 24 * 60 * 60 * 1000),
        category: "2"
      },
      pool_open: {
        date: this.toDateStringLocal(Date.now() + 2 * 8 * 24 * 60 * 60 * 1000)
      },
      // private_end: { date: this.toDateStringLocal(new Date().valueOf()) },
      public_end: {
        date: this.toDateStringLocal(Date.now() + 3 * 7 * 24 * 60 * 60 * 1000)
      },

      cleanedWebLinks: [],
      // prettier-ignore
      webLinks: [
        { key: "website", value: "" },
        { key: "github", value: "" },
        { key: "medium", value: "" },
        { key: "telegram", value: "" },
        { key: "twitter", value: "" },
        { key: "whitepaper", value: ""},
        { key: "whitelist", value: "" }
      ],

      base_token_symbol: "",
      base_tokens_raw: [],
      base_token_options: [],
      token_symbol: "",
      token_decimals: 1,
      accept: false,
      funded: false,
      dialog_close_ballot: false,
      dialog_cancel_ballot: false,
      accessType: "Premium",
      accessOptions: ["Public", "Premium"],
      premiumDuration: 1, //hours
      premiumDurationOptions: [1, 3, 6, 12, 24],
      vesting: false,
      lockup_fraction: 0.5,
      lockup_period: 30
    };
  },

  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName"]),
    ...mapGetters("ballots", ["getBallotByID", "getBallotByIDChain"]),
    ...mapGetters("blockchains", ["currentChain"]),

    votingTimeOptions() {
      return [
        {
          label: "1 Week",
          date: this.toDateStringLocal(Date.now() + 1 * this.weekInMs),
          category: "1"
        },
        {
          label: "2 Weeks",
          date: this.toDateStringLocal(Date.now() + 2 * this.weekInMs),
          category: "2"
        }
      ];
    },

    private_end() {
      // if (this.accessType === "Premium") {
      //   return {
      //     date: this.toDateStringLocal(
      //       new Date(this.pool_open.date).valueOf() +
      //         this.premiumDuration * 1000 * 60 * 60
      //     )
      //   };
      // } else {
      //   return this.public_end;
      // }
      return this.public_end;
    },

    selected_base_token() {
      return this.base_token_options.find(
        el => el.sym === this.base_token_symbol
      );
    },
    BaseTokenToChain() {
      let BaseObj = this.selected_base_token;
      let obj = {
        sym: BaseObj.decimals + "," + BaseObj.sym,
        contract: BaseObj.contract
      };
      return obj;
    },
    swapRatio() {
      return {
        quantity: this.$toChainString(
          this.pool.swap_ratio.quantity,
          this.token_decimals,
          this.token_symbol
        ),
        contract: this.pool.swap_ratio.contract
      };
    },
    tokenSymbolReformat() {
      let token = this.token_symbol;
      if (token === "") return "Custom token";
      else return token;
    },
    baseTokenSymbolReformat() {
      let token = this.base_token_symbol;
      if (token === "") return "Base token";
      else return token;
    },
    poolStatusText() {
      let status = this.pool.status;
      if (status === "published") return "Pool in progress";
      else if (status === "fail") return "Pool cancelled";
      else if (status === "success") return "Pool succeeded";
      else return "Draft";
    },
    localTimeZone() {
      return date.formatDate(new Date(), "Z");
    }
  },

  methods: {
    ...mapActions("ballots", [
      "getAllChainBallots",
      "getChainBallotByID",
      "getChainBallotByIDChain",
      "findCreatedBallotID",
      "ifBallotFunded",
      "getBallotConfig"
    ]),
    ...mapActions("pools", [
      "getChainAccountInfo",
      "getTokenPrecision",
      "updatePoolStatus",
      "getBaseTokens",
      "getPoolsSettings"
    ]),
    capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    },
    toDateStringUTC(timestamp) {
      if (timestamp <= 0) timestamp = new Date().valueOf();
      return new Date(timestamp)
        .toISOString()
        .slice(0, 16)
        .replace("T", " ");
    },
    toDateStringLocal(timestamp) {
      if (timestamp <= 0) timestamp = new Date().valueOf();
      return date.formatDate(timestamp, "YYYY-MM-DD HH:mm");
    },

    formatWhitelist() {
      // check if whitelist enabled
      if (this.haveWhitelist) {
        if (!(this.pool.whitelist instanceof Array)) {
          // if empty do nothing
          if (this.pool.whitelist.length !== 0) {
            //clean whitespace
            if (this.pool.whitelist.includes(" ")) {
              this.pool.whitelist = this.pool.whitelist.replace(" ", "");
            }
            //split into array
            this.pool.whitelist = this.pool.whitelist.split(",");
          }
        }
      } else {
        this.pool.whitelist = "";
        this.webLinks.find(el => el.key === "whitelist").value = "";
      }
    },

    // TODO check accounts exist?
    whitelistValidate(val) {
      console.log(val);
      if (val.length === 0) {
        return;
      } else if (val instanceof Array) {
        return;
      } else {
        console.log(val.split(","));
        return (
          (val.split(",").length > 1 && val.split(",")[1] != "") ||
          `Must contain at least two accounts`
        );
      }
    },

    validURL(str) {
      var pattern = new RegExp("((http|https)://)(www.)?[a-zA-Z0-9@:%._\\+~#?&//=]{2,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%._\\+~#?&//=]*)"
      ); // fragment locator
      if (str.length === 0) {
        return;
      } else {
        return !!pattern.test(str) || "Must be valid URL";
      }
    },

    async setBaseTokenOptions() {
      this.base_tokens_raw = await this.getBaseTokens();
      for (
        let token_num = 0;
        token_num < this.base_tokens_raw.length;
        token_num++
      ) {
        const asset = this.base_tokens_raw[token_num];
        let token_reformat = {
          sym: this.$getSymFromAsset(asset),
          decimals: this.$getDecimalFromAsset(asset),
          contract: asset.contract
        };
        this.base_token_options.push(token_reformat);
      }
    },

    getTokenSymbolFromPool() {
      let idx = this.pool.swap_ratio.quantity.indexOf(" ") + 1;
      this.token_symbol = this.pool.swap_ratio.quantity.slice(idx);
    },
    BaseTokenSymFromChain() {
      let idx = this.pool.base_token.sym.indexOf(",") + 1;
      this.base_token_symbol = this.pool.base_token.sym.slice(idx);
    },
    populateWebLinks() {
      // prettier-ignore
      this.webLinks.find(el => el.key === "website").value = this.pool.web_links.filter(el => el.key === "website").map(a => a.value);
      // prettier-ignore
      this.webLinks.find( el => el.key === "github" ).value = this.pool.web_links.filter(el => el.key === "github").map(a => a.value);
      // prettier-ignore
      this.webLinks.find( el => el.key === "medium" ).value = this.pool.web_links.filter(el => el.key === "medium").map(a => a.value);
      // prettier-ignore
      this.webLinks.find( el => el.key === "telegram" ).value = this.pool.web_links.filter(el => el.key === "telegram").map(a => a.value);
      // prettier-ignore
      this.webLinks.find( el => el.key === "twitter" ).value = this.pool.web_links.filter(el => el.key === "twitter").map(a => a.value);
      // prettier-ignore
      this.webLinks.find( el => el.key === "whitepaper" ).value = this.pool.web_links.filter(el => el.key === "whitepaper").map(a => a.value);
      // prettier-ignore
      this.webLinks.find( el => el.key === "whitelist" ).value = this.pool.web_links.filter(el => el.key === "whitelist").map(a => a.value);
    },

    async checkTokenContract(val) {
      // get decimal precisoin from token
      let payload = {
        address: this.pool.swap_ratio.contract,
        token_symbol: val
      };
      this.token_decimals = await this.getTokenPrecision(payload);
      return (
        (!!val && this.token_decimals >= 0) ||
        `Must be a valid contract and token`
      );
    },

    checkLinks() {
      this.cleanedWebLinks = this.webLinks.filter(el => el.value != "");
    },

    getPoolInfo() {
      if (this.poolID) {
        this.pool = JSON.parse(
          JSON.stringify(
            this.getBallotByIDChain(this.poolID, this.currentChain.NETWORK_NAME)
          )
        ); //make deep copy
        // if this pool is owned by user, populate the fields
        if (this.pool.owner === this.accountName) {
          this.getTokenSymbolFromPool();
          // pool to numbers
          this.pool.swap_ratio.quantity = this.$chainToQty(
            this.pool.swap_ratio.quantity
          );
          this.pool.soft_cap = this.$chainToQty(this.pool.soft_cap);
          this.pool.hard_cap = this.$chainToQty(this.pool.hard_cap);
          this.pool.minimum_swap = this.$chainToQty(this.pool.minimum_swap);
          this.pool.maximum_swap = this.$chainToQty(this.pool.maximum_swap);

          this.populateWebLinks();
          this.BaseTokenSymFromChain();

          // prettier-ignore
          this.ballot_close.date = this.toDateStringLocal(this.pool.ballot_close);
          this.pool_open.date = this.toDateStringLocal(this.pool.pool_open);
          this.private_end.date = this.toDateStringLocal(this.pool.private_end);
          this.public_end.date = this.toDateStringLocal(this.pool.public_end);

          if (this.pool.whitelist.length > 0) {
            this.haveWhitelist = true;
          }

          this.vesting = this.pool.token_lockup ? true : false;
          this.lockup_fraction = this.pool.lockup_percent / 10000;
          this.lockup_period = this.pool.lockup_period;

          this.accessType = this.pool.access_type;
        }
      }
    },

    async publishPool() {
      const actions = [
        {
          account: process.env.BALLOT_ADDRESS,
          name: "openballot",
          data: {
            id: this.poolID
          }
        }
      ];
      const transaction = await this.$store.$api.signTransaction(actions);
    },

    async updateBallot() {
      var actions = [
        {
          account: process.env.BALLOT_ADDRESS,
          name: "updateballot",
          data: {
            id: this.poolID,
            title: this.pool.title,
            avatar: this.pool.avatar,
            tag_line: this.pool.tag_line,
            description: this.pool.description,
            base_token: this.BaseTokenToChain,
            swap_ratio: this.swapRatio,
            soft_cap: this.$toChainString(
              this.pool.soft_cap,
              this.selected_base_token.decimals,
              this.selected_base_token.sym
            ),
            hard_cap: this.$toChainString(
              this.pool.hard_cap,
              this.selected_base_token.decimals,
              this.selected_base_token.sym
            ),
            minimum_swap: this.$toChainString(
              this.pool.minimum_swap,
              this.selected_base_token.decimals,
              this.selected_base_token.sym
            ),
            maximum_swap: this.$toChainString(
              this.pool.maximum_swap,
              this.selected_base_token.decimals,
              this.selected_base_token.sym
            ),
            // prettier-ignore
            ballot_close: this.toDateStringUTC(new Date(this.pool.ballot_close)),
            pool_open: this.toDateStringUTC(new Date(this.pool.pool_open)),
            private_end: this.toDateStringUTC(new Date(this.pool.private_end)),
            public_end: this.toDateStringUTC(new Date(this.pool.public_end)),
            whitelist: this.pool.whitelist,
            web_links: this.cleanedWebLinks
          }
        }
      ];
      if (this.pool.status === "draft") {
        if (this.vesting) {
          actions.push({
            account: process.env.BALLOT_ADDRESS,
            name: "setlockup",
            data: {
              ballot_id: this.poolID,
              token_lockup: this.vesting,
              lockup_fraction: this.lockup_fraction,
              lockup_period: this.lockup_period
            }
          });
        } else {
          actions.push({
            account: process.env.BALLOT_ADDRESS,
            name: "setlockup",
            data: {
              ballot_id: this.poolID,
              token_lockup: this.vesting,
              lockup_fraction: 0,
              lockup_period: 0
            }
          });
        }
      }
      const transaction = await this.$store.$api.signTransaction(actions);
    },

    async createBallot() {
      var actions = [
        {
          account: "token.start",
          name: "transfer",
          data: {
            from: this.accountName,
            to: process.env.BALLOT_ADDRESS,
            quantity: this.settings.listing_fee,
            memo: `ballot fee`
          }
        },
        {
          account: process.env.BALLOT_ADDRESS,
          name: "newballot",
          data: {
            owner: this.accountName,
            swap_token: this.swapRatio
          }
        },
        {
          account: process.env.BALLOT_ADDRESS,
          name: "updateballot",
          data: {
            id: this.ballotConfig.last_ballot_id + 1,
            title: this.pool.title,
            avatar: this.pool.avatar,
            tag_line: this.pool.tag_line,
            description: this.pool.description,
            base_token: this.BaseTokenToChain,
            swap_ratio: this.swapRatio,
            soft_cap: this.$toChainString(
              this.pool.soft_cap,
              this.selected_base_token.decimals,
              this.selected_base_token.sym
            ),
            hard_cap: this.$toChainString(
              this.pool.hard_cap,
              this.selected_base_token.decimals,
              this.selected_base_token.sym
            ),
            minimum_swap: this.$toChainString(
              this.pool.minimum_swap,
              this.selected_base_token.decimals,
              this.selected_base_token.sym
            ),
            maximum_swap: this.$toChainString(
              this.pool.maximum_swap,
              this.selected_base_token.decimals,
              this.selected_base_token.sym
            ),
            // prettier-ignore
            ballot_close: this.toDateStringUTC(new Date(this.pool.ballot_close)),
            pool_open: this.toDateStringUTC(new Date(this.pool.pool_open)),
            private_end: this.toDateStringUTC(new Date(this.pool.private_end)),
            public_end: this.toDateStringUTC(new Date(this.pool.public_end)),
            whitelist: this.pool.whitelist,
            web_links: this.cleanedWebLinks
          }
        }
      ];
      if (this.vesting) {
        actions.push({
          account: process.env.BALLOT_ADDRESS,
          name: "setlockup",
          data: {
            ballot_id: this.ballotConfig.last_ballot_id + 1,
            token_lockup: this.vesting,
            lockup_fraction: this.lockup_fraction,
            lockup_period: this.lockup_period
          }
        });
      } else {
        actions.push({
          account: process.env.BALLOT_ADDRESS,
          name: "setlockup",
          data: {
            ballot_id: this.ballotConfig.last_ballot_id + 1,
            token_lockup: this.vesting,
            lockup_fraction: 0,
            lockup_period: 0
          }
        });
      }
      const transaction = await this.$store.$api.signTransaction(actions);
    },

    async fundPool() {
      const actions = [
        {
          account: this.pool.swap_ratio.contract,
          name: "transfer",
          data: {
            from: this.accountName,
            to: process.env.BALLOT_ADDRESS,
            quantity: this.$toChainString(
              this.pool.swap_ratio.quantity * this.pool.hard_cap,
              this.token_decimals,
              this.token_symbol
            ),
            memo: `fund ballot:${this.poolID}`
          }
        }
      ];
      const transaction = await this.$store.$api.signTransaction(actions);
    },

    async closePool(send_tokens) {
      const actions = [
        {
          account: process.env.BALLOT_ADDRESS,
          name: "closeballot",
          data: {
            id: this.poolID
          }
        }
      ];
      const transaction = await this.$store.$api.signTransaction(actions);
    },

    async onUpdate() {
      this.pool.ballot_close = this.ballot_close.date;
      this.pool.pool_open = this.pool_open.date;
      this.pool.private_end = this.private_end.date;
      this.pool.public_end = this.public_end.date;
      if (this.accept !== true || !this.isAuthenticated) {
        this.$q.notify({
          color: "red-5",
          textColor: "white",
          icon: "warning",
          message: "You need to accept the terms and conditions first"
        });
      } else {
        this.checkLinks();
        this.formatWhitelist();
        try {
          if (await this.$refs.updateForm.validate()) {
            await this.updateBallot();
            this.$q.notify({
              color: "green-4",
              textColor: "white",
              icon: "cloud_done",
              message: "Updated"
            });
            this.redirectBallotPage();
          }
        } catch (error) {
          this.$errorNotification(error);
        }
      }
    },

    async onSubmit() {
      this.pool.ballot_close = this.ballot_close.date;
      this.pool.pool_open = this.pool_open.date;
      this.pool.private_end = this.private_end.date;
      this.pool.public_end = this.public_end.date;
      if (this.accept !== true || !this.isAuthenticated) {
        this.$q.notify({
          color: "red-5",
          textColor: "white",
          icon: "warning",
          message: "You need to accept the terms and conditions first"
        });
      } else {
        this.checkLinks();
        this.formatWhitelist();
        try {
          // if not owned pool create ballot
          if (this.accountName != this.pool.owner) {
            await this.createBallot();
            this.poolID = this.ballotConfig.last_ballot_id + 1;
          }
          this.$q.notify({
            color: "green-4",
            textColor: "white",
            icon: "cloud_done",
            message: "Updated"
          });
          this.redirectBallotPage();
        } catch (error) {
          this.$errorNotification(error);
        }
      }
    },

    async onPublish() {
      if (this.accept !== true) {
        this.$q.notify({
          color: "red-5",
          textColor: "white",
          icon: "warning",
          message: "You need to accept the terms and conditions first"
        });
      } else {
        try {
          if (await this.$refs.updateForm.validate()) {
            await this.publishPool();
            this.$q.notify({
              color: "green-4",
              textColor: "white",
              icon: "cloud_done",
              message: "Published"
            });
            this.redirectBallotPage();
          }
        } catch (error) {
          this.$errorNotification(error);
        }
      }
    },

    async onFund() {
      if (this.accept !== true) {
        this.$q.notify({
          color: "red-5",
          textColor: "white",
          icon: "warning",
          message: "You need to accept the terms and conditions first"
        });
      } else {
        try {
          if (await this.$refs.updateForm.validate()) {
            await this.fundPool();
            this.$q.notify({
              color: "green-4",
              textColor: "white",
              icon: "cloud_done",
              message: "Funded"
            });
            this.redirectBallotPage();
          }
        } catch (error) {
          this.$errorNotification(error);
        }
      }
    },

    async tryClosePool(send_tokens) {
      try {
        await this.closePool(send_tokens);
        this.$q.notify({
          color: "green-4",
          textColor: "white",
          icon: "cloud_done",
          message: "Voting completed"
        });
        this.redirectBallotPage();
      } catch (error) {
        this.$errorNotification(error);
      }
    },

    async onClosePool() {
      // this.dialog_close_ballot = true;
      await this.tryClosePool(false);
    },

    onBallotCancel() {
      this.dialog_cancel_ballot = true;
    },

    async tryBallotCancel() {
      try {
        await this.cancelBallot();
        this.$q.notify({
          color: "green-4",
          textColor: "white",
          icon: "cloud_done",
          message: "Ballot Cancelled"
        });
        this.redirectBallotPage();
      } catch (error) {
        this.$errorNotification(error);
      }
    },

    async cancelBallot() {
      const actions = [
        {
          account: process.env.BALLOT_ADDRESS,
          name: "cancelballot",
          data: {
            id: this.poolID
          }
        }
      ];
      const transaction = await this.$store.$api.signTransaction(actions);
    },

    onReset() {},

    // TODO do better redirects
    redirectBallotPage() {
      this.$router.push({
        name: "voting"
      });
    }
  },

  async mounted() {
    // check if updating or new pool
    if (this.$route.params.id === undefined) {
      this.explainProcessDialog = true;
    }

    this.settings = await this.getPoolsSettings();
    this.ballotConfig = await this.getBallotConfig();

    if (this.poolID) {
      await this.getChainBallotByIDChain({
        id: this.poolID,
        chain: this.currentChain.NETWORK_NAME
      });
      this.getPoolInfo();
    }
    await this.setBaseTokenOptions();

    // check if already funded
    this.funded = await this.ifBallotFunded({
      account: this.accountName,
      id: this.poolID,
      chain: this.currentChain.NETWORK_NAME
    });
  },

  watch: {
    async accountName() {
      if (this.poolID) {
        await this.getChainBallotByIDChain({
          id: this.poolID,
          chain: this.currentChain.NETWORK_NAME
        });
        this.getPoolInfo();
      }

      // check if already funded
      this.funded = await this.ifBallotFunded({
        account: this.accountName,
        id: this.poolID,
        chain: this.currentChain.NETWORK_NAME
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.header-bg {
  height: 200px;
  margin-bottom: -50px;
}
.weblink-container {
  display: grid;
  align-items: stretch;
  grid-template-rows: min-content;
  grid-column-gap: 10px;
  grid-row-gap: 3px;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
}
@media only screen and (max-width: 650px) {
  .q-card {
    padding-left: 10px;
    padding-right: 10px;
  }
}
</style>
