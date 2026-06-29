#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

function walk(dir, files = []) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f)
    if (fs.statSync(full).isDirectory()) walk(full, files)
    else if (f.endsWith('.tsx') || f.endsWith('.ts')) files.push(full)
  }
  return files
}

const files = walk('src')
let total = 0

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8')
  const original = content

  // Fix curly/smart quotes
  content = content.replace(/\u2018/g, "'").replace(/\u2019/g, "'")
  content = content.replace(/\u201c/g, '"').replace(/\u201d/g, '"')

  // Fix single-quoted strings containing apostrophe between letters
  let result = ''
  let i = 0
  while (i < content.length) {
    if (content[i] === "'" && (i === 0 || (content[i-1] !== '\\' && content[i-1] !== "'"))) {
      let j = i + 1
      let hasBroken = false
      while (j < content.length && content[j] !== '\n') {
        if (content[j] === "'" && j > i+1 && /[a-zA-ZÀ-ÿ]/.test(content[j-1]) && j+1 < content.length && /[a-zA-ZÀ-ÿ]/.test(content[j+1])) {
          hasBroken = true
          j++
        } else if (content[j] === "'") {
          break
        } else {
          j++
        }
      }
      if (hasBroken && j < content.length && content[j] === "'") {
        const inner = content.slice(i+1, j)
        if (!inner.includes('"')) {
          result += '"' + inner + '"'
          i = j + 1
          continue
        }
      }
    }
    result += content[i]
    i++
  }
  content = result

  // Fix escaped apostrophes in double-quoted strings
  content = content.replace(/"([^"\n]*)\\'/g, (m, p1) => '"' + p1 + "'")

  // Fix mismatched closing quotes in ternaries: "text' : -> "text" :
  content = content.replace(/((?:locale|lang) === '[a-z]+' \? )"([^'"\n]+)'(\s*:)/g, '$1"$2"$3')

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8')
    console.log('Fixed:', file)
    total++
  }
}
console.log(`Done. Fixed ${total} files.`)
