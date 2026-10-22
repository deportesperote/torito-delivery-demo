/* Torito Delivery — versión "rápida" (estilo app de delivery). Vista previa / tienda de ejemplo. */
(function(){
var WA='520000000000'; // EJEMPLO: número de WhatsApp pendiente (placeholder, no real)
var BASE='../';
var $=function(s){return document.querySelector(s)};
function E(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function F(n){return '$'+n.toLocaleString('es-MX',{minimumFractionDigits:n%1?2:0,maximumFractionDigits:2})}
function N(s){return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
var EMO={'Deportes':'🏆','Bebidas':'🥤','Dulces y Botanas':'🍬','Cuidado Personal e Higiene':'🧴','Lácteos y Refrigerados':'🥛','Limpieza del Hogar':'🧽','Vinos y Licores':'🍷','Despensa':'🥫','Mascotas':'🐶','Bebés':'👶','Fiesta y Desechables':'🎉','Panadería y Tortillería':'🍞','Hogar y Cocina':'🍳','Cocina Exprés':'🍲','Cigarros':'🚬','Otros':'🛍️'};
var SHORT={'Cuidado Personal e Higiene':'Cuidado personal','Lácteos y Refrigerados':'Lácteos','Limpieza del Hogar':'Limpieza','Vinos y Licores':'Vinos y licores','Dulces y Botanas':'Botanas','Fiesta y Desechables':'Fiesta','Panadería y Tortillería':'Panadería','Hogar y Cocina':'Hogar','Cocina Exprés':'Comida'};
var COL={'Deportes':'#1D4ED8','Bebidas':'#0EA5E9','Dulces y Botanas':'#EC4899','Cuidado Personal e Higiene':'#8B5CF6','Lácteos y Refrigerados':'#3B82F6','Limpieza del Hogar':'#14B8A6','Vinos y Licores':'#7F1D1D','Despensa':'#D97706','Mascotas':'#A16207','Bebés':'#F472B6','Fiesta y Desechables':'#F97316','Panadería y Tortillería':'#B45309','Hogar y Cocina':'#64748B','Cocina Exprés':'#DC2626','Cigarros':'#374151','Otros':'#6B7280'};
var SEMO={'Fútbol':'⚽','Básquetbol':'🏀','Voleibol':'🏐','Uniformes y textiles':'👕','Fútbol americano':'🏈','Béisbol':'⚾','Raqueta':'🎾','Handball y waterpolo':'🤾','Entrenamiento':'⏱️','Gimnasio':'🏋️','Cuidado y soporte':'🩹','Boxeo':'🥊','Natación':'🏊','Trofeos y medallas':'🏅','Accesorios':'🎒','Calzado':'👟','Zapateras':'👞','Mochilas y maletas':'🎒','Guantes Rinat':'🧤'};
var ENT={exp:{l:'⚡ Express 15 min',d:'hasta 3 km',m:15},est:{l:'🕒 Estándar 6 horas',d:'hasta 8 km',m:360}};
var PAGO={efectivo:'💵 Efectivo',transferencia:'🏦 Transferencia',tarjeta:'💳 Tarjeta al recibir'};
var H_OPEN=420,H_CLOSE=1320;
function mxNow(){var d=window.DP_NOW?new Date(window.DP_NOW):new Date(),p={};new Intl.DateTimeFormat('en-US',{timeZone:'America/Mexico_City',hour12:false,hour:'2-digit',minute:'2-digit'}).formatToParts(d).forEach(function(x){p[x.type]=x.value});return (+p.hour%24)*60+(+p.minute)}
function hh(m){return ('0'+Math.floor(m/60)).slice(-2)+':'+('0'+m%60).slice(-2)}
function eta(k){var cur=mxNow(),day=0,f=cur<H_OPEN||cur>=H_CLOSE,dur=ENT[k].m;if(cur<H_OPEN)cur=H_OPEN;else if(cur>=H_CLOSE){cur=H_OPEN;day=1}while(cur+dur>H_CLOSE){dur-=H_CLOSE-cur;cur=H_OPEN;day++}cur+=dur;return {fuera:f,txt:(day===0?'hoy':day===1?'mañana':'en '+day+' días')+' a las '+hh(cur)}}
// catálogo
var ALL=[],BY={},DEP={};
(window.PRODUCTS||[]).forEach(function(p){var n=parseInt(p.id.replace(/\D/g,''),10)||0;var it={id:'d'+p.id,n:p.n,p:p.p,iva:!!p.iva,img:p.img?BASE+p.img:'',dep:'Deportes',cat:p.c,k:p.k[0]||'',t:p.t,a:true,x:false,exp:n%2===1};it._q=N(p.n+' '+p.c+' '+p.s+' '+p.k.join(' ')+' deportes');ALL.push(it)});
function addT(T){T.forEach(function(p){var it={id:'t'+p.id,n:p.t,p:p.p,iva:false,img:'',dep:p.c,cat:p.c,k:'',t:[],a:p.a,x:p.x,exp:true};it._q=N(p.t+' '+p.c+' '+p.s);ALL.push(it)})}
function index(){BY={};DEP={};ALL.forEach(function(i){BY[i.id]=i;DEP[i.dep]=(DEP[i.dep]||0)+1})}
function depList(){return Object.keys(DEP).sort(function(a,b){return (b==='Deportes')-(a==='Deportes')||(a==='Otros')-(b==='Otros')||DEP[b]-DEP[a]})}
// estado
var S={dep:'',cat:'',q:'',lim:40,view:'home'},cart=[],cli={nombre:'',tel:'',dir:'',ref:'',ent:'exp',pago:'efectivo'},edad=false,LAST=null;
try{cart=JSON.parse(localStorage.getItem('rp_cart')||'[]')}catch(e){}try{cli=Object.assign(cli,JSON.parse(localStorage.getItem('rp_cli')||'{}'))}catch(e){}try{LAST=JSON.parse(localStorage.getItem('rp_last')||'null')}catch(e){}
function save(){try{localStorage.setItem('rp_cart',JSON.stringify(cart));localStorage.setItem('rp_cli',JSON.stringify(cli))}catch(e){}bar()}
function L(){return cart.filter(function(c){return BY[c.id]})}
function count(){return L().reduce(function(a,c){return a+c.qty},0)}
function total(){return L().reduce(function(a,c){return a+BY[c.id].p*c.qty},0)}
function qtyOf(id){return cart.filter(function(c){return c.id===id}).reduce(function(a,c){return a+c.qty},0)}
function adult(){return L().some(function(c){return BY[c.id].x})}
function canExp(){return L().every(function(c){return BY[c.id].exp})}
function entK(){return cli.ent==='exp'&&!canExp()?'est':cli.ent}
function hasT(i){return i.t.length>1||(i.dep==='Deportes'&&i.cat==='Uniformes y textiles')}
function tallas(i){return i.t.length>1?i.t:['CH','M','G','XG']}
// UI
function pic(i){return i.img?'<div class="pi"><img loading="lazy" alt="" src="'+i.img+'"></div>':'<div class="pi emo" style="--k:'+(COL[i.dep]||'#666')+'">'+(EMO[i.dep]||'🛍️')+'</div>'}
function ctl(i){var q=qtyOf(i.id);if(!i.a)return '<span class="ago">Agotado</span>';if(q&&!hasT(i))return '<div class="step"><button data-dec="'+i.id+'" aria-label="Quitar uno">−</button><b>'+q+'</b><button data-inc="'+i.id+'" aria-label="Agregar uno">+</button></div>';return '<button class="addb'+(q?' has':'')+'" data-add="'+i.id+'">'+(q?'✓ '+q+' · Agregar otra':'+ Agregar')+'</button>'}
function card(i){return '<article class="pc" id="c-'+i.id+'">'+pic(i)+(i.x?'<i class="b18">+18</i>':'')+'<div class="pb"><b class="pp">'+F(i.p)+(i.iva?' <small>+ IVA</small>':'')+'</b><h3>'+E(i.n)+'</h3><span class="tg '+(i.exp?'t1':'t2')+'">'+(i.exp?'⚡ 15 min':'🕒 6 h')+'</span>'+ctl(i)+'</div></article>'}
function refresh(id){var el=document.getElementById('c-'+id);if(el)el.outerHTML=card(BY[id])}
function grid(a){return '<div class="grid">'+a.map(card).join('')+'</div>'}
function row(t,a,dep){return '<section class="sec"><div class="sh"><h2>'+t+'</h2>'+(dep?'<button class="lnk" data-dep="'+E(dep)+'">Ver todo ›</button>':'')+'</div><div class="row">'+a.map(card).join('')+'</div></section>'}
function deps(){$('#deps').innerHTML=depList().map(function(d){return '<button class="dp'+(S.dep===d?' on':'')+'" data-dep="'+E(d)+'"><span style="--k:'+(COL[d]||'#666')+'">'+(EMO[d]||'🛍️')+'</span>'+E(SHORT[d]||d)+'</button>'}).join('')}
function pick(dep,n,f){return ALL.filter(function(i){return i.dep===dep&&i.a&&(!f||f(i))}).filter(function(_,j){return j%7===0}).slice(0,n)}
function home(){var h='';var m=mxNow(),open=m>=H_OPEN&&m<H_CLOSE;
  h+='<div class="hint'+(open?'':' off')+'">'+(open?'🟢 Abierto · Express llega en ~15 min (hasta 3 km)':'🌙 Fuera de horario · tu pedido se procesa a partir de las 7:00 h')+'</div>';
  if(LAST&&LAST.items&&LAST.items.some(function(c){return BY[c.id]})){h+='<section class="again"><div><b>🔁 Volver a pedir</b><small>'+LAST.items.length+' productos · '+F(LAST.total)+' · '+E(LAST.folio)+'</small><p>'+LAST.items.slice(0,3).map(function(c){return BY[c.id]?E(c.qty+'× '+BY[c.id].n):''}).join(' · ')+(LAST.items.length>3?'…':'')+'</p></div><button class="big" data-again>Agregar todo</button></section>'}
  var seen={},dp=ALL.filter(function(i){if(i.dep!=='Deportes'||!i.img||seen[i.cat]||/oka/i.test(i.n))return false;seen[i.cat]=1;return true}).slice(0,12);
  h+=row('🥤 Bebidas frías',pick('Bebidas',10),'Bebidas')+row('🍬 Botanas',pick('Dulces y Botanas',10),'Dulces y Botanas')+row('🏆 Deportes',dp,'Deportes')+row('🥛 Lácteos',pick('Lácteos y Refrigerados',10),'Lácteos y Refrigerados')+row('🧽 Limpieza',pick('Limpieza del Hogar',10),'Limpieza del Hogar');
  return h}
function list(){var t=N(S.q).split(/\s+/).filter(Boolean),r=ALL.filter(function(i){return (!S.dep||i.dep===S.dep)&&(!S.cat||i.cat===S.cat)&&t.every(function(w){return i._q.indexOf(w)>=0})});
  r.sort(function(a,b){return b.a-a.a});
  var h='<div class="lh"><button class="back" data-home aria-label="Volver">←</button><h2>'+(S.q?'“'+E(S.q)+'”':(EMO[S.dep]||'')+' '+E(S.dep))+'</h2><small>'+r.length+'</small></div>';
  if(S.dep==='Deportes'){var cs={};ALL.forEach(function(i){if(i.dep==='Deportes')cs[i.cat]=(cs[i.cat]||0)+1});h+='<div class="chips"><button class="ch'+(S.cat?'':' on')+'" data-cat="">Todo</button>'+Object.keys(cs).map(function(c){return '<button class="ch'+(S.cat===c?' on':'')+'" data-cat="'+E(c)+'">'+(SEMO[c]||'')+' '+E(c)+'</button>'}).join('')+'</div>'}
  if(!r.length)h+='<p class="none">No encontramos “'+E(S.q)+'”. Prueba con otra palabra.</p>';
  return h+grid(r.slice(0,S.lim))+(r.length>S.lim?'<div class="more"><button data-more>Ver más</button></div>':'')}
function render(){deps();$('#app').innerHTML=S.view==='home'?home():list();bar()}
function go(o){Object.assign(S,{lim:40},o);S.view=(S.dep||S.q)?'list':'home';render();window.scrollTo(0,0)}
function bar(){var n=count(),b=$('#cbar');b.hidden=!n;document.body.classList.toggle('hasbar',!!n);b.innerHTML='<span class="cn">'+n+'</span><b>Ver carrito</b><span>'+F(total())+'</span>'}
function toast(t){var x=$('#toast');x.textContent=t;x.hidden=false;clearTimeout(x._t);x._t=setTimeout(function(){x.hidden=true},1400)}
function add(id,talla,nota,q){var f=cart.filter(function(c){return c.id===id&&(c.talla||'')===(talla||'')&&(c.nota||'')===(nota||'')})[0];if(f)f.qty+=q||1;else cart.push({id:id,qty:q||1,talla:talla||(BY[id].t.length===1?BY[id].t[0]:''),nota:nota||''});save();refresh(id)}
function dec(id){for(var k=cart.length-1;k>=0;k--)if(cart[k].id===id){if(cart[k].qty>1)cart[k].qty--;else cart.splice(k,1);break}save();refresh(id)}
// hoja de talla
function tsheet(id){var i=BY[id],tl=tallas(i),sel=tl[0];ov('<div class="sm"><div class="grab"></div><div class="smh">'+pic(i)+'<div><b>'+E(i.n)+'</b><span class="pp">'+F(i.p)+(i.iva?' <small>+ IVA</small>':'')+'</span></div></div><p class="lb">Elige tu talla</p><div class="tl">'+tl.map(function(x,k){return '<button data-tl="'+E(x)+'" class="'+(k?'':'on')+'">'+E(x)+'</button>'}).join('')+'</div>'+(i.cat==='Uniformes y textiles'?'<input id="tn" class="in" placeholder="Nombre y número (opcional)">':'')+'<button class="big" id="tok">Agregar · '+F(i.p)+'</button></div>',function(e,b){if(b.dataset.tl){sel=b.dataset.tl;[].forEach.call(b.parentNode.children,function(x){x.classList.toggle('on',x===b)})}if(b.id==='tok'){add(id,sel,$('#tn')?$('#tn').value.trim():'');closeOv();toast('Agregado ✓')}})}
var ovH=null;function ov(html,h){var o=$('#ov');o.innerHTML=html;o.hidden=false;document.body.style.overflow='hidden';ovH=h}
function closeOv(){$('#ov').hidden=true;document.body.style.overflow='';ovH=null}
$('#ov').onclick=function(e){if(e.target.id==='ov'){closeOv();return}var b=e.target.closest('button');if(b&&b.dataset.close!=null){closeOv();return}if(b&&ovH)ovH(e,b)};
$('#ov').oninput=function(e){var t=e.target;if(t.dataset.f){cli[t.dataset.f]=t.value;save()}if(t.id==='edad')edad=t.checked};
// checkout en una sola página
function checkout(){var it=L();if(!it.length){closeOv();return}var k=entK(),e=eta(k),t=total(),c=cli,ready=c.nombre&&c.tel&&c.dir;
  var h='<div class="co"><div class="coh"><button data-close class="back" aria-label="Cerrar">←</button><h2>Tu pedido</h2></div><div class="cob">';
  h+='<section class="box"><h3>🛒 '+count()+' artículos</h3>'+it.map(function(c){var i=BY[c.id];return '<div class="li">'+pic(i)+'<div class="lt"><b>'+E(i.n)+'</b>'+(c.talla?'<small>Talla '+E(c.talla)+(c.nota?' · '+E(c.nota):'')+'</small>':'')+(i.x?'<i class="b18 s">+18</i>':'')+'</div><div class="lr"><b>'+F(i.p*c.qty)+'</b><div class="step sm"><button data-m="'+cart.indexOf(c)+'" aria-label="Quitar uno">−</button><b>'+c.qty+'</b><button data-p="'+cart.indexOf(c)+'" aria-label="Agregar uno">+</button></div></div></div>'}).join('')+'</section>';
  h+='<section class="box"><h3>🚚 ¿Cuándo lo quieres?</h3><div class="opts">'+Object.keys(ENT).map(function(x){var dis=x==='exp'&&!canExp();return '<button class="op'+(k===x?' on':'')+'" data-ent="'+x+'"'+(dis?' disabled':'')+'><b>'+ENT[x].l+'</b><small>'+ENT[x].d+'</small></button>'}).join('')+'</div>'+(!canExp()?'<p class="nt">Tu carrito tiene artículos de 6 horas, por eso va en Estándar.</p>':'')+(e.fuera?'<p class="warn">🌙 Pediste fuera de horario: tu pedido se procesa a partir de las 7:00 h.</p>':'')+'<p class="eta">⏱️ Llega aprox. <b>'+e.txt+'</b></p><p class="nt">Tiempos válidos en pedidos de 7:00 a 22:00 h.</p></section>';
  h+='<section class="box"><h3>📍 ¿A dónde lo llevamos?</h3><input class="in" data-f="nombre" autocomplete="name" placeholder="Tu nombre" value="'+E(c.nombre)+'"><input class="in" data-f="tel" type="tel" inputmode="tel" autocomplete="tel" placeholder="Teléfono (10 dígitos)" value="'+E(c.tel)+'"><input class="in" data-f="dir" autocomplete="street-address" placeholder="Calle, número y colonia" value="'+E(c.dir)+'"><input class="in" data-f="ref" placeholder="Referencia (opcional)" value="'+E(c.ref)+'">'+(ready?'<p class="nt ok">✓ Usamos tus datos guardados en este teléfono.</p>':'')+'</section>';
  h+='<section class="box"><h3>💳 ¿Cómo pagas?</h3><div class="opts three">'+Object.keys(PAGO).map(function(x){return '<button class="op'+(c.pago===x?' on':'')+'" data-pago="'+x+'"><b>'+PAGO[x]+'</b></button>'}).join('')+'</div></section>';
  if(adult())h+='<section class="box age"><h3>🔞 Productos para mayores de 18</h3><p>Se pedirá identificación oficial al entregar.</p><label class="ck"><input type="checkbox" id="edad"'+(edad?' checked':'')+'> Confirmo que soy mayor de edad</label></section>';
  h+='<section class="box tot"><div><span>Productos</span><span>'+F(t)+'</span></div><div><span>Envío</span><span>Por confirmar</span></div><div class="gt"><span>Total</span><span>'+F(t)+'</span></div>'+(L().some(function(c){return BY[c.id].iva})?'<p class="nt">Algunos artículos se cobran + IVA.</p>':'')+'</section><p class="err" id="err"></p></div>';
  h+='<div class="cof"><button class="big go" id="pedir">Pedir ahora · '+F(t)+'</button></div></div>';
  ov(h,function(ev,b){var d=b.dataset;if(d.ent){cli.ent=d.ent;save();checkout();return}if(d.pago){cli.pago=d.pago;save();checkout();return}
    if(d.m!=null){var j=+d.m;if(cart[j].qty>1)cart[j].qty--;else cart.splice(j,1);save();render();checkout();return}if(d.p!=null){cart[+d.p].qty++;save();render();checkout();return}
    if(b.id==='pedir'){var er=!cli.nombre?'Escribe tu nombre.':!/\d{10}/.test((cli.tel||'').replace(/\D/g,''))?'Escribe un teléfono de 10 dígitos.':!cli.dir?'Escribe tu dirección.':(adult()&&!edad)?'Confirma que eres mayor de edad.':'';if(er){$('#err').textContent=er;$('#err').scrollIntoView({block:'center'});return}confirmOrder()}})}
function folio(){var s=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Mexico_City'}).format(window.DP_NOW?new Date(window.DP_NOW):new Date()).replace(/-/g,''),k='rp_folio_'+s,n=1;try{n=+(localStorage.getItem(k)||0)+1;localStorage.setItem(k,n)}catch(e){}return 'TD-'+s+'-'+('000'+n).slice(-4)}
function msg(o){var c=o.cli;return '✅ *Pedido Torito Delivery*\nFolio: *'+o.folio+'*\n\n'+o.items.map(function(x){var i=BY[x.id];return '• '+x.qty+' × '+i.n+(x.talla?' (Talla '+x.talla+')':'')+(x.nota?' — '+x.nota:'')+' = '+F(i.p*x.qty)+(i.iva?' + IVA':'')}).join('\n')+'\n\n*Total: '+F(o.total)+'* · envío por confirmar\n🚚 '+ENT[o.ent].l.replace(/^\S+ /,'')+' ('+ENT[o.ent].d+')'+(o.eta.fuera?'\n🌙 Pedido fuera de horario: se procesa a partir de las 7:00 h':'')+'\n⏱️ Llega aprox. '+o.eta.txt+'\n📍 '+c.dir+(c.ref?' (Ref: '+c.ref+')':'')+'\n💳 '+PAGO[c.pago].replace(/^\S+ /,'')+'\n👤 '+c.nombre+' · '+c.tel+(o.adult?'\n🔞 Cliente confirma ser mayor de edad':'')}
function confirmOrder(){var k=entK();var o={folio:folio(),items:L().map(function(c){return Object.assign({},c)}),total:total(),cli:Object.assign({},cli),ent:k,eta:eta(k),adult:adult()};LAST=o;try{localStorage.setItem('rp_last',JSON.stringify(o))}catch(e){}cart=[];edad=false;save();render();
  ov('<div class="co"><div class="cob done"><div class="okc">✓</div><h2>¡Pedido listo!</h2><p>Folio</p><div class="fol">'+o.folio+'</div><p class="eta big2">⏱️ Llega aprox. <b>'+o.eta.txt+'</b></p>'+(o.eta.fuera?'<p class="warn">🌙 Fuera de horario: se procesa a partir de las 7:00 h.</p>':'')+'<p>'+o.items.length+' productos · <b>'+F(o.total)+'</b> · '+ENT[k].l+'</p><a class="big wa" target="_blank" rel="noopener" href="https://wa.me/'+WA+'?text='+encodeURIComponent(msg(o))+'">Enviar confirmación por WhatsApp</a><p class="nt">Número de WhatsApp: EJEMPLO (pendiente)</p><button class="big ghost" data-close>Seguir comprando</button></div></div>',function(){})}
// eventos
document.addEventListener('click',function(e){var b=e.target.closest('button,a');if(!b||b.closest('#ov'))return;var d=b.dataset;
  if(d.add){var i=BY[d.add];if(hasT(i))tsheet(d.add);else add(d.add);return}
  if(d.inc){add(d.inc);return}if(d.dec){dec(d.dec);return}
  if(d.dep!=null){$('#q').value='';$('#qx').hidden=true;go({dep:S.dep===d.dep&&S.view==='list'?'':d.dep,cat:'',q:''});return}
  if(d.cat!=null){go({cat:d.cat});return}
  if(d.more!=null){S.lim+=40;render();return}
  if(d.again!=null){LAST.items.forEach(function(c){if(BY[c.id]&&BY[c.id].a)add(c.id,c.talla,c.nota,c.qty)});toast('Agregamos tu pedido anterior ✓');checkout();return}
  if(d.home!=null||b.id==='home'){e.preventDefault();$('#q').value='';$('#qx').hidden=true;go({dep:'',cat:'',q:''});return}
  if(b.id==='cbar'){checkout();return}
  if(b.id==='qx'){$('#q').value='';b.hidden=true;go({q:'',dep:'',cat:''});$('#q').focus()}});
var qt;$('#q').oninput=function(){var v=this.value;$('#qx').hidden=!v;clearTimeout(qt);qt=setTimeout(function(){go({q:v.trim(),dep:'',cat:''})},150)};
index();render();
fetch(BASE+'torito-products.json').then(function(r){return r.json()}).then(function(T){addT(T);index();render()});
window.RP={go:go,checkout:checkout,add:add,set:function(c,k,l){cart=c;if(k)cli=Object.assign(cli,k);if(l){LAST=l}save();render()}};
})();
