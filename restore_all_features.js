const fs = require("fs");

let html = "";
try {
  html = fs.readFileSync("public/index.html", "utf8");
} catch (e) {
  console.error("Could not read index.html");
  process.exit(1);
}

// Remove any broken or partial profile sections
html = html.replace(/<section id="view-profile"[\s\S]*?<\/section>/g, "");
html = html.replace(/<script id="luxury-profile-script">[\s\S]*?<\/script>/g, "");

// The complete, bulletproof profile dashboard with all 12 tabs and settings
const fullProfileDashboardHTML = `
    <!-- 3. Customer Account Profile & Luxury Dashboard View -->
    <section id="view-profile" class="hidden space-y-8 pb-12">
      <!-- Profile Header Banner -->
      <div class="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 border border-amber-500/30 p-8 rounded-3xl shadow-xl text-white flex flex-col md:flex-row items-center justify-between gap-6">
        <div class="absolute -right-10 -bottom-10 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div class="flex items-center gap-5 relative z-10">
          <div class="w-16 h-16 bg-gradient-to-tr from-amber-500 to-amber-600 text-white rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg border-2 border-amber-400/40" id="prof-avatar-initial">U</div>
          <div>
            <div class="flex items-center gap-2">
              <h2 id="prof-heading" class="font-black text-2xl tracking-tight">My Account</h2>
              <span id="vip-badge-pill" class="hidden px-2.5 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full uppercase tracking-wider">KYTHOMART+ VIP</span>
            </div>
            <p class="text-xs text-slate-300 mt-1" id="prof-subtext"></p>
          </div>
        </div>
        <button type="button" onclick="logoutCustomer()" class="relative z-10 text-xs font-bold border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500 text-rose-300 hover:text-white px-5 py-2.5 rounded-xl transition shadow-sm flex items-center gap-2">
          <span>🚪</span> Log Out
        </button>
      </div>

      <!-- Dashboard Interactive Grid Menu with Clean SVG Icons -->
      <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <button type="button" onclick="switchProfileTab('orders')" id="ptab-orders" class="p-4 bg-white dark:bg-slate-900 border-2 border-amber-500 rounded-2xl text-center shadow-md font-bold text-xs transition flex flex-col items-center justify-center gap-2">
          <svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg> Orders
        </button>
        <button type="button" onclick="switchProfileTab('wishlist')" id="ptab-wishlist" class="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center shadow-sm hover:border-amber-500 transition font-bold text-xs text-slate-700 dark:text-slate-300 flex flex-col items-center justify-center gap-2">
          <svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg> Wishlists
        </button>
        <button type="button" onclick="switchProfileTab('coupons')" id="ptab-coupons" class="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center shadow-sm hover:border-amber-500 transition font-bold text-xs text-slate-700 dark:text-slate-300 flex flex-col items-center justify-center gap-2">
          <svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path></svg> Coupons
        </button>
        <button type="button" onclick="switchProfileTab('cards')" id="ptab-cards" class="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center shadow-sm hover:border-amber-500 transition font-bold text-xs text-slate-700 dark:text-slate-300 flex flex-col items-center justify-center gap-2">
          <svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg> Cards & Gift
        </button>
        <button type="button" onclick="switchProfileTab('addresses')" id="ptab-addresses" class="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center shadow-sm hover:border-amber-500 transition font-bold text-xs text-slate-700 dark:text-slate-300 flex flex-col items-center justify-center gap-2">
          <svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg> Addresses
        </button>
        <button type="button" onclick="switchProfileTab('recent')" id="ptab-recent" class="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center shadow-sm hover:border-amber-500 transition font-bold text-xs text-slate-700 dark:text-slate-300 flex flex-col items-center justify-center gap-2">
          <svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg> History
        </button>
        <button type="button" onclick="switchProfileTab('plus')" id="ptab-plus" class="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center shadow-sm hover:border-amber-500 transition font-bold text-xs text-slate-700 dark:text-slate-300 flex flex-col items-center justify-center gap-2">
          <svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg> KythoMart+
        </button>
        <button type="button" onclick="switchProfileTab('devices')" id="ptab-devices" class="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center shadow-sm hover:border-amber-500 transition font-bold text-xs text-slate-700 dark:text-slate-300 flex flex-col items-center justify-center gap-2">
          <svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg> Devices
        </button>
        <button type="button" onclick="switchProfileTab('languages')" id="ptab-languages" class="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center shadow-sm hover:border-amber-500 transition font-bold text-xs text-slate-700 dark:text-slate-300 flex flex-col items-center justify-center gap-2">
          <svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Languages
        </button>
        <button type="button" onclick="switchProfileTab('notifications')" id="ptab-notifications" class="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center shadow-sm hover:border-amber-500 transition font-bold text-xs text-slate-700 dark:text-slate-300 flex flex-col items-center justify-center gap-2">
          <svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg> Alerts
        </button>
        <button type="button" onclick="switchProfileTab('privacy')" id="ptab-privacy" class="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center shadow-sm hover:border-amber-500 transition font-bold text-xs text-slate-700 dark:text-slate-300 flex flex-col items-center justify-center gap-2">
          <svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg> Privacy
        </button>
        <button type="button" onclick="switchProfileTab('settings')" id="ptab-settings" class="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center shadow-sm hover:border-amber-500 transition font-bold text-xs text-slate-700 dark:text-slate-300 flex flex-col items-center justify-center gap-2">
          <svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg> Profile
        </button>
      </div>

      <!-- Main Dynamic Content Panel -->
      <div class="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl transition-colors duration-300">
        <!-- 1. Orders Panel with Real-time Cancel Support -->
        <div id="pcontent-orders" class="profile-tab-content space-y-6">
          <div class="flex justify-between items-center border-b dark:border-slate-800 pb-3">
            <h3 class="text-lg font-black text-slate-800 dark:text-white">My Past Purchases & Deliveries 🧾</h3>
            <span class="text-xs text-slate-400 font-semibold">Real-time cancellation enabled</span>
          </div>
          <div id="user-past-orders" class="space-y-4"></div>
        </div>

        <!-- 2. Wishlist Panel -->
        <div id="pcontent-wishlist" class="profile-tab-content space-y-6 hidden">
          <div class="flex justify-between items-center border-b dark:border-slate-800 pb-3">
            <h3 class="text-lg font-black text-slate-800 dark:text-white">Saved Favorites ❤️</h3>
          </div>
          <div id="profile-wishlist-grid" class="grid grid-cols-1 sm:grid-cols-2 gap-4"></div>
        </div>

        <!-- 3. Coupons Panel -->
        <div id="pcontent-coupons" class="profile-tab-content space-y-6 hidden">
          <div class="border-b dark:border-slate-800 pb-3">
            <h3 class="text-lg font-black text-slate-800 dark:text-white">Available Active Store Coupons 🎟️</h3>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="p-5 bg-gradient-to-br from-amber-50 to-amber-100/60 dark:from-amber-950/40 dark:to-slate-900 border border-amber-200 dark:border-amber-900 rounded-2xl space-y-2 shadow-sm">
              <div class="flex justify-between items-center font-mono font-black text-amber-700 dark:text-amber-300">
                <span class="text-sm">WELCOME10</span>
                <span class="text-xs bg-amber-600 text-white px-2.5 py-1 rounded-lg">10% OFF</span>
              </div>
              <p class="text-xs text-slate-600 dark:text-slate-300">Valid on your first store order with zero minimum requirement.</p>
            </div>
          </div>
        </div>

        <!-- 4. Saved Cards Panel -->
        <div id="pcontent-cards" class="profile-tab-content space-y-6 hidden">
          <div class="flex justify-between items-center border-b dark:border-slate-800 pb-3">
            <h3 class="text-lg font-black text-slate-800 dark:text-white">Saved Cards & Gift Vouchers 💳</h3>
          </div>
          <div class="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl shadow-md space-y-4 border border-indigo-500/30">
            <div class="flex justify-between items-center">
              <span class="font-mono text-xs text-amber-400 font-bold">VISA · Debit</span>
              <span class="text-xs opacity-75">Expires 12/28</span>
            </div>
            <div class="font-mono tracking-widest text-sm">•••• •••• •••• 4892</div>
          </div>
        </div>

        <!-- 5. Saved Addresses Panel -->
        <div id="pcontent-addresses" class="profile-tab-content space-y-6 hidden">
          <div class="flex justify-between items-center border-b dark:border-slate-800 pb-3">
            <h3 class="text-lg font-black text-slate-800 dark:text-white">Saved Delivery Addresses 📍</h3>
          </div>
          <div class="p-5 border-2 border-amber-600/40 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl space-y-2 relative">
            <span class="absolute top-4 right-4 bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Primary</span>
            <p class="font-bold text-sm" id="addr-card-name">Akash</p>
            <p class="text-xs text-slate-600 dark:text-slate-300" id="addr-card-address">Bengaluru, Karnataka</p>
            <p class="text-xs text-slate-500 font-mono" id="addr-card-phone">+91 7899985086</p>
          </div>
        </div>

        <!-- 6. Recently Viewed Panel -->
        <div id="pcontent-recent" class="profile-tab-content space-y-6 hidden">
          <div class="flex justify-between items-center border-b dark:border-slate-800 pb-3">
            <h3 class="text-lg font-black text-slate-800 dark:text-white">Recently Viewed Products 👀</h3>
          </div>
          <div id="profile-recent-grid" class="grid grid-cols-1 sm:grid-cols-2 gap-4"></div>
        </div>

        <!-- 7. KythoMart+ VIP Panel -->
        <div id="pcontent-plus" class="profile-tab-content space-y-6 hidden">
          <div class="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white p-8 rounded-3xl shadow-xl space-y-4">
            <div class="inline-block bg-white/20 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-widest border border-white/30">VIP Pass Elite</div>
            <h3 class="text-3xl font-black">KythoMart+ Membership ⭐</h3>
            <p class="text-sm text-amber-100 max-w-xl">Enjoy unlimited free express shipping, priority 24/7 dedicated support, and 2x reward points on all store items.</p>
          </div>
        </div>

        <!-- 8. Manage Devices Panel -->
        <div id="pcontent-devices" class="profile-tab-content space-y-6 hidden">
          <div class="flex justify-between items-center border-b dark:border-slate-800 pb-3">
            <h3 class="text-lg font-black text-slate-800 dark:text-white">Connected Devices & Active Sessions 💻</h3>
          </div>
          <div class="p-4 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl flex justify-between items-center">
            <div>
              <p class="font-bold text-sm">MacBook Air · Chrome Browser</p>
              <p class="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">Current Session · Bengaluru, India</p>
            </div>
            <span class="px-3 py-1 bg-emerald-100 text-emerald-700 font-bold rounded-xl text-xs">Active Now</span>
          </div>
        </div>

        <!-- 9. Languages Panel -->
        <div id="pcontent-languages" class="profile-tab-content space-y-6 hidden">
          <div class="flex justify-between items-center border-b dark:border-slate-800 pb-3">
            <h3 class="text-lg font-black text-slate-800 dark:text-white">Select Preferred Language 🌐</h3>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button type="button" class="p-4 border-2 border-amber-600 bg-amber-50 dark:bg-amber-950/40 rounded-2xl font-bold text-sm text-center">English (Default)</button>
            <button type="button" class="p-4 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-sm text-center">हिन्दी (Hindi)</button>
          </div>
        </div>

        <!-- 10. Notification Settings Panel -->
        <div id="pcontent-notifications" class="profile-tab-content space-y-6 hidden">
          <div class="flex justify-between items-center border-b dark:border-slate-800 pb-3">
            <h3 class="text-lg font-black text-slate-800 dark:text-white">Notification & Alert Preferences 🔔</h3>
          </div>
          <label class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border dark:border-slate-700 cursor-pointer">
            <span class="text-sm font-bold">WhatsApp Order Status & Delivery Updates</span>
            <input type="checkbox" checked class="w-5 h-5 accent-amber-600 rounded" />
          </label>
        </div>

        <!-- 11. Privacy Center Panel -->
        <div id="pcontent-privacy" class="profile-tab-content space-y-6 hidden">
          <div class="flex justify-between items-center border-b dark:border-slate-800 pb-3">
            <h3 class="text-lg font-black text-slate-800 dark:text-white">Privacy Center & Data Control 🛡️</h3>
          </div>
          <button type="button" onclick="alert('Data archive requested.')" class="bg-slate-900 text-white px-4 py-2 rounded-xl font-bold text-xs">Request Data Archive</button>
        </div>

        <!-- 12. Account Settings & Edit Profile Panel -->
        <div id="pcontent-settings" class="profile-tab-content space-y-6 hidden">
          <div class="flex justify-between items-center border-b dark:border-slate-800 pb-3">
            <h3 class="text-lg font-black text-slate-800 dark:text-white">Edit Profile & Account Settings ⚙️</h3>
          </div>
          <div class="space-y-4 max-w-lg">
            <div>
              <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Full Name</label>
              <input type="text" id="prof-name" placeholder="Full Name" class="w-full border dark:border-slate-700 bg-transparent rounded-xl p-3 text-sm text-slate-900 dark:text-slate-100" />
            </div>
            <div>
              <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Phone Number</label>
              <input type="tel" id="prof-phone" placeholder="Phone Number" class="w-full border dark:border-slate-700 bg-transparent rounded-xl p-3 text-sm text-slate-900 dark:text-slate-100" />
            </div>
            <div>
              <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Delivery Street Address</label>
              <textarea id="prof-address" placeholder="Delivery Street Address" class="w-full border dark:border-slate-700 bg-transparent rounded-xl p-3 text-sm text-slate-900 dark:text-slate-100"></textarea>
            </div>
            <button type="button" onclick="saveUserProfile()" class="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl text-xs font-extrabold transition shadow-md">Save Profile Updates</button>
          </div>
        </div>
      </div>

      <!-- Feedback & Information Section -->
      <div class="bg-gradient-to-br from-slate-900 to-slate-950 text-white p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6">
        <div class="flex justify-between items-center border-b border-slate-800 pb-5">
          <h3 class="text-lg font-black tracking-tight">Feedback & Store Information 💡</h3>
          <span class="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold rounded-full">v3.4.2</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div class="space-y-3">
            <textarea id="user-feedback-text" placeholder="Tell us how we can do better..." class="w-full border border-slate-700 bg-slate-900 rounded-2xl p-4 text-xs text-slate-100 h-28 resize-none"></textarea>
            <button type="button" onclick="submitUserFeedback()" class="bg-amber-600 hover:bg-amber-700 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs transition shadow-md">Send Feedback ➔</button>
          </div>
          <div class="space-y-2 text-xs text-slate-300 bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
            <p><strong>KythoMart Storefront</strong></p>
            <p class="text-slate-400">Outer Ring Road, Bengaluru, Karnataka 560103, India.</p>
          </div>
        </div>
      </div>
    </section>

    <script id="luxury-profile-script">
      function switchProfileTab(tabName) {
        const tabs = ["orders", "wishlist", "coupons", "cards", "addresses", "recent", "plus", "devices", "languages", "notifications", "privacy", "settings"];
        tabs.forEach(t => {
          const btn = document.getElementById("ptab-" + t);
          const content = document.getElementById("pcontent-" + t);
          if (btn) {
            btn.className = (t === tabName) 
              ? "p-4 bg-white dark:bg-slate-900 border-2 border-amber-500 rounded-2xl text-center shadow-md font-bold text-xs transition flex flex-col items-center justify-center gap-2"
              : "p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center shadow-sm hover:border-amber-500 transition font-bold text-xs text-slate-700 dark:text-slate-300 flex flex-col items-center justify-center gap-2";
          }
          if (content) {
            content.classList.toggle("hidden", t !== tabName);
          }
        });
        if (tabName === "wishlist" && typeof renderProfileWishlist === "function") renderProfileWishlist();
        if (tabName === "recent" && typeof renderProfileRecent === "function") renderProfileRecent();
        if (tabName === "orders") renderUserOrders();
      }

      window.renderUserOrders = async function() {
        try {
          const res = await fetch("/api/orders");
          const orders = await res.json();
          const container = document.getElementById("user-past-orders");
          if (!container) return;

          if (orders.length === 0) {
            container.innerHTML = "<p class='text-xs text-slate-400 py-4 text-center'>No past orders found.</p>";
            return;
          }

          container.innerHTML = orders.map(function(o) {
            var statusBg = o.status === "Cancelled" ? "bg-rose-100 text-rose-700" : o.status === "Delivered" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700";
            var actionBtn = (o.status !== "Cancelled" && o.status !== "Delivered") 
              ? "<button type='button' onclick='cancelCustomerOrder(\\"" + o.id + "\\")' class='bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-xl transition shadow-sm'>Cancel Order</button>"
              : "<span class='text-slate-400 font-semibold'>" + o.status + "</span>";

            return "<div class='p-5 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs mb-3'>" +
              "<div class='space-y-1'>" +
                "<div class='flex items-center gap-2'>" +
                  "<span class='font-black text-slate-900 dark:text-white'>" + o.id + "</span>" +
                  "<span class='px-2.5 py-0.5 rounded-full font-bold " + statusBg + "'>" + o.status + "</span>" +
                "</div>" +
                "<p class='text-slate-600 dark:text-slate-300'>" + (o.items || "Store Item") + "</p>" +
                "<p class='font-mono text-slate-500'>Total: ₹" + o.total + " · " + o.date + "</p>" +
              "</div>" +
              "<div>" + actionBtn + "</div>" +
            "</div>";
          }).join("");
        } catch (e) {
          console.error("Error loading user orders", e);
        }
      };

      window.cancelCustomerOrder = async function(orderId) {
        if (!confirm("Are you sure you want to cancel order " + orderId + "?")) return;
        try {
          const res = await fetch("/api/orders/cancel", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId })
          });
          const data = await res.json();
          if (res.ok && data.success) {
            alert(data.message);
            renderUserOrders();
          } else {
            alert(data.error || "Failed to cancel order.");
          }
        } catch (err) {
          alert("Network error. Please try again.");
        }
      };

      async function submitUserFeedback() {
        const text = document.getElementById("user-feedback-text").value.trim();
        if (!text) {
          alert("Please write your feedback message first.");
          return;
        }
        try {
          const res = await fetch("/api/feedback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: (typeof currentUser !== "undefined" && currentUser) ? currentUser.name : "Customer",
              email: (typeof currentUser !== "undefined" && currentUser) ? currentUser.email : "No email",
              message: text
            })
          });
          const data = await res.json();
          if (res.ok && data.success) {
            alert("Thank you! Your feedback has been sent successfully.");
            document.getElementById("user-feedback-text").value = "";
          } else {
            alert(data.error || "Failed to submit feedback.");
          }
        } catch (err) {
          alert("Network error. Please try again.");
        }
      }

      window.addEventListener("DOMContentLoaded", () => {
        renderUserOrders();
      });
    </script>
`;

if (html.includes("</main>")) {
  html = html.replace("</main>", fullProfileDashboardHTML + "\n</main>");
} else if (html.includes("</body>")) {
  html = html.replace("</body>", fullProfileDashboardHTML + "\n</body>");
} else {
  html += fullProfileDashboardHTML;
}

fs.writeFileSync("public/index.html", html);
console.log("All 12 account settings tabs, luxury profile dashboard, and feedback features successfully restored!");
