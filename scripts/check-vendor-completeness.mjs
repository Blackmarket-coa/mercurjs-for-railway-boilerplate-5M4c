#!/usr/bin/env node

import { readdirSync, readFileSync, existsSync, statSync } from "node:fs"
import { join, extname } from "node:path"

const repoRoot = process.cwd()

const vendorContextPath = join(
  repoRoot,
  "vendor-panel/src/providers/vendor-type-provider/vendor-type-context.tsx"
)
const vendorSrcPath = join(repoRoot, "vendor-panel/src")
const backendModulesPath = join(repoRoot, "backend/src/modules")

function listFilesRecursive(dir) {
  const files = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...listFilesRecursive(full))
    } else {
      files.push(full)
    }
  }
  return files
}

function parseExtensionKeys() {
  const source = readFileSync(vendorContextPath, "utf8")
  const sectionMatch = source.match(/ALL_EXTENSION_OPTIONS:[\s\S]*?=\s*\[(?<body>[\s\S]*?)\]\n/)

  if (!sectionMatch?.groups?.body) {
    throw new Error("Unable to parse ALL_EXTENSION_OPTIONS from vendor-type-context.tsx")
  }

  const keys = [...sectionMatch.groups.body.matchAll(/key:\s*"([^"]+)"/g)].map((m) => m[1])

  if (!keys.length) {
    throw new Error("No extension keys found in ALL_EXTENSION_OPTIONS")
  }

  return keys
}

function countReferencesOutsideContext(keys) {
  const sourceFiles = listFilesRecursive(vendorSrcPath).filter((file) => {
    if (file === vendorContextPath) return false
    const ext = extname(file)
    return ext === ".ts" || ext === ".tsx"
  })

  const fileContents = sourceFiles.map((file) => readFileSync(file, "utf8"))

  const unused = []
  for (const key of keys) {
    const hasReference = fileContents.some((content) => content.includes(key))
    if (!hasReference) {
      unused.push(key)
    }
  }

  return unused
}

function checkBackendModuleScaffold() {
  const missing = []

  for (const entry of readdirSync(backendModulesPath, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue
    }

    const moduleDir = join(backendModulesPath, entry.name)
    const hasIndex = existsSync(join(moduleDir, "index.ts"))
    const hasService = existsSync(join(moduleDir, "service.ts"))

    if (!hasIndex || !hasService) {
      missing.push({
        module: entry.name,
        missing: [!hasIndex ? "index.ts" : null, !hasService ? "service.ts" : null].filter(Boolean),
      })
    }
  }

  return missing
}

function main() {
  if (!existsSync(vendorContextPath)) {
    throw new Error(`Missing vendor context file: ${vendorContextPath}`)
  }

  if (!existsSync(vendorSrcPath) || !statSync(vendorSrcPath).isDirectory()) {
    throw new Error(`Missing vendor src directory: ${vendorSrcPath}`)
  }

  if (!existsSync(backendModulesPath) || !statSync(backendModulesPath).isDirectory()) {
    throw new Error(`Missing backend modules directory: ${backendModulesPath}`)
  }

  const keys = parseExtensionKeys()
  const unusedExtensionKeys = countReferencesOutsideContext(keys)
  const missingModules = checkBackendModuleScaffold()

  console.log("Vendor modules/extensions completeness guard")
  console.log(`- extension keys declared: ${keys.length}`)
  console.log(`- backend module directories checked: ${readdirSync(backendModulesPath, { withFileTypes: true }).filter((d) => d.isDirectory()).length}`)

  let hasError = false

  if (unusedExtensionKeys.length) {
    hasError = true
    console.error("\n❌ Unused extension keys (no references outside vendor-type-context.tsx):")
    for (const key of unusedExtensionKeys) {
      console.error(`  - ${key}`)
    }
  } else {
    console.log("\n✅ All declared extension keys are referenced outside vendor-type-context.tsx")
  }

  if (missingModules.length) {
    hasError = true
    console.error("\n❌ Backend modules missing required scaffold files:")
    for (const item of missingModules) {
      console.error(`  - ${item.module}: missing ${item.missing.join(", ")}`)
    }
  } else {
    console.log("✅ All backend module directories include index.ts and service.ts")
  }

  if (hasError) {
    process.exit(1)
  }

  console.log("\nAll completeness checks passed.")
}

main()
