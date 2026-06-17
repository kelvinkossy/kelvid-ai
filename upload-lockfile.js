// WARNING: Set GH_PAT environment variable before running.
const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\user\\AppData\\Local\\Temp\\kilo\\text-to-video\\package-lock.json', 'base64');
const body = JSON.stringify({ message: 'add package-lock.json', content });

const token = process.env.GH_PAT || '';
fetch('https://api.github.com/repos/kelvinkossy/vidforge/contents/package-lock.json', {
  method: 'PUT',
  headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
  body
})
.then(r => r.json())
.then(d => {
  console.log('RESULT:', JSON.stringify(d).slice(0, 300));
})
.catch(e => console.log('ERR:', e.message));
