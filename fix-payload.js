const fs = require('fs');
let html = fs.readFileSync('public/admin.html', 'utf8');

if (html.includes('imageUrl')) {
  html = html.replace(/image\s*:\s*[^,\}]+/, "image: imageUrl || 'https://via.placeholder.com/300'");
  fs.writeFileSync('public/admin.html', html);
  console.log('Updated payload to correctly use uploaded imageUrl!');
} else {
  console.log('imageUrl variable not found in script.');
}
