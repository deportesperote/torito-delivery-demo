/* Simulador de flujo Torito. No cobra, no abre WhatsApp y no es un pedido real. */
(function(){
var $=function(s){return document.querySelector(s)};
function E(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function money(n){n=Math.round((Number(n)||0)*100)/100;return '$'+n.toLocaleString('es-MX',{minimumFractionDigits:n%1?2:0,maximumFractionDigits:2})}
function reduce(){return !!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)}
var MIN=49,FREE=299;
var COLONIAS=[
  {id:'centro',n:'Centro',km:'1.2 km',z:'expres'},
  {id:'pinos',n:'Los Pinos',km:'2.4 km',z:'expres'},
  {id:'fuente',n:'La Fuente',km:'2.9 km',z:'expres'},
  {id:'triunfo',n:'El Triunfo',km:'5.1 km',z:'estandar'},
  {id:'veinte',n:'20 de Noviembre',km:'6.4 km',z:'estandar'},
  {id:'minillas',n:'Las Minillas',km:'7.8 km',z:'estandar'}
];
/* Nombres y precios del catálogo real (torito-products.json y products.js). */
var GOODS=[
  {id:'g1',n:'7UP Sabor Lima Limón Refresco 1.5 L',p:32,img:'../media/torito/c-7501022014080.webp'},
  {id:'g2',n:'Cheetos Bolzaza Torciditos 115 g',p:30,img:'../media/torito/bolzaza-cheetos-torciditos-115-g-sabritas.webp'},
  {id:'g3',n:'Alpura Vaquitas Leche Sabor Vainilla 200 ml',p:12,img:'../media/torito/c-7501055915705.webp'},
  {id:'g4',n:'Marinela Gansito 50 g',p:18,img:'../media/torito/gansito-50-g-marinela.webp'},
  {id:'g5',n:'Bimbo Bimbollos 450 g (8 pz)',p:52,img:'../media/torito/bimbollos-8-pz-450-g-bimbo.webp'},
  {id:'g6',n:'Boing Jugo de Guayaba Botellita 237 ml',p:14,img:'../media/torito/boing-jugo-de-guayaba-237-ml-vidrio.webp'},
  {id:'g7',n:'Balón Soccer Basic Cosido PVC 7.0',p:170,img:'../img/p/p0001.webp'}
];
var MENU=[
  {id:'t1',n:'Taco de pastor',p:22},
  {id:'t2',n:'Taco de bistec',p:25},
  {id:'t3',n:'Quesadilla sencilla',p:30},
  {id:'t4',n:'Gringa',p:45},
  {id:'t5',n:'Agua fresca del día',p:18},
  {id:'t6',n:'Orden de papas',p:35}
];
var BY={};
GOODS.concat(MENU).forEach(function(p){BY[p.id]=p});
var S,timers=[];
function blank(){return {step:1,path:'',zone:null,cart:{},paid:false,mode:'',posting:false}}
function later(fn,ms){var t=setTimeout(fn,reduce()?Math.min(ms,160):ms);timers.push(t)}
function clearTimers(){timers.forEach(clearTimeout);timers=[]}
function setStep(n){
  S.step=n;
  var current=null;
  [].forEach.call($('#steps').children,function(li){
    var k=+li.dataset.step;
    li.classList.toggle('on',k===n);
    li.classList.toggle('done',k<n);
    if(k===n){li.setAttribute('aria-current','step');current=li}else li.removeAttribute('aria-current');
  });
  if(current&&current.scrollIntoView)current.scrollIntoView({inline:'center',block:'nearest',behavior:reduce()?'auto':'smooth'});
}
function scrollLog(){var log=$('#log');log.scrollTop=log.scrollHeight}
function qty(id){return S.cart[id]||0}
function lines(){return Object.keys(S.cart).filter(function(id){return S.cart[id]>0&&BY[id]}).map(function(id){return {item:BY[id],qty:S.cart[id]}})}
function subtotal(){return lines().reduce(function(a,l){return a+l.item.p*l.qty},0)}
function shipFee(sub){if(!S.zone)return 0;if(sub>=FREE)return 0;return S.zone.z==='expres'?29:19}
function count(){return lines().reduce(function(a,l){return a+l.qty},0)}
function zoneName(){return S.zone?(S.zone.z==='expres'?'Exprés':'Estándar')+' · '+S.zone.n:''}
function paintDock(){
  var d=$('#dock');
  if(S.paid||!count()){d.hidden=true;d.innerHTML='';return}
  d.hidden=false;
  var n=count();
  d.innerHTML='<button type="button" data-act="pedido">Ver pedido · '+n+' · '+money(subtotal())+'</button>';
}
function paintRows(){
  [].forEach.call(document.querySelectorAll('.row'),function(row){
    var id=row.dataset.id,q=qty(id),ctl=row.querySelector('.ctl');
    if(!ctl||S.paid)return;
    ctl.innerHTML=q
      ?'<div class="stepper"><button type="button" data-dec="'+id+'" aria-label="Quitar uno">−</button><b>'+q+'</b><button type="button" data-inc="'+id+'" aria-label="Agregar uno">+</button></div>'
      :'<button type="button" class="addb" data-add="'+id+'">Agregar</button>';
  });
  paintDock();
}
function userSay(text){
  var log=$('#log');
  var el=document.createElement('div');
  el.className='msg user';
  el.innerHTML='<div class="bubble">'+E(text)+'</div>';
  log.appendChild(el);
  scrollLog();
}
function botSay(html,ms){
  var log=$('#log');
  var hold=document.createElement('div');
  hold.className='msg';
  hold.innerHTML='<span class="botface" aria-hidden="true">🐂</span><div class="bubble"><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span></div>';
  log.appendChild(hold);
  scrollLog();
  later(function(){
    hold.querySelector('.bubble').innerHTML=html;
    scrollLog();
  },ms==null?520:ms);
}
function choicesHtml(list){
  return '<div class="choices">'+list.map(function(b){
    return '<button type="button" data-act="'+E(b.id)+'">'+E(b.n)+'</button>';
  }).join('')+'</div>';
}
function lockChoices(){
  [].forEach.call(document.querySelectorAll('.choices button'),function(b){
    if(b.dataset.act==='iframe')return;
    b.disabled=true;
  });
}
function rowHtml(p){
  var q=qty(p.id);
  var ctl=q
    ?'<div class="stepper"><button type="button" data-dec="'+p.id+'" aria-label="Quitar uno">−</button><b>'+q+'</b><button type="button" data-inc="'+p.id+'" aria-label="Agregar uno">+</button></div>'
    :'<button type="button" class="addb" data-add="'+p.id+'">Agregar</button>';
  var img=p.img?'<img alt="" src="'+E(p.img)+'">':'<img alt="" src="../favicon.svg">';
  return '<div class="row" data-id="'+p.id+'">'+img+'<div class="meta"><b>'+E(p.n)+'</b><span>'+money(p.p)+'</span></div><div class="ctl">'+ctl+'</div></div>';
}
function welcome(){
  setStep(1);
  botSay('<p>Hola, Juan 👋 Bienvenido a Torito Delivery. Puedes armar un pedido de ejemplo: el súper, comida o una duda.</p><p>Nada de esto cobra ni sale a reparto.</p>'+choicesHtml([
    {id:'comprar',n:'Comprar ahora'},
    {id:'comida',n:'Pedir comida'},
    {id:'ayuda',n:'Necesito ayuda'}
  ]),80);
}
function askZone(){
  setStep(2);
  botSay('<p>¿En qué colonia de ejemplo estás? Sirve para calcular Exprés o Estándar. No es la cobertura real de Perote.</p>'+choicesHtml(COLONIAS.map(function(c){
    return {id:'zona:'+c.id,n:c.n+' · '+c.km+' · ejemplo'};
  })));
}
function zoneReply(){
  var c=S.zone,exp=c.z==='expres';
  var txt=exp
    ?c.n+' queda a '+c.km+' (dato de ejemplo). Te toca zona <b>Exprés</b>: hasta 3 km, envío $29, unos 15 min.'
    :c.n+' queda a '+c.km+' (dato de ejemplo). Te toca zona <b>Estándar</b>: hasta 8 km, envío $19, alrededor de 1 h.';
  botSay('<p>'+txt+'</p><p>Envío gratis desde $299. Pedido mínimo $49.</p>',420);
  later(function(){S.path==='comida'?showMenu():showGoods()},reduce()?200:700);
}
function showGoods(){
  setStep(3);
  botSay('<p>Mini catálogo con productos y precios del catálogo real. El pedido de la demo se arma aquí.</p><div class="rows">'+GOODS.map(rowHtml).join('')+'</div><div class="choices"><button type="button" data-act="iframe">Abrir catálogo completo</button></div><p class="note">La tienda completa es la de /rapido/. Lo que agregues allá no entra a este pedido de ejemplo.</p>');
}
function showMenu(){
  setStep(3);
  botSay('<div class="place"><span class="avatar" aria-hidden="true">🌮</span><div><b>Castor Tacos</b><p>Preparación 10–15 min</p><small>Menú de ejemplo</small></div></div><p>Precios de muestra, no son la carta real.</p><div class="rows">'+MENU.map(rowHtml).join('')+'</div>');
}
function add(id,d){
  if(S.paid||!BY[id])return;
  var q=qty(id)+d;
  if(q<=0)delete S.cart[id];else S.cart[id]=Math.min(20,q);
  paintRows();
}
function ticketHtml(){
  var sub=subtotal(),fee=shipFee(sub),items=lines();
  var lis=items.map(function(l){
    return '<li><span>'+l.qty+' × '+E(l.item.n)+'</span><b>'+money(l.item.p*l.qty)+'</b></li>';
  }).join('');
  var env=fee===0?'GRATIS':money(fee);
  return '<div class="ticket"><b>PEDIDO #1234</b><p class="demo-line">Demo · no es un pedido real</p><ul>'+lis+'</ul><div class="sums"><div><span>Zona</span><span>'+E(zoneName())+'</span></div><div><span>Subtotal</span><span>'+money(sub)+'</span></div><div><span>Envío</span><span>'+env+'</span></div><div class="total"><span>Total</span><span>'+money(sub+fee)+'</span></div></div></div>';
}
function showPedido(){
  if(S.paid||S.posting)return;
  if(!count()){botSay('<p>Agrega algo al pedido para continuar.</p>');return}
  S.posting=true;
  lockChoices();
  userSay('Ver pedido');
  setStep(4);
  var sub=subtotal();
  botSay(ticketHtml(),360);
  later(function(){
    S.posting=false;
    if(sub<MIN){
      botSay('<p>Te faltan '+money(MIN-sub)+' para el mínimo de '+money(MIN)+'. Sigue agregando y toca Ver pedido otra vez.</p>');
      return;
    }
    botSay('<p>Así quedaría el mensaje del pedido. ¿Lo mandamos a pagar? No se cobra nada.</p>'+choicesHtml([{id:'pagar',n:'Pagar con Mercado Pago'}]));
  },reduce()?200:900);
}
function openFrame(){
  if(!S.zone)return;
  var src='../rapido/?zona='+S.zone.z+'&nombre=Juan&tel=demo';
  var frame=$('#frame');
  if(frame.getAttribute('src')!==src)frame.src=src;
  $('#panel').hidden=false;
}
function closeFrame(){$('#panel').hidden=true}
function pay(){
  if(S.paid||subtotal()<MIN)return;
  lockChoices();
  userSay('Pagar con Mercado Pago');
  setStep(5);
  var sub=subtotal();
  $('#paysum').textContent='Total '+money(sub+shipFee(sub))+' · '+zoneName();
  $('#pay').hidden=false;
}
function afterPay(){
  $('#pay').hidden=true;
  if(S.paid)return;
  S.paid=true;
  paintDock();
  [].forEach.call(document.querySelectorAll('.row button'),function(b){b.disabled=true});
  botSay('<p>Pago de demostración aprobado. PEDIDO #1234 sigue en este chat.</p>',300);
  later(runTimeline,reduce()?180:800);
}
function etaLine(){
  var food=S.mode==='comida'||lines().some(function(l){return l.item.id.charAt(0)==='t'});
  if(food&&S.zone.z==='expres')return 'Castor lo prepara en 10–15 min y el envío Exprés son unos 15 min más.';
  if(food)return 'Castor lo prepara en 10–15 min. La entrega estándar es de alrededor de 1 h.';
  if(S.zone.z==='expres')return 'Sale en unos 15 min hacia '+S.zone.n+'.';
  return 'La entrega estándar a '+S.zone.n+' es de alrededor de 1 h.';
}
function status(title,text){
  return '<div class="status"><span class="mark" aria-hidden="true">✓</span><div><b>'+title+'</b><p>'+text+'</p></div></div>';
}
function runTimeline(){
  setStep(6);
  var steps=[
    [700,status('Confirmado','PEDIDO #1234 quedó confirmado. Sigue siendo una demo.')],
    [1300,status('Preparando',S.mode==='comida'?'Castor Tacos está armando el pedido, 10–15 min.':'Estamos juntando los productos.')],
    [1400,status('En camino',etaLine())],
    [1400,status('Entregado','Listo, Juan. Gracias. Aquí terminó la simulación.')]
  ];
  var wait=0;
  steps.forEach(function(s){
    wait+=reduce()?180:s[0];
    later(function(){botSay(s[1],reduce()?40:280)},wait);
  });
  later(function(){
    [].forEach.call($('#steps').children,function(li){
      li.classList.add('done');
      li.classList.toggle('on',li.dataset.step==='6');
    });
  },wait+(reduce()?200:700));
}
function help(){
  userSay('Necesito ayuda');
  botSay('<p>Puedo responder dudas de la demo. Nada de esto habla con una persona real.</p>'+choicesHtml([
    {id:'faq-horas',n:'Horarios'},
    {id:'faq-zonas',n:'Zonas y envío'},
    {id:'faq-humano',n:'Hablar con una persona'}
  ]));
}
function faq(id){
  var answers={
    'faq-horas':'Abrimos de 7:00 a 22:00 h, hora de Perote.',
    'faq-zonas':'Exprés: hasta 3 km, envío $29, unos 15 min. Estándar: hasta 8 km, envío $19, alrededor de 1 h. Envío gratis desde $299. Pedido mínimo $49. Las colonias de esta pantalla son de ejemplo.',
    'faq-humano':'En esta demo no hay una persona del otro lado. En el chat real, el equipo de Torito sigue la conversación.'
  };
  var labels={'faq-horas':'Horarios','faq-zonas':'Zonas y envío','faq-humano':'Hablar con una persona'};
  lockChoices();
  userSay(labels[id]);
  botSay('<p>'+answers[id]+'</p><p>¿Qué quieres hacer ahora?</p>'+choicesHtml([
    {id:'faq-horas',n:'Horarios'},
    {id:'faq-zonas',n:'Zonas y envío'},
    {id:'faq-humano',n:'Hablar con una persona'},
    {id:'comprar',n:'Comprar ahora'},
    {id:'comida',n:'Pedir comida'}
  ]));
}
function startPath(path){
  lockChoices();
  S.path=path;
  S.mode=path==='comida'?'comida':'super';
  userSay(path==='comida'?'Pedir comida':'Comprar ahora');
  if(!S.zone)askZone();
  else later(function(){path==='comida'?showMenu():showGoods()},200);
}
function onZone(id){
  var c=null;
  for(var i=0;i<COLONIAS.length;i++)if(COLONIAS[i].id===id)c=COLONIAS[i];
  if(!c)return;
  lockChoices();
  S.zone=c;
  userSay(c.n+' · ejemplo');
  zoneReply();
}
function reset(){
  clearTimers();
  closeFrame();
  $('#pay').hidden=true;
  $('#frame').removeAttribute('src');
  S=blank();
  $('#log').innerHTML='';
  paintDock();
  welcome();
}
document.addEventListener('click',function(e){
  var b=e.target.closest('button');
  if(!b||b.disabled)return;
  if(b.id==='reset'){reset();return}
  if(b.id==='panelx'){closeFrame();return}
  if(b.id==='payok'){afterPay();return}
  if(b.dataset.add){add(b.dataset.add,1);return}
  if(b.dataset.inc){add(b.dataset.inc,1);return}
  if(b.dataset.dec){add(b.dataset.dec,-1);return}
  var act=b.dataset.act;
  if(!act)return;
  if(act==='comprar'||act==='comida'){startPath(act==='comida'?'comida':'super');return}
  if(act==='ayuda'){lockChoices();help();return}
  if(act.indexOf('zona:')===0){onZone(act.slice(5));return}
  if(act==='iframe'){openFrame();return}
  if(act==='pedido'){showPedido();return}
  if(act==='pagar'){pay();return}
  if(act.indexOf('faq-')===0){faq(act);return}
});
S=blank();
welcome();
})();
