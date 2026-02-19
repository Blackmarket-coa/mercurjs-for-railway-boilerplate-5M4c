#!/usr/bin/env node
import fs from "node:fs"
import path from "node:path"

const ROOT = process.cwd()
const APP_DIR = path.join(ROOT, "src", "app", "[locale]")
const SCAN_DIRS = [
  path.join(ROOT, "src", "app"),
  path.join(ROOT, "src", "components"),
]

const IGNORED_PREFIXES = ["#", "mailto:", "tel:", "http://", "https://", "//"]
const ALLOWED_UNMATCHED = new Set(["/returns"])

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, files)
    else if (/\.(tsx?|jsx?)$/.test(entry.name)) files.push(full)
  }
  return files
}

function routeFromPage(pagePath) {
  const rel = path.relative(APP_DIR, pagePath).replace(/\\/g, "/")
  const dir = rel.replace(/\/page\.tsx$/, "")
  const route = "/" + dir.replace(/\([^/]+\)\//g, "").replace(/^$/, "")
  return route.replace(/\/+/g, "/")
}

const pageFiles = walk(APP_DIR).filter((f) => f.endsWith("/page.tsx"))
const routePatterns = pageFiles.map(routeFromPage)

function isMatch(href) {
  return routePatterns.some((pattern) => {
    const regex = new RegExp(
      "^" +
        pattern
          .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
          .replace(/\\\[[^/]+\\\]/g, "[^/]+") +
        "(?:/)?$"
    )
    return regex.test(href)
  })
}

const bad = []
const hrefRegex = /href\s*=\s*["'`]([^"'`]+)["'`]/g
for (const dir of SCAN_DIRS) {
  for (const file of walk(dir)) {
    const rel = path.relative(ROOT, file)
    const text = fs.readFileSync(file, "utf8")
    for (const match of text.matchAll(hrefRegex)) {
      const href = match[1]
      if (!href.startsWith("/")) continue
      if (IGNORED_PREFIXES.some((p) => href.startsWith(p))) continue
      if (href === "/") continue
      const clean = href.replace(/\?.*$/, "").replace(/#.*$/, "")
      if (/\.[a-zA-Z0-9]+$/.test(clean)) continue
      if (ALLOWED_UNMATCHED.has(clean)) continue
      if (!isMatch(clean)) {
        bad.push(`${rel}: ${href}`)
      }
    }
  }
}

if (bad.length) {
  console.error("Found internal hrefs that do not match known app routes:")
  for (const item of bad) console.error(` - ${item}`)
  process.exit(1)
}

console.log(`Route href validation passed (${routePatterns.length} route patterns).`)
