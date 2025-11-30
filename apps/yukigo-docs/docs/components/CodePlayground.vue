<template>
  <div class="flex w-full gap-8 h-64">
    <Editor v-model="code" />

    <div class="w-1/2 h-full">
      <div
        class="h-full flex flex-col bg-[#1e1e1e] rounded-[14px] overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.25)] font-mono">
        <div
          class="h-8 bg-[#2d2d2d] px-[0.6rem] flex items-center gap-[0.4rem] shrink-0">
          <div class="w-3 h-3 rounded-full bg-red-400" />
          <div class="w-3 h-3 rounded-full bg-yellow-400" />
          <div class="w-3 h-3 rounded-full bg-green-400" />
        </div>

        <div
          ref="terminalBodyRef"
          class="flex-1 p-5 text-[#f0f0f0] overflow-y-auto text-[0.92rem] leading-relaxed scroll-smooth">
          <div
            v-for="(line, i) in commandHistory"
            :key="i"
            :class="[
              'my-[0.4rem] whitespace-pre-wrap break-all',
              line.type === 'input' ? 'text-primary' : 'text-gray-300',
            ]">
            {{ line.text }}
          </div>

          <div class="flex items-center mt-2">
            <span class="text-primary mr-2 select-none">$</span>
            <input
              ref="inputRef"
              v-model="currentCommand"
              @keyup.enter="executeCommand"
              @keydown="navigateHistory"
              placeholder="doble 4"
              spellcheck="false"
              autocomplete="off"
              class="bg-transparent border-none text-[#f0f0f0] font-inherit w-full focus:outline-none" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import Editor from "./Editor.vue";
import { YukigoHaskellParser } from "yukigo-haskell-parser";
import { Interpreter } from "yukigo";

const props = defineProps({
  initialCode: {
    type: String,
    default: "doble x = x * 2",
  },
});

const code = ref(props.initialCode);
const commandHistory = ref([
  { type: "output", text: "Yukigo REPL v0.1.0 — Try a command!" },
]);
const currentCommand = ref("");
const historyIndex = ref(-1);

const inputRef = ref(null);
const terminalBodyRef = ref(null);

const parser = new YukigoHaskellParser();
const replParser = new YukigoHaskellParser("");

function scrollToBottom() {
  if (!terminalBodyRef.value) return;

  nextTick(() => {
    terminalBodyRef.value.scrollTo({
      top: terminalBodyRef.value.scrollHeight,
      behavior: "smooth",
    });
  });
}

function getCommandText(historyItem) {
  return historyItem.text.replace(/^\$ /, "");
}

function executeCommand() {
  const commandText = currentCommand.value.trim();
  if (!commandText) return;

  commandHistory.value.push({ type: "input", text: `$ ${commandText}` });

  let output;
  if (commandText === ":help") {
    output = `Commands:\n  parse     → Generate Mulang AST\n  query     → Run structural queries\n  metrics   → Compute complexity`;
  } else {
    try {
      const programAst = parser.parse(code.value);
      const interpreter = new Interpreter(programAst, {
        lazyLoading: true,
        debug: true,
      });
      const expression = replParser.parse(commandText);
      output = interpreter.evaluate(expression[0]);
    } catch (err) {
      output = err.toString();
    }
  }

  commandHistory.value.push({ type: "output", text: output });
  currentCommand.value = "";
  historyIndex.value = -1;

  scrollToBottom();
}

function navigateHistory(event) {
  const inputCommands = commandHistory.value.filter(
    (line) => line.type === "input"
  );
  if (inputCommands.length === 0) return;

  if (event.key === "ArrowUp") {
    event.preventDefault();
    if (historyIndex.value === -1) {
      historyIndex.value = inputCommands.length - 1;
    } else if (historyIndex.value > 0) {
      historyIndex.value--;
    }
    currentCommand.value = getCommandText(inputCommands[historyIndex.value]);
  } else if (event.key === "ArrowDown") {
    event.preventDefault();
    if (historyIndex.value === -1) return;

    if (historyIndex.value < inputCommands.length - 1) {
      historyIndex.value++;
      currentCommand.value = getCommandText(inputCommands[historyIndex.value]);
    } else {
      historyIndex.value = -1;
      currentCommand.value = "";
    }
  }
}

onMounted(() => {
  inputRef.value?.focus();
});
</script>
