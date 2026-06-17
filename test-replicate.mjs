const token = process.env.REPLICATE_API_TOKEN || '';
fetch('https://api.replicate.com/v1/predictions', {
  method: 'POST',
  headers: { Authorization: 'Token ' + token, 'Content-Type': 'application/json' },
  body: JSON.stringify({ version: 'stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438', input: { prompt: 'test' } }),
}).then(r => r.json()).then(d => { console.log(d.id ? 'API KEY WORKS' : 'FAIL'); console.log(JSON.stringify(d, null, 2).slice(0, 300)); }).catch(e => console.log('NETWORK ERROR:', e.message));
