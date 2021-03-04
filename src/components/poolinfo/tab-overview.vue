<template>
  <div>
    <div>
      {{title}}
    </div> 
    <div>
      <li v-for="(link) in web_links" :key="link.id">
        <a :href="link.value">{{link.key}}</a>
      </li>
    </div>
    <div>{{description}}</div>

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
      description: this.poolObject.description
    }
  }
}
</script>
