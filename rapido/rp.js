/* Torito Delivery — pedido rápido dentro del navegador de WhatsApp.
   El bot abre /rapido/?tel&nombre&zona&origen
   Esos datos mandan sobre cualquier memoria del teléfono.
   El botón de confirmar hace location.href a wa.me (sin target=_blank). */
(function(){
var WA='522821073249';
var BASE='../';
var $=function(s){return document.querySelector(s)};
function E(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function F(n){n=Number(n)||0;return '$'+n.toLocaleString('es-MX',{minimumFractionDigits:n%1?2:0,maximumFractionDigits:2})}
function N(s){return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
function cents(n){return Math.round((Number(n)||0)*100)}
function money(n){return (cents(n)/100).toFixed(2)}
function san(s,max){
  var t=String(s==null?'':s).replace(/[\u0000-\u001F\u007F|]+/g,' ').replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g,'').replace(/\s+/g,' ').trim();
  if(max&&t.length>max)t=t.slice(0,max).trim();
  return t;
}
var EMO={'Deportes':'🏆','Bebidas':'🥤','Cerveza':'🍺','Vinos y Licores':'🍷','Cigarros':'🚬','Dulces y Chocolates':'🍬','Botanas':'🍿','Galletas':'🍪','Pan y Pastelitos':'🍞','Lácteos y Huevo':'🥛','Carnes frías y Salchichonería':'🥓','Congelados y Helados':'🍦','Despensa':'🥫','Limpieza del Hogar':'🧽','Cuidado Personal':'🧴','Farmacia y Salud':'💊','Bebés':'👶','Mascotas':'🐶','Desechables y Fiesta':'🎉','Hogar y Ferretería':'🔧','Papelería':'✏️','Otros':'🛍️'};
var SHORT={'Vinos y Licores':'Vinos','Dulces y Chocolates':'Dulces','Pan y Pastelitos':'Pan','Lácteos y Huevo':'Lácteos','Carnes frías y Salchichonería':'Carnes frías','Congelados y Helados':'Helados','Limpieza del Hogar':'Limpieza','Cuidado Personal':'Cuidado personal','Farmacia y Salud':'Farmacia','Desechables y Fiesta':'Desechables','Hogar y Ferretería':'Hogar'};
var COL={'Deportes':'#1D4ED8','Bebidas':'#0EA5E9','Cerveza':'#CA8A04','Vinos y Licores':'#7F1D1D','Cigarros':'#374151','Dulces y Chocolates':'#EC4899','Botanas':'#F59E0B','Galletas':'#B45309','Pan y Pastelitos':'#C2410C','Lácteos y Huevo':'#3B82F6','Carnes frías y Salchichonería':'#DC2626','Congelados y Helados':'#06B6D4','Despensa':'#D97706','Limpieza del Hogar':'#14B8A6','Cuidado Personal':'#8B5CF6','Farmacia y Salud':'#16A34A','Bebés':'#F472B6','Mascotas':'#A16207','Desechables y Fiesta':'#F97316','Hogar y Ferretería':'#64748B','Papelería':'#6366F1','Otros':'#6B7280'};
var SEMO={'Fútbol':'⚽','Básquetbol':'🏀','Voleibol':'🏐','Uniformes y textiles':'👕','Fútbol americano':'🏈','Béisbol':'⚾','Raqueta':'🎾','Handball y waterpolo':'🤾','Entrenamiento':'⏱️','Gimnasio':'🏋️','Cuidado y soporte':'🩹','Boxeo':'🥊','Natación':'🏊','Trofeos y medallas':'🏅','Accesorios':'🎒','Calzado':'👟','Zapateras':'👞','Mochilas y maletas':'🎒','Guantes Rinat':'🧤'};
var SHIP={
  exp:{t:'Entrega en 15 min',d:'Hasta 3 km',fee:29,zona:'EXPRES',entrega:'DOMICILIO',tiempo:'15MIN'},
  est:{t:'Entrega en 1 hora',d:'Hasta 8 km',fee:19,zona:'ESTANDAR',entrega:'DOMICILIO',tiempo:'1H'},
  lenta:{t:'Entrega en 6 horas',d:'Tarifa estándar',fee:19,zona:'ESTANDAR',entrega:'DOMICILIO',tiempo:'6H'},
  tienda:{t:'Recoger en tienda',d:'Sin costo de envío',fee:0,zona:'',entrega:'TIENDA',tiempo:''}
};
var GRATIS=29900,MINIMO=10000,EFECTIVO_MAX=30000;
var MSG_EFECTIVO='Por seguridad, pedidos mayores a $300 se pagan en línea (tarjeta, OXXO o SPEI).';
var PAGO={enlinea:{t:'Pagar en línea (tarjeta, OXXO o SPEI)',code:'EN_LINEA',metodo:'mercadopago'},efectivo:{t:'Efectivo al entregar',code:'EFECTIVO',metodo:'efectivo'}};
var H_OPEN=420,H_CLOSE=1320,MSG_MAX=2000;
var Q=new URLSearchParams(location.search);
function param(n){return (Q.get(n)||'').replace(/\s+/g,' ').trim()}
var ZONA=(function(){var z=param('zona').toLowerCase();return z==='expres'||z==='estandar'||z==='fuera'?z:''})();
var ORIGEN=param('origen');
function normTel(s){
  var d=String(s||'').replace(/\D/g,'');
  if(d.length===13&&d.slice(0,3)==='521')d=d.slice(3);
  else if(d.length===12&&d.slice(0,2)==='52')d=d.slice(2);
  return d;
}
var telNorm=normTel(param('tel'));
var TEL_LOCK=telNorm.length===10;
var NAME_LOCK=san(param('nombre'),80).length>=2;
function mxNow(){var d=window.DP_NOW?new Date(window.DP_NOW):new Date(),p={};new Intl.DateTimeFormat('en-US',{timeZone:'America/Mexico_City',hour12:false,hour:'2-digit',minute:'2-digit'}).formatToParts(d).forEach(function(x){p[x.type]=x.value});return (+p.hour%24)*60+(+p.minute)}
function hh(m){return ('0'+Math.floor(m/60)).slice(-2)+':'+('0'+m%60).slice(-2)}
function isOpen(){var m=mxNow();return m>=H_OPEN&&m<H_CLOSE}
function eta(k){var cur=mxNow(),day=0,off=cur<H_OPEN||cur>=H_CLOSE,dur=k==='exp'?15:k==='est'?60:360;if(cur<H_OPEN)cur=H_OPEN;else if(cur>=H_CLOSE){cur=H_OPEN;day=1}while(cur+dur>H_CLOSE){dur-=H_CLOSE-cur;cur=H_OPEN;day++}cur+=dur;return {afterHours:off,txt:(day===0?'hoy':day===1?'mañana':'en '+day+' días')+' a las '+hh(cur)}}
var ALL=[],BY={},DEP={},BYDEP={},HOME=[];
function explicitExp(p){if(!p)return null;if(p.exp===true||p.express===true)return true;if(p.exp===false||p.express===false)return false;return null}
(window.PRODUCTS||[]).forEach(function(p){var it={id:'d'+p.id,n:p.n,p:p.p,iva:!!p.iva,img:p.img?BASE+p.img:'',dep:'Deportes',cat:p.c,k:p.k&&p.k[0]||'',t:p.t||[],a:true,x:false,exp:explicitExp(p)===true};it._q=N(p.n+' '+p.c+' '+(p.s||'')+' '+(p.k||[]).join(' ')+' deportes');ALL.push(it)});
function addT(T){T.forEach(function(p){var it={id:'t'+p.id,n:p.t,p:p.p,iva:false,img:p.i?BASE+p.i:'',dep:p.c,cat:p.s||p.c,sub:p.s,k:p.k||'',t:[],a:p.a,x:!!p.x,exp:explicitExp(p)!==false};it._q=N(p.t+' '+p.c+' '+(p.s||''));ALL.push(it)})}
function index(){BY={};DEP={};BYDEP={};ALL.forEach(function(i){BY[i.id]=i;DEP[i.dep]=(DEP[i.dep]||0)+1;(BYDEP[i.dep]=BYDEP[i.dep]||[]).push(i)})}
function depList(){return Object.keys(DEP).sort(function(a,b){return (b==='Deportes')-(a==='Deportes')||(a==='Otros')-(b==='Otros')||DEP[b]-DEP[a]})}
function buildHome(){
  var deps=['Bebidas','Botanas','Lácteos y Huevo','Despensa','Limpieza del Hogar','Deportes','Cuidado Personal','Pan y Pastelitos','Farmacia y Salud','Dulces y Chocolates'];
  var out=[],used={};
  for(var r=0;r<8;r++)deps.forEach(function(d){
    var pool=BYDEP[d]||[],found=null;
    for(var j=0;j<pool.length;j++){var it=pool[j];if(used[it.id]||!it.a)continue;if(d==='Deportes'&&!it.img)continue;found=it;if(it.img)break}
    if(found){used[found.id]=1;out.push(found)}
  });
  HOME=out;
}
var S={dep:'',q:'',lim:24},cart=[],edad=false,LAST_SEND=null;
var cli={nombre:param('nombre'),tel:TEL_LOCK?telNorm:(param('tel')||''),note:'',pago:'enlinea',ship:ZONA==='fuera'?'tienda':ZONA==='estandar'?'est':'exp'};
function L(){return cart.filter(function(c){return BY[c.id]&&c.qty>0})}
function count(){return L().reduce(function(a,c){return a+c.qty},0)}
function subCents(){return L().reduce(function(a,c){return a+cents(BY[c.id].p)*c.qty},0)}
function qtyOf(id){return cart.filter(function(c){return c.id===id}).reduce(function(a,c){return a+c.qty},0)}
function adult(){return L().some(function(c){return BY[c.id].x})}
function hasSlow(){return L().some(function(c){return BY[c.id]&&!BY[c.id].exp})}
function blocked(k){
  if(ZONA==='fuera')return k!=='tienda';
  if(k==='lenta')return !hasSlow();
  if(k==='exp')return ZONA==='estandar'||hasSlow();
  if(k==='est')return hasSlow();
  return false;
}
function resolveShip(cur){
  if(ZONA==='fuera')return 'tienda';
  if(hasSlow())return cur==='tienda'?'tienda':'lenta';
  if(cur==='lenta')cur='exp';
  if(cur&&!blocked(cur))return cur;
  if(!blocked('exp'))return 'exp';
  if(!blocked('est'))return 'est';
  return 'tienda';
}
function feeOf(k){if(!SHIP[k]||k==='tienda')return 0;if(subCents()>=GRATIS)return 0;return SHIP[k].fee}
function feeTxt(k){if(!k||k==='tienda')return F(0);if(!blocked(k)&&subCents()>=GRATIS)return 'GRATIS';return F(SHIP[k].fee)}
function tiempoOf(k){if(k==='exp')return '15MIN';if(k==='est')return '1H';if(k==='lenta')return '6H';return hasSlow()?'6H':'15MIN'}
function grandCents(k){return subCents()+cents(feeOf(k))}
function cashAllowed(k){return grandCents(k==null?resolveShip(cli.ship):k)<=EFECTIVO_MAX}
function enforcePay(k){
  if(cli.pago==='efectivo'&&!cashAllowed(k)){cli.pago='enlinea';return true}
  return false;
}
function pagoForzado(o,packedCents){
  var pay=PAGO[o.pagoKey]||PAGO.enlinea;
  var metodo=o.metodo||pay.metodo;
  var code=o.pago||pay.code;
  var declared=o.total!=null?cents(o.total):packedCents;
  if((metodo==='efectivo'||String(code).toUpperCase()==='EFECTIVO')&&(packedCents>EFECTIVO_MAX||declared>EFECTIVO_MAX))
    return {code:'EN_LINEA',metodo:'mercadopago'};
  return {code:code,metodo:metodo};
}
function zonaLine(k){if(k==='exp')return 'EXPRES';if(k==='tienda'&&!hasSlow()&&ZONA==='expres')return 'EXPRES';return 'ESTANDAR'}
function shipKeys(){if(ZONA==='fuera')return ['tienda'];if(hasSlow())return ['lenta','exp','est','tienda'];return ['exp','est','tienda']}
function greet(){var el=$('#loc');if(!el)return;if(cli.nombre){var f=cli.nombre.split(' ')[0];if(f.length>18)f=f.slice(0,18);el.textContent='Hola, '+f}else el.textContent='Perote'}
function zoneBanner(){var z=$('#zone');if(!z)return;if(ZONA==='fuera'){z.hidden=false;z.innerHTML='<b>Fuera de cobertura</b>No hay entrega a domicilio en tu zona. Puedes recoger en tienda, sin costo.'}else z.hidden=true}
function tag(i){if(ZONA==='fuera')return '<span class="tg t2">Solo tienda</span>';if(i.exp)return '<span class="tg t1">Express 15 min</span>';return '<span class="tg t2">Entrega en 6 h</span>'}
function pic(i){return i.img?'<div class="pi"><img alt="" decoding="async"></div>':'<div class="pi emo" style="--k:'+(COL[i.dep]||'#666')+'">'+(EMO[i.dep]||'🛍️')+'</div>'}
function fillImg(root,i,eager){var img=root.querySelector&&root.querySelector('img');if(!img||!i.img)return;img.alt=i.n;if(!eager)img.loading='lazy';else img.setAttribute('fetchpriority','high');img.src=i.img}
function ctl(i){var q=qtyOf(i.id);if(!i.a)return '<span class="ago">Agotado</span>';if(q)return '<div class="step" role="group" aria-label="Cantidad de '+E(i.n)+'"><button type="button" data-dec="'+i.id+'" aria-label="Quitar uno">−</button><b>'+q+'</b><button type="button" data-inc="'+i.id+'" aria-label="Agregar uno">+</button></div>';return '<button type="button" class="addb" data-add="'+i.id+'">Agregar</button>'}
function card(i){return '<article class="pc" id="c-'+i.id+'" data-open="'+i.id+'">'+pic(i)+(i.x?'<i class="b18">+18</i>':'')+'<div class="pb"><b class="pp">'+F(i.p)+(i.iva?' <small>+ IVA</small>':'')+'</b><h3>'+E(i.n)+'</h3>'+tag(i)+ctl(i)+'</div></article>'}
function hydrate(scope){var nodes=(scope||document).querySelectorAll? (scope||document).querySelectorAll('article.pc'):[];[].forEach.call(nodes,function(el,ix){var i=BY[el.dataset.open];if(i)fillImg(el,i,ix<4)})}
function refresh(id){var el=document.getElementById('c-'+id);if(!el||!BY[id])return;el.outerHTML=card(BY[id]);var n=document.getElementById('c-'+id);if(n)fillImg(n,BY[id],false)}
function grid(a){return '<div class="grid">'+a.map(card).join('')+'</div>'}
function deps(){var chips='<button type="button" class="chip'+(!S.dep&&!S.q?' on':'')+'" data-dep="">Todo</button>';$('#deps').innerHTML=chips+depList().map(function(d){return '<button type="button" class="chip'+(S.dep===d?' on':'')+'" data-dep="'+E(d)+'">'+(EMO[d]||'')+' '+E(SHORT[d]||d)+'</button>'}).join('')}
function results(){
  var t=N(S.q).split(/\s+/).filter(Boolean);
  if(!t.length&&!S.dep)return HOME.slice();
  var r=ALL.filter(function(i){return (!S.dep||i.dep===S.dep)&&t.every(function(w){return i._q.indexOf(w)>=0})});
  r.sort(function(a,b){return (b.a?1:0)-(a.a?1:0)||(b.img?1:0)-(a.img?1:0)});
  return r;
}
function statusLine(){
  if(ZONA==='fuera')return '';
  var z=ZONA==='estandar'?'Tu zona: entrega en 1 hora. Express de 15 min no está disponible. ':ZONA==='expres'?'Tu zona: Express en 15 min o en 1 hora. ':'';
  var h=isOpen()?'Abierto de 7:00 a 22:00 h.':'Cerrado. Preparamos pedidos desde las 7:00 h.';
  return '<p class="status">'+z+h+'</p>';
}
function render(){
  deps();greet();zoneBanner();
  var r=results(),html='';
  if(!S.q&&!S.dep)html+=statusLine();
  else html+='<div class="lh"><h2>'+(S.q?'“'+E(S.q)+'”':E(SHORT[S.dep]||S.dep))+'</h2><small>'+r.length+'</small></div>';
  if(!r.length)html+='<p class="none">No encontramos productos. Prueba con otra palabra.</p>';
  html+=grid(r.slice(0,S.lim));
  if(r.length>S.lim)html+='<div class="more"><button type="button" data-more>Ver más</button></div>';
  $('#app').innerHTML=html;hydrate($('#app'));bar();
}
function go(o){if(o.q!=null||o.dep!=null)S.lim=24;Object.assign(S,o);render();window.scrollTo(0,0)}
function faltaTxt(){var f=GRATIS-subCents();if(f<=0)return '';return 'Te faltan '+F(f/100)+' para envío gratis'}
function underMin(){return subCents()<MINIMO}
function minTxt(){var f=MINIMO-subCents();if(f<=0)return '';return 'Compra mínima $100 — te faltan '+F(f/100)}
function barNudge(){if(!count())return '';if(underMin())return minTxt();if(ZONA==='fuera')return '';if(subCents()>=GRATIS)return 'Envío GRATIS';return faltaTxt()}
function bar(){
  var n=count(),b=$('#cbar');if(!b)return;b.hidden=!n;document.body.classList.toggle('hasbar',!!n);
  if(!n){b.innerHTML='';b.classList.remove('tall');document.body.classList.remove('tallbar');return}
  var sub=subCents()/100,nd=barNudge();
  b.classList.toggle('tall',!!nd);document.body.classList.toggle('tallbar',!!nd);
  b.innerHTML='<span class="cn">'+n+'</span><span class="mid"><b>Ver pedido</b>'+(nd?'<small>'+nd+'</small>':'')+'</span><span class="sum">'+F(sub)+'</span>';
  b.setAttribute('aria-label','Ver pedido, '+n+' '+(n===1?'artículo':'artículos')+', '+F(sub)+(nd?', '+nd:''));
}
function toast(t){var x=$('#toast');if(!x)return;x.textContent=t;x.hidden=false;clearTimeout(x._t);x._t=setTimeout(function(){x.hidden=true},1200)}
function linesOf(id){var a=[];cart.forEach(function(c,i){if(c.id===id)a.push(i)});return a}
function add(id,talla,nota,q){
  q=q||1;var i=BY[id];if(!i||!i.a)return;
  var tal=talla||(i.t&&i.t.length===1?i.t[0]:'');
  var nt=nota||'';
  var was=qtyOf(id);
  var f=cart.filter(function(c){return c.id===id&&(c.talla||'')===tal&&(c.nota||'')===nt})[0];
  if(f)f.qty=Math.min(99,f.qty+q);else cart.push({id:id,qty:Math.min(99,q),talla:tal,nota:nt});
  LAST_SEND=null;bar();refresh(id);if(!was)toast('Agregado');
}
function dec(id){for(var k=cart.length-1;k>=0;k--)if(cart[k].id===id){if(cart[k].qty>1)cart[k].qty--;else cart.splice(k,1);break}LAST_SEND=null;bar();refresh(id)}
function bump(ix,dir){var c=cart[ix];if(!c)return;if(dir<0){if(c.qty>1)c.qty--;else cart.splice(ix,1)}else c.qty=Math.min(99,c.qty+1);LAST_SEND=null;bar()}
function hasT(i){return i.t.length>1||(i.dep==='Deportes'&&i.cat==='Uniformes y textiles'&&!i.t.length)}
function tallas(i){return i.t.length>1?i.t:['CH','M','G','XG']}
function tsheet(id,q){
  var i=BY[id],tl=tallas(i),sel=tl[0],qty=q||1;
  ov('<div class="sm"><div class="grab"></div><div class="smh">'+pic(i)+'<div><b>'+E(i.n)+'</b><span class="pp">'+F(i.p)+(i.iva?' <small>+ IVA</small>':'')+'</span></div></div><p class="lb">Elige la talla</p><div class="tl">'+tl.map(function(x,k){return '<button type="button" data-tl="'+E(x)+'" class="'+(k?'':'on')+'">'+E(x)+'</button>'}).join('')+'</div>'+(i.cat==='Uniformes y textiles'?'<input id="tn" class="in" maxlength="40" placeholder="Nombre y número (opcional)">':'')+'<button type="button" class="big" id="tok">Agregar · '+F(i.p*qty)+'</button></div>',function(e,b){
    if(b.dataset.tl){sel=b.dataset.tl;[].forEach.call(b.parentNode.children,function(x){x.classList.toggle('on',x===b)})}
    if(b.id==='tok'){add(id,sel,$('#tn')?$('#tn').value.trim():'',qty);closeOv()}
  });
  var box=$('#ov .sm');if(box)fillImg(box,i,true);
}
var ovH=null;
function ov(html,h){var o=$('#ov');o.innerHTML=html;o.hidden=false;document.body.style.overflow='hidden';ovH=h}
function closeOv(){$('#ov').hidden=true;$('#ov').innerHTML='';document.body.style.overflow='';ovH=null}
$('#ov').onclick=function(e){if(e.target.id==='ov'){closeOv();return}var b=e.target.closest('button');if(!b)return;if(b.dataset.close!=null){closeOv();return}if(ovH)ovH(e,b)};
$('#ov').oninput=function(e){var t=e.target;if(t.dataset.f){cli[t.dataset.f]=t.value;LAST_SEND=null}if(t.id==='edad')edad=t.checked};
function slowNames(){
  var names=[],seen={};
  L().forEach(function(c){var i=BY[c.id];if(!i||i.exp||seen[i.id])return;seen[i.id]=1;var n=i.n;if(n.length>36)n=n.slice(0,33).trim()+'…';names.push(n)});
  return names;
}
function shipHint(){
  if(ZONA==='fuera')return '<p class="nt">En tu zona solo puedes recoger en tienda.</p>';
  if(hasSlow()){
    var names=slowNames(),show=names.slice(0,3),extra=names.length-show.length;
    return '<p class="nt">Sin entrega en 15 min ni en 1 hora. Estos productos van en 6 horas: '+show.map(E).join(', ')+(extra?' y '+extra+' más':'')+'.</p>';
  }
  if(ZONA==='estandar')return '<p class="nt">En tu zona la entrega a domicilio es en 1 hora. Express de 15 min no está disponible.</p>';
  return '';
}
function checkout(){
  var it=L();if(!it.length){closeOv();bar();return}
  var toastEl=$('#toast');if(toastEl)toastEl.hidden=true;
  cli.ship=resolveShip(cli.ship);
  var switched=enforcePay(cli.ship);
  var k=cli.ship,sub=subCents()/100,env=feeOf(k),tot=grandCents(k)/100,e=eta(k==='tienda'?(hasSlow()?'lenta':'exp'):k),free=k!=='tienda'&&subCents()>=GRATIS,cash=cashAllowed(k);
  var y=0,prev=$('#ov .cob');if(prev)y=prev.scrollTop;
  var h='<div class="co"><div class="coh"><button type="button" data-close class="back" aria-label="Cerrar">←</button><h2>Tu pedido</h2></div><div class="cob">';
  if(NAME_LOCK)h+='<p class="who">Pedido de <b>'+E(cli.nombre)+'</b></p>';
  if(ZONA==='fuera')h+='<div class="zone"><b>Fuera de cobertura</b>No hay entrega a domicilio. El pedido queda para recoger en tienda.</div>';
  h+='<section class="box"><h3>'+count()+' '+(count()===1?'artículo':'artículos')+'</h3>'+it.map(function(c){var i=BY[c.id],ix=cart.indexOf(c);return '<div class="li">'+pic(i)+'<div class="lt"><b>'+E(i.n)+'</b>'+(c.talla?'<small>Talla '+E(c.talla)+(c.nota?' · '+E(c.nota):'')+'</small>':'')+(i.x?'<i class="b18 s">+18</i>':'')+'</div><div class="lr"><b>'+F(cents(i.p)*c.qty/100)+'</b><div class="step sm"><button type="button" data-m="'+ix+'" aria-label="Quitar uno">−</button><b>'+c.qty+'</b><button type="button" data-p="'+ix+'" aria-label="Agregar uno">+</button></div></div></div>'}).join('')+'</section>';
  var low=underMin();
  h+='<section class="box"><h3>Entrega</h3><div class="ships">'+shipKeys().map(function(x){var dis=blocked(x);return '<button type="button" class="ship'+(k===x?' on':'')+'" data-ship="'+x+'"'+(dis?' disabled':'')+' aria-pressed="'+(k===x?'true':'false')+'"><span class="tx"><b>'+SHIP[x].t+'</b><small>'+SHIP[x].d+'</small></span><span class="fee'+(feeTxt(x)==='GRATIS'?' free':'')+'">'+feeTxt(x)+'</span></button>'}).join('')+'</div>'+shipHint()+(k!=='tienda'&&!free&&!low&&subCents()>0?'<p class="shipnudge">'+faltaTxt()+'</p>':'')+(e.afterHours?'<p class="warn">Estamos cerrados. Tu pedido se prepara a partir de las 7:00 h.</p>':(k==='tienda'?'<p class="nt">Lo recogen en la tienda, de 7:00 a 22:00 h.</p>':'<p class="nt">Llega aprox. '+e.txt+'. Horario de 7:00 a 22:00 h.</p>'))+'</section>';
  h+='<section class="box"><h3>Pago</h3><div class="pays">'+Object.keys(PAGO).map(function(x){var dis=x==='efectivo'&&!cash;return '<button type="button" class="pay'+(cli.pago===x&&!dis?' on':'')+'" data-pago="'+x+'"'+(dis?' disabled aria-disabled="true"':'')+' aria-pressed="'+(cli.pago===x&&!dis?'true':'false')+'">'+PAGO[x].t+'</button>'}).join('')+'</div>'+(cash?'':'<p class="paylock" role="status">'+MSG_EFECTIVO+'</p>')+'</section>';
  if(!NAME_LOCK||!TEL_LOCK){
    h+='<section class="box"><h3>Tus datos</h3>';
    if(!NAME_LOCK)h+='<label class="lb" for="cN">Nombre</label><input id="cN" class="in" data-f="nombre" autocomplete="name" maxlength="80" placeholder="Nombre y apellido" value="'+E(cli.nombre)+'">';
    if(!TEL_LOCK)h+='<label class="lb" for="cT">Celular</label><input id="cT" class="in" data-f="tel" type="tel" inputmode="tel" autocomplete="tel" maxlength="16" placeholder="10 dígitos" value="'+E(cli.tel)+'">';
    h+='</section>';
  }
  h+='<section class="box"><label class="lb" for="nota">Nota (opcional)</label><textarea id="nota" class="note" data-f="note" maxlength="240" placeholder="Referencia, color de portón o indicación para la entrega">'+E(cli.note)+'</textarea></section>';
  if(adult())h+='<section class="box age"><h3>Solo mayores de 18</h3><p>Este pedido incluye bebidas alcohólicas o cigarros. Pediremos identificación al entregar.</p><label class="ck"><input type="checkbox" id="edad"'+(edad?' checked':'')+'> Confirmo que soy mayor de edad</label></section>';
  h+='</div>';
  h+='<div class="cof"><div class="tot"><div><span>Subtotal</span><b>'+F(sub)+'</b></div><div'+(free?' class="free"':'')+'><span>'+(free?'Envío GRATIS':'Envío')+'</span><b>'+(free?'':feeTxt(k))+'</b></div><div class="gt"><span>Total</span><b>'+F(tot)+'</b></div></div>'+(L().some(function(c){return BY[c.id].iva})?'<p class="nt">Algunos artículos de calzado se cobran + IVA.</p>':'')+(low?'<p class="minban">'+minTxt()+'</p>':'')+'<p class="err" id="err" role="alert"></p><p class="sent" id="sent"></p><button type="button" class="big" id="send"'+(low?' disabled':'')+'>Enviar pedido por WhatsApp · '+F(tot)+'</button>'+(cli.pago==='enlinea'&&!low?'<p class="payhint">Te mandaremos el botón de pago en WhatsApp</p>':'')+'</div></div>';
  ov(h,onCheckout);
  [].forEach.call(document.querySelectorAll('#ov .li'),function(row,ix){var c=it[ix];if(c)fillImg(row,BY[c.id],ix<2)});
  var cob=$('#ov .cob');if(cob)cob.scrollTop=y;
  if(switched){var lock=$('#ov .paylock');if(lock)lock.scrollIntoView({block:'center'})}
}
function validate(){
  cli.ship=resolveShip(cli.ship);
  var name=san(cli.nombre,80);
  if(!L().length)return 'Agrega un producto para continuar.';
  if(underMin())return minTxt();
  if(name.length<2)return 'Escribe tu nombre.';
  if(!telOk())return 'Escribe un celular de 10 dígitos.';
  if(adult()&&!edad)return 'Confirma que eres mayor de edad.';
  if(blocked(cli.ship))return 'Elige una entrega disponible.';
  if(cli.pago==='efectivo'&&!cashAllowed())return MSG_EFECTIVO;
  return '';
}
function telOk(){return TEL_LOCK||normTel(cli.tel).length===10}
function noteParts(k){
  var parts=[],e=eta('est');
  if(ZONA==='fuera')parts.push('Fuera de cobertura, recoger en tienda');
  if(e.afterHours)parts.push('Fuera de horario, preparar desde las 7:00');
  if(san(cli.note,240))parts.push(san(cli.note,240));
  L().forEach(function(c){var i=BY[c.id],bits=[];if(c.talla)bits.push('talla '+san(c.talla,24));if(c.nota)bits.push(san(c.nota,80));if(bits.length)parts.push(san(i.k||c.id,32)+' '+bits.join(' '))});
  if(L().some(function(c){return BY[c.id].iva}))parts.push('Hay artículos con IVA adicional');
  return san(parts.join('; '),500);
}
function itemLine(c){
  var i=BY[c.id];
  var clave=san(i.k||String(c.id).replace(/^[dt]/,''),32)||'SKU';
  var name=san(i.n,40)||'Producto';
  return c.qty+'|'+clave+'|'+name+'|'+money(i.p);
}
function asmMsg(head,lines,tail,note,machine){return head.join('\n')+'\n---\n'+lines.join('\n')+'\n---\n'+tail.join('\n')+(note?'\nNOTA: '+note:'')+'\n'+machine.join('\n')}
function buildMsg(o){
  var rows=o.items.map(function(c){return {line:itemLine(c),cents:cents(BY[c.id].p)*c.qty}});
  var envC=cents(o.envio),note=o.nota||'';
  function pack(list,n){
    var sub=0;list.forEach(function(r){sub+=r.cents});
    var totalC=sub+envC,pay=pagoForzado(o,totalC);
    var head=['PEDIDO #'+o.folio,'CLIENTE: '+san(o.nombre,80),'ZONA: '+o.zona,'ENTREGA: '+o.entrega,'ENTREGA_TIEMPO: '+(o.tiempo||tiempoOf(o.entrega==='TIENDA'?'tienda':'est')),'PAGO: '+pay.code,'ORIGEN: '+san(o.origen||'DIRECTO',24)];
    var tail=['SUBTOTAL: '+money(sub/100),'ENVIO: '+money(envC/100),'TOTAL: '+money(totalC/100)];
    var machine=['TOTAL_CENTAVOS:'+totalC,'PAGO_METODO:'+pay.metodo];
    return asmMsg(head,list.map(function(r){return r.line}),tail,n,machine);
  }
  var msg=pack(rows,note);
  if(msg.length<=MSG_MAX)return msg;
  var bareLen=pack(rows,'').length,prefix='\nNOTA: ';
  if(note&&bareLen+prefix.length<MSG_MAX){var room=MSG_MAX-(bareLen+prefix.length);return pack(rows,note.slice(0,Math.max(0,room)).trim())}
  var kept=rows.slice(),dropped=0;
  while(kept.length>1&&pack(kept,dropped?('Faltan '+dropped+' articulos'):'').length>MSG_MAX){kept.pop();dropped++}
  return pack(kept,dropped?('Faltan '+dropped+' articulos'):'');
}
function pad2(n){return ('0'+String(n==null?'':n).replace(/\D/g,'')).slice(-2)}
function randHex(n){var b=new Uint8Array(n);if(window.crypto&&crypto.getRandomValues)crypto.getRandomValues(b);else for(var i=0;i<n;i++)b[i]=Math.floor(Math.random()*256);var s='';for(var i=0;i<n;i++)s+=('0'+b[i].toString(16)).slice(-2);return s.toUpperCase()}
function folio(){
  try{
    var d=window.DP_NOW?new Date(window.DP_NOW):new Date(),p={};
    new Intl.DateTimeFormat('en-GB',{timeZone:'America/Mexico_City',hourCycle:'h23',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'}).formatToParts(d).forEach(function(x){p[x.type]=x.value});
    if(p.year&&p.month&&p.day)return 'TD-'+p.year+pad2(p.month)+pad2(p.day)+'-'+pad2((+p.hour)%24)+pad2(p.minute)+pad2(p.second)+'-'+randHex(4);
  }catch(err){}
  return 'TD-'+Date.now().toString(36).toUpperCase()+'-'+randHex(4);
}
function orderKey(){return JSON.stringify({items:L().map(function(c){return [c.id,c.qty,c.talla||'',c.nota||'']}),ship:cli.ship,pago:cli.pago,note:san(cli.note,240),nombre:san(cli.nombre,80),tel:TEL_LOCK?telNorm:normTel(cli.tel)})}
function makeOrder(){
  var k=resolveShip(cli.ship);
  enforcePay(k);
  var key=orderKey();
  if(LAST_SEND&&LAST_SEND.key===key)return LAST_SEND.order;
  var sub=subCents()/100,env=feeOf(k),tot=grandCents(k)/100;
  var pay=cashAllowed(k)?(PAGO[cli.pago]||PAGO.enlinea):PAGO.enlinea;
  var o={folio:folio(),items:L().map(function(c){return {id:c.id,qty:c.qty,talla:c.talla||'',nota:c.nota||''}}),sub:sub,envio:env,total:tot,nombre:san(cli.nombre,80),zona:zonaLine(k),entrega:k==='tienda'?'TIENDA':'DOMICILIO',tiempo:tiempoOf(k),pago:pay.code,pagoKey:cli.pago,metodo:pay.metodo,origen:san(ORIGEN||'DIRECTO',24)||'DIRECTO',nota:noteParts(k),key:key};
  LAST_SEND={key:key,order:o};
  return o;
}
function openWa(url){location.href=url}
function onCheckout(e,b){
  var d=b.dataset;
  if(d.ship){if(blocked(d.ship))return;cli.ship=d.ship;LAST_SEND=null;checkout();return}
  if(d.pago){if(d.pago==='efectivo'&&!cashAllowed())cli.pago='enlinea';else cli.pago=d.pago;LAST_SEND=null;checkout();return}
  if(d.m!=null){var idm=cart[+d.m]&&cart[+d.m].id;bump(+d.m,-1);if(idm)refresh(idm);checkout();return}
  if(d.p!=null){var idp=cart[+d.p]&&cart[+d.p].id;bump(+d.p,1);if(idp)refresh(idp);checkout();return}
  if(b.id==='send'){
    if(enforcePay()){LAST_SEND=null;checkout();return}
    var er=validate();
    if(er){var err=$('#err');if(err){err.textContent=er;err.scrollIntoView({block:'center'})}return}
    if(b.disabled)return;
    b.disabled=true;
    var o=makeOrder(),text=buildMsg(o),url='https://wa.me/'+WA+'?text='+encodeURIComponent(text);
    window.RP.lastMsg=text;window.RP.lastUrl=url;window.RP.lastOrder=o;
    window.RP.openWa(url);
    setTimeout(function(){
      b.disabled=false;
      var s=$('#sent');if(s)s.textContent='Folio '+o.folio+'. Si WhatsApp no se abrió, toca de nuevo.';
    },700);
  }
}
document.addEventListener('click',function(e){
  var b=e.target.closest('button,a');
  if(!b){var o=e.target.closest('[data-open]');if(o&&!o.closest('#ov')&&!o.closest('#pdx'))window.PD_OPEN&&PD_OPEN(o.dataset.open);return}
  if(b.closest('#ov')||b.closest('#pdx')||b.closest('#boot'))return;
  var d=b.dataset;
  if(d.add){var i=BY[d.add];if(!i)return;if(hasT(i))tsheet(d.add);else add(d.add);return}
  if(d.inc){var it=BY[d.inc];if(it&&hasT(it)&&!linesOf(d.inc).length)tsheet(d.inc);else if(it&&hasT(it)&&linesOf(d.inc).length>1)tsheet(d.inc);else add(d.inc,cartLineTalla(d.inc),cartLineNota(d.inc));return}
  if(d.dec){dec(d.dec);return}
  if(d.dep!=null){$('#q').value='';$('#qx').hidden=true;go({dep:d.dep,q:''});return}
  if(d.more!=null){S.lim+=24;render();return}
  if(b.id==='home'){e.preventDefault();$('#q').value='';$('#qx').hidden=true;go({dep:'',q:''});return}
  if(b.id==='cbar'){checkout();return}
  if(b.id==='qx'){$('#q').value='';b.hidden=true;go({q:'',dep:''});$('#q').focus()}
});
function cartLineTalla(id){var xs=cart.filter(function(c){return c.id===id});return xs.length===1?(xs[0].talla||''):''}
function cartLineNota(id){var xs=cart.filter(function(c){return c.id===id});return xs.length===1?(xs[0].nota||''):''}
var qt;$('#q').oninput=function(){var v=this.value;$('#qx').hidden=!v;clearTimeout(qt);qt=setTimeout(function(){go({q:v.trim(),dep:''})},150)};
function hideBoot(){var b=$('#boot');if(b)b.hidden=true}
function bootError(){var m=$('#bootMsg'),r=$('#bootRetry'),s=$('#boot .spin');if(m)m.textContent='No se pudieron cargar los productos. Revisa tu conexión e intenta de nuevo.';if(r)r.hidden=false;if(s)s.hidden=true}
var loaded=false;
function loadCatalog(p){
  var req=p||fetch(BASE+'torito-products.json');
  req.then(function(r){if(!r.ok)throw new Error('http');return r.json()}).then(function(T){
    if(loaded)return;addT(T);loaded=true;
    ALL.sort(function(a,b){return (b.a?1:0)-(a.a?1:0)||(b.img?1:0)-(a.img?1:0)});
    index();buildHome();hideBoot();render();window.RP.ready=true;
    setTimeout(function(){window.PD_DEEP&&PD_DEEP()},0);
  }).catch(function(){bootError()});
}
var retry=$('#bootRetry');if(retry)retry.onclick=function(){retry.hidden=true;var s=$('#boot .spin');if(s)s.hidden=false;var m=$('#bootMsg');if(m)m.textContent='Cargando productos…';loadCatalog()};
index();
window.RP={
  ready:false,add:add,checkout:checkout,folio:folio,buildMsg:buildMsg,makeOrder:makeOrder,openWa:openWa,
  quote:function(){var k=resolveShip(cli.ship);return {ship:k,sub:subCents()/100,envio:feeOf(k),total:grandCents(k)/100,zona:zonaLine(k),entrega:k==='tienda'?'TIENDA':'DOMICILIO',tiempo:tiempoOf(k),gratis:k!=='tienda'&&subCents()>=GRATIS,bajoMinimo:underMin(),efectivoPermitido:cashAllowed(k),pago:cli.pago}},
  zone:function(){return ZONA},telLocked:function(){return TEL_LOCK},blocked:blocked,client:function(){return cli}
};
window.PD_BASE=BASE;window.PD_FUERA=ZONA==='fuera';
window.PD_ADD=function(id,q){if(!BY[id])return;if(hasT(BY[id]))tsheet(id,q);else add(id,'','',q)};
window.PD_CTX={BY:function(){return BY},ALL:function(){return ALL},F:F,E:E,EMO:EMO,COL:COL};
loadCatalog(window.__CAT);
})();
