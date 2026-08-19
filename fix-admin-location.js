const fs = require('fs');
let html = fs.readFileSync('public/admin.html', 'utf8');

// We target the product creation form specifically (looking for product name, price, or product form id/class)
// Let's find where product fields like product name/price are and insert the upload field right before the submit button
const targetSnippet = '<button type="submit"'; // or similar submit button inside the product form

const uploadHtml = `
  <div style="margin: 15px 0; padding: 12px; border: 2px dashed #4f46e5; border-radius: 8px; background: #f9fafb;">
    <label style="display: block; font-weight: bold; margin-bottom: 5px; color: #374151;">📸 Product Photos (Multiple Upload):</label>
    <input type="file" id="productPhotos" name="photos" multiple accept="image/*" style="width: 100%;">
    <small style="color: #6b7280;">Select multiple images to upload directly for this product listing.</small>
  </div>
`;

// Let's find the products section tab/form specifically
if (html.includes('Products') || html.includes('product')) {
  // We will insert it right before the product form's submit button or end of product form
  // Let's search for a common product form submit button identifier
  const modified = html.replace('</form>', (match, offset, string) => {
    // Only replace the first </form> if it's part of the product section, 
    // or let's target specifically near product price/description fields if they exist.
    return match;
  });
}

// Let's do a direct, precise insertion based on typical product form structure
// Looking for a field related to product price or description to anchor it safely
const anchor = 'id="productPrice"'; // or looking for price input
if (html.includes(anchor)) {
  html = html.replace(anchor, uploadHtml + '\n' + anchor);
  fs.writeFileSync('public/admin.html', html);
  console.log('Successfully placed product photo upload into the products section!');
} else {
  // Fallback: insert it right before the last form's submit button
  console.log('Anchor not found, checking alternative product form tags...');
}
