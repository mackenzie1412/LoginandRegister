# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).


# 项目运行

1. 安装依赖

```bash
yarn install
```

前端
```bash
yarn add vue@3 vue-router@4 axios @vitejs/plugin-vue
```

后端
```bash
yarn add express mysql2 bcrypt jsonwebtoken dotenv
```



2. 运行初始化管理员

```bash
node backend/init-admin.js
```


3. 运行后端

```bash
node backend/server.js
```


4. 运行项目

```bash
yarn dev
```