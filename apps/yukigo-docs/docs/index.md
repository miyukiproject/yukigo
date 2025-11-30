---
title: Yukigo
titleTemplate: Universal code analysis made easy

layout: home
aside: false
editLink: false
markdownStyles: false
---

<script setup>
  import Hero from "./components/Hero.vue"
  import CodePlayground from "./components/CodePlayground.vue"
</script>

<main class="flex flex-col gap-16 px-48">
  <Hero />
  <CodePlayground initial-code="doble x = x * 2" />
</main>
