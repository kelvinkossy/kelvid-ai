const fs = require('fs');
const base = 'C:\\Users\\user\\AppData\\Local\\Temp\\kilo\\text-to-video';
const token = process.env.GH_PAT || '';
const files = ['Dockerfile', 'fly.toml', '.gitignore', 'next.config.ts', 'package-lock.json', 'postcss.config.mjs', 'tsconfig.json', 'package.json'];

async function upload(filename) {
  const content = fs.readFileSync(base + '\\' + filename, 'base64');
  const r = await fetch('https://api.github.com/repos/kelvinkossy/vidforge/contents/' + filename, {
    method: 'PUT',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'update ' + filename, content }),
    signal: AbortSignal.timeout(15000)
  });
  const d = await r.json();
  return filename + ': ' + (d.content?.sha ? 'OK' : (d.message?.slice(0,50) || 'unknown'));
}

(async () => {
  for (const f of files) {
    const result = await upload(f).catch(e => f + ': ERR ' + e.message.slice(0,30));
    console.log(result);
  }
  console.log('DONE');
})();
