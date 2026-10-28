/* Vista previa Opción F. No modifica el catálogo de /rapido/. */
(function(){
var CATS=window.TF_CATS||[];
var PRODUCTS=window.TF_PRODUCTS||[];
var BY={};
var CATN={};
CATS.forEach(function(c){CATN[c.id]=c.n});
function N(s){return String(s==null?'':s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
function E(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function F(n){n=Number(n)||0;return '$'+n.toLocaleString('es-MX',{minimumFractionDigits:n%1?2:0,maximumFractionDigits:2})}
PRODUCTS.forEach(function(p){
  var cat=CATN[p.cat]||'';
  p._q=N(p.n+' '+cat+' '+p.cat+' '+(p.emo||''));
  BY[p.id]=p;
});
var $=function(s){return document.querySelector(s)};
var state={q:'',cat:''};
var cart={};
var LIKES={};
try{var saved=JSON.parse(localStorage.getItem('tf_likes')||'{}');if(saved&&typeof saved==='object'&&!Array.isArray(saved))LIKES=saved}catch(e){}
function saveLikes(){try{localStorage.setItem('tf_likes',JSON.stringify(LIKES))}catch(e){}}

function qty(id){return cart[id]||0}
function count(){var n=0;Object.keys(cart).forEach(function(id){n+=cart[id]});return n}
function subtotal(){var n=0;Object.keys(cart).forEach(function(id){if(BY[id])n+=BY[id].p*cart[id]});return Math.round(n*100)/100}

function heart(p){
  var on=!!LIKES[p.id];
  return '<button type="button" class="like'+(on?' on':'')+'" data-like="'+p.id+'" aria-pressed="'+(on?'true':'false')+'" aria-label="Me gusta"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg></button>';
}
function pic(p){
  if(p.img)return '<div class="pi"><img alt="" src="../'+E(p.img)+'" decoding="async"></div>';
  var col=(CATS.filter(function(c){return c.id===p.cat})[0]||{}).c||'#E30613';
  return '<div class="pi emo" style="--k:'+col+'">'+(p.emo||'🛍️')+'</div>';
}
function ctl(p){
  var q=qty(p.id);
  if(q)return '<div class="step" role="group" aria-label="Cantidad"><button type="button" data-dec="'+p.id+'" aria-label="Quitar uno">−</button><b>'+q+'</b><button type="button" data-inc="'+p.id+'" aria-label="Agregar uno">+</button></div>';
  return '<button type="button" class="addb" data-add="'+p.id+'">Agregar</button>';
}
function card(p){
  return '<article class="pc" data-card="'+p.id+'">'+heart(p)+pic(p)+'<div class="pb"><h3 class="pn">'+E(p.n)+'</h3><div class="pp">'+F(p.p)+'</div><div class="ctl">'+ctl(p)+'</div></div></article>';
}
function rail(title,list){
  if(!list.length)return '';
  return '<section class="sec"><div class="sec-h"><h2>'+E(title)+'</h2></div><div class="rail">'+list.map(card).join('')+'</div></section>';
}

function filtered(){
  var words=N(state.q).split(/\s+/).filter(Boolean);
  return PRODUCTS.filter(function(p){
    if(state.cat&&p.cat!==state.cat)return false;
    return words.every(function(w){return p._q.indexOf(w)>=0});
  });
}
function titleOf(){
  if(state.q&&state.cat)return '“'+state.q.trim()+'” en '+(CATN[state.cat]||'');
  if(state.q)return 'Resultados de “'+state.q.trim()+'”';
  return CATN[state.cat]||'Productos';
}
function renderStories(){
  $('#stories').innerHTML=CATS.map(function(c){
    var on=state.cat===c.id;
    return '<button type="button" class="story'+(on?' on':'')+'" data-cat="'+c.id+'" aria-pressed="'+(on?'true':'false')+'"><span class="bubble" style="--c:'+c.c+'">'+c.emo+'</span><span class="sl">'+E(c.n)+'</span></button>';
  }).join('');
}
function paintStories(){
  var nodes=$('#stories').querySelectorAll('.story');
  [].forEach.call(nodes,function(b){
    var on=b.getAttribute('data-cat')===state.cat;
    b.classList.toggle('on',on);
    b.setAttribute('aria-pressed',on?'true':'false');
  });
}
function renderMain(){
  var main=$('#productos');
  var browsing=!state.q&&!state.cat;
  if(browsing){
    var hoy=PRODUCTS.filter(function(p){return p.hoy});
    var aba=PRODUCTS.filter(function(p){return p.cat==='abarrotes'});
    main.innerHTML=rail('Para hoy',hoy)+rail('Abarrotes',aba);
    return;
  }
  var list=filtered();
  var head='<div class="sec-h"><h2>'+E(titleOf())+'</h2>'+(state.cat?'<button type="button" data-clear>Ver todo</button>':'')+'</div>';
  var note=state.cat==='frutas'&&!state.q?'<p class="note">Fruta fresca ilustrada, solo en esta vista previa.</p>':'';
  if(!list.length){
    main.innerHTML=head+note+'<div class="empty"><b>No encontramos productos</b><p>Prueba con otra palabra o quita el filtro.</p>'+(state.cat||state.q?'<button type="button" data-reset>Ver catálogo</button>':'')+'</div>';
    return;
  }
  main.innerHTML=head+note+'<div class="grid">'+list.map(card).join('')+'</div>';
}
function paintQty(id){
  var html=ctl(BY[id]);
  document.querySelectorAll('.pc').forEach(function(el){
    if(el.getAttribute('data-card')!==id)return;
    var slot=el.querySelector('.ctl');
    if(slot)slot.innerHTML=html;
  });
}
function paintLike(id){
  var on=!!LIKES[id];
  document.querySelectorAll('[data-like="'+id+'"]').forEach(function(b){
    b.classList.toggle('on',on);
    b.setAttribute('aria-pressed',on?'true':'false');
  });
}
function paintBar(){
  var n=count();
  var bar=$('#cbar');
  document.body.classList.toggle('hasbar',n>0);
  if(!n){bar.hidden=true;return}
  var was=bar.hidden;
  bar.hidden=false;
  $('#cbadge').textContent=String(n);
  $('#ctot').textContent=F(subtotal());
  if(was){bar.classList.remove('bump');void bar.offsetWidth;bar.classList.add('bump')}
}
var toastT;
function toast(msg){
  var el=$('#toast');
  el.textContent=msg;
  el.hidden=false;
  clearTimeout(toastT);
  toastT=setTimeout(function(){el.hidden=true},1600);
}
function thumb(p){
  if(p.img)return '<div class="thumb"><img alt="" src="../'+E(p.img)+'"></div>';
  return '<div class="thumb">'+(p.emo||'🛍️')+'</div>';
}
function paintSheet(){
  var ids=Object.keys(cart).filter(function(id){return cart[id]>0&&BY[id]});
  $('#lines').innerHTML=ids.map(function(id){
    var p=BY[id],q=cart[id];
    return '<div class="line">'+thumb(p)+'<div><p class="ln">'+E(p.n)+'</p><p class="lp">'+F(p.p*q)+'</p></div><div class="step"><button type="button" data-dec="'+id+'" aria-label="Quitar uno">−</button><b>'+q+'</b><button type="button" data-inc="'+id+'" aria-label="Agregar uno">+</button></div></div>';
  }).join('');
  var t=subtotal();
  $('#sub').textContent=F(t);
  $('#grand').textContent=F(t);
}
function openSheet(){
  if(!count())return;
  $('#toast').hidden=true;
  paintSheet();
  $('#ov').hidden=false;
  $('#sheet').hidden=false;
  document.body.classList.add('sheet-open');
  $('#x').focus();
}
function closeSheet(){
  $('#ov').hidden=true;
  $('#sheet').hidden=true;
  document.body.classList.remove('sheet-open');
}
function setQty(id,q){
  if(!BY[id])return;
  if(q<=0)delete cart[id];
  else cart[id]=q;
  paintQty(id);
  paintBar();
  if(!$('#sheet').hidden){
    if(!count())closeSheet();
    else paintSheet();
  }
}
function scrollUnderHeader(el){
  var sticky=document.querySelector('.sticky').getBoundingClientRect().height;
  var y=el.getBoundingClientRect().top+window.scrollY-sticky-4;
  window.scrollTo({top:Math.max(0,y),behavior:'smooth'});
}
function centerStory(){
  var btn=document.querySelector('.story.on');
  var sc=$('#stories');
  if(!btn||!sc)return;
  var left=btn.offsetLeft-(sc.clientWidth-btn.offsetWidth)/2;
  sc.scrollTo({left:Math.max(0,left),behavior:'smooth'});
}
function focusProducts(){
  var el=$('#productos');
  el.classList.remove('pulse');
  void el.offsetWidth;
  el.classList.add('pulse');
  el.focus({preventScroll:true});
  scrollUnderHeader(el);
  setTimeout(function(){el.classList.remove('pulse')},1200);
}
function resetRails(){
  var sc=$('#stories');
  if(sc)sc.scrollTo({left:0,behavior:'smooth'});
}
function goHome(){
  state.cat='';
  state.q='';
  var q=$('#q');
  q.value='';
  $('#qx').hidden=true;
  paintStories();
  resetRails();
  renderMain();
}

renderStories();
renderMain();
paintBar();

$('#q').addEventListener('input',function(){
  state.q=this.value;
  $('#qx').hidden=!state.q;
  renderMain();
});
$('#qx').addEventListener('click',function(){
  state.q='';
  $('#q').value='';
  this.hidden=true;
  renderMain();
  $('#q').focus();
});
$('#home').addEventListener('click',function(e){
  e.preventDefault();
  goHome();
  window.scrollTo({top:0,behavior:'smooth'});
});
$('#cta').addEventListener('click',focusProducts);
$('#cbar').addEventListener('click',openSheet);
$('#x').addEventListener('click',closeSheet);
$('#keep').addEventListener('click',closeSheet);
$('#ov').addEventListener('click',closeSheet);
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeSheet()});

document.body.addEventListener('click',function(e){
  var t=e.target.closest('[data-cat],[data-add],[data-inc],[data-dec],[data-like],[data-clear],[data-reset]');
  if(!t)return;
  if(t.hasAttribute('data-cat')){
    var id=t.getAttribute('data-cat');
    state.cat=state.cat===id?'':id;
    paintStories();
    renderMain();
    if(state.cat){centerStory();scrollUnderHeader($('#stories'));}
    return;
  }
  if(t.hasAttribute('data-clear')||t.hasAttribute('data-reset')){
    state.cat='';
    if(t.hasAttribute('data-reset')){state.q='';$('#q').value='';$('#qx').hidden=true}
    paintStories();
    resetRails();
    renderMain();
    return;
  }
  if(t.hasAttribute('data-like')){
    var lid=t.getAttribute('data-like');
    if(LIKES[lid])delete LIKES[lid];else LIKES[lid]=1;
    saveLikes();
    paintLike(lid);
    toast(LIKES[lid]?'Guardado en Me gusta':'Quitado de Me gusta');
    return;
  }
  var add=t.getAttribute('data-add');
  if(add){setQty(add,qty(add)+1);toast('Agregado al pedido');return}
  var inc=t.getAttribute('data-inc');
  if(inc){setQty(inc,qty(inc)+1);return}
  var dec=t.getAttribute('data-dec');
  if(dec){setQty(dec,qty(dec)-1)}
});
})();
