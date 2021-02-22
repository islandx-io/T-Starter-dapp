<template>
<!-- And do not be conformed to this world, but be transformed by the renewing of your mind, that you may prove what is that good and acceptable and perfect will of God. - Romans 12:2 -NKJV -->
  <q-page class=''>
    <title>T-STARTER - Pools</title>
    <section id="page-banner" class="page-banner bg-gradient-layout6 has-animation">

				<div class="container">
					<div class="breadcrumbs-area">
						<h1>Pools</h1>
					</div>
				</div>
			</section>

      <section class="service-wrap-layout1 section-padding-md-equal bg-color-accent2 position-relative" id="tokensale">
				<div class="container">
            <div class="isotope-wrap">
              <div class="isotope-classes-tab isotop-btn-layout1">
                <a href="/pools" class="current nav-item" data-filter=".all">All pools</a>
                <a href="/pools" class="nav-item" data-filter=".featured">Featured pools</a>
                <a href="/pools" class="nav-item" data-filter=".joined">Pools joined </a>
                <a href="/pools" class="nav-item" data-filter=".created">Pools created</a>
                <q-btn class="current nav-item" data-filter=".all" label="All pools" />
                <q-btn class="nav-item" data-filter=".featured" label="Featured pools" />
                <q-btn class="nav-item" data-filter=".joined" label="Pools joined" />
                <q-btn class="nav-item" data-filter=".created" label="Pools created" />
                
              </div>
            </div>

            <div class="row featuredContainer">
               <Poolcard></Poolcard>
               <Poolcard></Poolcard>
               <Poolcard></Poolcard>
               <Poolcard></Poolcard>
            </div>
        </div>
      </section>
   
  </q-page>
</template>

<script>
import Poolcard from 'src/components/Poolcard.vue'
export default {
  components: { Poolcard },
  // name: 'Pools',
}
</script>
