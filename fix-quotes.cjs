#!/usr/bin/env node
// Fix ONLY broken string literals - apostrophe between letters inside single-quoted string
// Do NOT touch: code expressions, function calls, JSX props, className values
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

  // Step 1: Fix curly/smart quotes only
  content = content.replace(/[\u2018\u2019]/g, "'")
  content = content.replace(/[\u201c\u201d]/g, '"')

  // Step 2: Fix ONLY single-quoted strings where apostrophe appears between two letters
  // e.g. 'Guarantor's' or 'd'activation' 
  // Algorithm: scan for ' ... [letter]'[letter] ... ' pattern
  let result = ''
  let i = 0
  while (i < content.length) {
    if (content[i] === "'" && (i === 0 || (content[i-1] !== '\\' && content[i-1] !== "'"))) {
      // Peek ahead: is there a letter-apostrophe-letter inside this string?
      let j = i + 1
      let brokenAt = -1
      while (j < content.length && content[j] !== '\n') {
        if (content[j] === "'" && 
            j > i+1 && 
            j+1 < content.length &&
            /[a-zA-Z\u00C0-\u024F]/.test(content[j-1]) && 
            /[a-zA-Z\u00C0-\u024F]/.test(content[j+1])) {
          brokenAt = j
          j++
        } else if (content[j] === "'") {
          break
        } else {
          j++
        }
      }
      // j now points to the closing quote (or newline)
      if (brokenAt >= 0 && j < content.length && content[j] === "'") {
        const inner = content.slice(i+1, j)
        // Only fix if inner has no double quotes (would need escaping)
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

  // Step 3: Fix mismatched: double-quote opens, single-quote closes
  // ONLY in ternary string values: ? "text' : 
  // Very specific pattern to avoid breaking code
  content = content.replace(
    /(\? )"([^"\n]{3,})' (:)/g,
    (m, pre, inner, post) => {
      // Only fix if inner looks like human text (has spaces or accented chars)
      if (/[ \u00C0-\u024F]/.test(inner) && !inner.includes("'")) {
        return pre + '"' + inner + '"' + ' ' + post
      }
      return m
    }
  )

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8')
    console.log('Fixed:', file)
    total++
  }
}
console.log('Done. Fixed ' + total + ' files.')
