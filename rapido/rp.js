/* Torito Delivery — pedido rápido dentro del navegador de WhatsApp.
   Layout Opción F (héroe, círculos y filas) sobre el catálogo real.
   Al tocar un círculo salen chips de subcategoría (Opción A) debajo.
   El bot abre /rapido/?tel&nombre&zona&origen
   Esos datos mandan sobre cualquier memoria del teléfono.
   El checkout no pide dirección ni pago: eso sigue en el chat de Jelou.
   El PEDIDO # sale con PAGO EN_LINEA y PAGO_METODO mercadopago.
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
/* Pin de la tienda en Perote. Único origen para calcular la distancia. */
var STORE_ORIGIN={name:'Torito Delivery',lat:19.5605936,lng:-97.2434922};
/* Círculos de la Opción C, en este orden. Cada uno agrupa departamentos del catálogo. */
var CIRCLES=[
  {id:'abarrotes',n:'Abarrotes',emo:'🥫',c:'#E8A317',deps:['Despensa']},
  {id:'bebidas',n:'Bebidas',emo:'🥤',c:'#0EA5E9',deps:['Bebidas','Cerveza','Vinos y Licores']},
  {id:'botanas',n:'Botanas',emo:'🍿',c:'#F59E0B',deps:['Botanas']},
  {id:'limpieza',n:'Limpieza',emo:'🧽',c:'#14B8A6',deps:['Limpieza del Hogar']},
  {id:'deportes',n:'Deportes',emo:'⚽',c:'#2563EB',deps:['Deportes']},
  {id:'ferreteria',n:'Ferretería',emo:'🔧',c:'#64748B',deps:['Hogar y Ferretería','Papelería']},
  {id:'mascotas',n:'Mascotas',emo:'🐶',c:'#A16207',deps:['Mascotas']},
  {id:'fiestas',n:'Fiestas',emo:'🎉',c:'#DB2777',deps:['Desechables y Fiesta']}
];
/* Cada chip filtra con s (subs), cat de Deportes (cats) o departamento (deps).
   Etiquetas cortas apuntan a esos campos; no hay productos inventados. */
(function attachChips(){
  var by={};
  CIRCLES.forEach(function(c){by[c.id]=c});
  by.abarrotes.chips=[
    {id:'enlatados',n:'Enlatados',subs:['Enlatados y conservas']},
    {id:'aceites',n:'Aceites y vinagres',subs:['Aceites y vinagres']},
    {id:'harinas',n:'Harinas y azúcar',subs:['Azúcar, harinas y repostería']},
    {id:'pastas',n:'Pastas y sopas',subs:['Sopas instantáneas y pastas']},
    {id:'arroz',n:'Arroz y frijol',subs:['Arroz, frijol y semillas']},
    {id:'salsas',n:'Salsas',subs:['Salsas, condimentos y especias']},
    {id:'cereales',n:'Cereales y avena',subs:['Cereales y avena']}
  ];
  by.bebidas.chips=[
    {id:'refrescos',n:'Refrescos',subs:['Refrescos']},
    {id:'jugos',n:'Jugos',subs:['Jugos y néctares']},
    {id:'agua',n:'Agua',subs:['Agua','Agua mineral']},
    {id:'cerveza',n:'Cerveza',deps:['Cerveza']},
    {id:'cafe',n:'Café y té',subs:['Café','Té']},
    {id:'deportivas',n:'Deportivas',subs:['Bebidas deportivas y sueros']},
    {id:'energeticas',n:'Energéticas',subs:['Energéticas']},
    {id:'polvo',n:'En polvo',subs:['Bebidas en polvo']},
    {id:'vinos',n:'Vinos y licores',deps:['Vinos y Licores']}
  ];
  by.botanas.chips=[
    {id:'papas',n:'Papas',subs:['Papas y frituras']},
    {id:'cacahuates',n:'Cacahuates',subs:['Cacahuates, semillas y nueces']}
  ];
  by.limpieza.chips=[
    {id:'detergentes',n:'Detergentes',subs:['Detergentes para ropa']},
    {id:'suavizantes',n:'Suavizantes',subs:['Suavizantes']},
    {id:'limpiadores',n:'Limpiadores',subs:['Limpiadores y desinfectantes']},
    {id:'lavatrastes',n:'Lavatrastes',subs:['Lavatrastes']},
    {id:'utensilios',n:'Utensilios',subs:['Utensilios de limpieza']},
    {id:'insecticidas',n:'Insecticidas',subs:['Insecticidas']},
    {id:'aromatizantes',n:'Aromatizantes',subs:['Aromatizantes']}
  ];
  by.deportes.chips=[
    {id:'futbol',n:'Fútbol',cats:['Fútbol']},
    {id:'basquet',n:'Básquetbol',cats:['Básquetbol']},
    {id:'volei',n:'Voleibol',cats:['Voleibol']},
    {id:'uniformes',n:'Uniformes',cats:['Uniformes y textiles']},
    {id:'americano',n:'Fútbol americano',cats:['Fútbol americano']},
    {id:'beisbol',n:'Béisbol',cats:['Béisbol']},
    {id:'raqueta',n:'Raqueta',cats:['Raqueta']},
    {id:'handball',n:'Handball',cats:['Handball y waterpolo']},
    {id:'entreno',n:'Entrenamiento',cats:['Entrenamiento']},
    {id:'gimnasio',n:'Gimnasio',cats:['Gimnasio']},
    {id:'soporte',n:'Cuidado',cats:['Cuidado y soporte']},
    {id:'boxeo',n:'Boxeo',cats:['Boxeo']},
    {id:'natacion',n:'Natación',cats:['Natación']},
    {id:'trofeos',n:'Trofeos',cats:['Trofeos y medallas']},
    {id:'accesorios',n:'Accesorios',cats:['Accesorios']},
    {id:'calzado',n:'Calzado',cats:['Calzado']},
    {id:'zapateras',n:'Zapateras',cats:['Zapateras']},
    {id:'mochilas',n:'Mochilas',cats:['Mochilas y maletas']},
    {id:'guantes',n:'Guantes Rinat',cats:['Guantes Rinat']}
  ];
  by.ferreteria.chips=[
    {id:'velas',n:'Velas',subs:['Velas y veladoras']},
    {id:'pilas',n:'Pilas y focos',subs:['Pilas y focos']},
    {id:'encendedores',n:'Encendedores',subs:['Encendedores y cerillos']},
    {id:'calzado-cuidado',n:'Cuidado del calzado',subs:['Cuidado del calzado']},
    {id:'cinta',n:'Cinta y pegamento',subs:['Ferretería']},
    {id:'papeleria',n:'Papelería',deps:['Papelería']}
  ];
  by.mascotas.chips=[
    {id:'perro',n:'Perro',subs:['Alimento para perro']},
    {id:'gato',n:'Gato',subs:['Alimento para gato']},
    {id:'aves',n:'Aves',subs:['Alimento para aves']}
  ];
  by.fiestas.chips=[
    {id:'desechables',n:'Desechables',subs:['Vasos, platos y cubiertos','Servilletas y toallas de papel','Bolsas y envoltura']},
    {id:'decoracion',n:'Decoración',subs:['Fiesta']}
  ];
})();
var GRATIS=29900,MINIMO=4900,EFECTIVO_MAX=30000;
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
function index(){BY={};DEP={};BYDEP={};CIRCLES.forEach(function(c){c._vis=null});ALL.forEach(function(i){BY[i.id]=i;DEP[i.dep]=(DEP[i.dep]||0)+1;(BYDEP[i.dep]=BYDEP[i.dep]||[]).push(i)})}
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
/* Tiempo: '' = Todo. Default en todas las zonas, incluida expres.
   Express ocultaría Deportes (van en 6 h si no traen bandera). */
var S={dep:'',circle:'',sub:'',q:'',lim:24,spd:'',fav:false},cart=[],edad=false,LAST_SEND=null;
/* Me gusta queda en este teléfono, por id de producto. No entra al carrito. */
var LIKES={};
try{var _lk=JSON.parse(localStorage.getItem('rp_likes')||'{}');if(_lk&&typeof _lk==='object'&&!Array.isArray(_lk))LIKES=_lk}catch(e){}
function saveLikes(){try{localStorage.setItem('rp_likes',JSON.stringify(LIKES))}catch(e){}}
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
function tiempoOf(k){if(k==='exp')return '15MIN';if(k==='est')return '1H';if(k==='lenta')return '6H';return hasSlow()?'6H':'15MIN'}
function grandCents(k){return subCents()+cents(feeOf(k))}
function cashAllowed(k){return grandCents(k==null?resolveShip(cli.ship):k)<=EFECTIVO_MAX}
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
function greet(){var el=$('#loc');if(!el)return;if(cli.nombre){var f=cli.nombre.split(' ')[0];if(f.length>18)f=f.slice(0,18);el.textContent='Hola, '+f}else el.textContent='Perote'}
function zoneBanner(){var z=$('#zone');if(!z)return;if(ZONA==='fuera'){z.hidden=false;z.innerHTML='<b>Fuera de cobertura</b>No hay entrega a domicilio en tu zona. Puedes recoger en tienda, sin costo.'}else z.hidden=true}
function circleById(id){for(var i=0;i<CIRCLES.length;i++)if(CIRCLES[i].id===id)return CIRCLES[i];return null}
function inCircle(i,c){
  if(!c)return false;
  if(c.subs&&c.subs.length)return c.subs.indexOf(i.sub)>=0||c.subs.indexOf(i.cat)>=0;
  return !!(c.deps&&c.deps.indexOf(i.dep)>=0);
}
function coveredDep(d){return CIRCLES.some(function(c){return c.deps&&c.deps.indexOf(d)>=0})}
function chipHit(i,ch){
  if(!ch)return false;
  if(ch.subs&&(ch.subs.indexOf(i.sub)>=0||ch.subs.indexOf(i.cat)>=0))return true;
  if(ch.cats&&ch.cats.indexOf(i.cat)>=0)return true;
  if(ch.deps&&ch.deps.indexOf(i.dep)>=0)return true;
  return false;
}
function visibleChips(c){
  if(!c)return [];
  if(c._vis)return c._vis;
  var src=c.chips||[],out=[];
  for(var k=0;k<src.length;k++){
    var ch=src[k],hit=false;
    for(var i=0;i<ALL.length;i++){if(inCircle(ALL[i],c)&&chipHit(ALL[i],ch)){hit=true;break}}
    if(hit)out.push(ch);
  }
  c._vis=out;
  return out;
}
function activeChip(){
  var c=circleById(S.circle);
  if(!c||!S.sub||S.fav)return null;
  var list=visibleChips(c);
  for(var i=0;i<list.length;i++)if(list[i].id===S.sub)return list[i];
  return null;
}
function pic(i){return i.img?'<div class="pi"><img alt="" decoding="async"></div>':'<div class="pi emo" style="--k:'+(COL[i.dep]||'#666')+'">'+(EMO[i.dep]||'🛍️')+'</div>'}
function fillImg(root,i,eager){var img=root.querySelector&&root.querySelector('img');if(!img||!i.img)return;img.alt=i.n;if(!eager)img.loading='lazy';else img.setAttribute('fetchpriority','high');img.src=i.img}
function ctl(i){var q=qtyOf(i.id);if(!i.a)return '<span class="ago">Agotado</span>';if(q)return '<div class="step" role="group" aria-label="Cantidad de '+E(i.n)+'"><button type="button" data-dec="'+i.id+'" aria-label="Quitar uno">−</button><b>'+q+'</b><button type="button" data-inc="'+i.id+'" aria-label="Agregar uno">+</button></div>';return '<button type="button" class="addb" data-add="'+i.id+'">Agregar</button>'}
function likeBtn(i){var on=!!LIKES[i.id];return '<button type="button" class="like'+(on?' on':'')+'" data-like="'+i.id+'" aria-pressed="'+(on?'true':'false')+'" aria-label="Me gusta"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg></button>'}
function etaTag(i){return i.exp?'<span class="xtag x">⚡ Exprés 15 min</span>':'<span class="xtag h">6 h</span>'}
function card(i){return '<article class="pc" data-open="'+i.id+'">'+likeBtn(i)+pic(i)+(i.x?'<i class="b18">+18</i>':'')+'<div class="pb">'+etaTag(i)+'<h3 class="pn">'+E(i.n)+'</h3><div class="pp">'+F(i.p)+(i.iva?' <small>+ IVA</small>':'')+'</div><div class="ctl">'+ctl(i)+'</div></div></article>'}
function hydrate(scope){var nodes=(scope||document).querySelectorAll? (scope||document).querySelectorAll('article.pc'):[];[].forEach.call(nodes,function(el,ix){var i=BY[el.dataset.open];if(i)fillImg(el,i,ix<8)})}
function refresh(id){
  if(!BY[id])return;
  var html=card(BY[id]);
  [].forEach.call(document.querySelectorAll('article.pc'),function(el){if(el.dataset.open===id)el.outerHTML=html});
  [].forEach.call(document.querySelectorAll('article.pc'),function(el){if(el.dataset.open===id)fillImg(el,BY[id],false)});
}
function storyBtn(c){
  if(c.fav)return '<button type="button" class="story" data-fav="1" aria-pressed="false"><span class="bubble" style="--c:'+c.c+'">'+c.emo+'</span><span class="sl">'+E(c.n)+'</span></button>';
  return '<button type="button" class="story" data-circle="'+c.id+'" aria-pressed="false"><span class="bubble" style="--c:'+c.c+'">'+c.emo+'</span><span class="sl">'+E(c.n)+'</span></button>';
}
function stories(){
  var el=$('#stories');if(!el||el.childElementCount)return;
  el.innerHTML=CIRCLES.map(storyBtn).join('')+storyBtn({n:'Favoritos',emo:'♥',c:'#E30613',fav:true});
}
function paintStories(){
  [].forEach.call(document.querySelectorAll('#stories .story'),function(b){
    var on=b.dataset.fav?!!S.fav:(!!S.circle&&b.dataset.circle===S.circle);
    b.classList.toggle('on',on);
    b.setAttribute('aria-pressed',on?'true':'false');
  });
}
function speeds(){
  var el=$('#spd');if(!el)return;
  var opts=[{id:'',l:'Todo'},{id:'exp',l:'Express 15 min'},{id:'6h',l:'6 horas'}];
  el.innerHTML=opts.map(function(o){var on=S.spd===o.id;return '<button type="button" class="chip'+(on?' on':'')+'" data-spd="'+o.id+'" aria-pressed="'+(on?'true':'false')+'">'+o.l+'</button>'}).join('');
}
function matchSpd(i){if(S.spd==='exp')return !!i.exp;if(S.spd==='6h')return !i.exp;return true}
function browsing(){return !S.q&&!S.circle&&!S.sub&&!S.dep&&!S.fav}
function take(pred,n){
  var out=[];
  for(var i=0;i<ALL.length&&out.length<n;i++){var it=ALL[i];if(it.a&&pred(it))out.push(it)}
  return out;
}
function results(){
  var t=N(S.q).split(/\s+/).filter(Boolean);
  var c=circleById(S.circle);
  var chip=activeChip();
  var r=ALL.filter(function(i){
    if(S.dep&&i.dep!==S.dep)return false;
    if(c&&!inCircle(i,c))return false;
    if(chip&&!chipHit(i,chip))return false;
    if(S.fav&&!LIKES[i.id])return false;
    if(!matchSpd(i))return false;
    return t.every(function(w){return i._q.indexOf(w)>=0});
  });
  r.sort(function(a,b){return (b.a?1:0)-(a.a?1:0)||(b.img?1:0)-(a.img?1:0)});
  return r;
}
function viewTitle(){
  var c=S.circle?circleById(S.circle):null;
  var chip=activeChip();
  var name='';
  if(chip&&c)name=chip.n===c.n?chip.n:chip.n+' · '+c.n;
  else if(c)name=c.n;
  else if(S.dep)name=SHORT[S.dep]||S.dep;
  else if(S.fav)name='Favoritos';
  var bits=[];
  if(S.q&&name)bits.push('“'+S.q+'” en '+name);
  else if(S.q)bits.push('Resultados de “'+S.q+'”');
  else if(name)bits.push(name);
  if(S.spd==='exp')bits.push('Express 15 min');
  else if(S.spd==='6h')bits.push('6 horas');
  return E(bits.join(' · '));
}
function emptyTitle(){
  if(S.fav&&!S.q&&!S.spd)return 'Aún no tienes favoritos';
  return 'No encontramos productos';
}
function emptyMsg(){
  if(S.fav&&!S.q&&!S.spd&&!S.sub)return 'Toca el corazón en un producto para guardarlo aquí.';
  if(S.fav)return 'Ningún favorito coincide con este filtro.';
  if(S.sub&&!S.q&&!S.spd)return 'Nada en esta subcategoría. Prueba con Todo.';
  if(S.spd==='exp')return 'Ningún producto Express de 15 min coincide.';
  if(S.spd==='6h')return 'Ningún producto de 6 horas coincide.';
  return 'Prueba con otra palabra o quita el filtro.';
}
function statusLine(){
  if(ZONA==='fuera')return '';
  var z=ZONA==='estandar'?'Tu zona: entrega en 1 hora. Express de 15 min no está disponible. ':ZONA==='expres'?'Tu zona: Express en 15 min o en 1 hora. ':'';
  var h=isOpen()?'Abierto de 7:00 a 22:00 h.':'Cerrado. Preparamos pedidos desde las 7:00 h.';
  return '<p class="status">'+z+h+'</p>';
}
function rail(title,list,btn){
  if(!list.length)return '';
  return '<section class="sec"><div class="sec-h"><h2>'+E(title)+'</h2>'+(btn||'')+'</div><div class="rail">'+list.map(card).join('')+'</div></section>';
}
function homeHtml(){
  var html=statusLine();
  html+=rail('Para hoy',HOME.filter(function(i){return i.a&&matchSpd(i)}).slice(0,12),'');
  CIRCLES.forEach(function(c){
    html+=rail(c.n,take(function(i){return inCircle(i,c)&&matchSpd(i)},12),'<button type="button" data-circle="'+c.id+'">Ver todo</button>');
  });
  depList().forEach(function(d){
    if(coveredDep(d))return;
    html+=rail(SHORT[d]||d,take(function(i){return i.dep===d&&matchSpd(i)},12),'<button type="button" data-dep="'+E(d)+'">Ver todo</button>');
  });
  if(!html.replace(statusLine(),''))html+='<div class="empty"><b>No hay productos con este tiempo</b><p>Prueba con Todo para ver el catálogo completo.</p></div>';
  return html;
}
function renderSubs(){
  var el=$('#subs');if(!el)return;
  var c=!S.fav&&circleById(S.circle);
  var chips=c?visibleChips(c):[];
  if(S.sub&&!activeChip())S.sub='';
  if(!chips.length){el.hidden=true;el.innerHTML='';return}
  el.hidden=false;
  el.innerHTML=[{id:'',n:'Todo'}].concat(chips).map(function(s){
    var on=s.id?!!(activeChip()&&activeChip().id===s.id):!activeChip();
    return '<button type="button" class="chip'+(on?' on':'')+'" data-sub="'+E(s.id)+'" aria-pressed="'+(on?'true':'false')+'">'+E(s.n)+'</button>';
  }).join('');
}
function centerChip(){
  var sc=$('#subs');if(!sc||sc.hidden)return;
  var btn=sc.querySelector('.chip.on');if(!btn)return;
  var left=btn.offsetLeft-(sc.clientWidth-btn.offsetWidth)/2;
  sc.scrollTo({left:Math.max(0,left),behavior:'auto'});
}
function render(){
  if(S.sub&&!activeChip())S.sub='';
  stories();paintStories();renderSubs();speeds();greet();zoneBanner();
  var main=$('#productos');if(!main)return;
  var html;
  if(browsing())html=homeHtml();
  else{
    var r=results();
    html='<div class="sec-h"><h2>'+viewTitle()+'</h2><button type="button" data-clear>Ver todo</button></div>';
    if(!r.length)html+='<div class="empty"><b>'+emptyTitle()+'</b><p>'+emptyMsg()+'</p><button type="button" data-clear>Ver catálogo</button></div>';
    else{
      html+='<div class="grid">'+r.slice(0,S.lim).map(card).join('')+'</div>';
      if(r.length>S.lim)html+='<div class="more"><button type="button" data-more>Ver más</button></div>';
    }
  }
  main.innerHTML=html;hydrate(main);bar();centerChip();
}
function reduceMotion(){return !!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)}
function scrollUnderHeader(el){
  if(!el)return;
  var sticky=document.querySelector('.sticky');
  var h=sticky?sticky.getBoundingClientRect().height:0;
  var y=el.getBoundingClientRect().top+window.scrollY-h-4;
  window.scrollTo({top:Math.max(0,y),behavior:reduceMotion()?'auto':'smooth'});
}
function focusProducts(){
  var el=$('#productos');if(!el)return;
  el.classList.remove('pulse');void el.offsetWidth;el.classList.add('pulse');
  try{el.focus({preventScroll:true})}catch(err){el.focus()}
  scrollUnderHeader(el);
  setTimeout(function(){el.classList.remove('pulse')},1200);
}
function centerStory(){
  var btn=document.querySelector('#stories .story.on');
  var sc=$('#stories');
  if(!btn||!sc)return;
  var left=btn.offsetLeft-(sc.clientWidth-btn.offsetWidth)/2;
  sc.scrollTo({left:Math.max(0,left),behavior:reduceMotion()?'auto':'smooth'});
}
function go(o,opt){
  if(o.circle!=null&&o.circle!==S.circle&&o.sub==null)o.sub='';
  if(o.fav&&o.sub==null)o.sub='';
  if(o.dep&&o.sub==null)o.sub='';
  if(o.q!=null||o.dep!=null||o.circle!=null||o.spd!=null||o.fav!=null||o.sub!=null)S.lim=24;
  Object.assign(S,o);render();
  if(!opt||opt.scroll!==false)window.scrollTo(0,0);
}
function faltaTxt(){var f=GRATIS-subCents();if(f<=0)return '';return 'Te faltan '+F(f/100)+' para envío gratis'}
function underMin(){return subCents()<MINIMO}
function minTxt(){var f=MINIMO-subCents();if(f<=0)return '';return 'Compra mínima '+F(MINIMO/100)+' — te faltan '+F(f/100)}
function barNudge(){
  if(!count())return '';
  if(underMin())return minTxt();
  if(addr.km!=null&&addr.km>8)return 'Fuera de zona de entrega';
  if(addr.km!=null){
    var b=zoneFromKm(addr.km),k=b.band==='expres'?'exp':'est',fee=feeOf(k);
    return b.label+' · '+(fee?'envío '+F(fee):'envío gratis');
  }
  if(ZONA==='fuera')return '';
  if(subCents()>=GRATIS)return 'Envío GRATIS';
  return faltaTxt();
}
function bar(){
  var n=count(),b=$('#cbar');if(!b)return;
  var was=b.hidden;
  b.hidden=!n;document.body.classList.toggle('hasbar',!!n);
  if(!n){b.innerHTML='';b.classList.remove('tall');b.classList.remove('bump');document.body.classList.remove('tallbar');return}
  var sub=subCents()/100,nd=barNudge();
  b.classList.toggle('tall',!!nd);document.body.classList.toggle('tallbar',!!nd);
  b.innerHTML='<span class="cbadge">'+n+'</span><span class="clab"><b>Ver pedido</b>'+(nd?'<small>'+E(nd)+'</small>':'')+'</span><b class="sum">'+F(sub)+'</b>';
  b.setAttribute('aria-label','Ver pedido, '+n+' '+(n===1?'artículo':'artículos')+', '+F(sub)+(nd?', '+nd:''));
  if(was){b.classList.remove('bump');void b.offsetWidth;b.classList.add('bump')}
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
$('#ov').oninput=function(e){var t=e.target;if(t.id==='calle'||t.id==='colonia'||t.id==='refs'){readAddr();saveAddr();LAST_SEND=null;paintAddr();return}if(t.dataset.f){cli[t.dataset.f]=t.value;LAST_SEND=null}if(t.id==='edad'){edad=t.checked;paintAddr()}};
var WA_ICO='<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M12 2.1A9.9 9.9 0 0 0 3.2 16.7L2 22l5.5-1.2A9.9 9.9 0 1 0 12 2.1zm5.6 14.1c-.2.7-1.3 1.2-1.8 1.3-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.6-.6-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 .9-2.3c.2-.2.6-.4 1-.4h.3c.3 0 .4 0 .6.5.2.6.8 1.9.8 2.1.1.1.1.3 0 .5l-.4.5c-.1.2-.3.3-.1.6.2.3.7 1.1 1.5 1.8 1 .9 1.8 1.2 2.1 1.3.3.1.4.1.6-.1.2-.2.7-.8.8-1 .2-.3.3-.2.6-.1.2.1 1.5.7 1.7.8.3.1.4.2.5.3.1.2.1.6-.2 1.3z"/></svg>';
function etaLabel(k){
  if(k==='tienda')return hasSlow()?'Recoges en tienda. El pedido queda listo en 6 horas.':'Recoges en tienda, sin costo de envío.';
  if(k==='lenta')return 'Este pedido sale en 6 horas.';
  if(k==='est')return 'Entrega estimada en 1 hora.';
  return 'Entrega estimada en 15 min.';
}
function gratisPct(){
  var p=GRATIS?(subCents()/GRATIS)*100:0;
  if(p<0)p=0;if(p>100)p=100;
  return Math.round(p*10)/10;
}
function shipNudgeHtml(k){
  if(k==='tienda')return '';
  var pct=gratisPct(),now=Math.min(GRATIS,subCents())/100,label=subCents()>=GRATIS?'Envío GRATIS':faltaTxt();
  return '<p class="nudge">'+label+'</p><div class="shipbar" role="progressbar" aria-valuemin="0" aria-valuemax="'+(GRATIS/100)+'" aria-valuenow="'+now+'" aria-valuetext="'+E(label)+'" aria-label="Progreso hacia envío gratis"><span style="width:'+pct+'%"></span></div>';
}
function liRow(c){
  var i=BY[c.id],ix=cart.indexOf(c),meta='';
  if(c.talla)meta='<small>Talla '+E(c.talla)+(c.nota?' · '+E(c.nota):'')+'</small>';
  return '<div class="li">'+pic(i)+'<div class="lt"><b>'+E(i.n)+'</b><span class="lp">'+F(cents(i.p)*c.qty/100)+'</span>'+meta+(i.x?'<i class="b18 s">+18</i>':'')+'</div><div class="step sm" role="group" aria-label="Cantidad"><button type="button" data-m="'+ix+'" aria-label="Quitar uno">−</button><b>'+c.qty+'</b><button type="button" data-p="'+ix+'" aria-label="Agregar uno">+</button></div></div>';
}
function haversineKm(a,b){
  var R=6371,p=Math.PI/180,dLat=(b.lat-a.lat)*p,dLng=(b.lng-a.lng)*p;
  var s=Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(a.lat*p)*Math.cos(b.lat*p)*Math.sin(dLng/2)*Math.sin(dLng/2);
  return 2*R*Math.asin(Math.min(1,Math.sqrt(s)));
}
function zoneFromKm(km){
  if(km==null||isNaN(km))return null;
  if(km<=3)return {band:'expres',label:'Exprés'};
  if(km<=8)return {band:'estandar',label:'Estándar'};
  return {band:'fuera',label:'Fuera de zona de entrega'};
}
function kmLabel(km){var n=Math.round(km*10)/10;return n.toLocaleString('es-MX',{minimumFractionDigits:1,maximumFractionDigits:1})+' km'}
function fromStore(km){return 'a '+kmLabel(km)+' de '+STORE_ORIGIN.name}
function mapLink(){
  if(addr.lat==null||addr.lng==null)return '';
  function c(n){return (Math.round(n*1e6)/1e6).toFixed(6)}
  return 'https://maps.google.com/?q='+c(addr.lat)+','+c(addr.lng);
}
var addr={calle:'',colonia:'',refs:'',lat:null,lng:null,km:null,loading:false,geoMsg:''};
function loadAddr(){
  try{
    var j=JSON.parse(localStorage.getItem('rp_addr')||'null');
    if(!j||typeof j!=='object')return;
    addr.calle=san(j.calle,120);
    addr.colonia=san(j.colonia,80);
    addr.refs=san(j.refs,160);
    if(typeof j.lat==='number'&&typeof j.lng==='number'&&isFinite(j.lat)&&isFinite(j.lng)){
      addr.lat=j.lat;addr.lng=j.lng;addr.km=haversineKm(STORE_ORIGIN,{lat:j.lat,lng:j.lng});
    }
  }catch(e){}
}
function saveAddr(){
  try{localStorage.setItem('rp_addr',JSON.stringify({calle:addr.calle,colonia:addr.colonia,refs:addr.refs,lat:addr.lat,lng:addr.lng}))}catch(e){}
}
function readAddr(){
  var c=$('#calle'),k=$('#colonia'),r=$('#refs');
  if(c)addr.calle=c.value;
  if(k)addr.colonia=k.value;
  if(r)addr.refs=r.value;
}
function addrShip(){
  var b=zoneFromKm(addr.km);
  if(!b||b.band==='fuera')return '';
  return b.band==='expres'?'exp':'est';
}
function addrError(){
  if(addr.km==null)return 'Usa tu ubicación para calcular la zona de entrega.';
  if(addr.km>8)return 'Fuera de zona de entrega';
  if(!san(addr.calle,120))return 'Escribe la calle y el número.';
  if(!san(addr.colonia,80))return 'Escribe la colonia.';
  return '';
}
function zoneHtml(){
  if(addr.km==null)return '<p class="zonepick">Calculamos Exprés o Estándar con tu ubicación.</p>';
  var b=zoneFromKm(addr.km),d=fromStore(addr.km);
  if(b.band==='fuera')return '<p class="zonepick bad">Fuera de zona de entrega · '+E(d)+'</p>';
  var when=hasSlow()?'entrega en 6 h':(b.band==='expres'?'15 min':'1 h');
  var fee=feeOf(addrShip());
  return '<p class="zonepick ok">'+b.label+' · '+when+' · '+(fee?'envío '+F(fee):'envío gratis')+' · '+E(d)+'</p>';
}
function feeLineHtml(){
  var k=addrShip();
  if(!k)return '<div class="subline" id="feeline"><span>Envío</span><b>—</b></div>';
  var fee=feeOf(k);
  return '<div class="subline" id="feeline"><span>Envío</span><b>'+(fee?F(fee):'GRATIS')+'</b></div>';
}
function paintAddr(){
  var z=$('#zonepick');if(z)z.innerHTML=zoneHtml();
  var g=$('#geoerr');if(g){g.textContent=addr.geoMsg||'';g.hidden=!addr.geoMsg}
  var fee=$('#feeline');if(fee)fee.outerHTML=feeLineHtml();
  var geo=$('#geo');if(geo){geo.disabled=!!addr.loading;geo.textContent=addr.loading?'Buscando ubicación…':'📍 Usar mi ubicación'}
  var send=$('#send');if(send)send.disabled=!!validate();
  bar();
}
function applyNominatim(j){
  var a=j&&j.address||{};
  var street=[a.road||a.pedestrian||a.footway||a.residential||'',a.house_number||''].filter(Boolean).join(' ');
  var col=a.suburb||a.neighbourhood||a.quarter||a.city_district||a.village||a.hamlet||'';
  if(street)addr.calle=street;
  if(col)addr.colonia=col;
  if(!street&&!col)addr.geoMsg='Encontramos el punto, pero no la calle. Escríbela tú.';
  else addr.geoMsg='';
}
function geoFill(lat,lng){
  addr.lat=lat;addr.lng=lng;addr.km=haversineKm(STORE_ORIGIN,{lat:lat,lng:lng});
  addr.geoMsg='';
  saveAddr();
  var calle=$('#calle'),col=$('#colonia');
  if(calle)calle.value=addr.calle;
  if(col)col.value=addr.colonia;
  paintAddr();
  var url='https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&accept-language=es&lat='+encodeURIComponent(lat)+'&lon='+encodeURIComponent(lng);
  fetch(url,{headers:{Accept:'application/json'}}).then(function(r){if(!r.ok)throw new Error('http');return r.json()}).then(function(j){
    applyNominatim(j);saveAddr();
    var c=$('#calle'),k=$('#colonia');
    if(c&&document.activeElement!==c)c.value=addr.calle;
    if(k&&document.activeElement!==k)k.value=addr.colonia;
    paintAddr();
  }).catch(function(){
    addr.geoMsg='Encontramos el punto, pero no la calle. Escríbela tú.';
    paintAddr();
  });
}
function useGeo(){
  if(!navigator.geolocation){addr.geoMsg='Este navegador no comparte la ubicación. Escribe la calle y la colonia.';paintAddr();return}
  addr.loading=true;addr.geoMsg='';paintAddr();
  navigator.geolocation.getCurrentPosition(function(pos){
    addr.loading=false;
    geoFill(pos.coords.latitude,pos.coords.longitude);
  },function(){
    addr.loading=false;
    addr.geoMsg='No se permitió la ubicación. Escribe la calle y la colonia. Para calcular la zona, actívala y toca el botón otra vez.';
    paintAddr();
  },{enableHighAccuracy:true,timeout:12000,maximumAge:0});
}
loadAddr();
function addrBlock(){
  return '<section class="box addr"><h3>Dirección de entrega</h3><button type="button" class="geo" id="geo"'+(addr.loading?' disabled':'')+'>'+(addr.loading?'Buscando ubicación…':'📍 Usar mi ubicación')+'</button><p class="geoerr" id="geoerr"'+(addr.geoMsg?'':' hidden')+'>'+E(addr.geoMsg)+'</p><label>Calle y número<input id="calle" class="in" maxlength="120" autocomplete="address-line1" value="'+E(addr.calle)+'"></label><label>Colonia<input id="colonia" class="in" maxlength="80" autocomplete="address-level3" value="'+E(addr.colonia)+'"></label><label>Referencias<input id="refs" class="in" maxlength="160" placeholder="Ej. portón azul, frente al parque" value="'+E(addr.refs)+'"></label><div id="zonepick">'+zoneHtml()+'</div></section>';
}
function checkout(){
  readAddr();
  var it=L();if(!it.length){closeOv();bar();return}
  var toastEl=$('#toast');if(toastEl)toastEl.hidden=true;
  cli.ship=resolveShip(cli.ship);
  cli.pago='enlinea';
  var k=cli.ship,sub=subCents()/100,low=underMin();
  var e=eta(k==='tienda'?(hasSlow()?'lenta':'exp'):k);
  var y=0,prev=$('#ov .cob');if(prev)y=prev.scrollTop;
  var h='<div class="co"><div class="cobrand"><span class="logo">🐂 Torito <b>Delivery</b></span></div><div class="coh"><button type="button" data-close class="back" aria-label="Cerrar">←</button><h2>Tu pedido</h2></div><div class="cob">';
  if(ZONA==='fuera')h+='<div class="zone"><b>Fuera de cobertura</b>No hay entrega a domicilio. El pedido queda para recoger en tienda.</div>';
  if(e.afterHours)h+='<p class="warn">Estamos cerrados. Tu pedido se prepara a partir de las 7:00 h.</p>';
  h+='<p class="eta">'+etaLabel(k)+'</p>';
  h+=addrBlock();
  h+='<section class="box lines">'+it.map(liRow).join('')+'</section>';
  if(adult())h+='<section class="box age"><h3>Solo mayores de 18</h3><p>Este pedido incluye bebidas alcohólicas o cigarros. Pediremos identificación al entregar.</p><label class="ck"><input type="checkbox" id="edad"'+(edad?' checked':'')+'> Confirmo que soy mayor de edad</label></section>';
  if(L().some(function(c){return BY[c.id].iva}))h+='<p class="nt">Algunos artículos de calzado se cobran + IVA.</p>';
  h+='</div>';
  h+='<div class="cof"><div class="subline"><span>Subtotal</span><b>'+F(sub)+'</b></div>'+feeLineHtml()+(low?'<p class="minban">'+minTxt()+'</p>':'')+shipNudgeHtml(k)+'<p class="err" id="err" role="alert"></p><p class="sent" id="sent"></p><button type="button" class="big" id="send"'+(validate()?' disabled':'')+'><span>Enviar a WhatsApp</span>'+WA_ICO+'</button><p class="payhint">Después seguimos con el pago en el chat</p></div></div>';
  ov(h,onCheckout);
  [].forEach.call(document.querySelectorAll('#ov .li'),function(row,ix){var c=it[ix];if(c)fillImg(row,BY[c.id],ix<2)});
  var cob=$('#ov .cob');if(cob)cob.scrollTop=y;
}
function validate(){
  var ship=addrShip();
  if(ship)cli.ship=ship;
  cli.pago='enlinea';
  if(!L().length)return 'Agrega un producto para continuar.';
  if(underMin())return minTxt();
  var ae=addrError();if(ae)return ae;
  if(adult()&&!edad)return 'Confirma que eres mayor de edad.';
  return '';
}
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
    if(o.direccion)head.push('DIRECCION: '+san(o.direccion,180));
    if(o.referencias)head.push('REFERENCIAS: '+san(o.referencias,160));
    if(o.mapa)head.push('MAPA: '+san(o.mapa,120));
    if(o.distancia)head.push('DISTANCIA: '+san(o.distancia,80));
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
function orderKey(){return JSON.stringify({items:L().map(function(c){return [c.id,c.qty,c.talla||'',c.nota||'']}),ship:cli.ship,pago:cli.pago,note:san(cli.note,240),nombre:san(NAME_LOCK?param('nombre'):cli.nombre,80),tel:TEL_LOCK?telNorm:normTel(cli.tel),calle:san(addr.calle,120),colonia:san(addr.colonia,80),refs:san(addr.refs,160),lat:addr.lat,lng:addr.lng})}
function makeOrder(){
  readAddr();
  var ship=addrShip();
  var k=ship||resolveShip(cli.ship);
  cli.ship=k;
  cli.pago='enlinea';
  var key=orderKey();
  if(LAST_SEND&&LAST_SEND.key===key)return LAST_SEND.order;
  var sub=subCents()/100,env=feeOf(k),tot=grandCents(k)/100;
  var pay=PAGO.enlinea;
  var nombre=san(NAME_LOCK?param('nombre'):cli.nombre,80);
  var tiempo=hasSlow()?'6H':tiempoOf(k);
  var zona=k==='exp'?'EXPRES':k==='est'?'ESTANDAR':zonaLine(k);
  var o={folio:folio(),items:L().map(function(c){return {id:c.id,qty:c.qty,talla:c.talla||'',nota:c.nota||''}}),sub:sub,envio:env,total:tot,nombre:nombre,zona:zona,entrega:'DOMICILIO',tiempo:tiempo,pago:pay.code,pagoKey:'enlinea',metodo:pay.metodo,origen:san(ORIGEN||'DIRECTO',24)||'DIRECTO',nota:noteParts(k),direccion:san(addr.calle,120)+(addr.colonia?', '+san(addr.colonia,80):''),referencias:san(addr.refs,160),mapa:mapLink(),distancia:addr.km==null?'':fromStore(addr.km),key:key};
  LAST_SEND={key:key,order:o};
  return o;
}
function openWa(url){location.href=url}
function onCheckout(e,b){
  var d=b.dataset;
  if(b.id==='geo'){useGeo();return}
  if(d.m!=null){readAddr();var idm=cart[+d.m]&&cart[+d.m].id;bump(+d.m,-1);if(idm)refresh(idm);checkout();return}
  if(d.p!=null){readAddr();var idp=cart[+d.p]&&cart[+d.p].id;bump(+d.p,1);if(idp)refresh(idp);checkout();return}
  if(b.id==='send'){
    readAddr();
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
  if(d.like){
    e.preventDefault();e.stopPropagation();
    var lid=d.like;if(!BY[lid])return;
    if(LIKES[lid])delete LIKES[lid];else LIKES[lid]=1;
    saveLikes();
    if(S.fav)render();
    else [].forEach.call(document.querySelectorAll('[data-like="'+lid+'"]'),function(btn){
      btn.classList.toggle('on',!!LIKES[lid]);
      btn.setAttribute('aria-pressed',LIKES[lid]?'true':'false');
    });
    toast(LIKES[lid]?'Guardado en Me gusta':'Quitado de Me gusta');
    return;
  }
  if(d.add){var i=BY[d.add];if(!i)return;if(hasT(i))tsheet(d.add);else add(d.add);return}
  if(d.inc){var it=BY[d.inc];if(it&&hasT(it)&&!linesOf(d.inc).length)tsheet(d.inc);else if(it&&hasT(it)&&linesOf(d.inc).length>1)tsheet(d.inc);else add(d.inc,cartLineTalla(d.inc),cartLineNota(d.inc));return}
  if(d.dec){dec(d.dec);return}
  if(d.spd!=null){go({spd:d.spd});return}
  if(d.sub!=null){
    if(!S.circle||S.fav)return;
    var sid=d.sub,ns=S.sub===sid?'':sid;
    go({sub:ns},{scroll:false});
    return;
  }
  if(d.fav!=null){
    var on=!S.fav;
    $('#q').value='';$('#qx').hidden=true;
    go({fav:on,circle:'',dep:'',q:'',sub:''},{scroll:false});
    if(on){centerStory();scrollUnderHeader($('#productos'));}
    else window.scrollTo({top:0,behavior:reduceMotion()?'auto':'smooth'});
    return;
  }
  if(d.circle!=null){
    var id=d.circle,next=S.circle===id?'':id;
    $('#q').value='';$('#qx').hidden=true;
    go({circle:next,dep:'',q:'',fav:false,sub:''},{scroll:false});
    if(next){centerStory();scrollUnderHeader($('#stories'));}
    else window.scrollTo({top:0,behavior:reduceMotion()?'auto':'smooth'});
    return;
  }
  if(d.dep!=null){$('#q').value='';$('#qx').hidden=true;go({dep:d.dep,circle:'',q:'',fav:false,sub:''},{scroll:false});scrollUnderHeader($('#productos'));return}
  if(d.clear!=null){$('#q').value='';$('#qx').hidden=true;go({circle:'',dep:'',q:'',fav:false,sub:''});return}
  if(d.more!=null){S.lim+=24;render();return}
  if(b.id==='cta'){focusProducts();return}
  if(b.id==='home'){e.preventDefault();$('#q').value='';$('#qx').hidden=true;go({dep:'',circle:'',q:'',spd:'',fav:false,sub:''});return}
  if(b.id==='cbar'){checkout();return}
  if(b.id==='qx'){$('#q').value='';b.hidden=true;go({q:''},{scroll:false});$('#q').focus();if(!S.circle&&!S.dep&&!S.fav)window.scrollTo(0,0)}
});
function cartLineTalla(id){var xs=cart.filter(function(c){return c.id===id});return xs.length===1?(xs[0].talla||''):''}
function cartLineNota(id){var xs=cart.filter(function(c){return c.id===id});return xs.length===1?(xs[0].nota||''):''}
var qt;$('#q').oninput=function(){
  var v=this.value;$('#qx').hidden=!v;clearTimeout(qt);
  qt=setTimeout(function(){
    go({q:v.trim()},{scroll:false});
    if(v.trim())scrollUnderHeader($('#productos'));
    else if(!S.circle&&!S.dep&&!S.fav)window.scrollTo({top:0,behavior:reduceMotion()?'auto':'smooth'});
  },150);
};
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
  zone:function(){return ZONA},telLocked:function(){return TEL_LOCK},blocked:blocked,client:function(){return cli},
  storeOrigin:STORE_ORIGIN,haversineKm:haversineKm,zoneFromKm:zoneFromKm
};
window.PD_BASE=BASE;window.PD_FUERA=ZONA==='fuera';
window.PD_ADD=function(id,q){if(!BY[id])return;if(hasT(BY[id]))tsheet(id,q);else add(id,'','',q)};
window.PD_CTX={BY:function(){return BY},ALL:function(){return ALL},F:F,E:E,EMO:EMO,COL:COL};
loadCatalog(window.__CAT);
})();
