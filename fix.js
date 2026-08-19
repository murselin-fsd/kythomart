const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

if (!html.includes('handleUserHeaderClick')) {
  html = html.replace('</body>', '<script>function handleUserHeaderClick() { console.log("User header clicked"); }</script></body>');
}

html = html.replace(/let sym\s*=/g, 'window.sym =').replace(/const sym\s*=/g, 'window.sym =');

fs.writeFileSync('public/index.html', html);
console.log('index.html patched successfully!');
