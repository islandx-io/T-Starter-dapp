<template>
  <div>
    <div v-if="pool.web_links !== 'Loading'">
      <li v-for="link in webLinks" :key="link.id">
        <a :href="link.value" target="_blank">
          <q-icon size="16px" :name="iconName(link.key)" class="q-pr-xs" />
          {{ link.key.toUpperCase() }}
        </a>
      </li>
    </div>
    <div v-else>{{ pool.web_links }}</div>
    <p class="q-pt-md">{{ pool.description }}</p>
  </div>
</template>

<script>
export default {
  name: "tab-overview",
  props: {
    pool: {
      required: true
    }
  },
  computed: {
    webLinks() {
      return this.pool.web_links.filter(link => link.value != "");
    }
  },
  methods: {
    iconName(siteName) {
      let result = "";
      if (siteName === "github") {
        result = "fab fa-github";
      } else if (siteName === "medium") {
        result = "fab fa-medium-m";
      } else if (siteName === "telegram") {
        result = "fab fa-telegram-plane";
      } else if (siteName === "twitter") {
        result = "fab fa-twitter";
      } else if (siteName === "website") {
        result = "fas fa-globe";
      } else if (siteName === "whitelist") {
        result = "fas fa-clipboard-list";
      } else if (siteName === "whitepaper") {
        result = "fas fa-scroll";
      }
      return result;
    }
  }
};
</script>

<style lang="scss" scoped>
li {
  display: inline-block;
  margin: 0 3px;
}
a {
  display: flex;
  text-decoration: none;
  color: $primary;
  align-items: stretch;
  padding-right: 12px;
  font-size: 12px;
}
</style>
