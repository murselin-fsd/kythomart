const fs = require('fs');

// 1. Update server.js with upload route
let server = fs.readFileSync('server.js', 'utf8');
if (!server.includes('/api/upload-image')) {
  const uploadCode = `
const multer = require('multer');
const uploadStorage = multer.diskStorage({
  destination: './public/uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname.replace(/\\s+/g, '_'));
  }
});
const upload = multer({ storage: uploadStorage });

app.post('/api/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  res.json({ success: true, url: '/uploads/' + req.file.filename });
});
`;
  server = server.replace('const app = express();', 'const app = express();\n' + uploadCode);
  fs.writeFileSync('server.js', server);
  console.log('server.js updated with image upload route!');
} else {
  console.log('Upload route already exists in server.js');
}

// 2. Update admin.html with file input and logic
let html = fs.readFileSync('public/admin.html', 'utf8');
const targetButton = '<button type="button" onclick="addNewProduct()"';
const fileInputHtml = `
  <div style="grid-column: span 2; margin-bottom: 10px;">
    <label style="display: block; font-size: 12px; font-weight: bold; color: #475569; margin-bottom: 4px;">Product Image File:</label>
    <input type="file" id="new-prod-file" accept="image/*" class="border rounded-xl p-2 text-sm w-full bg-white" />
  </div>
`;

if (html.includes(targetButton) && !html.includes('new-prod-file')) {
  html = html.replace(targetButton, fileInputHtml + '\n' + targetButton);
}

const oldFunc = 'async function addNewProduct() {';
const newFunc = `async function addNewProduct() {
  const fileInput = document.getElementById('new-prod-file');
  let imageUrl = '';

  if (fileInput && fileInput.files[0]) {
    const formData = new FormData();
    formData.append('image', fileInput.files[0]);
    try {
      const uploadRes = await fetch('/api/upload-image', { method: 'POST', body: formData });
      const uploadData = await uploadRes.json();
      if (uploadData.success) {
        imageUrl = uploadData.url;
      }
    } catch (err) {
      console.error('Image upload failed', err);
    }
  }
`;

if (html.includes(oldFunc) && !html.includes('new-prod-file')) {
  html = html.replace(oldFunc, newFunc);
  html = html.replace(
    /price:\s*document\.getElementById\('new-prod-price'\)\.value\.trim\(\),/,
    "price: document.getElementById('new-prod-price').value.trim(), image: imageUrl || 'https://via.placeholder.com/300',"
  );
}

fs.writeFileSync('public/admin.html', html);
console.log('admin.html updated successfully with image upload field and logic!');
