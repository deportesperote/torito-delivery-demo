/* Torito Delivery — tienda única (súper + deportes). Vista previa. */
(function(){
var WA='520000000000'; // EJEMPLO: número de WhatsApp pendiente (placeholder, no real)
var $=function(s){return document.querySelector(s)};
function E(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function F(n){return '$'+n.toLocaleString('es-MX',{minimumFractionDigits:n%1?2:0,maximumFractionDigits:2})}
function N(s){return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
var EMO={'Deportes':'🏆','Bebidas':'🥤','Cerveza':'🍺','Vinos y Licores':'🍷','Cigarros':'🚬','Dulces y Chocolates':'🍬','Botanas':'🍿','Galletas':'🍪','Pan y Pastelitos':'🍞','Lácteos y Huevo':'🥛','Carnes frías y Salchichonería':'🥓','Congelados y Helados':'🍦','Despensa':'🥫','Limpieza del Hogar':'🧽','Cuidado Personal':'🧴','Farmacia y Salud':'💊','Bebés':'👶','Mascotas':'🐶','Desechables y Fiesta':'🎉','Hogar y Ferretería':'🔧','Papelería':'✏️','Otros':'🛍️'};
var COL={'Deportes':'#1D4ED8','Bebidas':'#0EA5E9','Cerveza':'#CA8A04','Vinos y Licores':'#7F1D1D','Cigarros':'#374151','Dulces y Chocolates':'#EC4899','Botanas':'#F59E0B','Galletas':'#B45309','Pan y Pastelitos':'#C2410C','Lácteos y Huevo':'#3B82F6','Carnes frías y Salchichonería':'#DC2626','Congelados y Helados':'#06B6D4','Despensa':'#D97706','Limpieza del Hogar':'#14B8A6','Cuidado Personal':'#8B5CF6','Farmacia y Salud':'#16A34A','Bebés':'#F472B6','Mascotas':'#A16207','Desechables y Fiesta':'#F97316','Hogar y Ferretería':'#64748B','Papelería':'#6366F1','Otros':'#6B7280'};
var SEMO={'Fútbol':'⚽','Básquetbol':'🏀','Voleibol':'🏐','Uniformes y textiles':'👕','Fútbol americano':'🏈','Béisbol':'⚾','Raqueta':'🎾','Handball y waterpolo':'🤾','Entrenamiento':'⏱️','Gimnasio':'🏋️','Cuidado y soporte':'🩹','Boxeo':'🥊','Natación':'🏊','Trofeos y medallas':'🏅','Accesorios':'🎒','Calzado':'👟','Zapateras':'👞','Mochilas y maletas':'🎒','Guantes Rinat':'🧤'};
// ---- entrega: un tipo por pedido ----
var ENT={exp:{l:'⚡ Express 15 min',d:'hasta 3 km',m:15},est:{l:'🕒 Estándar 6 horas',d:'hasta 8 km',m:360}};
var H_OPEN=7*60,H_CLOSE=22*60;
function mxNow(){var d=window.DP_NOW?new Date(window.DP_NOW):new Date(),p={};new Intl.DateTimeFormat('en-US',{timeZone:'America/Mexico_City',hour12:false,hour:'2-digit',minute:'2-digit'}).formatToParts(d).forEach(function(x){p[x.type]=x.value});return (+p.hour%24)*60+(+p.minute)}
function hh(m){return ('0'+Math.floor(m/60)).slice(-2)+':'+('0'+m%60).slice(-2)}
function eta(k){var cur=mxNow(),day=0,f=cur<H_OPEN||cur>=H_CLOSE,dur=ENT[k].m;if(cur<H_OPEN)cur=H_OPEN;else if(cur>=H_CLOSE){cur=H_OPEN;day=1}while(cur+dur>H_CLOSE){dur-=H_CLOSE-cur;cur=H_OPEN;day++}cur+=dur;return {fuera:f,txt:(day===0?'hoy':day===1?'mañana':'en '+day+' días')+' a las '+hh(cur)}}
function etaHtml(e){return (e.fuera?'<div class="ofh">🌙 <b>Pediste fuera de horario:</b> tu pedido se procesa a partir de las 7:00 h.</div>':'')+'<div class="eta">⏱️ Llega aprox. '+e.txt+'</div>'}
var HNOTE='Tiempos de entrega válidos en pedidos dentro del horario de 7:00 a 22:00 h';
// ---- catálogo unificado ----
var ALL=[],BY={},DEP={};
(window.PRODUCTS||[]).forEach(function(p){var n=parseInt(p.id.replace(/\D/g,''),10)||0;var it={id:'d'+p.id,n:p.n,p:p.p,iva:!!p.iva,img:p.img,dep:'Deportes',cat:p.c,sub:p.s,k:p.k[0]||'',t:p.t,a:true,x:false,exp:n%2===1};it._q=N(p.n+' '+p.c+' '+p.s+' '+p.k.join(' ')+' deportes');ALL.push(it)});
function addT(T){T.forEach(function(p){var it={id:'t'+p.id,n:p.t,p:p.p,iva:false,img:p.i||'',dep:p.c,cat:p.c,sub:p.s,k:'',t:[],a:p.a,x:p.x,exp:true};it._q=N(p.t+' '+p.c+' '+p.s);ALL.push(it)})}
function index(){BY={};DEP={};ALL.forEach(function(i){BY[i.id]=i;DEP[i.dep]=(DEP[i.dep]||0)+1})}
// ---- estado ----
var S={view:'home',dep:'',cat:'',q:'',lim:60},cart=[],cli={nombre:'',tel:'',ent:'',modo:'envio',dir:'',ref:'',pago:'efectivo',edad:false},STEP=1,LAST=null;
try{cart=JSON.parse(localStorage.getItem('td_cart')||'[]')}catch(e){}try{cli=Object.assign(cli,JSON.parse(localStorage.getItem('td_cli')||'{}'))}catch(e){}
function save(){try{localStorage.setItem('td_cart',JSON.stringify(cart));localStorage.setItem('td_cli',JSON.stringify(cli))}catch(e){}fab()}
function L(){return cart.filter(function(i){return BY[i.id]})}
function total(){return L().reduce(function(a,i){return a+BY[i.id].p*i.qty},0)}
function adult(){return L().some(function(i){return BY[i.id].x})}
function canExp(){return L().every(function(i){return BY[i.id].exp})}
function iva(){return L().some(function(i){return BY[i.id].iva})}
// ---- tarjetas ----
function big(src){return /^img\/p\/p\d+\.webp$/.test(src||'')?src.replace(/\.webp$/,'-900.webp'):src}
function media(i,cls){return i.img?'<div class="ph img '+(cls||'')+'"><img loading="lazy" alt="'+E(i.n)+'" src="'+i.img+'"></div>':'<div class="ph emo '+(cls||'')+'" style="--k:'+(COL[i.dep]||'#666')+'"><span>'+(EMO[i.dep]||'🛍️')+'</span><em>'+E(i.dep)+'</em></div>'}
function badge(i){return '<span class="eb '+(i.exp?'e1':'e2')+'">'+(i.exp?'⚡ Envío Express 15 min':'🕒 Entrega en 6 h')+'</span>'}
function card(i){return '<article class="card'+(i.a?'':' na')+'" data-open="'+i.id+'">'+media(i)+(i.x?'<i class="b18">+18</i>':'')+'<div class="bd"><h3>'+E(i.n)+'</h3>'+badge(i)+'<div class="pr"><b>'+F(i.p)+'</b>'+(i.iva?'<span class="iva">+ IVA</span>':'')+(i.a?'<button class="add" data-add="'+i.id+'" aria-label="Agregar al carrito">+</button>':'<em>Agotado</em>')+'</div></div></article>'}
function grid(a){return '<div class="grid">'+a.map(card).join('')+'</div>'}
function depList(){return Object.keys(DEP).sort(function(a,b){return (b==='Deportes')-(a==='Deportes')||(a==='Otros')-(b==='Otros')||DEP[b]-DEP[a]})}
var TABS=[['parati','Para ti'],['ofertas','⚡ Ofertas'],['dep:Deportes','🏆 Deportes'],['dep:Bebidas','🥤 Bebidas'],['super','🛒 Súper'],['dep:Cerveza','🍺 Cerveza'],['dep:Vinos y Licores','🍷 Vinos'],['dep:Botanas','🍿 Botanas'],['dep:Lácteos y Huevo','🥛 Lácteos']];
function tabsBar(){var cur=S.view==='list'?(S.dep?'dep:'+S.dep:''):S.tab||'parati';$('#tabs').innerHTML=TABS.map(function(t){return '<button class="pill'+(t[0]===cur?' on':'')+'" data-tab="'+t[0]+'">'+t[1]+'</button>'}).join('');$('#tabs').hidden=S.view==='feed'}
// mezcla estable: deportes con foto + súper
function mix(n,seed){var d=ALL.filter(function(i){return i.dep==='Deportes'&&i.img&&i.a}),g=ALL.filter(function(i){return i.dep!=='Deportes'&&i.a&&i.dep!=='Otros'}),r=[],a=seed||1;for(var k=0;r.length<n&&k<n*3;k++){var src=k%3===2?g:d;if(!src.length)continue;a=(a*9301+49297)%233280;r.push(src[a%src.length])}return r.filter(function(x,ix){return r.indexOf(x)===ix})}
function flashPicks(){return ALL.filter(function(i){return i.a&&!i.x&&i.dep!=='Otros'&&(i.img?i.p<=200:i.p<=15)}).filter(function(_,j){return j%11===0}).slice(0,24)}
function countdown(){var m=mxNow(),end=m<H_CLOSE&&m>=H_OPEN?H_CLOSE:null;if(!end)return '<b class="cd off">Vuelve a las 7:00</b>';var left=(end-m)*60-(new Date().getSeconds());var h=Math.floor(left/3600),mi=Math.floor(left%3600/60),se=left%60;return '<b class="cd" id="cd">'+[h,mi,se].map(function(x){return '<i>'+('0'+x).slice(-2)+'</i>'}).join(':')+'</b>'}
function flashStrip(full){var p=flashPicks();return '<section class="flash"><div class="fh"><b>⚡ Ofertas relámpago</b><span>Termina en '+countdown()+'</span>'+(full?'':'<button data-tab="ofertas">Ver todo ›</button>')+'</div><p class="fx">Selección del día a precio normal de catálogo · precios de ejemplo, sin descuento real</p>'+(full?grid(p):'<div class="hs">'+p.slice(0,10).map(function(i){return '<div class="fc" data-open="'+i.id+'">'+media(i,'sm')+'<b>'+F(i.p)+'</b>'+badge(i)+'</div>'}).join('')+'</div>')+'</section>'}
function home(){return '<section class="hero"><div><span class="tag">TORITO DELIVERY</span><h1>Súper + Deportes<br>a tu puerta</h1><p>⚡ Express 15 min · 🕒 6 h · 7:00–22:00</p></div><div class="hi"><img alt="" src="img/p/p1409-900.webp"><img alt="" src="img/p/p0133-900.webp"></div></section>'+flashStrip(false)+'<h2 class="st">✨ Para ti</h2>'+grid(mix(40,7))}
function cats(){return '<h2 class="st">Categorías</h2><div class="tiles">'+depList().map(function(d){return '<button class="tile" data-dep="'+E(d)+'" style="--k:'+(COL[d]||'#666')+'"><span>'+(EMO[d]||'🛍️')+'</span><b>'+E(d)+'</b><small>'+DEP[d]+'</small></button>'}).join('')+'</div>'}
function superV(){return '<h2 class="st">🛒 Súper</h2><div class="tiles">'+depList().filter(function(d){return d!=='Deportes'}).map(function(d){return '<button class="tile" data-dep="'+E(d)+'" style="--k:'+(COL[d]||'#666')+'"><span>'+(EMO[d]||'🛍️')+'</span><b>'+E(d)+'</b><small>'+DEP[d]+'</small></button>'}).join('')+'</div>'+grid(mix(30,3).filter(function(i){return i.dep!=='Deportes'}).concat(ALL.filter(function(i){return i.dep==='Bebidas'&&i.a}).slice(0,20)))}
function list(){var t=N(S.q).split(/\s+/).filter(Boolean),r=ALL.filter(function(i){return (!S.dep||i.dep===S.dep)&&(!S.cat||i.cat===S.cat)&&t.every(function(w){return i._q.indexOf(w)>=0})});
  if(S.q&&!S.dep){var d=r.filter(function(i){return i.dep==='Deportes'}),g=r.filter(function(i){return i.dep!=='Deportes'}),m=[];while(d.length||g.length){if(g.length)m.push(g.shift());if(d.length)m.push(d.shift())}r=m}
  var h='<div class="crumb">'+(S.dep?(EMO[S.dep]||'')+' <b>'+E(S.dep)+'</b>':'')+(S.q?'Resultados para “'+E(S.q)+'”':'')+' · '+r.length+' productos</div>';
  if(S.dep==='Deportes'){var cs={};ALL.forEach(function(i){if(i.dep==='Deportes')cs[i.cat]=(cs[i.cat]||0)+1});h+='<div class="subs">'+Object.keys(cs).map(function(c){return '<button class="sub'+(S.cat===c?' on':'')+'" data-cat="'+E(c)+'">'+(SEMO[c]||'🏆')+' '+E(c)+'</button>'}).join('')+'</div>'}
  return h+grid(r.slice(0,S.lim))+(r.length>S.lim?'<div class="more"><button data-more>Ver más</button></div>':'')}
function feed(){var a=ALL.filter(function(i){return i.img&&i.a&&!/oka/i.test(i.n)}),r=[],x=5;for(var k=0;k<30;k++){x=(x*9301+49297)%233280;var it=a[x%a.length];if(r.indexOf(it)<0)r.push(it)}
  return '<div class="feed" id="feed">'+r.map(function(i){return '<section class="fd" data-id="'+i.id+'"><img alt="'+E(i.n)+'" src="'+big(i.img)+'"><div class="fg"></div><div class="side"><button data-like="'+i.id+'" class="'+(LIKES[i.id]?'on':'')+'" aria-label="Me gusta">❤️<small>Me gusta</small></button><button data-share="'+i.id+'" aria-label="Compartir">↗️<small>Compartir</small></button><button data-add="'+i.id+'" aria-label="Agregar al carrito">🛒<small>Agregar</small></button></div><div class="fi"><span class="ftag">'+(SEMO[i.cat]||'🏆')+' '+E(i.cat)+'</span><h3>'+E(i.n)+'</h3>'+badge(i)+'<div class="fp"><b>'+F(i.p)+'</b>'+(i.iva?'<span class="iva">+ IVA</span>':'')+'<button data-open="'+i.id+'">Ver producto</button></div></div></section>'}).join('')+'</div>'}
function cuenta(){return '<section class="acc"><div class="av">🐂</div><h2>Mi cuenta</h2><p>Vista previa: aún no hay inicio de sesión.</p><div class="kv2"><span>Tus datos de entrega se guardan solo en este teléfono.</span></div><button class="go" data-tab="parati">Seguir comprando</button></section>'}
var LIKES={};try{LIKES=JSON.parse(localStorage.getItem('tt_likes')||'{}')}catch(e){}
var cdT;
function render(){var v=S.view;$('#app').className='v-'+v;$('#app').innerHTML=v==='home'?home():v==='ofertas'?flashStrip(true):v==='cats'?cats():v==='super'?superV():v==='feed'?feed():v==='cuenta'?cuenta():list();
  tabsBar();[].forEach.call(document.querySelectorAll('.bn button'),function(b){b.classList.toggle('on',b.dataset.nav===({home:'home',ofertas:'home',super:'home',list:'home',cats:'cats',feed:'feed',cuenta:'cuenta'})[v])});document.body.classList.toggle('feedmode',v==='feed');fab();
  clearInterval(cdT);if($('#cd'))cdT=setInterval(function(){var c=$('#cd');if(!c){clearInterval(cdT);return}c.outerHTML=countdown()},1000)}
function go(o){Object.assign(S,{lim:40},o);if(!o.view)S.view=(S.dep||S.q)?'list':'home';render();window.scrollTo(0,0)}
// ---- detalle (hoja inferior) ----
function detail(id){var i=BY[id],to=tallas(i),q=1;var d=$('#pd');d.innerHTML='<div class="pdb"><div class="grab"></div><button class="pdx" aria-label="Cerrar">✕</button>'+(i.img?'<div class="pdi"><img alt="'+E(i.n)+'" src="'+big(i.img)+'"></div>':'<div class="pdi emo" style="--k:'+(COL[i.dep]||'#666')+'"><span>'+(EMO[i.dep]||'🛍️')+'</span></div>')+
  '<div class="pdc"><div class="pdp"><b>'+F(i.p)+'</b>'+(i.iva?'<span class="iva">+ IVA</span>':'')+(i.x?'<i class="b18 s">+18</i>':'')+'</div><h2>'+E(i.n)+'</h2>'+badge(i)+'<p class="pdm">'+E(i.dep==='Deportes'?i.cat+(i.sub?' · '+i.sub:''):i.dep+(i.sub?' · '+i.sub:''))+(i.k?' · Cód. '+E(i.k):'')+'</p>'+
  (to?'<label class="pdl">Talla</label><div class="tl">'+to.map(function(x,k){return '<button data-t="'+E(x)+'" class="'+(k===0?'on':'')+'">'+E(x)+'</button>'}).join('')+'</div>':'')+
  (i.dep==='Deportes'?'<input class="pdn" id="pdN" placeholder="'+(i.cat==='Uniformes y textiles'?'Nombre y número (opcional)':'Nota (opcional)')+'">':'')+
  (i.x?'<p class="pd18">🔞 Venta solo a mayores de 18 años. Se pide identificación al entregar.</p>':'')+
  '<div class="pda"><div class="qty"><button data-q="-1">−</button><span id="pdQ">1</span><button data-q="1">+</button></div>'+(i.a?'<button class="go" id="pdAdd">Agregar al carrito · '+F(i.p)+'</button>':'<button class="go" disabled>Agotado</button>')+'</div></div></div>';
  d.hidden=false;document.body.style.overflow='hidden';var tal=to?to[0]:(i.t.length===1?i.t[0]:'');
  d.onclick=function(e){var b=e.target.closest('button');if(e.target===d||(b&&b.classList.contains('pdx'))){d.hidden=true;document.body.style.overflow='';return}if(!b)return;
    if(b.dataset.t!=null){tal=b.dataset.t;[].forEach.call(b.parentNode.children,function(x){x.classList.toggle('on',x===b)})}
    if(b.dataset.q){q=Math.max(1,q+(+b.dataset.q));$('#pdQ').textContent=q;if($('#pdAdd'))$('#pdAdd').textContent='Agregar al carrito · '+F(i.p*q)}
    if(b.id==='pdAdd'){var nota=$('#pdN')?$('#pdN').value.trim():'',f=cart.filter(function(c){return c.id===id&&c.talla===tal&&c.nota===nota})[0];if(f)f.qty+=q;else cart.push({id:id,qty:q,talla:tal,nota:nota});save();d.hidden=true;document.body.style.overflow='';toast('Agregado al carrito ✓')}}}
function toast(t){var x=$('#toast');x.textContent=t;x.hidden=false;clearTimeout(x._t);x._t=setTimeout(function(){x.hidden=true},1600)}
document.addEventListener('click',function(e){var b=e.target.closest('button,a,[data-open]');if(!b||b.closest('#sheet')||b.closest('#pd'))return;var d=b.dataset;
  if(d.add){e.stopPropagation();var it=BY[d.add];if(tallas(it)){detail(d.add);return}var f=cart.filter(function(i){return i.id===d.add})[0];if(f)f.qty++;else cart.push({id:d.add,qty:1,talla:it.t.length===1?it.t[0]:'',nota:''});save();toast('Agregado al carrito ✓');return}
  if(d.like){LIKES[d.like]=!LIKES[d.like];try{localStorage.setItem('tt_likes',JSON.stringify(LIKES))}catch(_){}b.classList.toggle('on',!!LIKES[d.like]);return}
  if(d.share){var it2=BY[d.share],tx=it2.n+' — '+F(it2.p)+' en Torito Delivery';if(navigator.share)navigator.share({title:'Torito Delivery',text:tx}).catch(function(){});else{try{navigator.clipboard.writeText(tx)}catch(_){}toast('Texto copiado para compartir')}return}
  if(d.open){detail(d.open);return}
  if(d.tab){var t=d.tab;$('#q').value='';if(t.indexOf('dep:')===0)go({dep:t.slice(4),cat:'',q:'',view:'list',tab:t});else go({dep:'',cat:'',q:'',view:t==='parati'?'home':t,tab:t});return}
  if(d.nav){if(d.nav==='cart'){if(STEP===4)STEP=1;openC();return}$('#q').value='';go({dep:'',cat:'',q:'',view:d.nav,tab:'parati'});return}
  if(d.dep!=null){$('#q').value='';go({dep:d.dep,cat:'',q:'',view:'list'});return}
  if(d.cat!=null){go({cat:S.cat===d.cat?'':d.cat,view:'list'});return}
  if(d.more!=null){S.lim+=40;render();return}
  if(b.id==='home'){e.preventDefault();$('#q').value='';go({dep:'',cat:'',q:'',view:'home',tab:'parati'})}});
var qt;$('#q').oninput=function(){var v=this.value;clearTimeout(qt);qt=setTimeout(function(){go({q:v.trim(),dep:'',cat:'',view:v.trim()?'list':'home'})},200)};
// ---- carrito / checkout ----
function fab(){var n=L().reduce(function(a,i){return a+i.qty},0);[].forEach.call(document.querySelectorAll('.cnt'),function(c){c.textContent=n;c.hidden=!n});var f=$('#fab');f.hidden=!n;f.innerHTML='🛒 <b>'+n+'</b> '+(n===1?'artículo':'artículos')+' · <b>'+F(total())+'</b>'}
$('#fab').onclick=function(){if(STEP===4)STEP=1;openC()};$('#x').onclick=function(){$('#sheet').hidden=true;document.body.style.overflow=''};
function bar(){var N2=['Carrito','Datos','Revisar','Listo'];return '<div class="steps">'+N2.map(function(n,k){k++;return '<div class="stp'+(k<STEP?' done':'')+(k===STEP?' on':'')+'"><span>'+(k<STEP?'✓':k)+'</span>'+n+'</div>'}).join('')+'</div><div class="pbar"><i style="width:'+((STEP-1)/3*100)+'%"></i></div>'}
var PAGO={efectivo:'💵 Efectivo al recibir',transferencia:'🏦 Transferencia',tarjeta:'💳 Tarjeta al recibir'};
function entKey(){var k=cli.ent||'exp';if(k==='exp'&&!canExp())k='est';return k}
function thumb(i){return i.img?'<img alt="" src="'+i.img+'">':'<div class="mini" style="--k:'+(COL[i.dep]||'#666')+'">'+(EMO[i.dep]||'🛍️')+'</div>'}
function sum(o){var h='<div class="sum">'+o.items.map(function(c){var i=BY[c.id];return '<div class="sl"><div><b>'+c.qty+' × '+E(i.n)+'</b>'+(i.x?' <i class="b18 s">+18</i>':'')+'<small>'+[c.talla&&'Talla '+E(c.talla),c.nota&&E(c.nota)].filter(Boolean).join(' · ')+'</small></div><b>'+F(i.p*c.qty)+(i.iva?' <span class="iva">+ IVA</span>':'')+'</b></div>'}).join('')+'<div class="sl t"><span>Envío</span><span>Por confirmar</span></div><div class="sl tt"><span>Total</span><span>'+F(o.total)+'</span></div>'+(o.iva?'<div class="ivan">Algunos artículos (calzado) se cobran + IVA.</div>':'')+'</div>';
  var c=o.cli;return h+'<div class="sum"><div class="kv"><span>👤 Cliente</span><b>'+E(c.nombre)+'</b></div><div class="kv"><span>📱 Teléfono</span><b>'+E(c.tel)+'</b></div><div class="kv"><span>🚚 Entrega</span><b>'+ENT[o.ent].l+' ('+ENT[o.ent].d+')</b></div><div class="kv"><span>📍 '+(c.modo==='tienda'?'Recoger':'Domicilio')+'</span><b>'+(c.modo==='tienda'?'Recoger en tienda':E(c.dir)+(c.ref?'<br><small>Ref: '+E(c.ref)+'</small>':''))+'</b></div><div class="kv"><span>Pago</span><b>'+PAGO[c.pago]+'</b></div></div>'}
function msg(o){var c=o.cli;return '✅ *Pedido Torito Delivery*\nFolio: *'+o.folio+'*\n\n'+o.items.map(function(x){var i=BY[x.id];return '• '+x.qty+' × '+i.n+(x.talla?' (Talla '+x.talla+')':'')+(x.nota?' — '+x.nota:'')+' = '+F(i.p*x.qty)+(i.iva?' + IVA':'')}).join('\n')+'\n\n*Total: '+F(o.total)+'*'+(o.iva?' (calzado + IVA)':'')+' · envío por confirmar\n🚚 '+ENT[o.ent].l.replace(/^\S+ /,'')+' ('+ENT[o.ent].d+')'+(o.eta.fuera?'\n🌙 Pedido fuera de horario: se procesa a partir de las 7:00 h':'')+'\n⏱️ Llega aprox. '+o.eta.txt+'\n📍 '+(c.modo==='tienda'?'Recoger en tienda':c.dir+(c.ref?' (Ref: '+c.ref+')':''))+'\n💳 '+PAGO[c.pago].replace(/^\S+ /,'')+'\n👤 '+c.nombre+' · '+c.tel+(o.adult?'\n🔞 Cliente confirma ser mayor de edad (se verificará identificación al entregar)':'')}
function folio(){var s=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Mexico_City'}).format(window.DP_NOW?new Date(window.DP_NOW):new Date()).replace(/-/g,''),k='td_folio_'+s,n=1;try{n=+(localStorage.getItem(k)||0)+1;localStorage.setItem(k,n)}catch(e){}return 'TD-'+s+'-'+('000'+n).slice(-4)}
function openC(n){if(n)STEP=n;$('#sheet').hidden=false;document.body.style.overflow='hidden';body()}
function tallas(i){return i.t.length>1?i.t:(i.dep==='Deportes'&&i.cat==='Uniformes y textiles'&&!i.t.length?['CH','M','G','XG']:null)}
function body(){var b=$('#sb'),h=bar(),t=total(),f='',it=L();
  if(STEP<4&&!it.length){b.innerHTML=h+'<div class="empty"><div>🛒</div><p>Tu carrito está vacío.</p></div>';return}
  var k=entKey();
  if(STEP===1){h+='<h3 class="sh">🛒 Tu carrito</h3>'+it.map(function(c){var i=BY[c.id],j=cart.indexOf(c),to=tallas(i);return '<div class="ci">'+thumb(i)+'<div class="cx"><b>'+E(i.n)+'</b>'+(i.x?'<i class="b18 s">+18</i>':'')+'<span class="eb '+(i.exp?'e1':'e2')+'">'+(i.exp?'⚡ Express 15 min':'🕒 Entrega en 6 horas')+'</span>'+(i.dep==='Deportes'?(to?'<select data-tl="'+j+'">'+(c.talla&&to.indexOf(c.talla)<0?'<option selected>'+E(c.talla)+'</option>':'')+to.map(function(x){return '<option'+(x===c.talla?' selected':'')+'>'+E(x)+'</option>'}).join('')+'</select>':'')+'<input data-nt="'+j+'" placeholder="'+(i.cat==='Uniformes y textiles'?'Nombre y número':'Nota (opcional)')+'" value="'+E(c.nota)+'">':'')+'<div class="r2"><div class="qty"><button data-m="'+j+'">−</button><span>'+c.qty+'</span><button data-p="'+j+'">+</button></div><b class="lp">'+F(i.p*c.qty)+(i.iva?' <span class="iva">+ IVA</span>':'')+'</b><button class="rm" data-r="'+j+'" aria-label="Quitar">🗑</button></div></div></div>'}).join('');f='<div class="tot"><span>Total</span><b>'+F(t)+'</b></div><button class="go" data-go="2">Continuar → Tus datos</button>'}
  else if(STEP===2){var c=cli;h+='<h3 class="sh">👤 Tus datos</h3><div class="co">'+
    '<div class="field"><label>Nombre completo</label><input id="cN" value="'+E(c.nombre)+'" placeholder="Nombre y apellido"></div><div class="field"><label>Teléfono (WhatsApp)</label><input id="cT" type="tel" value="'+E(c.tel)+'" placeholder="10 dígitos"></div>'+
    '<div class="field"><label>Tipo de entrega</label><div class="seg col" data-k="ent">'+Object.keys(ENT).map(function(x){var dis=x==='exp'&&!canExp();return '<button data-v="'+x+'" class="'+x+(k===x?' on':'')+'"'+(dis?' disabled':'')+'>'+ENT[x].l+' <small>'+ENT[x].d+'</small></button>'}).join('')+'</div>'+(!canExp()?'<small class="hint">Tu carrito incluye artículos con entrega en 6 horas, por eso aplica Estándar.</small>':'')+'<small class="hnote">'+HNOTE+'</small>'+etaHtml(eta(k))+'</div>'+
    '<div class="field"><label>¿Cómo lo recibes?</label><div class="seg" data-k="modo"><button data-v="envio" class="'+(c.modo!=='tienda'?'on':'')+'">🛵 Envío a domicilio</button><button data-v="tienda" class="'+(c.modo==='tienda'?'on':'')+'">🏪 Recoger en tienda</button></div></div>'+
    (c.modo!=='tienda'?'<div class="field"><label>Dirección</label><textarea id="cD" rows="2" placeholder="Calle, número, colonia">'+E(c.dir)+'</textarea></div><div class="field"><label>Referencia</label><input id="cR" value="'+E(c.ref)+'" placeholder="Ej. portón azul, frente al parque"></div>':'')+
    '<div class="field"><label>Forma de pago</label><div class="seg col" data-k="pago">'+Object.keys(PAGO).map(function(x){return '<button data-v="'+x+'" class="'+(c.pago===x?'on':'')+'">'+PAGO[x]+'</button>'}).join('')+'</div></div>'+
    (adult()?'<div class="age"><b>🔞 Tu pedido incluye bebidas alcohólicas o cigarros.</b><p>Venta exclusiva a mayores de 18 años. Se pedirá identificación oficial al entregar.</p><label class="chk"><input type="checkbox" id="cA"'+(c.edad?' checked':'')+'> Confirmo que soy mayor de edad</label></div>':'')+'</div><p class="err" id="cErr"></p>';
    f='<div class="nav2"><button class="back" data-go="1">← Atrás</button><button class="go" data-go="3">Revisar pedido →</button></div>'}
  else if(STEP===3){h+='<h3 class="sh">📋 Revisa tu pedido</h3>'+etaHtml(eta(k))+sum({items:it,total:t,cli:cli,ent:k,iva:iva()});f='<div class="nav2"><button class="back" data-go="2">← Atrás</button><button class="go ok" data-go="ok">✔ Confirmar pedido</button></div>'}
  else{h+='<div class="done"><div class="chk2">✓</div><h3>¡Pedido registrado!</h3><p>Tu folio es</p><div class="folio">'+LAST.folio+'</div><p>Envía la confirmación por WhatsApp para que preparemos tu pedido.</p></div>'+etaHtml(LAST.eta)+sum(LAST);f='<a class="wabtn" id="waL" target="_blank" rel="noopener" href="https://wa.me/'+WA+'?text='+encodeURIComponent(msg(LAST))+'">Enviar confirmación por WhatsApp</a><small class="hnote c">Número de WhatsApp: EJEMPLO (pendiente)</small>'}
  b.innerHTML=h+'<div class="cfoot">'+f+'</div>';
  [['#cN','nombre'],['#cT','tel'],['#cD','dir'],['#cR','ref']].forEach(function(a){var e=$(a[0]);if(e)e.oninput=function(){cli[a[1]]=this.value;save()}});
  if($('#cA'))$('#cA').onchange=function(){cli.edad=this.checked;save()};
  b.oninput=b.onchange=function(e){var d=e.target.dataset;if(d.nt!=null)cart[+d.nt].nota=e.target.value;else if(d.tl!=null)cart[+d.tl].talla=e.target.value;else return;save()};
  b.onclick=function(e){var x=e.target.closest('button');if(!x||x.disabled)return;var d=x.dataset,kk=x.parentNode.dataset.k;if(kk){cli[kk]=d.v;save();body();return}
    if(d.go){if(d.go==='3'){var er=!cli.nombre?'Escribe tu nombre.':!/\d{10}/.test(cli.tel.replace(/\D/g,''))?'Escribe un teléfono de 10 dígitos.':(cli.modo!=='tienda'&&!cli.dir)?'Escribe la dirección de entrega.':(adult()&&!cli.edad)?'Confirma que eres mayor de edad para continuar.':'';if(er){$('#cErr').textContent=er;return}}
      if(d.go==='ok'){LAST={folio:folio(),items:it.map(function(c){return Object.assign({},c)}),total:t,cli:Object.assign({},cli),ent:k,eta:eta(k),adult:adult(),iva:iva()};cart=[];save();STEP=4}else STEP=+d.go;body();b.scrollTop=0;return}
    if(d.m!=null){if(cart[+d.m].qty>1)cart[+d.m].qty--;else cart.splice(+d.m,1)}else if(d.p!=null)cart[+d.p].qty++;else if(d.r!=null)cart.splice(+d.r,1);else return;save();body()}}
// ---- carga ----
index();render();
fetch('torito-products.json').then(function(r){return r.json()}).then(function(T){addT(T);ALL.sort(function(a,b){return (b.img?1:0)-(a.img?1:0)});index();cart=cart.filter(function(i){return BY[i.id]});render()});
window.TD={detail:detail,go:go,open:openC,cart:function(){return cart},set:function(c,k){cart=c;if(k)cli=Object.assign(cli,k);save()},all:function(){return ALL},msg:function(){return LAST&&msg(LAST)}};
})();
