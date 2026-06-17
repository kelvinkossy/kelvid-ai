// WARNING: Set GH_PAT environment variable before running.
// This script uses the GitHub Contents API to upload files.
const fs = require('fs');
const path = 'C:\\Users\\user\\AppData\\Local\\Temp\\kilo\\text-to-video';
const files = ['Dockerfile', 'fly.toml', '.gitignore', 'next.config.ts', 'package-lock.json'];
const token = process.env.GH_PAT || '';

async function uploadFile(filename) {
  const content = fs.readFileSync(path + '\\' + filename, 'base64');
  const body = JSON.stringify({ message: 'update ' + filename, content });
  try {
    const r = await fetch('https://api.github.com/repos/kelvinkossy/vidforge/contents/' + filename, {
      method: 'PUT',
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
      body
    });
    const d = await r.json();
    console.log(filename + ': ' + (d.content?.sha ? 'OK' : d.message?.slice(0, 50) || JSON.stringify(d).slice(0, 60)));
  } catch(e) {
    console.log(filename + ': BLOCKED - ' + e.message.slice(0, 40));
  }
}

(async () => {
  for (const f of files) await uploadFile(f);
  console.log('done');
})();
