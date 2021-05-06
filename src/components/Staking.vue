<template>
  <q-dialog ref="dialog" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <div class="row">
        <div class="col">
          <!-- START balance  -->
          START Balance {{}}

          <!-- Stake input -->
          <q-input outlined v-model="amountStake">
            <template v-slot:append>
              <q-btn
                class="col-shrink"
                label="Max"
                @click="setStakeMax"
                color="positive"
                outline
              />
            </template>
          </q-input>

          <q-btn color="primary" label="Stake" @click="tryStake()" />
        </div>

        <div class="col">
          <!-- Staked amount -->
          Staked START Balance {{}}

          <!-- Unstake input -->
          <q-input outlined v-model="amountUnstake">
            <template v-slot:append>
              <q-btn
                class="col-shrink"
                label="Max"
                @click="setUnstakeMax"
                color="positive"
                outline
              />
            </template>
          </q-input>

          <q-btn color="primary" label="Unstake" @click="tryUnstake()" />
        </div>
      </div>

      <!-- buttons example -->
      <!-- <q-card-actions align="right">
        <q-btn color="primary" label="OK" @click="onOKClick" />
        <q-btn color="primary" label="Cancel" @click="onCancelClick" />
      </q-card-actions> -->
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  props: {
    // ...your custom props
  },
  data() {
    return {
      amountStake: 0,
      amountUnstake: 0
    };
  },

  computed: {},

  methods: {
    // following method is REQUIRED
    // (don't change its name --> "show")
    show() {
      this.$refs.dialog.show();
    },

    // following method is REQUIRED
    // (don't change its name --> "hide")
    hide() {
      this.$refs.dialog.hide();
    },

    onDialogHide() {
      // required to be emitted
      // when QDialog emits "hide" event
      this.$emit("hide");
    },

    onOKClick() {
      // on OK, it is REQUIRED to
      // emit "ok" event (with optional payload)
      // before hiding the QDialog
      this.$emit("ok");
      // or with payload: this.$emit('ok', { ... })

      // then hiding dialog
      this.hide();
    },

    onCancelClick() {
      // we just need to hide dialog
      this.hide();
    },

    setStakeMax() {
      console.log("Stake max")
    },

    setUnstakeMax() {
      console.log("UnStake max")
    },

    tryStake() {
      console.log("Try stake")
    },

    tryUnstake() {
      console.log("Try unstake")
    },


  },

  mounted() {}
};
</script>
