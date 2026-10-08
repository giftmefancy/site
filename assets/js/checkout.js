document.addEventListener('DOMContentLoaded', async () => {
  GFM.renderHeader();
  GFM.renderFooter();

  const data = await GFM.loadData();
  const wrap = document.getElementById('checkout-cart');
  const totalEl = document.getElementById('checkout-total');
  const canvas = document.getElementById('order-canvas');
  const form = document.getElementById('checkout-form');

  function items() {
    return GFM.getCart()
      .map(i => {
        const product = data.products.find(p => p.id === i.id);
        return product ? { ...product, qty: Number(i.qty) || 1 } : null;
      })
      .filter(Boolean);
  }

  function render() {
    const list = items();

    if (!list.length) {
      wrap.innerHTML = '<div class="empty-cart"><h2>Your cart is empty.</h2><p class="muted">Browse the collection and add something fancy.</p><a class="btn btn-dark" href="shop.html">Browse products →</a></div>';
      totalEl.textContent = 'R0.00';
      drawCanvas([]);
      return;
    }

    wrap.innerHTML = `<div class="cart-items">${list.map(p => `
      <article class="cart-item">
        <div class="cart-item-image"><img src="${p.image}" alt="${p.name}" loading="lazy"></div>
        <div>
          <h3>${p.name}</h3>
          <small>${GFM.money(p.price)} each</small>
          <div class="cart-qty">
            <button class="qty-btn" type="button" data-q="${p.id}" data-v="${p.qty - 1}" aria-label="Decrease ${p.name} quantity">−</button>
            <span>${p.qty}</span>
            <button class="qty-btn" type="button" data-q="${p.id}" data-v="${p.qty + 1}" aria-label="Increase ${p.name} quantity">+</button>
          </div>
          <button class="remove-item" type="button" data-q="${p.id}" data-v="0">Remove</button>
        </div>
        <div class="cart-item-price">${GFM.money(p.price * p.qty)}</div>
      </article>`).join('')}</div>`;

    const total = list.reduce((sum, p) => sum + p.price * p.qty, 0);
    totalEl.textContent = GFM.money(total);

    wrap.querySelectorAll('.qty-btn, .remove-item').forEach(button => {
      button.onclick = () => {
        GFM.updateQty(button.dataset.q, Number(button.dataset.v));
        render();
      };
    });

    drawCanvas(list);
  }

  function drawCanvas(list) {
    if (!canvas) return;
    const rowHeight = 95;
    canvas.height = Math.max(520, 195 + list.length * rowHeight);
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#f1e8ff';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#11101a';
    ctx.font = '900 48px Arial';
    ctx.fillText('gift me fancy', 55, 85);
    ctx.font = '18px Arial';
    ctx.fillStyle = '#7557b8';
    ctx.fillText('ORDER PREVIEW', 57, 120);

    let y = 175;
    let total = 0;
    list.forEach(p => {
      ctx.fillStyle = '#fff';
      ctx.fillRect(45, y - 35, 910, 80);
      ctx.fillStyle = '#11101a';
      ctx.font = '700 22px Arial';
      ctx.fillText(p.name.slice(0, 34), 75, y);
      ctx.font = '17px Arial';
      ctx.fillStyle = '#686474';
      ctx.fillText(`${p.qty} × ${GFM.money(p.price)}`, 650, y);
      ctx.fillStyle = '#11101a';
      ctx.font = '700 18px Arial';
      ctx.fillText(GFM.money(p.qty * p.price), 820, y);
      total += p.qty * p.price;
      y += rowHeight;
    });

    const totalY = Math.min(y + 20, height - 45);
    ctx.fillStyle = '#11101a';
    ctx.font = '900 28px Arial';
    ctx.fillText('TOTAL', 650, totalY);
    ctx.fillText(GFM.money(total), 820, totalY);
  }

  const clearButton = document.getElementById('clear-cart');
  if (clearButton) clearButton.onclick = () => {
    GFM.clearCart();
    render();
  };

  form.onsubmit = e => {
    e.preventDefault();
    const list = items();
    if (!list.length) {
      alert('Your cart is empty.');
      return;
    }

    const d = new FormData(form);
    const total = list.reduce((sum, p) => sum + p.price * p.qty, 0);
    const lines = list.map(p => `• ${p.name} × ${p.qty} = ${GFM.money(p.price * p.qty)}`).join('\n');
    const msg = `Hello Gift Me Fancy! 👋\n\nNEW ORDER\n\n${lines}\n\nTOTAL: ${GFM.money(total)}\n\nCUSTOMER DETAILS\nName: ${d.get('name')}\nEmail: ${d.get('email')}\nWhatsApp/Phone: ${d.get('phone')}\nDelivery address: ${d.get('address')}\nOrder notes: ${d.get('notes') || 'None'}\n\nPlease confirm availability, delivery arrangements and payment instructions.`;
    location.href = `https://wa.me/27837609276?text=${encodeURIComponent(msg)}`;
  };

  render();
});