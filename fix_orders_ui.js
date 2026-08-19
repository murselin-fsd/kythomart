const fs = require("fs");
let html = fs.readFileSync("public/index.html", "utf8");

// Replace the renderUserOrders script to safely handle different order object property names
const updatedOrderScript = `
      window.renderUserOrders = async function() {
        try {
          const res = await fetch("/api/orders");
          const orders = await res.json();
          const container = document.getElementById("user-past-orders");
          if (!container) return;

          if (!orders || orders.length === 0) {
            container.innerHTML = "<p class='text-xs text-slate-400 py-4 text-center'>No past orders found.</p>";
            return;
          }

          container.innerHTML = orders.map(function(o, index) {
            var orderId = o.id || o.orderId || ("ORD-" + (100000 + index));
            var status = o.status || "Processing";
            var statusBg = status === "Cancelled" ? "bg-rose-100 text-rose-700" : status === "Delivered" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700";
            
            // Format items safely whether it's a string, array, or object
            var itemsText = "Store Item";
            if (typeof o.items === "string") {
              itemsText = o.items;
            } else if (Array.isArray(o.items)) {
              itemsText = o.items.map(i => (i.name || i.title || "Item") + " (x" + (i.qty || 1) + ")").join(", ");
            } else if (o.items && typeof o.items === "object") {
              itemsText = o.items.name || o.items.title || JSON.stringify(o.items);
            } else if (o.productName) {
              itemsText = o.productName;
            }

            var totalAmount = o.total || o.amount || o.price || "0.00";
            var orderDate = o.date || o.createdAt || "Today";

            var actionBtn = (status !== "Cancelled" && status !== "Delivered") 
              ? "<button type='button' onclick='cancelCustomerOrder(\\"" + orderId + "\\")' class='bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-xl transition shadow-sm'>Cancel Order</button>"
              : "<span class='text-slate-400 font-semibold'>" + status + "</span>";

            return "<div class='p-5 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs mb-3'>" +
              "<div class='space-y-1'>" +
                "<div class='flex items-center gap-2'>" +
                  "<span class='font-black text-slate-900 dark:text-white'>" + orderId + "</span>" +
                  "<span class='px-2.5 py-0.5 rounded-full font-bold " + statusBg + "'>" + status + "</span>" +
                "</div>" +
                "<p class='text-slate-600 dark:text-slate-300'>" + itemsText + "</p>" +
                "<p class='font-mono text-slate-500'>Total: ₹" + totalAmount + " · " + orderDate + "</p>" +
              "</div>" +
              "<div>" + actionBtn + "</div>" +
            "</div>";
          }).join("");
        } catch (e) {
          console.error("Error loading user orders", e);
        }
      };
`;

// Replace old renderUserOrders definition in index.html
html = html.replace(/window\.renderUserOrders\s*=\s*async function\(\)\s*\{[\s\S]*?\};/g, updatedOrderScript);
fs.writeFileSync("public/index.html", html);
console.log("Orders UI rendering fixed successfully!");
