import { defineConfig } from "vitepress";
import tailwindcss from "@tailwindcss/vite";
import typedocSidebar from "../ast/typedoc-sidebar.json";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Yukigo",
  base: '/yukigo/',
  description:
    "An universal, multi-paradigm, multi-language static code analyzer & interpreter",
  vite: {
    plugins: [tailwindcss()],
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config

    nav: [
      { text: "Home", link: "/" },
      { text: "Docs", link: "/getting-started" },
      { text: "AST", link: "/ast" },
    ],

    sidebar: {
      "/": [
        {
          text: "Introduction",
          items: [
            { text: "Getting Started", link: "/getting-started" },
            { text: "Making a Simple REPL", link: "/simple-repl" },
          ],
        },
        {
          text: "AST",
          items: [{ text: "Reference", link: "/ast" }],
        },
        {
          text: "Inspections",
          items: [
            { text: "Generic Inspections", link: "/inspections/generic" },
            { text: "Functional Inspections", link: "/inspections/functional" },
            { text: "Imperative Inspections", link: "/inspections/imperative" },
            { text: "OOP Inspections", link: "/inspections/oop" },
            { text: "Logic Inspections", link: "/inspections/logic" },
          ],
        },
        {
          text: "Guides:",
          items: [
            { text: "Making a Yukigo Parser", link: "/making-a-parser" },
            {
              text: "Making a Custom Set of Inspections",
              link: "/api-examples",
            },
          ],
        },
      ],
      "/ast/": [
        {
          text: "AST Reference",
          items: typedocSidebar,
        },
      ],
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/noiseArch/yukigo" },
      { icon: "discord", link: "https://discord.gg/M3hpGEbbum" },
    ],
  },
});
