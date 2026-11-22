(() => {
  const cfg = window.ALIPS_CONFIG || {};
  const products = window.ALIPS_PRODUCTS || [];
  const $ = (id) => document.getElementById(id);
  const money = (n) => `${cfg.currency || 'PKR'} ${Number(n).toLocaleString('en-PK')}`;
  let cart = JSON.parse(localStorage.getItem('alips_cart') || '{}');
  let activeFilter = 'All';
  const save = () => localStorage.setItem('alips_cart', JSON.stringify(cart));
  const toast = (msg) => { $('toast').textContent = msg; $('toast').classList.add('show'); setTimeout(() => $('toast').classList.remove('show'), 2200); };
  const productById = (id) => products.find(p => p.id === id);
  const cartQty = () => Object.values(cart).reduce((a,b) => a + b, 0);
  const subtotal = () => Object.entries(cart).reduce((sum,[id,qty]) => sum + (productById(id)?.price || 0) * qty, 0);
  function renderProducts() {
    const q = $('searchInput').value.trim().toLowerCase();
    const list = products.filter(p => (activeFilter === 'All' || p.category === activeFilter) && `${p.name} ${p.category} ${p.description}`.toLowerCase().includes(q));
    $('productGrid').innerHTML = list.length ? list.map(p => `<article class="product-card"><div class="product-visual">${p.image ? `<img src="${p.image}" alt="${escapeHtml(p.name)}" style="width:100%;height:100%;object-fit:cover">` : `<span>${escapeHtml(p.icon || '✦')}</span>`}</div><div class="product-info"><span class="product-category">${escapeHtml(p.category)}</span><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.description || '')}</p><div class="product-bottom"><span class="product-price">${money(p.price)}</span><button class="add-button" data-add="${escapeHtml(p.id)}">Add to cart +</button></div></div></article>`).join('') : '<div class="empty-state">No products found. Try another search or category.</div>';
  }
  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function renderCart() {
    $('cartCount').textContent = cartQty();
    const entries = Object.entries(cart).filter(([id,qty]) => qty > 0 && productById(id));
    $('cartItems').innerHTML = entries.length ? entries.map(([id,qty]) => { const p = productById(id); return `<div class="cart-row"><div><b>${escapeHtml(p.name)}</b><small>${money(p.price)} each</small><div class="qty-controls"><button data-qty="${id}" data-change="-1" aria-label="Decrease quantity">−</button><span>${qty}</span><button data-qty="${id}" data-change="1" aria-label="Increase quantity">+</button><button class="remove-item" data-remove="${id}">Remove</button></div></div><b>${money(p.price * qty)}</b></div>`; }).join('') : '<div class="empty-state">Your cart is empty.<br><br>Browse the products and add something you like.</div>';
    $('cartSubtotal').textContent = money(subtotal());
    $('checkoutButton').disabled = !entries.length;
    $('checkoutButton').style.opacity = entries.length ? '1' : '.45';
  }
  function openCart() { $('cartDrawer').classList.add('open'); $('cartDrawer').setAttribute('aria-hidden','false'); $('overlay').classList.add('show'); }
  function closeCart() { $('cartDrawer').classList.remove('open'); $('cartDrawer').setAttribute('aria-hidden','true'); $('overlay').classList.remove('show'); }
  document.addEventListener('click', e => {
    const add = e.target.closest('[data-add]'); if (add) { const id = add.dataset.add; cart[id] = (cart[id] || 0) + 1; save(); renderCart(); toast('Added to your cart'); }
    const qty = e.target.closest('[data-qty]'); if (qty) { const id = qty.dataset.qty; cart[id] = Math.max(0, (cart[id] || 0) + Number(qty.dataset.change)); if (!cart[id]) delete cart[id]; save(); renderCart(); }
    const remove = e.target.closest('[data-remove]'); if (remove) { delete cart[remove.dataset.remove]; save(); renderCart(); }
    const cat = e.target.closest('[data-category]'); if (cat) { setFilter(cat.dataset.category); document.querySelector('#products').scrollIntoView({behavior:'smooth'}); }
    const filter = e.target.closest('[data-filter]'); if (filter) setFilter(filter.dataset.filter);
  });
  function setFilter(value) { activeFilter = value; document.querySelectorAll('[data-filter]').forEach(b => b.classList.toggle('active', b.dataset.filter === value)); renderProducts(); }
  $('searchInput').addEventListener('input', renderProducts);
  $('openCart').addEventListener('click', openCart); $('closeCart').addEventListener('click', closeCart); $('overlay').addEventListener('click', closeCart);
  $('checkoutButton').addEventListener('click', () => { if (!cartQty()) return; closeCart(); $('checkoutModal').classList.add('show'); $('checkoutModal').setAttribute('aria-hidden','false'); });
  $('closeCheckout').addEventListener('click', () => { $('checkoutModal').classList.remove('show'); $('checkoutModal').setAttribute('aria-hidden','true'); });
  $('checkoutModal').addEventListener('click', e => { if (e.target === $('checkoutModal')) $('closeCheckout').click(); });
  $('checkoutForm').addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const lines = Object.entries(cart).filter(([id,qty]) => qty > 0 && productById(id)).map(([id,qty]) => { const p = productById(id); return `• ${p.name} x ${qty} — ${money(p.price * qty)}`; });
    const msg = [`*New order — ${cfg.storeName || 'Alips.pk'}*`, '', ...lines, '', `*Subtotal: ${money(subtotal())}*`, '', `Name: ${fd.get('name')}`, `Phone: ${fd.get('phone')}`, `Address: ${fd.get('address')}`, `Notes: ${fd.get('notes') || 'None'}`, '', 'Please confirm availability and delivery charges.'].join('\n');
    const number = String(cfg.whatsappNumber || '').replace(/\D/g,'');
    if (!number) { toast('Please set your WhatsApp number in config.js first.'); return; }
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  });
  $('contactWhatsApp').addEventListener('click', e => { const n = String(cfg.whatsappNumber || '').replace(/\D/g,''); if (!n) { e.preventDefault(); toast('Please set your WhatsApp number in config.js first.'); } else { e.preventDefault(); window.open(`https://wa.me/${n}?text=${encodeURIComponent('Hello Alips.pk, I have a question.')}`, '_blank', 'noopener'); } });
  $('menuToggle').addEventListener('click', () => { const nav = $('mainNav'); const isOpen = nav.classList.toggle('open'); $('menuToggle').setAttribute('aria-expanded', String(isOpen)); });
  document.querySelectorAll('#mainNav a').forEach(a => a.addEventListener('click', () => $('mainNav').classList.remove('open')));
  $('year').textContent = new Date().getFullYear();
  renderProducts(); renderCart();
})();
