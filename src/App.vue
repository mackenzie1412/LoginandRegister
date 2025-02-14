<template>
  <router-view/>
</template>

<style>
body {
  background: url('./assets/Frieren.png') no-repeat center fixed;
  background-size: cover;
  margin: 0;
  min-height: 100vh;
  overflow: hidden;
}

.login-box {
    background: rgba(255, 255, 255, 0.8);
    padding: 2rem;
    border-radius: 10px;
    width: 80%;
    max-width: 300px;
    margin: 100px auto;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
    animation: fadeIn 0.5s ease-out;
    text-align: center;
}
</style>