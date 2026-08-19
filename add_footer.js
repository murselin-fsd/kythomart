const fs = require("fs");

let indexHtml = fs.readFileSync("public/index.html", "utf8");

// Remove any duplicate or old footers if present
indexHtml = indexHtml.replace(/<!-- Professional Enterprise Footer -->[\s\S]*?<\/footer>/g, "");

const professionalFooterHTML = `
  <!-- Professional Enterprise Footer -->
  <footer class="bg-[#172337] text-white text-xs mt-16 pt-12 pb-8 border-t border-slate-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Main Footer Links Grid -->
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 pb-12 border-b border-slate-700/60">
        <!-- ABOUT -->
        <div class="space-y-3">
          <p class="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">About</p>
          <ul class="space-y-2 text-slate-300">
            <li><a href="#" class="hover:underline">Contact Us</a></li>
            <li><a href="#" class="hover:underline">About Us</a></li>
            <li><a href="#" class="hover:underline">Careers</a></li>
            <li><a href="#" class="hover:underline">KythoMart Stories</a></li>
            <li><a href="#" class="hover:underline">Press</a></li>
            <li><a href="#" class="hover:underline">Corporate Information</a></li>
          </ul>
        </div>

        <!-- GROUP COMPANIES -->
        <div class="space-y-3">
          <p class="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">Group Companies</p>
          <ul class="space-y-2 text-slate-300">
            <li><a href="#" class="hover:underline">Myntra</a></li>
            <li><a href="#" class="hover:underline">Cleartrip</a></li>
            <li><a href="#" class="hover:underline">Shopsy</a></li>
          </ul>
        </div>

        <!-- HELP -->
        <div class="space-y-3">
          <p class="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">Help</p>
          <ul class="space-y-2 text-slate-300">
            <li><a href="#" class="hover:underline">Payments</a></li>
            <li><a href="#" class="hover:underline">Shipping</a></li>
            <li><a href="#" class="hover:underline">Cancellation & Returns</a></li>
            <li><a href="#" class="hover:underline">FAQ</a></li>
          </ul>
        </div>

        <!-- CONSUMER POLICY -->
        <div class="space-y-3">
          <p class="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">Consumer Policy</p>
          <ul class="space-y-2 text-slate-300">
            <li><a href="#" class="hover:underline">Cancellation & Returns</a></li>
            <li><a href="#" class="hover:underline">Terms Of Use</a></li>
            <li><a href="#" class="hover:underline">Security</a></li>
            <li><a href="#" class="hover:underline">Privacy</a></li>
            <li><a href="#" class="hover:underline">Sitemap</a></li>
            <li><a href="#" class="hover:underline">Grievance Redressal</a></li>
            <li><a href="#" class="hover:underline">EPR Compliance</a></li>
          </ul>
        </div>

        <!-- MAIL US -->
        <div class="space-y-3 col-span-2 sm:col-span-1">
          <p class="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">Mail Us:</p>
          <p class="text-slate-300 leading-relaxed text-[11px]">
            KythoMart Internet Private Limited,<br>
            Buildings Alyssa, Begonia &<br>
            Clove Embassy Tech Village,<br>
            Outer Ring Road, Devarabeesanahalli Village,<br>
            Bengaluru, 560103,<br>
            Karnataka, India
          </p>
          <div class="pt-2">
            <p class="text-slate-400 font-semibold uppercase tracking-wider text-[11px] mb-2">Social:</p>
            <div class="flex items-center gap-3 text-slate-300">
              <a href="#" class="hover:text-amber-400 transition">🌐 Facebook</a>
              <a href="#" class="hover:text-amber-400 transition">🐦 Twitter</a>
              <a href="#" class="hover:text-amber-400 transition">📺 YouTube</a>
            </div>
          </div>
        </div>

        <!-- REGISTERED OFFICE ADDRESS -->
        <div class="space-y-3 col-span-2 sm:col-span-1">
          <p class="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">Registered Office Address:</p>
          <p class="text-slate-300 leading-relaxed text-[11px]">
            KythoMart Internet Private Limited,<br>
            Buildings Alyssa, Begonia &<br>
            Clove Embassy Tech Village,<br>
            Outer Ring Road, Devarabeesanahalli Village,<br>
            Bengaluru, 560103,<br>
            Karnataka, India<br>
            CIN : U51109KA2012PTC066107<br>
            Telephone: <a href="tel:04445614709" class="text-blue-400 hover:underline">044-45614709</a>
          </p>
        </div>
      </div>

      <!-- Bottom Bar Links & Payment Badges -->
      <div class="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 text-slate-300 text-[11px]">
        <div class="flex flex-wrap items-center justify-center md:justify-start gap-6 font-semibold">
          <a href="#" class="hover:text-amber-400 flex items-center gap-1.5"><span>🛍️</span> Become a Seller</a>
          <a href="#" class="hover:text-amber-400 flex items-center gap-1.5"><span>📢</span> Advertise</a>
          <a href="#" class="hover:text-amber-400 flex items-center gap-1.5"><span>🎁</span> Gift Cards</a>
          <a href="#" class="hover:text-amber-400 flex items-center gap-1.5"><span>❓</span> Help Center</a>
        </div>
        <div class="text-slate-400">
          © 2007-2026 KythoMart.com
        </div>
        <div class="flex items-center gap-2 opacity-80">
          <span class="px-2 py-1 bg-white/10 rounded font-mono text-[10px]">VISA</span>
          <span class="px-2 py-1 bg-white/10 rounded font-mono text-[10px]">MasterCard</span>
          <span class="px-2 py-1 bg-white/10 rounded font-mono text-[10px]">UPI</span>
          <span class="px-2 py-1 bg-white/10 rounded font-mono text-[10px]">NetBanking</span>
        </div>
      </div>
    </div>
  </footer>
`;

if (indexHtml.includes("</body>")) {
  indexHtml = indexHtml.replace("</body>", professionalFooterHTML + "\n</body>");
} else {
  indexHtml += professionalFooterHTML;
}

fs.writeFileSync("public/index.html", indexHtml);
console.log("Professional enterprise footer added to index.html successfully!");
