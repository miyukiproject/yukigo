import { defineConfig } from "vitepress";
import tailwindcss from "@tailwindcss/vite";
import { existsSync, readdirSync } from "fs";
import path from "path";

const NODES_DIR = path.resolve(__dirname, "../ast");

const CATEGORY_ORDER = [
  "Literals",
  "Expressions",
  "Statements",
  "Patterns",
  "Declarations",
  "Types",
  "Logic",
  "OOP",
  "Operators",
];

function getAstSidebar() {
  const sidebar: any = [];

  CATEGORY_ORDER.forEach((category) => {
    const categoryDir = path.join(NODES_DIR, category);

    if (existsSync(categoryDir)) {
      const files = readdirSync(categoryDir)
        .filter((file) => file.endsWith(".md") && file !== "index.md")
        .map((file) => {
          const name = file.replace(".md", "");
          return {
            text: name,
            link: `/ast/${category}/${name}`,
          };
        });

      if (files.length > 0) {
        sidebar.push({
          text: category,
          collapsed: true,
          items: files.sort((a, b) => a.text.localeCompare(b.text)),
        });
      }
    }
  });

  return sidebar;
}

type Link = { key: string; link: string };
type SidebarDef = { key: string; items: Link[] };

const sidebarDef: SidebarDef[] = [
  {
    key: "introduction",
    items: [
      { key: "gettingStarted", link: "/getting-started" },
      { key: "simpleRepl", link: "/simple-repl" },
    ],
  },
  {
    key: "inspections",
    items: [
      { key: "generic", link: "/inspections/generic" },
      { key: "functional", link: "/inspections/functional" },
      { key: "imperative", link: "/inspections/imperative" },
      { key: "oop", link: "/inspections/oop" },
      { key: "logic", link: "/inspections/logic" },
    ],
  },
  {
    key: "guides",
    items: [
      { key: "makingParser", link: "/guides/making-a-parser" },
      { key: "makingInspections", link: "/guides/making-inspections" },
    ],
  },
  {
    key: "howItWorks",
    items: [
      { key: "interpreter", link: "/how/interpreter/index" },
      { key: "patternMatching", link: "/how/pattern-matching/index" },
    ],
  },
  {
    key: "astReference",
    items: getAstSidebar(),
  },
];

const sidebarTranslations = {
  es: {
    introduction: "Introducción",
    gettingStarted: "Comenzar",
    simpleRepl: "Crear un REPL simple",
    inspections: "Inspecciones",
    generic: "Genérico",
    functional: "Funcional",
    imperative: "Imperativo",
    oop: "POO",
    logic: "Lógica",
    guides: "Guías",
    makingParser: "Crear un parser",
    makingInspections: "Crear inspecciones",
    howItWorks: "¿Cómo funciona?",
    interpreter: "Intérprete",
    patternMatching: "Pattern matching",
    astReference: "Referencia AST",
  },
  en: {
    introduction: "Introduction",
    gettingStarted: "Getting Started",
    simpleRepl: "Making a Simple REPL",
    inspections: "Inspections",
    generic: "Generic",
    functional: "Functional",
    imperative: "Imperative",
    oop: "OOP",
    logic: "Logic",
    guides: "Guides",
    makingParser: "Making a Parser",
    makingInspections: "Making a Custom Inspection Set",
    howItWorks: "How it works?",
    interpreter: "Interpreter",
    patternMatching: "Pattern matching",
    astReference: "AST Reference",
  },
};

type Locale = keyof typeof sidebarTranslations;

function buildSidebar(locale: Locale) {
  const t = sidebarTranslations[locale];
  return {
    "/": sidebarDef.map((section) => ({
      text: t[section.key as keyof typeof t] ?? section.key,
      collapsed: true,
      items: section.items.map((item) =>
        "link" in item
          ? {
              text: t[item.key as keyof typeof t] ?? item.key,
              link: locale + "/" + item.link,
            }
          : item,
      ),
    })),
  };
}

const socialLinks = [
  { icon: "github", link: "https://github.com/miyukiproject/yukigo" },
  { icon: "discord", link: "https://discord.gg/M3hpGEbbum" },
];

export default defineConfig({
  title: "Yukigo",
  base: "/yukigo/",
  description:
    "Un analizador de código estático e intérprete universal, multiparadigma y multilenguaje",
  vite: {
    plugins: [tailwindcss() as any],
  },
  locales: {
    root: {
      label: "Español",
      lang: "es",
      link: "/es/",
      themeConfig: {
        nav: [
          { text: "Inicio", link: "/es/" },
          { text: "Docs", link: "/es/getting-started" },
          { text: "AST", link: "/es/ast/README" },
        ],
        sidebar: buildSidebar("es"),
        socialLinks,
      },
    },
    en: {
      label: "English",
      lang: "en",
      link: "/en/",
      description:
        "An universal, multi-paradigm, multi-language static code analyzer & interpreter",
      themeConfig: {
        nav: [
          { text: "Home", link: "/en/" },
          { text: "Docs", link: "/en/getting-started" },
          { text: "AST", link: "en/ast/README" },
        ],
        sidebar: buildSidebar("en"),
        socialLinks,
      },
    },
  },
});
