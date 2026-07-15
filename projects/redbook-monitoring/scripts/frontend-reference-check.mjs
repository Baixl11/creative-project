import fs from "node:fs";

const source = fs.readFileSync(new URL("../assets/app.js", import.meta.url), "utf8");
const declaredFunctions = new Set(
  [...source.matchAll(/\bfunction\s+([A-Za-z_$][\w$]*)\s*\(/g)]
    .map((match) => match[1]),
);
const importedBindings = new Set(
  [...source.matchAll(/import\s*\{([\s\S]*?)\}\s*from/g)]
    .flatMap((match) => match[1].split(","))
    .map((name) => name.trim().split(/\s+as\s+/).at(-1))
    .filter(Boolean),
);
const knownGlobals = new Set([
  "Array",
  "Boolean",
  "Date",
  "Error",
  "FormData",
  "Intl",
  "JSON",
  "Map",
  "Math",
  "Number",
  "Promise",
  "Set",
  "String",
  "URLSearchParams",
  "clearTimeout",
  "fetch",
  "isFinite",
  "parseInt",
  "setTimeout",
]);
const languageKeywords = new Set([
  "async",
  "catch",
  "for",
  "function",
  "if",
  "return",
  "switch",
  "while",
]);

const allowedMethods = new Set([
  "add",
  "addEventListener",
  "all",
  "append",
  "catch",
  "classList",
  "close",
  "closest",
  "contains",
  "createElement",
  "createElementNS",
  "forEach",
  "format",
  "from",
  "get",
  "getAttribute",
  "getBoundingClientRect",
  "getItem",
  "has",
  "includes",
  "join",
  "map",
  "match",
  "matches",
  "max",
  "min",
  "querySelector",
  "querySelectorAll",
  "reduce",
  "remove",
  "removeAttribute",
  "replace",
  "replaceAll",
  "replaceChildren",
  "set",
  "setAttribute",
  "setItem",
  "setProperty",
  "slice",
  "some",
  "sort",
  "split",
  "startsWith",
  "stringify",
  "test",
  "then",
  "toggle",
  "trim",
]);

const suspicious = [];
for (const match of source.matchAll(/\b([A-Za-z_$][\w$]*)\s*\(/g)) {
  const name = match[1];
  const before = source.slice(Math.max(0, match.index - 12), match.index);
  if (
    declaredFunctions.has(name)
    || importedBindings.has(name)
    || knownGlobals.has(name)
    || languageKeywords.has(name)
    || allowedMethods.has(name)
    || /\bfunction\s+$/.test(before)
    || /[.\w$]\s*$/.test(before)
  ) {
    continue;
  }

  suspicious.push(name);
}

if (suspicious.length) {
  throw new Error(`发现可能未定义的前端函数调用：${[...new Set(suspicious)].sort().join(", ")}`);
}

console.log(JSON.stringify({
  ok: true,
  checkedFunctions: declaredFunctions.size,
  checkedImports: importedBindings.size,
}, null, 2));
