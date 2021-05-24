import Vue from 'vue'
import VueRouter from 'vue-router'

import routes from './routes'

Vue.use(VueRouter)

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default function ({store}/* { store, ssrContext } */) {
  const Router = new VueRouter({
    scrollBehavior: () => ({ x: 0, y: 0 }),
    routes,

    // Leave these as they are and change in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    mode: process.env.VUE_ROUTER_MODE,
    base: process.env.VUE_ROUTER_BASE
  })

  Router.beforeResolve(async (to, from, next) => {
    if (to.params.chain.toUpperCase() === store.getters['blockchains/currentChain'].NETWORK_NAME) {
      next()
    } else {
      await store.dispatch("blockchains/setNewChain", to.params.chain.toUpperCase())
      // await store.dispatch("account/logout")
      // this.$router.go();
      // console.log(next())
      next()
      Router.go()
    }    
  })

  

  return Router
}
