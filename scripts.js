(function(){
  function getCart(){ try{ return JSON.parse(localStorage.getItem('myazon_cart')||'[]'); }catch(e){return []} }
  function setCart(c){ localStorage.setItem('myazon_cart', JSON.stringify(c)); updateCartCount(); }
  function updateCartCount(){ var c = getCart(); var count = c.reduce(function(s,i){return s+i.qty},0); var els = document.querySelectorAll('#cart-count, #cart-count-p, #cart-count-c'); els.forEach(function(el){ if(el) el.innerText = count; }); }
  function fmt(n){ return '₹' + n.toLocaleString('en-IN'); }
  
  function renderProductGrid(list){ 
    var grid = document.getElementById('productGrid'); 
    if(!grid) return; 
    grid.innerHTML = ''; 
    if(list.length === 0) {
      grid.innerHTML = '<p>No products found.</p>';
      return;
    }
    list.forEach(function(p){ 
      var card = document.createElement('div'); 
      card.className='card'; 
      card.innerHTML = '\
        <img src="'+p.image+'" alt="'+p.title+'">\
        <div class="title">'+p.title+'</div>\
        <div class="meta">'+p.category+' • ⭐ '+p.rating+'</div>\
        <div class="price">'+fmt(p.price)+'</div>\
        <div class="row">\
          <button class="btn" onclick="addToCart(\''+p.id+'\')">Add to Cart</button>\
          <a class="ghost" href="product.html?id='+p.id+'">View</a>\
        </div>'; 
      grid.appendChild(card); 
    }); 
  }

  function renderProductPage(id){ 
    var p = products.find(function(x){return x.id===id}); 
    if(!p) return; 
    var container = document.getElementById('productPage'); 
    if(!container) return; 
    container.innerHTML = '\
      <div class="product-detail">\
        <img src="'+p.image+'" alt="'+p.title+'">\
        <h2 class="title">'+p.title+'</h2>\
        <div class="meta">'+p.category+' • ⭐ '+p.rating+'</div>\
        <div class="price" style="margin-top:8px;font-size:20px">'+fmt(p.price)+'</div>\
        <p style="margin-top:10px">'+p.desc+'</p>\
      </div>\
      <aside>\
        <div class="card">\
          <div style="font-weight:700">'+fmt(p.price)+'</div>\
          <button class="btn" onclick="addToCart(\''+p.id+'\')">Add to Cart</button>\
        </div>\
      </aside>'; 
  }

  function renderCartPage(){ 
    var cartDiv = document.getElementById('cartItems'); 
    if(!cartDiv) return; 
    var cart = getCart(); 
    cartDiv.innerHTML=''; 
    if(cart.length===0){ 
      cartDiv.innerHTML='<p>Your cart is empty.</p>'; 
      document.getElementById('cartTotal').innerText = fmt(0); 
      return; 
    } 
    var total=0; 
    cart.forEach(function(item){ 
      var p = products.find(function(x){return x.id===item.id}); 
      if(!p) return; 
      total += p.price * item.qty; 
      var node = document.createElement('div'); 
      node.className='cart-item'; 
      node.innerHTML = '\
        <img src="'+p.image+'" alt="'+p.title+'">\
        <div style="flex:1">\
          <div style="font-weight:600">'+p.title+'</div>\
          <div class="meta">'+fmt(p.price)+'</div>\
          <div style="margin-top:6px">Qty: <button class="ghost" onclick="decQty(\''+p.id+'\')">-</button> <span>'+item.qty+'</span> <button class="ghost" onclick="incQty(\''+p.id+'\')">+</button></div>\
        </div>\
        <div style="text-align:right">\
          <div style="font-weight:700">'+fmt(p.price * item.qty)+'</div>\
          <button class="ghost" onclick="removeItem(\''+p.id+'\')">Remove</button>\
        </div>'; 
      cartDiv.appendChild(node); 
    }); 
    document.getElementById('cartTotal').innerText = fmt(total); 
  }

  window.addToCart = function(id){ 
    var cart = getCart(); 
    var found = cart.find(function(x){return x.id===id}); 
    if(found) found.qty += 1; 
    else cart.push({id:id, qty:1}); 
    setCart(cart); 
    alert('Added to cart'); 
    if(location.pathname.endsWith('product.html')) updateCartCount(); 
  }

  window.incQty = function(id){ 
    var cart = getCart(); 
    cart = cart.map(function(x){ if(x.id===id) x.qty+=1; return x}); 
    setCart(cart); 
    renderCartPage(); 
  }

  window.decQty = function(id){ 
    var cart = getCart(); 
    cart = cart.map(function(x){ if(x.id===id) x.qty = Math.max(1,x.qty-1); return x}); 
    setCart(cart); 
    renderCartPage(); 
  }

  window.removeItem = function(id){ 
    var cart = getCart(); 
    cart = cart.filter(function(x){return x.id!==id}); 
    setCart(cart); 
    renderCartPage(); 
  }

  function applyFilters(){
    var list = products.slice();

    // Search filter
    var q = (document.getElementById('searchInput')?.value || '').toLowerCase();
    if(q) {
      list = list.filter(p => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }

    // Category filter handled separately on click events

    // Price filter
    var min = parseFloat(document.getElementById('minPrice')?.value) || 0;
    var max = parseFloat(document.getElementById('maxPrice')?.value) || Infinity;
    list = list.filter(p => p.price >= min && p.price <= max);

    // Rating filter
    var ratingVal = parseFloat(document.getElementById('ratingFilter')?.value) || 0;
    if(ratingVal > 0){
      list = list.filter(p => p.rating >= ratingVal);
    }

    renderProductGrid(list);
  }

  document.addEventListener('click', function(e){ 
    if(e.target && e.target.id==='clearCart'){ 
      setCart([]); 
      renderCartPage(); 
    } 
    if(e.target && e.target.id==='checkoutBtn'){ 
      alert('Checkout simulated. Thank you!'); 
      setCart([]); 
      renderCartPage(); 
    } 
    if(e.target && e.target.id==='searchBtn'){ 
      applyFilters();
    } 
    if(e.target && e.target.id==='searchBtnP'){ 
      var q = document.getElementById('searchInputP').value.toLowerCase(); 
      location.href = 'index.html?search='+encodeURIComponent(q); 
    } 
    if(e.target && e.target.id==='searchBtnC'){ 
      var q = document.getElementById('searchInputC').value.toLowerCase(); 
      location.href = 'index.html?search='+encodeURIComponent(q); 
    }
    if(e.target && e.target.id==='applyPriceFilter'){
      applyFilters();
    }
  });

  document.addEventListener('DOMContentLoaded', function(){ 
    // Restore dark mode preference
    if(localStorage.getItem('darkMode') === 'true'){
      document.body.classList.add('dark-mode');
    }

    updateCartCount(); 

    if(document.getElementById('productGrid')){
      var catLinks = document.querySelectorAll('.categories a'); 
      catLinks.forEach(function(a){ 
        a.addEventListener('click', function(ev){ 
          ev.preventDefault(); 
          var cat = this.getAttribute('data-cat'); 
          if(cat==='All') renderProductGrid(products); 
          else renderProductGrid(products.filter(function(p){return p.category===cat})); 
        }) 
      });

      var sortSelect = document.getElementById('sortSelect'); 
      if(sortSelect){ 
        sortSelect.addEventListener('change', function(){ 
          var val=this.value; 
          var list = products.slice(); 
          if(val==='price-asc') list.sort(function(a,b){return a.price-b.price}); 
          if(val==='price-desc') list.sort(function(a,b){return b.price-a.price}); 
          if(val==='rating') list.sort(function(a,b){return b.rating-a.rating}); 
          renderProductGrid(list); 
        }); 
      }

      // Price & rating filters
      document.getElementById('ratingFilter')?.addEventListener('change', applyFilters);

      var params = new URLSearchParams(location.search); 
      if(params.get('search')){ 
        var q = params.get('search').toLowerCase(); 
        renderProductGrid(products.filter(function(p){ 
          return p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) 
        })); 
      } else renderProductGrid(products);
    }

    if(document.getElementById('productPage')){ 
      var params = new URLSearchParams(location.search); 
      var id = params.get('id'); 
      if(id) renderProductPage(id); 
    }

    if(document.getElementById('cartItems')){ 
      renderCartPage(); 
    }

    // Dark mode toggle
    document.getElementById('darkModeToggle')?.addEventListener('click', function(){
      document.body.classList.toggle('dark-mode');
      localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    });

    // Enter key for search
    document.getElementById('searchInput')?.addEventListener('keypress', function(e){
      if(e.key === 'Enter'){
        applyFilters();
      }
    });
  });
})();
// Add this helper function near the top
function showToast(message) {
  let toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerText = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('show');
  }, 100);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}



// Add this near the top with other window functions
window.addToCartWithQty = function(id) {
  var qty = parseInt(document.getElementById('quantity')?.value) || 1;
  var cart = getCart();
  var found = cart.find(x => x.id === id);
  if(found) found.qty += qty;
  else cart.push({id: id, qty: qty});
  setCart(cart);
  showToast('✅ Added to cart');
};
