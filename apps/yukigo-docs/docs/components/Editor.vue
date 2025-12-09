<template>
  <div class="flex w-full shadow-2xl bg-[#0f1115] border border-white/5 rounded-2xl overflow-hidden font-mono text-sm text-gray-200 h-full" @keydown="onKeyDown">
    <div class="bg-white/5 px-3 py-2 select-none text-right overflow-hidden">
      <div v-for="ln in lineCount" :key="ln" class="text-gray-500 leading-5">{{ ln }}</div>
    </div>

    <div class="relative flex-1">
      <pre class="absolute inset-0 p-3 overflow-auto whitespace-pre" aria-hidden="true" v-html="highlightedCode"></pre>
      <textarea
        ref="textarea"
        v-model="internalValue"
        spellcheck="false"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        class="absolute inset-0 p-3 w-full h-full resize-none bg-transparent text-transparent caret-indigo-300 outline-none whitespace-pre overflow-auto"
        @scroll="syncScroll"
        @input="onInput"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, defineProps } from 'vue'
import Prism from 'prismjs'
import 'prismjs/components/prism-haskell'
import 'prismjs/themes/prism-okaidia.css'


const props = defineProps({
  modelValue: { type: String, default: '' },
  readonly: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue'])
const internalValue = ref(props.modelValue)
const textarea = ref<HTMLTextAreaElement | null>(null)
const gutter = ref<HTMLElement | null>(null)

watch(() => props.modelValue, v => { if (v !== internalValue.value) internalValue.value = v })
watch(internalValue, v => emit('update:modelValue', v))

const lineCount = computed(() => Array.from({ length: Math.max(internalValue.value.split('\n').length, 1) }, (_, i) => i + 1))

const highlightedCode = computed(() => {
  try {
    return Prism.highlight(internalValue.value, Prism.languages.haskell, 'haskell')
  } catch {
    return internalValue.value
  }
})

function onInput() {}
function syncScroll() {
  const ta = textarea.value
  if (!ta) return
  const pre = ta.previousElementSibling as HTMLElement | null
  if (!pre) return
  pre.scrollTop = ta.scrollTop
  pre.scrollLeft = ta.scrollLeft
}

function onKeyDown(e: KeyboardEvent) {
  const ta = textarea.value
  if (!ta || props.readonly) return

  if (e.key === 'Tab') {
    e.preventDefault()
    const start = ta.selectionStart
    const end = ta.selectionEnd
    internalValue.value = internalValue.value.slice(0, start) + '  ' + internalValue.value.slice(end)
    nextTick(() => { ta.selectionStart = ta.selectionEnd = start + 2; syncScroll() })
  }

  if (e.key === 'Enter') {
    const start = ta.selectionStart
    const value = internalValue.value
    const lineStart = value.lastIndexOf('\n', start - 1) + 1
    const indentMatch = value.slice(lineStart, start).match(/^[ \t]+/)
    if (indentMatch) {
      e.preventDefault()
      const indent = indentMatch[0]
      internalValue.value = value.slice(0, start) + '\n' + indent + value.slice(ta.selectionEnd)
      nextTick(() => { ta.selectionStart = ta.selectionEnd = start + 1 + indent.length; syncScroll() })
    }
  }
}

onMounted(() => nextTick(syncScroll))
</script>