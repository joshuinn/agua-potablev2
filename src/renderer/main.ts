import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { createRouter, createWebHashHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "HelloWorld",
    component: () => import("./layouts/MainLayout.vue"),
    //component:Dashboard,
    children: [
      {
        path: "/",
        component: () => import("./views/Dashboard.vue"),
      },
      {
        path: "/table",
        component: () => import("./views/Table.vue"),
      },
      {
        path: "/page/:page",
        component: () => import("./components/Page.vue"),
      },
      {
        path: "/exit",
        component: () => import("./components/Exit.vue"),
      },
      {
        path: "/catalog-works",
        component: () => import("./views/Catalog.vue"),
      },
      {
        path: "/pipe-cost",
        component: () => import("./views/PipeCost.vue"),
      },
      {
        path: "/polygon",
        component: () => import("./views/Polygon.vue"),
      },
      {
        path: "/cipu",
        component: () => import("./views/Cipu.vue"),
      },{
        path:"/heating-cost",
        component:()=>import("./views/HeatingCost.vue")
      }
    ],
  },
];
const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

const app = createApp(App);

app.use(router);

app.mount("#app");
