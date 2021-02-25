const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [{ path: "", component: () => import("pages/Index.vue") }]
  },
  {
    path: "/account/:accountName",
    component: () => import("layouts/MainLayout.vue"),
    children: [{ path: "", component: () => import("pages/Account.vue") }]
  },
  {
    path: "/transfer",
    component: () => import("layouts/MainLayout.vue"),
    children: [{ path: "", component: () => import("pages/Transfer.vue") }]
  },
  {
    path: "/streaming",
    component: () => import("layouts/MainLayout.vue"),
    children: [{ path: "", component: () => import("pages/Streaming.vue") }]
  },
  {
    path: "/pools",
    component: () => import("layouts/MainLayout.vue"),
    children: [{ path: "", component: () => import("pages/Pools.vue") }]
  },
  {
    // TODO decide on how slugs and IDs will be handled
    path: "/pools/:slug-:id",
    component: () => import("layouts/MainLayout.vue"),
    children: [{ path: "", name: 'pooldetails', component: () => import("pages/Pool.vue") },
                { path: "join", name: 'joinpool', component: () => import("pages/Join.vue") }]
  },
  {
    path: "/createpool",
    component: () => import("layouts/MainLayout.vue"),
    children: [{ path: "", component: () => import("pages/CreatePool.vue") }]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "*",
    component: () => import("pages/Error404.vue")
  }
];

export default routes;
