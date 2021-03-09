<template>
  <div>
    <div v-if="pool.web_links !== 'Loading'">
      <li v-for="link in pool.web_links" :key="link.id">
        <a :href="link.value">
          <q-icon size="xs" :name="iconName(link.key)" />
          {{ link.key }}</a
        >
      </li>
    </div>
    <div v-else>{{ pool.web_links }}</div>
    <p>{{ pool.description }}</p>
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
  text-decoration: none;
}
</style>
