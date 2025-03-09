import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/login",
    name: "login",
    component: () => import("../components/LoginPage.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/",
    name: "home",
    component: () => import("../components/HomeManager.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/team",
    name: "team",
    component: () => import("../components/TeamManager.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/research",
    name: "research",
    component: () => import("../components/ResearchManager.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/treatise",
    name: "treatise",
    component: () => import("../components/TreatiseManager.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/device",
    name: "device",
    component: () => import("../components/DeviceManager.vue"),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫
router.beforeEach(async (to, _from, next) => {
  // 检查路由是否需要认证
  if (to.meta.requiresAuth !== false) {
    // 获取本地存储的token
    const token = localStorage.getItem("token");

    if (!token) {
      // 没有token，重定向到登录页
      next({ name: "login" });
      return;
    }

    // 有token，但需要验证token是否有效
    try {
      const response = await fetch(`/api/validateToken?token=${token}`);
      const data = await response.json();

      if (data.code === 200) {
        // token有效，更新token
        localStorage.setItem("token", data.data);
        next();
      } else {
        // token无效，重定向到登录页
        localStorage.removeItem("token");
        next({ name: "login" });
      }
    } catch (error) {
      console.error("验证token失败:", error);
      next({ name: "login" });
    }
  } else {
    // 不需要认证的路由直接放行
    next();
  }
});

export default router;
