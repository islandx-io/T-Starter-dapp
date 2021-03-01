<template>
  <ul class="status-countdown">
    <li>
      <!-- <li v-if="days > 0"> -->
      <p class="digit">{{ days | twoDigits }}</p>
      <p class="text">{{ days > 1 ? "days" : "day" }}</p>
    </li>
    <li>
      <p class="digit">{{ hours | twoDigits }}</p>
      <p class="text">{{ hours > 1 ? "hours" : "hour" }}</p>
    </li>
    <li>
      <p class="digit">{{ minutes | twoDigits }}</p>
      <p class="text">min</p>
    </li>
    <li>
      <p class="digit">{{ seconds | twoDigits }}</p>
      <p class="text">Sec</p>
    </li>
  </ul>
</template>

<script>
let interval = null;
export default {
  name: "status-countdown",
  props: {
    deadline: {
      type: Date,
      required: true
    },
    reset: {
      type: Boolean
    }
  },
  data() {
    return {
      now: Math.trunc(new Date().getTime() / 1000), //  Current time (seconds)
      endDate: null, // Deadline (seconds)
      diff: 0 // Time difference (seconds)
    };
  },
  created() {
    if (!this.deadline) {
      throw new Error("Missing prop 'deadline'");
    }
    this.endDate = Math.trunc(this.deadline / 1000);
    if (!this.endDate) {
      throw new Error("Invalid value for the 'deadline' prop");
    }
    interval = setInterval(() => {
      this.now = Math.trunc(new Date().getTime() / 1000);
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
    now() {
      this.diff = this.endDate - this.now;
      if (this.diff <= 0 || this.reset) {
        this.diff = 0;
        clearInterval(interval); // Stop countdown
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
  }
};
</script>
<style>
.status-countdown {
  padding: 0;
  margin: 0;
}
.status-countdown li {
  display: inline-block;
  margin: 0 8px;
  text-align: center;
  position: relative;
}
.status-countdown li p {
  margin: 0;
}
.status-countdown li:after {
  content: ":";
  position: absolute;
  top: 0;
  right: -13px;
  font-size: 32px;
}
.status-countdown li:first-of-type {
  margin-left: 0;
}
.status-countdown li:last-of-type {
  margin-right: 0;
}
.status-countdown li:last-of-type:after {
  content: "";
}
.status-countdown .digit {
  font-size: 32px;
  font-weight: 600;
  line-height: 1.4;
  margin-bottom: 0;
}
.status-countdown .text {
  text-transform: uppercase;
  margin-bottom: 0;
  font-size: 10px;
}
</style>
