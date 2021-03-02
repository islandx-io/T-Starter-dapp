<template>
  <ul class="mini text-subtitle2" v-if="mini">
    <li>
      <p>{{ days }}d</p>
    </li>
    <li>
      <p>{{ hours }}h</p>
    </li>
    <li>
      <p>{{ minutes }}m</p>
    </li>
  </ul>
  <ul class="countdown" v-else>
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
  name: "countdown",
  props: {
    deadline: {
      type: Number,
      required: true
    },
    reset: {
      type: Boolean
    },
    mini: {
      type: Boolean
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
    now() {
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
<style lang="scss" scoped>
.countdown {
  padding: 0;
  margin: 0;
}
.countdown li {
  display: inline-block;
  margin: 0 8px;
  text-align: center;
  position: relative;
}
.countdown li p {
  margin: 0;
}
.countdown li:after {
  content: ":";
  position: absolute;
  top: 0;
  right: -13px;
  font-size: 32px;
}
.countdown li:first-of-type {
  margin-left: 0;
}
.countdown li:last-of-type {
  margin-right: 0;
}
.countdown li:last-of-type:after {
  content: "";
}
.countdown .digit {
  font-size: 32px;
  font-weight: 600;
  line-height: 1.4;
  margin-bottom: 0;
}
.countdown .text {
  text-transform: uppercase;
  margin-bottom: 0;
  font-size: 10px;
}

// .mini {
//   color: $accent;
// }
.mini ul {
  padding: 0;
  margin: 0;
}
.mini li p {
  margin: 0;
}
.mini li {
  display: inline-block;
  margin: 0 3px;
}
</style>
