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

  // 1. Fix curly/smart quotes
  content = content.replace(/[\u2018\u2019]/g, "'")
  content = content.replace(/[\u201c\u201d]/g, '"')

  // 2. Fix single-quoted strings with apostrophe between letters
  // e.g. 'word's more' -> "word's more"
  let result = ''
  let i = 0
  while (i < content.length) {
    if (content[i] === "'" && (i === 0 || (content[i-1] !== '\\' && content[i-1] !== "'"))) {
      let j = i + 1
      let hasBroken = false
      while (j < content.length && content[j] !== '\n') {
        if (content[j] === "'" && j > i+1 && /[a-zA-Z\u00C0-\u024F]/.test(content[j-1]) && j+1 < content.length && /[a-zA-Z\u00C0-\u024F]/.test(content[j+1])) {
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

  // 3. Fix double-quoted strings that close with single quote
  // e.g. "text with d'apostrophe' -> "text with d'apostrophe"
  content = content.replace(/"([^"\n]+)'/g, (match, inner) => {
    // Only fix if inner contains no double quotes and looks like a string value
    if (!inner.includes('"') && inner.length > 3) {
      // Check if this is in a ternary or JSX prop context
      return '"' + inner + '"'
    }
    return match
  })

  // 4. Fix escaped apostrophes in double-quoted strings
  content = content.replace(/"([^"\n]*)\\'/g, '"$1\'')

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8')
    console.log('Fixed:', file)
    total++
  }
}
console.log('Done. Fixed ' + total + ' files.')
