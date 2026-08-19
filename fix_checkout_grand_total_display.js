const fs = require("fs");
let html = fs.readFileSync("public/index.html", "utf8");

// Inject a master grand total synchronizer script
const masterTotalSync = `
  <script id="master-grand-total-sync">
    window.updateAllGrandTotals = function() {
      if (!window.cart || !Array.isArray(window.cart)) return 0;
      let total = window.cart.reduce((sum, item) => {
        let p = item.price;
        if (typeof p === 'string') {
          p = parseFloat(p.replace(/[^0-9.]/g, '')) || 0;
        } else {
          p = Number(p) || 0;
        }
        let q = Number(item.quantity || item.qty || 1);
        return sum + (p * q);
      }, 0);

      // If a discount or promo is applied, you can factor it in here if needed
      // Format as currency string
      const formatted = "₹" + total.toFixed(2);

      // Update cart drawer grand total
      const cartTotalEl = document.getElementById("cart-grand-total");
      if (cartTotalEl) cartTotalEl.innerText = formatted;

      // Update checkout modal grand total (checking common element IDs)
      const checkoutTotalEls = document.querySelectorAll("#checkout-grand-total, #grand-total-display, .grand-total-text");
      checkoutTotalEls.forEach(el => {
        el.innerText = formatted;
      });

      // Also search all elements in the checkout modal for ₹0.00 and update them
      const modal = document.getElementById("modal-checkout");
      if (modal) {
        const spans = modal.querySelectorAll("span, div, p");
        spans.forEach(span => {
          if (span.innerText && (span.innerText.includes("₹0.00") || span.innerText.includes("₹0"))) {
            span.innerText = formatted;
          }
        });
      }

      return total;
    };

    // Run automatically whenever cart updates or checkout opens
    document.addEventListener("DOMContentLoaded", () => {
      const originalOpenCheckout = window.openCheckoutModal;
      window.openCheckoutModal = function() {
        window.updateAllGrandTotals();
        if (originalOpenCheckout) originalOpenCheckout();
        // Force update inside modal after open
        setTimeout(window.updateAllGrandTotals, 50);
      };

      // Also hook into updateCartUI
      const originalUpdateCartUI = window.updateCartUI;
      window.updateCartUI = function() {
        if (originalUpdateCartUI) originalUpdateCartUI();
        window.updateAllGrandTotals();
      };
    });
  </script>
`;

if (!html.includes("master-grand-total-sync")) {
  html = html.replace("</body>", masterTotalSync + "\n</body>");
  fs.writeFileSync("public/index.html", html);
  console.log("Master grand total synchronizer successfully applied!");
}
