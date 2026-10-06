const K='mitti_store_v2';
const seed=()=>({users:[{u:'user',p:'user123'}],admin:{u:'admin',p:'admin123'},orders:[],products:[{id:1,n:"Terracotta water jug (matka)",e:"🏺",p:799,c:"Pots",s:12},{id:2,n:"Hand-thrown tea cup set of 4",e:"🍵",p:649,c:"Tableware",s:25},{id:3,n:"Glazed ceramic dinner bowl",e:"🥣",p:399,c:"Tableware",s:18},{id:4,n:"Clay planter with saucer",e:"🪴",p:549,c:"Planters",s:20},{id:5,n:"Hanging terracotta planter",e:"🌿",p:449,c:"Planters",s:15},{id:6,n:"Painted clay diya set of 12",e:"🪔",p:299,c:"Decor",s:50},{id:7,n:"Ganesh clay idol, 8 inch",e:"🗿",p:899,c:"Decor",s:10},{id:8,n:"Clay cooking handi with lid",e:"🍲",p:699,c:"Pots",s:14},{id:9,n:"Terracotta wind chime",e:"🔔",p:349,c:"Decor",s:22},{id:10,n:"Kulhad (clay cups) pack of 20",e:"☕",p:249,c:"Tableware",s:60}]});
let db;try{db=JSON.parse(localStorage.getItem(K))}catch(e){}
if(!db||!db.products)db=seed();
const save=()=>{try{localStorage.setItem(K,JSON.stringify(db))}catch(e){}};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const inr=n=>'₹'+Number(n).toLocaleString('en-IN');
let S={cat:'All',view:'userLogin',me:null,cart:{},pay:'upi',err:'',last:null,addr:''};
const $=id=>document.getElementById(id);
const total=()=>Object.entries(S.cart).reduce((t,[id,q])=>t+db.products.find(p=>p.id==id).p*q,0);
const count=()=>Object.values(S.cart).reduce((a,b)=>a+b,0);
function go(v){S.view=v;S.err='';render();window.scrollTo(0,0)}
function logout(){S={cat:'All',view:S.me&&S.me.role==='admin'?'adminLogin':'userLogin',me:null,cart:{},pay:'upi',err:'',last:null,addr:''};render()}

function header(){
  let h='<span class="brand" onclick="go(S.me?(S.me.role===\'admin\'?\'admin\':\'shop\'):\'userLogin\')">🏺 Mitti Clay Co.</span>';
  if(S.me&&S.me.role==='user')h+=`<button onclick="go('shop')">Shop</button><button onclick="go('orders')">My orders</button><button class="pri" onclick="go('cart')">Cart (${count()})</button>`;
  if(S.me)h+=`<span class="mute">${esc(S.me.name)}</span><button onclick="logout()">Log out</button>`;
  $('hd').innerHTML=h;
}

function render(){
  header();
  const v=S.view,a=$('app');
  const admin=S.me&&S.me.role==='admin',user=S.me&&S.me.role==='user';
  if(['shop','cart','checkout','success','orders'].includes(v)&&!user)S.view='userLogin';
  if(v==='admin'&&!admin)S.view='adminLogin';
  a.innerHTML=({userLogin:()=>login('user'),adminLogin:()=>login('admin'),shop,cart,checkout,success,orders,admin:adminView})[S.view]();
  if(S.view==='checkout'&&S.pay==='upi')drawQR();
}

function login(role){
  const isA=role==='admin';
  return `<div class="card auth ${role}"><h2>${isA?'Admin login':'Customer login'}</h2>
  <p class="mute">${isA?'Manage products and orders.':'Sign in to shop and pay online.'}</p>
  <label for="u">Username</label><input id="u" autocomplete="username">
  <label for="p">Password</label><input id="p" type="password" autocomplete="current-password" onkeydown="if(event.key==='Enter')doLogin('${role}')">
  <p class="err" role="alert">${esc(S.err)}</p>
  <button class="pri" style="width:100%" onclick="doLogin('${role}')">Log in</button>
  ${isA?'':'<button style="width:100%;margin-top:.5rem" onclick="doRegister()">Create account with these details</button>'}
  <p class="mute">Demo ${isA?'admin: admin / admin123':'user: user / user123'}</p>
  <p><a href="#" onclick="go('${isA?'userLogin':'adminLogin'}');return false">${isA?'Customer login page':'Admin login page'}</a></p></div>`;
}
function doLogin(role){
  const u=$('u').value.trim(),p=$('p').value;
  if(role==='admin'){
    if(u===db.admin.u&&p===db.admin.p){S.me={name:'Admin',role:'admin'};go('admin')}else{S.err='Wrong admin username or password.';render()}
  }else{
    const f=db.users.find(x=>x.u===u&&x.p===p);
    if(f){S.me={name:f.u,role:'user'};go('shop')}else{S.err='Wrong username or password. Create an account if you are new.';render()}
  }
}
function doRegister(){
  const u=$('u').value.trim(),p=$('p').value;
  if(u.length<3||p.length<4){S.err='Use a username of 3+ characters and a password of 4+ characters.';return render()}
  if(db.users.some(x=>x.u===u)){S.err='That username is taken.';return render()}
  db.users.push({u,p});save();S.me={name:u,role:'user'};go('shop');
}

function shop(){
  const cats=['All',...new Set(db.products.map(p=>p.c).filter(Boolean))];
  const list=db.products.filter(p=>S.cat==='All'||p.c===S.cat);
  return `<div class="card" style="background:var(--acc);color:#fff;border:0;margin-bottom:1rem"><h1 style="font-size:1.9rem;margin:0">Fired by hand, made to be used</h1>
  <p style="margin:.4rem 0 0">Pots, planters, tableware and festival decor from village kilns. Pay by UPI QR or card.</p></div>
  <div class="tabs" role="group" aria-label="Category">${cats.map(c=>`<button class="${S.cat===c?'on':''}" onclick="S.cat='${c}';render()">${c}</button>`).join('')}</div>
  <div class="grid">${list.map(p=>`<div class="card prod"><div class="pic" aria-hidden="true">${esc(p.e)}</div>
  <h3 style="margin-top:.6rem;font-size:1.05rem">${esc(p.n)}</h3><div class="mute">${esc(p.c||'')}</div><div class="price">${inr(p.p)}</div>
  <div class="mute">${p.s>0?p.s+' in stock':'Out of stock'}</div>
  <button class="pri" style="margin-top:.5rem" ${p.s>0?'':'disabled'} onclick="add(${p.id})">Add to cart</button></div>`).join('')}</div>`;
}
function add(id){const p=db.products.find(x=>x.id===id);if((S.cart[id]||0)<p.s)S.cart[id]=(S.cart[id]||0)+1;render()}
function qty(id,d){const p=db.products.find(x=>x.id==id);const q=(S.cart[id]||0)+d;if(q<=0)delete S.cart[id];else if(q<=p.s)S.cart[id]=q;render()}

function cart(){
  if(!count())return `<div class="card"><h2>Your cart is empty</h2><button class="pri" onclick="go('shop')">Browse products</button></div>`;
  return `<h2>Cart</h2><div class="card">${Object.entries(S.cart).map(([id,q])=>{const p=db.products.find(x=>x.id==id);
  return `<div class="row"><span>${esc(p.e)} ${esc(p.n)}<br><span class="mute">${inr(p.p)} each</span></span>
  <span><button aria-label="Fewer" onclick="qty(${id},-1)">−</button> ${q} <button aria-label="More" onclick="qty(${id},1)">+</button></span><b>${inr(p.p*q)}</b></div>`}).join('')}
  <div class="row"><b>Total</b><b>${inr(total())}</b></div><button class="pri" onclick="go('checkout')">Go to payment</button></div>`;
}

function checkout(){
  if(!count())return cart();
  const upi=S.pay==='upi';
  return `<h2>Payment</h2><div class="two" style="align-items:start"><div class="card"><h3>Delivery</h3>
  <label for="ad">Full name and address</label><input id="ad" value="${esc(S.addr)}" oninput="S.addr=this.value" placeholder="Name, street, city, PIN">
  <h3 style="margin-top:1.2rem">Order total: ${inr(total())}</h3><p class="mute">${count()} item(s)</p></div>
  <div class="card"><div class="tabs" role="tablist"><button class="${upi?'on':''}" onclick="S.pay='upi';render()">Scan &amp; pay (UPI)</button>
  <button class="${upi?'':'on'}" onclick="S.pay='card';render()">Debit / credit card</button></div>
  ${upi?`<p class="mute">Scan with any UPI app (GPay, PhonePe, Paytm), pay ${inr(total())}, then confirm.</p><div class="qr" id="qr"></div>
  <p class="mute" style="text-align:center">mitticlay@upi</p><p class="err" role="alert">${esc(S.err)}</p>
  <button class="pri" style="width:100%" onclick="pay('UPI QR')">I have paid</button>`
  :`<label for="cn">Card number</label><input id="cn" inputmode="numeric" maxlength="19" placeholder="4242 4242 4242 4242" oninput="this.value=this.value.replace(/\\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim()">
  <label for="nm">Name on card</label><input id="nm" autocomplete="cc-name">
  <div class="two"><div><label for="ex">Expiry (MM/YY)</label><input id="ex" maxlength="5" placeholder="08/29" oninput="let d=this.value.replace(/\\D/g,'').slice(0,4);this.value=d.length>2?d.slice(0,2)+'/'+d.slice(2):d"></div>
  <div><label for="cv">CVV</label><input id="cv" type="password" inputmode="numeric" maxlength="4"></div></div>
  <p class="err" role="alert">${esc(S.err)}</p><button class="pri" style="width:100%" onclick="payCard()">Pay ${inr(total())}</button>
  <p class="mute">Demo only: no card data is sent or saved. Use any Luhn-valid number, e.g. 4242 4242 4242 4242.</p>`}</div></div>`;
}
function drawQR(){
  const el=$('qr');if(!el)return;
  const link=`upi://pay?pa=mitticlay@upi&pn=Clay%20and%20Chai&am=${total()}&cu=INR`;
  try{new QRCode(el,{text:link,width:170,height:170})}catch(e){el.textContent='QR unavailable: pay to mitticlay@upi'}
}
const luhn=n=>{let s=0,d=false;for(let i=n.length-1;i>=0;i--){let x=+n[i];if(d){x*=2;if(x>9)x-=9}s+=x;d=!d}return s%10===0};
function payCard(){
  const n=$('cn').value.replace(/\s/g,''),nm=$('nm').value.trim(),ex=$('ex').value,cv=$('cv').value;
  const m=/^(\d\d)\/(\d\d)$/.exec(ex);const now=new Date();
  let e='';
  if(n.length<13||!luhn(n))e='Enter a valid card number.';
  else if(!nm)e='Enter the name on the card.';
  else if(!m||+m[1]<1||+m[1]>12||new Date(2000+ +m[2],+m[1],0,23,59)<now)e='Enter a valid, unexpired date.';
  else if(!/^\d{3,4}$/.test(cv))e='Enter the 3 or 4 digit CVV.';
  if(e){S.err=e;const keep=[n,nm,ex];render();return}
  pay('Card ending '+n.slice(-4));
}
function pay(method){
  if(!S.addr.trim()){S.err='Add your delivery address first.';return render()}
  document.querySelectorAll('#app button').forEach(b=>{b.disabled=true;b.textContent='Processing payment…'});
  setTimeout(()=>{
    const items=Object.entries(S.cart).map(([id,q])=>{const p=db.products.find(x=>x.id==id);p.s-=q;return{n:p.n,e:p.e,q,p:p.p}});
    const o={id:'CC'+Date.now().toString().slice(-7),user:S.me.name,items,total:total(),method,addr:S.addr.trim(),status:'Placed',at:new Date().toLocaleString('en-IN')};
    db.orders.unshift(o);save();S.last=o;S.cart={};go('success');
  },1200);
}
function success(){
  const o=S.last;if(!o)return shop();
  return `<div class="card done"><div class="tick" aria-hidden="true">✓</div><h2>Order placed</h2>
  <p>Payment received via ${esc(o.method)}. Order <b>${o.id}</b> is confirmed.</p>
  ${o.items.map(i=>`<div class="row"><span>${esc(i.e)} ${esc(i.n)} × ${i.q}</span><b>${inr(i.p*i.q)}</b></div>`).join('')}
  <div class="row"><b>Total paid</b><b>${inr(o.total)}</b></div><p class="mute">Delivering to: ${esc(o.addr)}</p>
  <button class="pri" onclick="go('shop')">Keep shopping</button> <button onclick="go('orders')">View my orders</button></div>`;
}
function orders(){
  const mine=db.orders.filter(o=>o.user===S.me.name);
  if(!mine.length)return `<div class="card"><h2>No orders yet</h2><button class="pri" onclick="go('shop')">Browse products</button></div>`;
  return `<h2>My orders</h2>${mine.map(o=>`<div class="card" style="margin-bottom:.8rem"><div class="row"><b>${o.id}</b><span class="tag">${esc(o.status)}</span></div>
  <div class="mute">${o.at} · ${esc(o.method)}</div>${o.items.map(i=>`<div>${esc(i.e)} ${esc(i.n)} × ${i.q}</div>`).join('')}<b>${inr(o.total)}</b></div>`).join('')}`;
}

function adminView(){
  const rev=db.orders.reduce((t,o)=>t+o.total,0);
  return `<h2>Admin dashboard</h2><div class="stats"><div class="card"><b>${db.orders.length}</b>Orders</div><div class="card"><b>${inr(rev)}</b>Revenue</div><div class="card"><b>${db.products.length}</b>Products</div></div>
  <div class="card scroll" style="margin-bottom:1rem"><h3>Orders</h3>${db.orders.length?`<table><tr><th>ID</th><th>Customer</th><th>Total</th><th>Paid by</th><th>Status</th></tr>
  ${db.orders.map(o=>`<tr><td>${o.id}</td><td>${esc(o.user)}</td><td>${inr(o.total)}</td><td>${esc(o.method)}</td><td><select aria-label="Status for ${o.id}" onchange="setStatus('${o.id}',this.value)">
  ${['Placed','Packed','Shipped','Delivered'].map(s=>`<option ${s===o.status?'selected':''}>${s}</option>`).join('')}</select></td></tr>`).join('')}</table>`:'<p class="mute">No orders yet. They appear here when customers pay.</p>'}</div>
  <div class="card"><h3>Products</h3>${db.products.map(p=>`<div class="row"><span>${esc(p.e)} ${esc(p.n)} · ${esc(p.c||'')} · ${inr(p.p)} · ${p.s} in stock</span><button class="danger" onclick="delProd(${p.id})">Delete</button></div>`).join('')}
  <h3 style="margin-top:1rem">Add product</h3><div class="two"><div><label for="pn">Name</label><input id="pn"></div><div><label for="pe">Emoji</label><input id="pe" value="📦"></div>
  <div><label for="pc">Category</label><input id="pc" value="Pots"></div><div><label for="pp">Price (₹)</label><input id="pp" type="number" min="1"></div><div><label for="ps">Stock</label><input id="ps" type="number" min="0" value="10"></div></div>
  <p class="err" role="alert">${esc(S.err)}</p><button class="pri" onclick="addProd()">Add product</button></div>`;
}
function setStatus(id,s){db.orders.find(o=>o.id===id).status=s;save()}
function delProd(id){db.products=db.products.filter(p=>p.id!==id);save();render()}
function addProd(){
  const n=$('pn').value.trim(),p=+$('pp').value,s=+$('ps').value;
  if(!n||!(p>0)||s<0){S.err='Enter a name, a price above 0, and a stock count.';return render()}
  db.products.push({id:Date.now(),n,e:$('pe').value||'🏺',c:$('pc').value.trim()||'Other',p,s});save();S.err='';render();
}
render();