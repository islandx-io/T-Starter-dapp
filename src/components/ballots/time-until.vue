<template>
  <div>
    <div v-if="days > 1">{{ days }} days</div>
    <div v-else-if="days === 1">{{ days }} day</div>

    <div v-if="hours > 1 && days < 1">{{ hours }} hours</div>
    <div v-else-if="hours === 1 && days < 1">{{ hours }} hour</div>

    <div v-if="minutes >= 1 && hours < 1">{{ minutes }} min</div>

    <div v-if="seconds >= 1 && minutes < 1">{{ seconds }} s</div>

    <div v-if="days <= 0 && hours <= 0 && minutes <= 0 && seconds <= 0">
      Closed
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
let interval = null;
export default {
  name: "time-until",
  props: {
    deadline: {
      type: Number,
      required: true
    },
    reset: {
      type: Boolean
    },
    poolID: {
      type: Number
    }
  },
  data() {
    return {
      now: Math.trunc(Date.now() / 1000), //  Current time (seconds)
      endDate: null, // Deadline (seconds)
      diff: 0 // Time difference (seconds)
    };
  },
  created() {
    interval = setInterval(() => {
      this.now = Math.trunc(Date.now() / 1000);
    }, 1000); // Update the current time every second
  },
  computed: {
    seconds() {
      return Math.trunc(this.diff) % 60;
    },
    minutes() {
      return Math.trunc(this.diff / 60) % 60;
    },
    hours() {
      return Math.trunc(this.diff / 60 / 60) % 24;
    },
    days() {
      return Math.trunc(this.diff / 60 / 60 / 24);
    }
  },
  watch: {
    async now() {
      if (!this.deadline) {
        throw new Error("Missing prop 'deadline'");
      }
      this.endDate = Math.trunc(this.deadline / 1000);
      if (!this.endDate) {
        throw new Error("Invalid value for the 'deadline' prop");
      }
      this.diff = this.endDate - this.now;
      if (this.diff <= 0 || this.reset) {
        this.diff = 0;
        clearInterval(interval); // Stop countdown
        // await this.getChainBallotByID(this.poolID); // update status //FIXME reenable me when working
        this.$emit("countdown-finished");
        // console.log("Time finished");
      }
    }
  },
  filters: {
    twoDigits(value) {
      if (value.toString().length <= 1) {
        return "0" + value.toString();
      }
      return value.toString();
    }
  },
  destroyed() {
    clearInterval(interval);
  },
  methods: {
    ...mapActions("ballots", ["getChainBallotByID"])
  }
};
</script>
<style lang="scss" scoped>
// Large
// .c-large {
//   padding: 0;
//   margin: 0;
//   color: $accent;
//   font-weight: 200px;
// }
// .c-large li {
//   display: inline-block;
//   margin: 0 3px;
// }
// .c-large li div {
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   height: 40px;
//   width: 40px;
//   border: 2px solid $accent;
//   border-radius: 50%;
// }
// .c-large li:after {
//   position: absolute;
//   top: 0;
//   right: -13px;
//   font-size: 32px;
// }
// .c-large li:first-of-type {
//   margin-left: 0;
// }
// .c-large li:last-of-type {
//   margin-right: 0;
// }
// .c-large li:last-of-type:after {
//   content: "";
// }
</style>
