const fs = require("fs");

let indexHtml = fs.readFileSync("public/index.html", "utf8");

// Remove any old help center section if it exists
indexHtml = indexHtml.replace(/<section id="view-helpcentre"[\s\S]*?<\/section>/g, "");

const helpCentreSectionHTML = `
    <!-- 4. Help Centre & 24x7 Customer Support View -->
    <section id="view-helpcentre" class="hidden space-y-8 pb-12 max-w-6xl mx-auto px-4">
      <div class="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 p-8 rounded-3xl text-white shadow-xl border border-amber-500/30 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 class="text-2xl font-black tracking-tight flex items-center gap-2">
            <span>🛟</span> KythoMart 24x7 Customer Support Centre
          </h2>
          <p class="text-xs text-slate-300 mt-1">Quick answers, order management, and instant assistance for all your shopping queries.</p>
        </div>
        <button type="button" onclick="switchMainView('storefront')" class="bg-amber-600 hover:bg-amber-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition shadow-md">
          Back to Storefront ➔
        </button>
      </div>

      <!-- Support Categories Grid (Flipkart Style) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Card 1 -->
        <div onclick="openSupportCategory('orders')" class="bg-white dark:bg-slate-900 border dark:border-slate-800 p-6 rounded-3xl shadow-md hover:border-amber-500 cursor-pointer transition space-y-3">
          <div class="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 text-xl font-black">📦</div>
<div>
            <h3 class="font-black text-slate-900 dark:text-white text-base">Manage Your Orders</h3>
            <p class="text-xs text-slate-500 mt-1">View, track, cancel, or return active and past store orders instantly.</p>
          </div>
        </div>

        <!-- Card 2 -->
        <div onclick="openSupportCategory('returns')" class="bg-white dark:bg-slate-900 border dark:border-slate-800 p-6 rounded-3xl shadow-md hover:border-amber-500 cursor-pointer transition space-y-3">
          <div class="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 text-xl font-black">🔄</div>
          <div>
            <h3 class="font-black text-slate-900 dark:text-white text-base">Returns & Refunds</h3>
            <p class="text-xs text-slate-500 mt-1">Check return eligibility, refund timelines, and pickup tracking details.</p>
          </div>
        </div>

        <!-- Card 3 -->
        <div onclick="openSupportCategory('payments')" class="bg-white dark:bg-slate-900 border dark:border-slate-800 p-6 rounded-3xl shadow-md hover:border-amber-500 cursor-pointer transition space-y-3">
          <div class="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 text-xl font-black">💳</div>
          <div>
            <h3 class="font-black text-slate-900 dark:text-white text-base">Payments & UPI Issues</h3>
            <p class="text-xs text-slate-500 mt-1">Resolve failed transactions, COD queries, wallet refunds, and bank offers.</p>
          </div>
        </div>

        <!-- Card 4 -->
        <div onclick="openSupportCategory('plus')" class="bg-white dark:bg-slate-900 border dark:border-slate-800 p-6 rounded-3xl shadow-md hover:border-amber-500 cursor-pointer transition space-y-3">
          <div class="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 text-xl font-black">⭐</div>
          <div>
            <h3 class="font-black text-slate-900 dark:text-white text-base">KythoMart+ VIP Membership</h3>
            <p class="text-xs text-slate-500 mt-1">Learn about free express shipping, priority support, and exclusive member discounts.</p>
          </div>
        </div>

        <!-- Card 5 -->
        <div onclick="openSupportCategory('other')" class="bg-white dark:bg-slate-900 border dark:border-slate-800 p-6 rounded-3xl shadow-md hover:border-amber-500 cursor-pointer transition space-y-3">
          <div class="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 text-xl font-black">❓</div>
          <div>
            <h3 class="font-black text-slate-900 dark:text-white text-base">Other Issues & Queries</h3>
            <p class="text-xs text-slate-500 mt-1">Account login assistance, address updates, and general storefront inquiries.</p>
          </div>
        </div>

        <!-- Card 6 -->
        <div onclick="alert('Connecting you to a live KythoMart Support Assistant via secure chat...')" class="bg-gradient-to-br from-amber-500 to-amber-700 text-white p-6 rounded-3xl shadow-md cursor-pointer transition space-y-3">
          <div class="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white text-xl font-black">💬</div>
          <div>
            <h3 class="font-black text-white text-base">Live Agent Chat 24x7</h3>
            <p class="text-xs text-amber-100 mt-1">Chat live with our customer support executives for instant issue resolution.</p>
          </div>
        </div>
      </div>
    </section>

    <script>
      function openSupportCategory(category) {
        if (category === 'orders' || category === 'returns') {
          if (typeof switchMainView === 'function') {
            switchMainView('profile');
            if (typeof switchProfileTab === 'function') switchProfileTab('orders');
          }
        } else if (category === 'plus') {
          if (typeof switchMainView === 'function') {
            switchMainView('profile');
            if (typeof switchProfileTab === 'function') switchProfileTab('plus');
          }
        } else {
          alert("Support Category Selected: " + category.toUpperCase() + ". Our support team will assist you shortly.");
        }
      }
    </script>
`;

if (indexHtml.includes("</main>")) {
  indexHtml = indexHtml.replace("</main>", helpCentreSectionHTML + "\n</main>");
} else {
  indexHtml += helpCentreSectionHTML;
}

// Update footer "Contact Us" and "Help" links to open the Help Centre view
indexHtml = indexHtml.replace(/href="#"([^>]*?>Contact Us<\/a>)/g, 'href="#help" onclick="switchMainView(\'helpcentre\')"$1');
indexHtml = indexHtml.replace(/href="#"([^>]*?>Help<\/a>)/g, 'href="#help" onclick="switchMainView(\'helpcentre\')"$1');
indexHtml = indexHtml.replace(/href="#"([^>]*?>Help Center<\/a>)/g, 'href="#help" onclick="switchMainView(\'helpcentre\')"$1');

fs.writeFileSync("public/index.html", indexHtml);
console.log("Help Centre and 24x7 support view added successfully!");
