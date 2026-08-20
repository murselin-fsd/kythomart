const fs = require("fs");
if (fs.existsSync("public/index.html")) {
  let html = fs.readFileSync("public/index.html", "utf8");

  // Remove any old tracking modals or duplicate scripts to keep it clean
  html = html.replace(/<div id="orderTrackingModal"[\s\S]*?<\/script>/g, "");

  const modalAndScript = `
<!-- Live Order Tracking & WhatsApp Notification Modal -->
<div id="orderTrackingModal" class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center hidden">
  <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl max-w-lg w-full shadow-2xl border dark:border-slate-800">
    <div class="flex justify-between items-center mb-4">
      <h3 class="font-bold text-lg text-slate-900 dark:text-slate-100">📦 Live Order Tracking</h3>
      <button onclick="closeOrderTracker()" class="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
    </div>
    <div id="tracker-content" class="space-y-4">
      <!-- Dynamic Timeline injected here -->
    </div>
    <div class="mt-6 flex justify-end">
      <button onclick="closeOrderTracker()" class="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 rounded-xl font-bold text-sm">Close</button>
    </div>
  </div>
</div>

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
      }
    })
    .catch(err => {
      console.error("Tracker error:", err);
      alert("Could not load tracking data.");
    });
};

function closeOrderTracker() {
  const modal = document.getElementById('orderTrackingModal');
  if (modal) modal.classList.add('hidden');
}
</script>
`;

  html = html.replace("</body>", modalAndScript + "\n</body>");
  fs.writeFileSync("public/index.html", html, "utf8");
  console.log("Successfully added order tracking modal and script to DOM!");
}
