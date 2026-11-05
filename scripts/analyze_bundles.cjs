const fs = require('fs');
const path = require('path');

function getFiles(dir) {
  let res = [];
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      res = res.concat(getFiles(p));
    } else if (f.endsWith('.ts') || f.endsWith('.tsx')) {
      res.push(p);
    }
  }
  return res;
}

const map = {};
for (const f of getFiles('src')) {
  const c = fs.readFileSync(f, 'utf8');
  const m = c.match(/from\s+['"][^'"]+['"]/g) || [];
  for (const imp of m) {
    const quote = imp.includes('"') ? '"' : "'";
    const parts = imp.split(quote);
    const p = parts[1];
    if (p && !p.startsWith('.') && !p.startsWith('@/')) {
      map[p] = (map[p] || 0) + 1;
    }
  }
}

console.log(JSON.stringify(map, null, 2));
