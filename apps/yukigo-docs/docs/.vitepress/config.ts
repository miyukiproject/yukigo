import { defineConfig } from "vitepress";
import tailwindcss from "@tailwindcss/vite";
import { existsSync, readdirSync, readFileSync } from "fs";
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
            link: `ast/${category}/${name}`,
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

export default defineConfig({
  title: "Yukigo",
  base: "/yukigo/",
  description:
    "An universal, multi-paradigm, multi-language static code analyzer & interpreter",
  vite: {
    plugins: [tailwindcss() as any],
  },
  themeConfig: {
    nav: [
      { text: "Home", link: "/" },
      { text: "Docs", link: "/getting-started" },
      { text: "Reference", link: "/ast/README" },
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
          text: "Inspections",
          items: [
            { text: "Generic", link: "/inspections/generic" },
            { text: "Functional", link: "/inspections/functional" },
            { text: "Imperative", link: "/inspections/imperative" },
            { text: "OOP", link: "/inspections/oop" },
            { text: "Logic", link: "/inspections/logic" },
          ],
        },
        {
          text: "Guides",
          items: [
            { text: "Making a Parser", link: "/guides/making-a-parser" },
            {
              text: "Making a Custom Inspection Set",
              link: "/guides/making-inspections",
            },
          ],
        },
        {
          text: "AST Reference",
          items: getAstSidebar(),
        },
      ],
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/miyukiproject/yukigo" },
      { icon: "discord", link: "https://discord.gg/M3hpGEbbum" },
    ],
  },
});
