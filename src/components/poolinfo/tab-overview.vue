<template>
  <div>
    <div>
      {{title}}
    </div> 
    <div>
      <li v-for="(link, key) in web_links" :key="link.id">
        <a :href="link">{{key}}</a>
      </li>
    </div>
    <div>{{long_description}}</div>

  </div>  
</template>

<script>
export default {
  name: 'tab-overview',
  props: {
    poolObject: {
      required: true,
    },
  },
  data () {
    return {
      title: this.poolObject.title,
      web_links: this.poolObject.web_links,
      long_description: this.poolObject.long_description
    }
  }
}
</script>
