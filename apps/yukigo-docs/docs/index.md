---
title: Yukigo
titleTemplate: Universal code analysis made easy

layout: home
aside: false
editLink: false
markdownStyles: false
---

<script setup>
import Editor from "./components/Editor.vue"
import { YukigoHaskellParser } from "yukigo-haskell-parser"
import { ref, onMounted } from 'vue'

import { Interpreter } from "yukigo"

const commandHistory = ref([
  { type: 'output', text: 'Yukigo REPL v0.1.0 — Try a command!' }
])
const currentCommand = ref('')
const inputRef = ref(null)
const historyIndex = ref(-1)

const code = ref('doble x = x * 2')

const parser = new YukigoHaskellParser()
const repl = new YukigoHaskellParser("")

function getCommandText(historyItem) {
  return historyItem.text.replace(/^\$ /, '')
}

function executeCommand() {
  const ast = parser.parse(code.value)
  const interpreter = new Interpreter(ast, { lazyLoading: true, debug: true })

  if (!currentCommand.value.trim()) return

  commandHistory.value.push({ type: 'input', text: `$ ${currentCommand.value}` })
  let output
  if(currentCommand.value == ':help') {
    output = `Commands:\n  parse     → Generate Mulang AST\n  query     → Run structural queries\n  metrics   → Compute complexity`
  } else {
    const expression = repl.parse(currentCommand.value)
    try {
      output = interpreter.evaluate(expression[0])
    } catch (err) {
      output = err.toString();
    }
    
  }



  commandHistory.value.push({ type: 'output', text: output })
  currentCommand.value = ''
  historyIndex.value = -1

  setTimeout(() => {
    const body = document.querySelector('.terminal-body')
    if (body) body.scrollTop = body.scrollHeight
  }, 10)
}

function navigateHistory(event) {
  const inputCommands = commandHistory.value.filter(line => line.type === 'input')
  
  if (event.key === 'ArrowUp') {
    event.preventDefault()
    if (inputCommands.length === 0) return
    
    if (historyIndex.value === -1) {
      historyIndex.value = inputCommands.length - 1
    } else if (historyIndex.value > 0) {
      historyIndex.value--
    }
    
    currentCommand.value = getCommandText(inputCommands[historyIndex.value])
  } else if (event.key === 'ArrowDown') {
    event.preventDefault()
    if (historyIndex.value === -1) return
    
    if (historyIndex.value < inputCommands.length - 1) {
      historyIndex.value++
      currentCommand.value = getCommandText(inputCommands[historyIndex.value])
    } else {
      historyIndex.value = -1
      currentCommand.value = ''
    }
  }
}

onMounted(() => {
  inputRef.value?.focus()
})
</script>

<style scoped>

.terminal-container {
  flex: 1;
  min-width: 300px;
  max-width: "50%";
}

.terminal {
  background: #1e1e1e;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0,0,0,0.25);
  font-family: var(--vp-font-family-mono);
}

.terminal-header {
  background: #2d2d2d;
  padding: 0.6rem 1rem;
  display: flex;
  gap: 0.6rem;
}
.terminal-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}
.dot-red { background: #ff5f56; }
.dot-yellow { background: #ffbd2e; }
.dot-green { background: #27c93f; }

.terminal-body {
  padding: 1.2rem;
  color: #f0f0f0;
  overflow-y: auto;
  font-size: 0.92rem;
  line-height: 1.5;
}

.history-line {
  margin: 0.4rem 0;
}
.history-line.input {
  color: #5d83ff;
}
.history-line.output {
  color: #d1d5db;
  /* white-space: pre-wrap; */
}

.terminal-input {
  display: flex;
  align-items: center;
  margin-top: 0.5rem;
}
.terminal-prompt {
  color: #5d83ff;
  margin-right: 0.5rem;
  user-select: none;
}
.terminal-input input {
  background: transparent;
  border: none;
  color: #f0f0f0;
  font-family: inherit;
  font-size: inherit;
  width: 100%;
  outline: none;
}
</style>
<main class="flex flex-col gap-16 px-48">
  <div class="flex gap-8 flex-col w-full mt-20 justify-center items-center">
    <h1 class="font-bold text-6xl leading-18 bg-clip-text bg-linear-32 from-primary to-white text-transparent">❄️Yukigo</h1>
    <span class="font-medium text-xl">An universal, multi-paradigm, multi-language static code analyzer & interpreter</span>
    <div class="flex gap-4 items-center">
      <a class="bg-primary px-4 py-2 rounded-2xl" href="/getting-started/">Get Started</a>
      <a class="alt" href="https://github.com/noiseArch/yukigo" target="_blank">View on GitHub</a>
    </div>
  </div>
  <div class="flex w-full gap-8 h-64">
    <Editor v-model="code" />
    <div class="w-1/2 h-full">
      <div class="terminal h-full pb-4">
        <div class="h-6 flex w-full px-[0.6rem] items-center gap-1 bg-[#2d2d2d]">
          <div class="h-1/2 aspect-square bg-red-500 rounded-full" />
          <div class="h-1/2 aspect-square bg-yellow-500 rounded-full" />
          <div class="h-1/2 aspect-square bg-green-500 rounded-full" />
        </div>
        <div class="terminal-body h-full">
          <div v-for="(line, i) in commandHistory" :key="i" :class="`history-line ${line.type}`">
            {{ line.text }}
          </div>
          <div class="terminal-input">
            <span class="terminal-prompt">$</span>
            <input
              ref="inputRef"
              v-model="currentCommand"
              @keyup.enter="executeCommand"
              @keydown="navigateHistory"
              placeholder="doble 4"
              spellcheck="false"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</main>
