const routes = [
  {
    path: "/",
    redirect: { name: "home", params: { chain: "telos" } },
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "/:chain",
        name: "home",
        component: () => import("pages/Index.vue")
      }
    ]
  },
  {
    path: "/pools",
    redirect: { name: "home", params: { chain: "telos" } },
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "/:chain",
        name: "home",
        component: () => import("pages/Index.vue")
      }
    ]
  },
  {
    path: "/:chain/temp",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", name: "temp", component: () => import("pages/Temp.vue") }
    ]
  },
  {
    path: "/:chain",
    component: () => import("layouts/MainLayout.vue"),
    children: [{ path: "", component: () => import("pages/Index.vue") }]
  },
  {
    path: "/:chain/wallet/:accountName",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", name: "wallet", component: () => import("pages/Wallet.vue") }
    ]
  },
  {
    path: "/:chain/pools",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", name: "allpools", component: () => import("pages/Pools.vue") }
    ]
  },
  {
    path: "/:chain/pools/:id",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        name: "pooldetails",
        component: () => import("pages/Pool.vue")
      },
      {
        path: "join",
        name: "joinpool",
        component: () => import("pages/Join.vue")
      }
    ]
  },
  {
    path: "/:chain/createpool",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        name: "createpool",
        component: () => import("pages/CreatePool.vue")
      }
    ]
  },
  {
    path: "/:chain/updatepool/:id",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        name: "updatepool",
        component: () => import("pages/UpdatePool.vue")
      }
    ]
  },
  {
    path: "/:chain/receive",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        name: "receive",
        component: () => import("pages/ReceiveTokens.vue")
      }
    ]
  },
  {
    path: "/:chain/send",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        name: "send",
        component: () => import("pages/SendTokens.vue")
      }
    ]
  },
  {
    path: "/:chain/voting",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        name: "voting",
        component: () => import("pages/Voting.vue")
      }
    ]
  },
  {
    path: "/:chain/voting/:id",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        name: "ballotdetails",
        component: () => import("pages/Ballot.vue")
      }
    ]
  },
  {
    path: "/:chain/createballot",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        name: "createballot",
        component: () => import("pages/CreateBallot.vue")
      },
      {
        path: ":id",
        name: "updateballot",
        component: () => import("pages/CreateBallot.vue")
      }
    ]
  },
  // {
  //   path: "/:chain/updateballot/:id",
  //   component: () => import("layouts/MainLayout.vue"),
  //   children: [
  //     {
  //       path: "",
  //       name: "updateballot",
  //       component: () => import("pages/CreateBallot.vue")
  //     },
  //   ]
  // },
  // {
  //   path: "/account/:accountName",
  //   component: () => import("layouts/MainLayout.vue"),
  //   children: [{ path: "", component: () => import("pages/Account.vue") }]
  // },
  // {
  //   path: "/transfer",
  //   component: () => import("layouts/MainLayout.vue"),
  //   children: [{ path: "", component: () => import("pages/Transfer.vue") }]
  // },
  // {
  //   path: "/streaming",
  //   component: () => import("layouts/MainLayout.vue"),
  //   children: [{ path: "", component: () => import("pages/Streaming.vue") }]
  // },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "*",
    component: () => import("pages/Error404.vue")
  }
];

export default routes;
