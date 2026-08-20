const fs = require("fs");
if (fs.existsSync("public/index.html")) {
  let html = fs.readFileSync("public/index.html", "utf8");

  // Force attach openOrderTracker to window so any button can call it securely
  const globalFnFix = `
<script>
window.openOrderTracker = function(orderId) {
  fetch('/api/my-orders?email=' + encodeURIComponent(currentUser ? currentUser.email : ''))
    .then(res => res.json())
    .then(orders => {
      const order = orders.find(o => String(o.id || o.orderId) === String(orderId));
      if (!order) {
        alert("Order details not found for ID: " + orderId);
        return;
      }

      const theId = order.id || order.orderId || orderId;
      const status = order.status || "Pending";
      const timeline = order.timeline || { placed: "Recent" };

      const steps = ["Pending", "Packed", "Dispatched", "Out for Delivery", "Delivered"];
      const currentIndex = steps.indexOf(status) === -1 ? 0 : steps.indexOf(status);

      let stepsHtml = steps.map((step, idx) => {
        const isDone = idx <= currentIndex;
        return \`
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs \${isDone ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}">
              \${isDone ? '✓' : idx + 1}
            </div>
            <div>
              <p class="font-bold text-sm text-slate-800 dark:text-slate-200">\${step}</p>
              <p class="text-xs text-slate-400">\${idx === 0 ? (timeline.placed || 'Recorded') : idx === 1 ? (timeline.packed || 'Pending') : idx === 2 ? (timeline.dispatched || 'Pending') : idx === 3 ? (timeline.outForDelivery || 'Pending') : (timeline.delivered || 'Pending')}</p>
            </div>
          </div>
        \`;
      }).join('');

      const whatsappText = encodeURIComponent("Hello, I want an update on my order #" + theId + " which is currently " + status + ".");
      const whatsappLink = "https://wa.me/?text=" + whatsappText;

      const trackerContent = document.getElementById('tracker-content');
      if (trackerContent) {
        trackerContent.innerHTML = \`
          <div class="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl mb-4">
            <p class="text-xs text-slate-500 font-bold">Order ID: #\${theId}</p>
            <p class="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">Status: <span class="text-amber-600">\${status}</span></p>
          </div>
          <div class="space-y-4 my-4">
            \${stepsHtml}
          </div>
          <div class="pt-4 border-t dark:border-slate-800 flex justify-between items-center">
            <a href="\${whatsappLink}" target="_blank" class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
              💬 Track via WhatsApp
            </a>
            <span class="text-xs text-slate-400">Instant Support</span>
          </div>
        \`;
      }

      const modal = document.getElementById('orderTrackingModal');
      if (modal) {
        modal.classList.remove('hidden');
      } else {
        alert("Modal element missing from DOM.");
      }
    })
    .catch(err => {
      console.error("Tracker error:", err);
      alert("Could not load tracking data.");
    });
};
</script>
`;

  // Append or replace the global function script before </body>
  html = html.replace("</body>", globalFnFix + "\n</body>");
  fs.writeFileSync("public/index.html", html, "utf8");
  console.log("Successfully bound window.openOrderTracker globally!");
}
