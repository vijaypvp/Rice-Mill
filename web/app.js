const { createApp, ref, computed, onMounted } = Vue;

createApp({
  setup() {
    const products = ref([]);
    const marketing = ref({ heroTitle: '', heroSubtitle: '', highlights: [], about: '' });
    const qty = ref({});
    const cart = ref([]);
    const customer = ref({ name: '', phone: '' });
    const invoice = ref(null);
    const loading = ref(false);
    const error = ref('');

    const subtotal = computed(() => cart.value.reduce((s, c) => s + c.qtyKg * c.pricePerKg, 0));
    const tax = computed(() => +(subtotal.value * 0.05).toFixed(2));
    const total = computed(() => +(subtotal.value + tax.value).toFixed(2));

    function addToCart(p) {
      const q = +(qty.value[p.id] || 0);
      if (!q) return;
      const existing = cart.value.find(c => c.productId === p.id);
      const newQty = existing ? existing.qtyKg + q : q;
      if (newQty > p.stockKg) { alert('Insufficient stock'); return; }
      if (existing) existing.qtyKg = +(existing.qtyKg + q).toFixed(2);
      else cart.value.push({ productId: p.id, name: p.name, pricePerKg: p.pricePerKg, qtyKg: q });
      qty.value[p.id] = 0;
    }

    function updateCart(i) {
      const c = cart.value[i];
      if (c.qtyKg <= 0) cart.value.splice(i, 1);
      const p = products.value.find(p => p.id === c.productId);
      if (c.qtyKg > p.stockKg) { c.qtyKg = p.stockKg; }
      c.qtyKg = +(+c.qtyKg).toFixed(2);
    }

    function removeFromCart(i) { cart.value.splice(i, 1); }

    async function placeOrder() {
      error.value = '';
      if (cart.value.length === 0) return;
      try {
        loading.value = true;
        const res = await fetch('/api/orders', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customer: customer.value, items: cart.value.map(c => ({ productId: c.productId, qtyKg: c.qtyKg })) })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to place order');
        invoice.value = data;
        // Update local stock and clear cart
        for (const l of data.lines) {
          const p = products.value.find(p => p.id === l.productId);
          if (p) p.stockKg = +(p.stockKg - l.qtyKg).toFixed(2);
        }
        cart.value = [];
      } catch (e) {
        error.value = e.message;
      } finally {
        loading.value = false;
      }
    }

    function printInvoice() {
      window.print();
    }

    function closeInvoice() {
      invoice.value = null;
    }

    onMounted(async () => {
      const [pRes, mRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/marketing')
      ]);
      products.value = await pRes.json();
      marketing.value = await mRes.json();
      for (const p of products.value) qty.value[p.id] = 0.5;
    });

    return { products, marketing, qty, cart, customer, invoice, loading, error, subtotal, tax, total, addToCart, updateCart, removeFromCart, placeOrder, printInvoice, closeInvoice };
  }
}).mount('#app');
