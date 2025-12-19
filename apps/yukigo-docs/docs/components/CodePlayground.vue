<template>
  <div class="flex flex-col w-full gap-4">
    <!-- Parser Selector -->
    <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
      <!-- Desktop: Buttons -->
      <div class="hidden sm:flex gap-3">
        <button
          v-for="lang in languages"
          :key="lang.value"
          @click="switchLanguage(lang.value)"
          :class="[
            'px-4 py-2 rounded-full font-semibold transition-all duration-200 border backdrop-blur',
            selectedLanguage === lang.value
              ? 'bg-gradient-to-r from-primary to-purple-500 text-white border-transparent shadow-[0_8px_24px_rgba(59,130,246,0.35)] scale-[1.02]'
              : 'bg-white/10 text-gray-200 border-white/15 hover:bg-white/15 hover:border-white/25 hover:shadow-[0_6px_18px_rgba(0,0,0,0.25)]'
          ]">
          {{ lang.label }}
        </button>
      </div>
      
      <!-- Mobile: Select -->
      <select 
        v-model="selectedLanguage"
        @change="switchLanguage(selectedLanguage)"
        class="sm:hidden px-4 py-2 rounded-full border border-white/20 bg-[#16181d]/80 text-gray-100 font-semibold cursor-pointer focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50 backdrop-blur">
        <option v-for="lang in languages" :key="lang.value" :value="lang.value">
          {{ lang.label }}
        </option>
      </select>
    </div>

    <!-- Editor and Terminal -->
    <div class="flex flex-col lg:flex-row w-full gap-4 lg:gap-8">
      <div class="w-full lg:w-1/2 h-80 sm:h-96 lg:h-80">
        <Editor v-model="code" />
      </div>
      
      <div class="w-full lg:w-1/2 h-80 sm:h-96 lg:h-80">
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
              :placeholder="currentPlaceholder"
              spellcheck="false"
              autocomplete="off"
              class="bg-transparent border-none text-[#f0f0f0] font-inherit w-full focus:outline-none" />
          </div>
        </div>
      </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import Editor from "./Editor.vue";
import { YukigoHaskellParser } from "yukigo-haskell-parser";
import { YukigoPrologParser } from "yukigo-prolog-parser";
import { YukigoWollokParser } from "yukigo-wollok-parser";

import { Interpreter } from "yukigo";

const props = defineProps({
  initialCode: {
    type: String,
    default: "doble x = x * 2",
  },
});

// Language configuration
const languages = [
  { value: "haskell", label: "Haskell" },
  { value: "prolog", label: "Prolog" },
  { value: "wollok", label: "Wollok" },
];

const languageExamples = {
  haskell: {
    code: "doble x = x * 2",
    parser: new YukigoHaskellParser(),
    placeholder: "doble 4",
  },
  prolog: {
    code: "padre(tom, bob).\npadre(tom, liz).\nabuelo(X, Y) :- padre(X, Z), padre(Z, Y).",
    parser: new YukigoPrologParser(),
    placeholder: "padre(tom, X)",
  },
  wollok: {
    code: `object pepita {
  var energy = 100
  method fly(meters) {
    energy = energy - meters
  }
  method energy() = energy
}`,
    parser: new YukigoWollokParser(),
    placeholder: "pepita.energy()",
  },
};

const selectedLanguage = ref("haskell");
const code = ref(props.initialCode);
const commandHistory = ref([
  { type: "output", text: "Yukigo REPL v0.1.0 — Try a command!" },
]);
const currentCommand = ref("");
const historyIndex = ref(-1);

const inputRef = ref(null);
const terminalBodyRef = ref(null);

let parser = new YukigoHaskellParser();

const currentPlaceholder = computed(() => {
  return languageExamples[selectedLanguage.value]?.placeholder || "doble 4";
});

const currentPlaceholder = computed(() => {
  return languageExamples[selectedLanguage.value]?.placeholder || "doble 4";
});

function switchLanguage(lang) {
  selectedLanguage.value = lang;
  const example = languageExamples[lang];
  parser = example.parser;
  code.value = example.code;
  commandHistory.value = [
    { type: "output", text: `Yukigo REPL v0.1.0 — ${lang.charAt(0).toUpperCase() + lang.slice(1)} loaded` },
  ];
  currentCommand.value = "";
  historyIndex.value = -1;
}

function formatOutput(value) {
  if (value === null || value === undefined) return "nil";
  if (typeof value === "boolean") return value ? "True" : "False";
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return `"${value}"`;
  if (typeof value === "function") return "<function>";
  if (value instanceof Map) {
    // Formatear objetos Wollok (que se almacenan como Maps)
    const attrs = [];
    for (const [key, val] of value.entries()) {
      if (!key.startsWith("__method_")) {
        attrs.push(`${key} = ${formatOutput(val)}`);
      }
    }
    return attrs.length > 0 ? `{ ${attrs.join(", ")} }` : "<object>";
  }
  if (Array.isArray(value)) {
    return "[" + value.map(formatOutput).join(", ") + "]";
  }
  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
}

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
      const expression = parser.parseExpression(commandText);
      console.log(expression)
      const result = interpreter.evaluate(expression);
      output = formatOutput(result);
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
