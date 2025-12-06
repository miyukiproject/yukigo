<template>
  <div style="margin: 20px 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; display: flex; gap: 15px; align-items: center; flex-wrap: wrap;">
    <strong style="color: white; font-size: 16px;">Select a language:</strong>
    <select v-model="selectedLanguage" style="padding: 8px 12px; border-radius: 4px; border: 2px solid white; font-size: 14px; font-weight: 500; cursor: pointer; background: white; color: #333;">
      <option value="haskell">Haskell</option>
      <option value="prolog">Prolog</option>
      <option value="wollok">Wollok</option>
    </select>
  </div>

  <div style="margin: 20px 0;">
    <p><strong>Install command:</strong></p>
    <div style="background: #f5f5f5; padding: 10px; border-radius: 4px; font-family: monospace; overflow-x: auto;">
      npm install yukigo yukigo-{{ selectedLanguage }}-parser
    </div>
  </div>

  <div style="margin: 20px 0;">
    <p><strong>Example code:</strong></p>
    <div style="background: #1e1e1e; color: #d4d4d4; padding: 15px; border-radius: 4px; font-family: monospace; overflow-x: auto;">
      <div style="color: #ce9178;">{{ current.import }}</div>
      <div style="color: #ce9178;">import { Analyzer } from "yukigo";</div>
      <div style="margin-top: 10px;"></div>
      <div style="color: #ce9178;">const code = `{{ current.code }}`;</div>
      <div style="color: #ce9178;">const parser = {{ current.parser }};</div>
      <div style="color: #ce9178;">const ast = parser.parse(code);</div>
      <div style="margin-top: 10px;"></div>
      <div style="color: #ce9178;">const analyzer = new Analyzer(ast);</div>
      <div style="margin-top: 10px;"></div>
      <div style="color: #ce9178;">const expectations = [</div>
      <div style="margin-left: 20px; color: #ce9178;">...</div>
      <div style="color: #ce9178;">];</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const selectedLanguage = ref('haskell')

const examples = {
  haskell: {
    name: 'Haskell',
    code: 'double x = x * 2',
    parser: 'new YukigoHaskellParser()',
    import: 'import { YukigoHaskellParser } from "yukigo-haskell-parser";'
  },
  prolog: {
    name: 'Prolog',
    code: 'parent(tom, bob).\\nparent(tom, liz).',
    parser: 'new YukigoPrologParser()',
    import: 'import { YukigoPrologParser } from "yukigo-prolog-parser";'
  },
  wollok: {
    name: 'Wollok',
    code: 'method double(x) = x * 2',
    parser: 'new YukigoWollokParser()',
    import: 'import { YukigoWollokParser } from "yukigo-wollok-parser";'
  }
}

const current = computed(() => examples[selectedLanguage.value])
</script>
