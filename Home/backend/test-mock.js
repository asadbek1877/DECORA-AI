// Quick test script for Mock AI mode
const fs = require('fs');
const path = require('path');
const http = require('http');

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyYzAxM2MxNi0wOWZmLTQzZDYtYTg4ZC0yYTg4ZGNkZDI4ZGUiLCJpYXQiOjE3NzI0NDA1NTYsImV4cCI6MTc3MzA0NTM1Nn0.PNDMbyWX25DsdtNgmP6ieWxoS4H628cVEn1d77kRNDM';

function httpRequest(method, pathStr, body, contentType) {
  return new Promise((resolve, reject) => {
    const headers = { Authorization: `Bearer ${TOKEN}` };
    if (contentType) headers['Content-Type'] = contentType;
    if (body) headers['Content-Length'] = Buffer.byteLength(body);

    const opts = { hostname: 'localhost', port: 4000, path: pathStr, method, headers };
    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', (ch) => (data += ch));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function uploadFile(filePath) {
  return new Promise((resolve, reject) => {
    const boundary = '----FormBoundary' + Date.now();
    const fileData = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);

    const prefix = Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="image"; filename="${fileName}"\r\nContent-Type: image/jpeg\r\n\r\n`
    );
    const suffix = Buffer.from(`\r\n--${boundary}--\r\n`);
    const body = Buffer.concat([prefix, fileData, suffix]);

    const opts = {
      hostname: 'localhost', port: 4000, path: '/api/design/upload', method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length,
      },
    };

    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', (ch) => (data += ch));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log('\n=== TEST: Mock AI Mode ===\n');

  // Step 1: Upload image
  const imgPath = path.join(__dirname, 'uploads', 'processed_13b28565-1d07-47ac-ac35-45a097b30083.jpg');
  console.log('1. Uploading image...');
  const uploadRes = await uploadFile(imgPath);
  console.log(`   Status: ${uploadRes.status}`);
  console.log(`   Response:`, JSON.stringify(uploadRes.body, null, 2));

  if (uploadRes.status !== 200 && uploadRes.status !== 201) {
    console.log('   UPLOAD FAILED, stopping.');
    return;
  }

  const projectId = uploadRes.body?.data?.projectId;
  if (!projectId) {
    console.log('   No projectId in response, stopping.');
    return;
  }

  // Step 2: Generate previews (mock mode)
  console.log(`\n2. Generating previews for project ${projectId}...`);
  const previewBody = JSON.stringify({
    projectId,
    styles: ['minimalism', 'modern', 'scandinavian'],
    roomType: 'living room',
  });

  const startTime = Date.now();
  const previewRes = await httpRequest('POST', '/api/design/generate-preview', previewBody, 'application/json');
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log(`   Status: ${previewRes.status} (took ${elapsed}s)`);
  console.log(`   Response:`, JSON.stringify(previewRes.body, null, 2));

  if (previewRes.status === 200 && previewRes.body?.data?.previews) {
    console.log(`\n   ✅ MOCK MODE WORKS! Got ${previewRes.body.data.previews.length} preview(s)`);
    previewRes.body.data.previews.forEach((p, i) => {
      console.log(`   Preview ${i + 1}: ${p.styleName} → ${p.imageUrl?.substring(0, 80)}...`);
    });
  } else {
    console.log('\n   ❌ Preview generation failed');
  }
}

main().catch(console.error);
