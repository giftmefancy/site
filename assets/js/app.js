const GFM = (() => {
const DATA_URL='assets/data/inventory.json';
async function loadData(){const r=await fetch(DATA_URL);if(!r.ok)throw new Error('Could not load inventory.json');return r.json();}
const money=n=>new Intl.NumberFormat('en-ZA',{style:'currency',currency:'ZAR',minimumFractionDigits:2}).format(n);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
function getCart(){try{return JSON.parse(localStorage.getItem('gfm_cart')||'[]')}catch{return[]}}
function saveCart(c){localStorage.setItem('gfm_cart',JSON.stringify(c));updateCartBadge()}
function addToCart(product,qty=1){const c=getCart(),x=c.find(i=>i.id===product.id);if(x)x.qty+=qty;else c.push({id:product.id,qty});saveCart(c);toast(product.name+' added to your cart.');}
function updateQty(id,qty){saveCart(getCart().map(i=>i.id===id?{...i,qty}:i).filter(i=>i.qty>0))}
function clearCart(){localStorage.removeItem('gfm_cart');updateCartBadge()}
function updateCartBadge(){const el=document.querySelector('.cart-count');if(el)el.textContent=getCart().reduce((a,i)=>a+i.qty,0)}
function toast(msg){let t=document.querySelector('.gfm-toast');if(!t){t=document.createElement('div');t.className='gfm-toast';t.style.cssText='position:fixed;right:18px;bottom:18px;z-index:99;background:#111;color:#fff;padding:13px 17px;border-radius:99px;font-size:12px;box-shadow:0 12px 35px #0003';document.body.appendChild(t)}t.textContent=msg;t.style.opacity=1;clearTimeout(t._x);t._x=setTimeout(()=>t.style.opacity=0,2200)}
function renderHeader(){
const mount=document.getElementById('site-header');
if(!mount)return;
mount.innerHTML=`<header class="site-header"><div class="container site-header-inner">
<a class="logo" href="index.html" aria-label="Gift Me Fancy home">
  <span class="logo-text"><strong>gift me <span>fancy</span></strong><small>Christian aesthetics & whimsical wonders</small></span>
</a>
<nav class="main-nav" id="main-nav" aria-label="Main navigation">
  <a href="index.html#products">Products</a><a href="index.html#about">About</a><a href="index.html#services">Services</a><a href="contact.html">Contact</a>
</nav>
<div class="header-actions">
  <a class="header-cart" href="checkout.html" aria-label="Cart">♡<span class="cart-count">0</span></a>
  <a class="btn btn-dark header-shop" href="shop.html">Shop Now <span>→</span></a>
  <button class="mobile-menu-button" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="main-nav">☰</button>
</div>
</div></header>`;
const toggle=document.querySelector('.mobile-menu-button');
const nav=document.getElementById('main-nav');
if(toggle&&nav){
  toggle.onclick=()=>{
    const open=nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded',String(open));
    toggle.setAttribute('aria-label',open?'Close menu':'Open menu');
    toggle.textContent=open?'×':'☰';
  };
  nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Open menu');toggle.textContent='☰';}));
}
updateCartBadge();
}
function renderFooter(){
const mount=document.getElementById('site-footer');
if(!mount)return;
mount.innerHTML=`<footer class="site-footer"><div class="container footer-grid">
<div><div class="footer-brand">gift me fancy</div><p>Christian Aesthetics & Whimsical Wonders — bringing joy, beauty and faith into home, garden and gifting.</p></div>
<div><div class="footer-heading">Explore</div><div class="footer-links"><a href="index.html#about">About</a><a href="shop.html">Products</a><a href="index.html#services">Services</a><a href="contact.html">Contact Us</a></div></div>
<div><div class="footer-heading">Contact</div><div class="footer-links"><a href="mailto:hello@giftmefancy.com">hello@giftmefancy.com</a><a href="https://wa.me/27837609276" target="_blank" rel="noopener">083 760 9276</a><span>Durban, South Africa</span></div></div>
</div><div class="container footer-bottom"><p>© ${new Date().getFullYear()} Gift Me Fancy</p><p>Designed and maintained by <a href="https://icarusdigi.github.io/site/" target="_blank" rel="noopener">IDM</a></p></div></footer>`;
}
function renderCategories(data){const el=document.getElementById('home-category-grid');if(!el)return;el.innerHTML=data.categories.map(c=>`<a class="category-card" href="shop.html?category=${encodeURIComponent(c.id)}"><strong>${esc(c.name)}</strong><span>${esc(c.description)}</span></a>`).join('')}
function productCard(p){return `<article class="product-card">
<a href="product.html?id=${encodeURIComponent(p.id)}"><div class="product-image"><img src="${p.image}" alt="${esc(p.name)}" loading="lazy"></div></a>
<div class="product-content"><span class="product-category">${esc(p.category)}</span><h3><a href="product.html?id=${encodeURIComponent(p.id)}">${esc(p.name)}</a></h3><p>${esc(p.short_description)}</p>
<div class="product-bottom"><span class="product-price">${money(p.price)}</span><button type="button" class="btn btn-dark add-btn" data-add="${esc(p.id)}">Add to cart</button></div></div></article>`}
function renderFeatured(data){const el=document.getElementById('featured-products');if(el)el.innerHTML=data.products.filter(p=>p.featured).slice(0,4).map(productCard).join('');bindAddButtons(data)}
function bindAddButtons(data){document.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>{const p=data.products.find(x=>x.id===b.dataset.add);if(p)addToCart(p)})}
function productDetail(p){return `<section class="section"><div class="container product-detail"><div class="product-detail-image"><img src="${p.image}" alt="${esc(p.name)}"></div><div class="product-detail-info"><span class="eyebrow">${esc(p.category)}</span><h1>${esc(p.name)}</h1><div class="product-detail-price">${money(p.price)}</div><p class="product-detail-description">${esc(p.description)}</p><div class="quantity-control"><button type="button" id="qty-minus" aria-label="Decrease quantity">−</button><span id="product-qty-value">1</span><button type="button" id="qty-plus" aria-label="Increase quantity">+</button></div><button class="btn btn-dark" id="add-detail" type="button">Add to cart →</button><a class="text-link" href="shop.html">← Back to collection</a></div></div></section>`}
function bindContactForm(){const f=document.getElementById('contact-form');if(!f)return;f.onsubmit=e=>{e.preventDefault();const d=new FormData(f);const text=`Hello Gift Me Fancy!%0A%0AContact enquiry%0AName: ${encodeURIComponent(d.get('name'))}%0AEmail: ${encodeURIComponent(d.get('email'))}%0APhone: ${encodeURIComponent(d.get('phone')||'Not provided')}%0A%0AMessage:%0A${encodeURIComponent(d.get('message'))}`;location.href=`https://wa.me/27837609276?text=${text}`}}
return{loadData,money,getCart,saveCart,addToCart,updateQty,clearCart,updateCartBadge,renderHeader,renderFooter,renderCategories,renderFeatured,productCard,productDetail,bindAddButtons,bindContactForm};
})();