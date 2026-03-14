<script setup>
import { computed } from 'vue'
import { useData } from 'vitepress'

const { lang } = useData()

const t = {
  'en': {
    tagline: 'An universal, multi-paradigm, multi-language static code analyzer & interpreter',
    getStarted: 'Get Started',
    viewOnGithub: 'View on GitHub',
  },
  'es': {
    tagline: 'Un analizador de código estático e intérprete universal, multiparadigma y multilenguaje',
    getStarted: 'Comenzar',
    viewOnGithub: 'Ver en GitHub',
  },
}

const tr = computed(() => t[lang.value] ?? t['en'])
</script>
<template>
  <div class="flex gap-4 sm:gap-6 lg:gap-8 flex-col w-full mt-10 sm:mt-16 lg:mt-20 justify-center items-center text-center">
    <h1 class="font-bold text-4xl sm:text-5xl lg:text-6xl leading-tight bg-clip-text bg-linear-32 from-primary to-white text-transparent">
      ❄️Yukigo
    </h1>
    <span class="font-medium text-base sm:text-lg lg:text-xl max-w-2xl">
      {{ tr.tagline }}
    </span>
    <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-center mt-4">
      <a class="bg-primary px-4 py-2 rounded-2xl w-full sm:w-auto text-center" :href="'/yukigo/' + lang + '/getting-started/'">
        {{ tr.getStarted }}
      </a>
      <a class="alt text-center w-full sm:w-auto" href="https://github.com/miyukiproject/yukigo" target="_blank">
        {{ tr.viewOnGithub }}
      </a>
    </div>
  </div>
</template>
