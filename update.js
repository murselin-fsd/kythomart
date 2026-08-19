const fs = require('fs');
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Storefront & Dispatch Portal</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-50 text-slate-900 min-h-screen flex flex-col font-sans">
  <header class="bg-white border-b sticky top-0 z-40 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 py-3 flex flex-wrap justify-between items-center gap-4">
      <div class="flex items-center gap-2 cursor-pointer" onclick="switchTab('store')">
        <span class="bg-indigo-600 text-white font-black text-sm px-2.5 py-1 rounded-lg">STORE</span>
        <span class="font-bold text-lg tracking-tight text-slate-800">Dispatch Commerce</span>
      </div>
      <nav class="flex items-center bg-slate-100 p-1 rounded-xl gap-1 text-sm font-medium">
        <button onclick="switchTab('store')" id="tab-store" class="px-4 py-1.5 rounded-lg bg-white shadow-sm text-indigo-600 font-semibold">Storefront</button>
        <button onclick="switchTab('inventory')" id="tab-inventory" class="px-4 py-1.5 rounded-lg text-slate-600 hover:text-slate-900">Manage Products 🔒</button>
        <button onclick="switchTab('dispatch')" id="tab-dispatch" class="px-4 py-1.5 rounded-lg text-slate-600 hover:text-slate-900">Dispatch Orders 🔒</button>
        <button onclick="switchTab('support')" id="tab-support" class="px-4 py-1.5 rounded-lg text-slate-600 hover:text-slate-900">Support Tickets 🔒</button>
      </nav>
      <div class="flex items-center gap-2">
        <button id="auth-btn" onclick="handleAuthClick()" class="text-xs font-bold border px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 transition">Admin Login</button>
        <button onclick="toggleCart()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition">
          <span>Cart</span>
          <span id="cart-count" class="bg-white text-indigo-600 text-xs px-2 py-0.5 rounded-full font-bold">0</span>
        </button>
      </div>
    </div>
  </header>
  <main class="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
    <section id="view-store">
      <div class="mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-800">Product Catalog</h2>
          <p class="text-xs text-slate-500">Pick products and place your order.</p>
        </div>
        <div class="bg-white border p-3 rounded-2xl shadow-sm flex items-center gap-2">
          <input type="text" id="track-input" placeholder="Enter Tracking ID (e.g. TRK-...)" class="border rounded-xl px-3 py-1.5 text-xs outline-none" />
          <button onclick="trackOrder()" class="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-1.5 rounded-xl transition">Track Order</button>
        </div>
      </div>
      <div id="track-result" class="hidden mb-6 bg-indigo-50 border border-indigo-100 p-4 rounded-2xl text-sm flex justify-between items-center"></div>
      <div id="product-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"></div>
    </section>
    <section id="view-inventory" class="hidden space-y-6">
      <div class="bg-white border rounded-2xl p-6 shadow-sm">
        <h3 class="text-lg font-bold text-slate-800 mb-1">Add New Product</h3>
        <p class="text-xs text-slate-500 mb-4">Add products to your catalog dynamically.</p>
        <form onsubmit="addProduct(event)" class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <input type="text" id="prod-name" placeholder="Product Name" required class="border rounded-xl p-2.5 text-sm" />
          <input type="number" step="0.01" id="prod-price" placeholder="Price ($)" required class="border rounded-xl p-2.5 text-sm" />
          <input type="text" id="prod-category" placeholder="Category" class="border rounded-xl p-2.5 text-sm" />
          <input type="number" id="prod-stock" placeholder="Stock Units" required class="border rounded-xl p-2.5 text-sm" />
          <input type="url" id="prod-image" placeholder="Image URL" class="border rounded-xl p-2.5 text-sm" />
          <div class="md:col-span-3 lg:col-span-5 flex justify-end">
            <button type="submit" class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition">+ Publish Product</button>
          </div>
        </form>
      </div>
      <div class="bg-white border rounded-2xl shadow-sm overflow-hidden">
        <div class="px-6 py-3 border-b bg-slate-50 font-bold text-sm text-slate-700">Existing Inventory (Click Manage Stock to update units)</div>
        <table class="w-full text-left text-sm text-slate-600">
          <thead class="bg-slate-100 text-xs uppercase text-slate-500 border-b">
            <tr>
              <th class="p-4">Item</th>
              <th class="p-4">Category</th>
              <th class="p-4">Price</th>
              <th class="p-4">Stock Status</th>
              <th class="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody id="inventory-table-body" class="divide-y"></tbody>
        </table>
      </div>
    </section>
    <section id="view-dispatch" class="hidden space-y-4">
      <div class="flex justify-between items-center mb-2">
        <div>
          <h2 class="text-2xl font-bold text-slate-800">Dispatch Dashboard</h2>
          <p class="text-xs text-slate-500">View orders and manage fulfillment.</p>
        </div>
        <button onclick="loadOrders()" class="text-sm font-semibold text-indigo-600 hover:underline">Refresh Orders</button>
      </div>
      <div id="orders-container" class="grid grid-cols-1 gap-4"></div>
    </section>
    <section id="view-support" class="hidden space-y-4">
      <div class="flex justify-between items-center mb-2">
        <div>
          <h2 class="text-2xl font-bold text-slate-800">Customer Support Center</h2>
          <p class="text-xs text-slate-500">Manage customer inquiries, returns, and disputes.</p>
        </div>
        <button onclick="loadTickets()" class="text-sm font-semibold text-indigo-600 hover:underline">Refresh Tickets</button>
      </div>
      <div id="tickets-container" class="grid grid-cols-1 gap-4"></div>
    </section>
  </main>
  <div id="stock-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center hidden z-50 p-4">
    <div class="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-4">
      <div class="flex justify-between items-center border-b pb-3">
        <div>
          <h3 class="text-lg font-bold text-slate-800">Manage Product Stock</h3>
          <p id="modal-prod-name" class="text-xs text-indigo-600 font-semibold truncate max-w-[240px]"></p>
        </div>
        <button onclick="closeStockModal()" class="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
      </div>
      <form onsubmit="saveModalStock(event)" class="space-y-4">
        <div>
          <label class="block text-xs uppercase font-bold text-slate-500 mb-1">Stock Units</label>
          <input type="number" id="modal-prod-stock" min="0" required class="w-full border rounded-xl p-2.5 text-sm font-bold text-slate-800 outline-none focus:border-indigo-600" />
        </div>
        <div class="flex flex-col gap-2 pt-2">
          <button type="button" onclick="setModalStockZero()" class="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 py-2.5 rounded-xl text-xs font-bold transition border border-rose-200">
            🚫 Mark Out of Stock (0) - Instant
          </button>
          <div class="flex gap-2">
            <button type="button" onclick="closeStockModal()" class="w-1/2 border py-2.5 rounded-xl text-xs font-semibold hover:bg-slate-50">Cancel</button>
            <button type="submit" class="w-1/2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-xs font-semibold transition">Save Stock</button>
          </div>
        </div>
      </form>
    </div>
  </div>
  <div id="login-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center hidden z-50 p-4">
    <div class="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl">
      <h3 class="text-lg font-bold mb-1">Admin Authentication</h3>
      <p class="text-xs text-slate-500 mb-4">Credentials: <code class="font-bold">admin / admin123</code></p>
      <form onsubmit="submitLogin(event)" class="space-y-3">
        <input type="text" id="login-user" placeholder="Username" required class="w-full border rounded-xl p-2.5 text-sm" />
        <input type="password" id="login-pass" placeholder="Password" required class="w-full border rounded-xl p-2.5 text-sm" />
        <div id="login-error" class="text-xs text-rose-600 hidden font-medium"></div>
        <div class="flex gap-2 pt-2">
          <button type="button" onclick="closeLoginModal()" class="w-1/2 border py-2.5 rounded-xl text-sm font-semibold">Cancel</button>
          <button type="submit" class="w-1/2 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700">Login</button>
        </div>
      </form>
    </div>
  </div>
  <div id="cart-drawer" class="fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl p-6 hidden z-50 flex flex-col justify-between">
    <div>
      <div class="flex justify-between items-center border-b pb-3 mb-4">
        <h3 class="text-lg font-bold">Shopping Cart</h3>
        <button onclick="toggleCart()" class="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
      </div>
      <div id="cart-items" class="divide-y max-h-[60vh] overflow-y-auto"></div>
    </div>
    <div class="border-t pt-4">
      <div class="flex justify-between text-lg font-bold mb-4">
        <span>Total:</span>
        <span id="cart-total">$0.00</span>
      </div>
      <button onclick="openCheckout()" class="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition">Proceed to Checkout</button>
    </div>
  </div>
  <div id="checkout-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center hidden z-50 p-4">
    <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
      <h3 class="text-xl font-bold mb-1">Dispatch & Delivery Address</h3>
      <p class="text-xs text-slate-500 mb-4">Provide destination details for fulfillment.</p>
      <form id="checkout-form" onsubmit="submitOrder(event)" class="space-y-3">
        <input type="text" id="c-name" placeholder="Recipient Full Name" required class="w-full border rounded-xl p-2.5 text-sm" />
        <input type="email" id="c-email" placeholder="Email Address" required class="w-full border rounded-xl p-2.5 text-sm" />
        <input type="tel" id="c-phone" placeholder="Phone Number" required class="w-full border rounded-xl p-2.5 text-sm" />
        <textarea id="c-address" placeholder="Delivery Street Address" required class="w-full border rounded-xl p-2.5 text-sm"></textarea>
        <div class="grid grid-cols-2 gap-2">
          <input type="text" id="c-city" placeholder="City" required class="border rounded-xl p-2.5 text-sm" />
          <input type="text" id="c-zip" placeholder="Zip / Postal Code" required class="border rounded-xl p-2.5 text-sm" />
        </div>
        <div class="flex gap-2 pt-2">
          <button type="button" onclick="closeCheckout()" class="w-1/2 border py-2.5 rounded-xl text-sm font-semibold">Cancel</button>
          <button type="submit" class="w-1/2 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition">Confirm & Dispatch</button>
        </div>
      </form>
    </div>
  </div>
  <script>
    let products = [];
    let cart = [];
    let pendingProtectedTab = null;
    let activeStockProductId = null;

    function getAuthHeaders() {
      const token = localStorage.getItem('adminToken');
      return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': 'Bearer ' + token } : {})
      };
    }

    function switchTab(tab) {
      if ((tab === 'inventory' || tab === 'dispatch' || tab === 'support') && !localStorage.getItem('adminToken')) {
        pendingProtectedTab = tab;
        openLoginModal();
        return;
      }
      ['store', 'inventory', 'dispatch', 'support'].forEach(t => {
        const viewEl = document.getElementById('view-' + t);
        const tabEl = document.getElementById('tab-' + t);
        if (viewEl) viewEl.classList.add('hidden');
        if (tabEl) tabEl.className = 'px-4 py-1.5 rounded-lg text-slate-600 hover:text-slate-900';
      });
      document.getElementById('view-' + tab).classList.remove('hidden');
      document.getElementById('tab-' + tab).className = 'px-4 py-1.5 rounded-lg bg-white shadow-sm text-indigo-600 font-semibold';
      if (tab === 'store' || tab === 'inventory') loadProducts();
      if (tab === 'dispatch') loadOrders();
      if (tab === 'support') loadTickets();
    }

    function handleAuthClick() {
      if (localStorage.getItem('adminToken')) {
        localStorage.removeItem('adminToken');
        updateAuthUI();
        switchTab('store');
      } else {
        openLoginModal();
      }
    }

    function updateAuthUI() {
      const btn = document.getElementById('auth-btn');
      if (localStorage.getItem('adminToken')) {
        btn.innerText = 'Logout';
        btn.className = 'text-xs font-bold border border-rose-200 text-rose-600 px-3 py-2 rounded-xl hover:bg-rose-50';
      } else {
        btn.innerText = 'Admin Login';
        btn.className = 'text-xs font-bold border px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50';
      }
    }

    function openLoginModal() { document.getElementById('login-modal').classList.remove('hidden'); }
    function closeLoginModal() { document.getElementById('login-modal').classList.add('hidden'); }

    async function submitLogin(e) {
      e.preventDefault();
      const username = document.getElementById('login-user').value;
      const password = document.getElementById('login-pass').value;
      const errBox = document.getElementById('login-error');
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('adminToken', data.token);
        closeLoginModal();
        updateAuthUI();
        if (pendingProtectedTab) {
          switchTab(pendingProtectedTab);
          pendingProtectedTab = null;
        }
      } else {
        errBox.innerText = data.error || 'Login failed.';
        errBox.classList.remove('hidden');
      }
    }

    async function loadProducts() {
      const res = await fetch('/api/products');
      products = await res.json();
      document.getElementById('product-grid').innerHTML = products.map((p, index) => {
        const stock = p.stock !== undefined ? p.stock : 10;
        return \`
          <div class="bg-white border rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <img src="\${p.image}" class="h-44 w-full object-cover rounded-xl mb-3" />
            <div>
              <span class="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">\${p.category || 'General'}</span>
              <h4 class="font-bold text-slate-800 mt-2 text-sm">\${p.name}</h4>
              <div class="flex justify-between items-center mt-2">
                <span class="text-lg font-black text-slate-900">$\${(p.price || 0).toFixed(2)}</span>
                <span class="text-xs \${stock > 0 ? 'text-emerald-600 font-semibold' : 'text-rose-500 font-semibold'}">\${stock > 0 ? stock + ' left' : 'Sold out'}</span>
              </div>
            </div>
            <button onclick="addToCartByIndex(\${index})" \${stock <= 0 ? 'disabled' : ''} class="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm py-2.5 rounded-xl font-bold transition shadow-sm disabled:bg-slate-300">
              \${stock > 0 ? '+ Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        \`;
      }).join('');

      document.getElementById('inventory-table-body').innerHTML = products.map(p => {
        const stock = p.stock !== undefined ? p.stock : 10;
        const isOut = stock <= 0;
        const safeName = (p.name || '').replace(/'/g, "\\\\'");
        return \`
          <tr class="hover:bg-slate-50">
            <td class="p-4 font-semibold text-slate-800 flex items-center gap-3">
              <img src="\${p.image}" class="w-8 h-8 rounded-lg object-cover" />
              \${p.name}
            </td>
            <td class="p-4">\${p.category || 'General'}</td>
            <td class="p-4 font-bold text-slate-800">$\${(p.price || 0).toFixed(2)}</td>
            <td class="p-4">
              <span class="px-2.5 py-1 rounded-full text-xs font-bold \${isOut ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}">
                \${isOut ? 'Out of Stock (0)' : stock + ' Units'}
              </span>
            </td>
            <td class="p-4 text-right space-x-2">
              <button type="button" onclick="openStockModal('\${p.id}', '\${safeName}', \${stock})" class="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-xl text-xs font-bold transition">Manage Stock</button>
              <button type="button" onclick="deleteProduct('\${p.id}')" class="text-rose-600 hover:underline text-xs font-bold">Delete</button>
            </td>
          </tr>
        \`;
      }).join('');
    }

    function openStockModal(id, name, stock) {
      activeStockProductId = id;
      document.getElementById('modal-prod-name').innerText = name;
      document.getElementById('modal-prod-stock').value = stock;
      document.getElementById('stock-modal').classList.remove('hidden');
    }

    function closeStockModal() {
      document.getElementById('stock-modal').classList.add('hidden');
      activeStockProductId = null;
    }

    async function setModalStockZero() {
      document.getElementById('modal-prod-stock').value = 0;
      await submitStockUpdate(0);
    }

    async function saveModalStock(e) {
      e.preventDefault();
      const stock = parseInt(document.getElementById('modal-prod-stock').value, 10);
      if (isNaN(stock) || stock < 0) {
        alert('Please enter a valid stock number.');
        return;
      }
      await submitStockUpdate(stock);
    }

    async function submitStockUpdate(stock) {
      if (!activeStockProductId) return;
      try {
        const res = await fetch('/api/admin/products/' + activeStockProductId + '/stock', {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify({ stock })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          closeStockModal();
          loadProducts();
        } else {
          alert(data.error || 'Failed to update stock. Make sure you are logged in as admin.');
        }
      } catch (err) {
        alert('Network error while updating stock.');
      }
    }

    async function addProduct(e) {
      e.preventDefault();
      const payload = {
        name: document.getElementById('prod-name').value,
        price: document.getElementById('prod-price').value,
        category: document.getElementById('prod-category').value,
        stock: document.getElementById('prod-stock').value,
        image: document.getElementById('prod-image').value
      };
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      if (res.status === 401 || res.status === 403) {
        alert('Authentication required.');
        return;
      }
      if (res.ok) {
        e.target.reset();
        loadProducts();
      }
    }

    async function deleteProduct(id) {
      if (!confirm('Remove this product?')) return;
      await fetch('/api/products/' + id, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      loadProducts();
    }

    async function loadOrders() {
      const res = await fetch('/api/orders', { headers: getAuthHeaders() });
      if (res.status === 401 || res.status === 403) {
        switchTab('store');
        return;
      }
      const orders = await res.json();
      const container = document.getElementById('orders-container');
      if (orders.length === 0) {
        container.innerHTML = '<div class="bg-white p-8 rounded-2xl text-center text-slate-400">No orders received yet.</div>';
        return;
      }
      container.innerHTML = orders.map(o => \`
        <div class="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
          <div class="flex justify-between items-center border-b pb-3">
            <div>
              <span class="font-mono font-bold text-indigo-600">\${o.orderId}</span>
              \${o.trackingId ? '<span class="text-xs bg-slate-100 font-mono text-slate-600 px-2 py-0.5 rounded ml-2">Track: ' + o.trackingId + '</span>' : ''}
              <span class="text-xs text-slate-400 ml-2">\${new Date(o.date).toLocaleString()}</span>
            </div>
            <select onchange="updateOrderStatus('\${o.orderId}', this.value)" class="text-xs font-bold border rounded-lg px-2.5 py-1">
              <option value="Pending Dispatch" \${o.status === 'Pending Dispatch' ? 'selected' : ''}>Pending Dispatch</option>
              <option value="Dispatched" \${o.status === 'Dispatched' ? 'selected' : ''}>Dispatched</option>
              <option value="Delivered" \${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
            </select>
          </div>
          <div class="text-sm grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-slate-50 p-3.5 rounded-xl">
              <p class="text-xs uppercase font-bold text-slate-400 mb-1">Customer & Address</p>
              <p class="font-bold text-slate-800">\${o.customer.name} (\${o.customer.phone})</p>
              <p class="text-slate-500 text-xs">\${o.customer.email}</p>
              <p class="text-slate-700 mt-2 text-xs font-medium">\${o.customer.address}, \${o.customer.city} (\${o.customer.zip})</p>
            </div>
            <div class="bg-slate-50 p-3.5 rounded-xl flex flex-col justify-between">
              <div>
                <p class="text-xs uppercase font-bold text-slate-400 mb-1">Items in Package</p>
                <ul class="text-slate-700 text-xs space-y-1">
                  \${o.items.map(i => '<li>• ' + i.name + ' &times; ' + i.quantity + '</li>').join('')}
                </ul>
              </div>
              <p class="font-bold text-slate-900 border-t pt-2 mt-2">Total: $\${o.total.toFixed(2)}</p>
            </div>
          </div>
        </div>
      \`).join('');
    }

    async function updateOrderStatus(id, status) {
      await fetch('/api/orders/' + id + '/status', {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
      });
      loadOrders();
    }

    async function loadTickets() {
      const res = await fetch('/api/tickets', { headers: getAuthHeaders() });
      if (res.status === 401 || res.status === 403) {
        switchTab('store');
        return;
      }
      const ticketList = await res.json();
      const container = document.getElementById('tickets-container');
      if (ticketList.length === 0) {
        container.innerHTML = '<div class="bg-white p-8 rounded-2xl text-center text-slate-400">No support tickets or disputes received.</div>';
        return;
      }
      container.innerHTML = ticketList.map(t => \`
        <div class="bg-white border rounded-2xl p-5 shadow-sm space-y-3">
          <div class="flex justify-between items-center border-b pb-3">
            <div>
              <span class="font-mono font-bold text-indigo-600">\${t.ticketId}</span>
              <span class="text-xs bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-md ml-2">\${t.issueType}</span>
              <span class="text-xs text-slate-400 ml-2">\${new Date(t.date).toLocaleString()}</span>
            </div>
            <select onchange="updateTicketStatus('\${t.ticketId}', this.value)" class="text-xs font-bold border rounded-lg px-2.5 py-1">
              <option value="Open" \${t.status === 'Open' ? 'selected' : ''}>Open</option>
              <option value="In Progress" \${t.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
              <option value="Resolved" \${t.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
            </select>
          </div>
          <div class="text-sm grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-slate-50 p-3.5 rounded-xl">
              <p class="text-xs uppercase font-bold text-slate-400 mb-1">Customer Details</p>
              <p class="font-bold text-slate-800">\${t.name}</p>
              <p class="text-slate-500 text-xs">\${t.email}</p>
              <p class="text-slate-700 mt-2 text-xs font-medium">Order Reference: <span class="font-mono font-bold text-indigo-600">\${t.orderId}</span></p>
            </div>
            <div class="bg-slate-50 p-3.5 rounded-xl flex flex-col justify-between">
              <div>
                <p class="text-xs uppercase font-bold text-slate-400 mb-1">Customer Message / Dispute</p>
                <p class="text-slate-700 text-xs mt-1 leading-relaxed">\${t.message}</p>
              </div>
            </div>
          </div>
        </div>
      \`).join('');
    }

    async function updateTicketStatus(id, status) {
      await fetch('/api/tickets/' + id + '/status', {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
      });
      loadTickets();
    }

    async function trackOrder() {
      const trackingId = document.getElementById('track-input').value.trim();
      const resultBox = document.getElementById('track-result');
      if (!trackingId) {
        alert('Please enter a valid Tracking ID.');
        return;
      }
      const res = await fetch('/api/orders');
      const orders = await res.json();
      const found = orders.find(o => o.trackingId === trackingId);
      resultBox.classList.remove('hidden');
      if (found) {
        resultBox.innerHTML = \`
          <div>
            <p class="font-bold text-slate-800">Tracking ID: <span class="text-indigo-600 font-mono">\${found.trackingId}</span></p>
            <p class="text-xs text-slate-500 mt-1">Status: <span class="font-bold text-amber-600">\${found.status}</span> | Recipient: \${found.customer.name}</p>
          </div>
          <span class="text-xs font-bold bg-white px-3 py-1.5 rounded-xl border shadow-sm">\${found.orderId}</span>
        \`;
      } else {
        resultBox.innerHTML = \`<p class="text-rose-600 text-xs font-semibold">No order found with Tracking ID "\${trackingId}". Please check and try again.</p>\`;
      }
    }

    function addToCartByIndex(index) {
      const prod = products[index];
      if (!prod) return;
      const inCart = cart.find(item => item.id == prod.id);
      if (inCart) {
        if (inCart.quantity < (prod.stock || 10)) inCart.quantity++;
      } else {
        cart.push({ ...prod, quantity: 1 });
      }
      renderCart();
      toggleCart();
    }

    function updateCartQuantity(index, change) {
      if (cart[index]) {
        cart[index].quantity += change;
        if (cart[index].quantity <= 0) {
          cart.splice(index, 1);
        }
        renderCart();
      }
    }

    function removeFromCart(index) {
      if (cart[index]) {
        cart.splice(index, 1);
        renderCart();
      }
    }

    function renderCart() {
      const count = cart.reduce((a, b) => a + b.quantity, 0);
      document.getElementById('cart-count').innerText = count;
      const container = document.getElementById('cart-items');
      if (!container) return;
      if (cart.length === 0) {
        container.innerHTML = '<p class="text-xs text-slate-400 py-6 text-center">Your cart is empty.</p>';
      } else {
        container.innerHTML = cart.map((item, index) => \`
          <div class="py-3 flex justify-between items-center text-sm gap-2">
            <div class="flex-1">
              <p class="font-bold text-slate-800 line-clamp-1">\${item.name}</p>
              <p class="text-xs text-slate-500">$\${(item.price || 0).toFixed(2)} each</p>
            </div>
            <div class="flex items-center gap-1.5 border rounded-xl px-2 py-1 bg-slate-50">
              <button type="button" onclick="updateCartQuantity(\${index}, -1)" class="text-slate-600 font-bold hover:text-black px-1.5">-</button>
              <span class="text-xs font-bold w-4 text-center">\${item.quantity}</span>
              <button type="button" onclick="updateCartQuantity(\${index}, 1)" class="text-slate-600 font-bold hover:text-black px-1.5">+</button>
            </div>
            <div class="text-right ml-2">
              <p class="font-bold text-slate-900 text-xs">$\${(item.quantity * (item.price || 0)).toFixed(2)}</p>
              <button type="button" onclick="removeFromCart(\${index})" class="text-[10px] text-rose-500 hover:underline">Remove</button>
            </div>
          </div>
        \`).join('');
      }
      const totalEl = document.getElementById('cart-total');
      if (totalEl) {
        totalEl.innerText = \`$\${cart.reduce((a, b) => a + ((b.price || 0) * b.quantity), 0).toFixed(2)}\`;
      }
    }

    function toggleCart() { 
      const drawer = document.getElementById('cart-drawer');
      drawer.classList.toggle('hidden');
      if (!drawer.classList.contains('hidden')) {
        renderCart();
      }
    }

    function openCheckout() { if (cart.length > 0) document.getElementById('checkout-modal').classList.remove('hidden'); }
    function closeCheckout() { document.getElementById('checkout-modal').classList.add('hidden'); }

    async function submitOrder(e) {
      e.preventDefault();
      const customer = {
        name: document.getElementById('c-name').value,
        email: document.getElementById('c-email').value,
        phone: document.getElementById('c-phone').value,
        address: document.getElementById('c-address').value,
        city: document.getElementById('c-city').value,
        zip: document.getElementById('c-zip').value
      };
      const total = cart.reduce((a, b) => a + ((b.price || 0) * b.quantity), 0).toFixed(2);
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer, items: cart, total })
      });
      const data = await res.json();
      if (data.success) {
        alert('Order Placed Successfully!\\nOrder ID: ' + data.orderId + '\\nTracking ID: ' + data.trackingId);
        cart = [];
        renderCart();
        closeCheckout();
        toggleCart();
        loadProducts();
      }
    }

    updateAuthUI();
    loadProducts();
    renderCart();
  </script>
</body>
</html>`;

fs.writeFileSync('public/index.html', html);
console.log('Successfully updated public/index.html!');
