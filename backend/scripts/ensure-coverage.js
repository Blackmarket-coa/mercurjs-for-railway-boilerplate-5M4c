const fs = require("fs")

const summaryPath = "./coverage/coverage-summary.json"
const minLinesCoverage = 5

if (!fs.existsSync(summaryPath)) {
  console.error(`Coverage summary not found at ${summaryPath}`)
  process.exit(1)
}

const summary = JSON.parse(fs.readFileSync(summaryPath, "utf8"))
const linesPct = summary?.total?.lines?.pct

if (typeof linesPct !== "number") {
  console.error("Coverage summary is missing total line coverage")
  process.exit(1)
}

if (linesPct < minLinesCoverage) {
  console.error(`Line coverage ${linesPct}% is below required ${minLinesCoverage}%`)
  process.exit(1)
}

console.log(`Coverage gate passed: ${linesPct}% >= ${minLinesCoverage}%`)
