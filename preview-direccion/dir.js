/* Vista previa de la dirección. No modifica /rapido/. */
(function(){
var STORE_ORIGIN={name:'Torito Delivery',lat:19.5605936,lng:-97.2434922};
var COLONIAS=['Centro','20 de Noviembre','Amado Nervo','Azteca','Del Bosque','Del Valle','Donaldo Colosio','Echeverría','El Calvario','El Conejo','El Escobilla','El Limón','El Pedregal','Francisco Villa','Guadalupe Victoria','Héroe de Nacozari','Justo Sierra','La Gloria','Landa','Los Molinos','Los Pescados','Niños Héroes','Rancho Nuevo','Sabinal','Sierra de Agua','Tenextepec','Teresa Morales','Veracruz','Vicente Guerrero','Vidal Díaz Muñoz'];
var HINT={
  a:'Dos pestañas: ubicación o escribir la dirección.',
  b:'El formulario va primero. La ubicación es un enlace.',
  c:'Primero el GPS. «Prefiero escribirla» abre el formulario.'
};
function $(s){return document.querySelector(s)}
function E(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function N(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
function money(n){return '$'+Number(n).toLocaleString('es-MX')}
function kmLabel(km){var n=Math.round(km*10)/10;return n.toLocaleString('es-MX',{minimumFractionDigits:1,maximumFractionDigits:1})+' km'}
function fromStore(km){return 'a '+kmLabel(km)+' de '+STORE_ORIGIN.name}
function haversineKm(a,b){
  var R=6371,p=Math.PI/180,dLat=(b.lat-a.lat)*p,dLng=(b.lng-a.lng)*p;
  var s=Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(a.lat*p)*Math.cos(b.lat*p)*Math.sin(dLng/2)*Math.sin(dLng/2);
  return 2*R*Math.asin(Math.min(1,Math.sqrt(s)));
}
function zoneFromKm(km){
  if(km<=3)return {band:'expres',label:'Exprés',when:'15 min',fee:29};
  if(km<=8)return {band:'estandar',label:'Estándar',when:'1 h',fee:19};
  return {band:'fuera',label:'Fuera de zona de entrega',when:'',fee:0};
}
var S={opt:'a',tab:'gps',form:false,calle:'',colonia:'',refs:'',lat:null,lng:null,km:null,mode:'',msg:'',loading:false};
function blankKeepOpt(){
  var opt=S.opt;
  S={opt:opt,tab:'gps',form:false,calle:'',colonia:'',refs:'',lat:null,lng:null,km:null,mode:'',msg:'',loading:false};
}
function readForm(){
  var c=$('#calle'),k=$('#colonia'),r=$('#refs');
  if(c)S.calle=c.value;
  if(k)S.colonia=k.value;
  if(r)S.refs=r.value;
}
function matchColonia(name){
  var n=N(name);
  for(var i=0;i<COLONIAS.length;i++)if(N(COLONIAS[i])===n)return COLONIAS[i];
  return '';
}
function coloniaOptions(){
  return '<option value="">Elige tu colonia</option>'+COLONIAS.map(function(c){
    return '<option'+(c===S.colonia?' selected':'')+'>'+E(c)+'</option>';
  }).join('');
}
function formHtml(){
  return '<label>Calle y número<input id="calle" class="in" maxlength="120" autocomplete="address-line1" value="'+E(S.calle)+'" placeholder="Ej. Independencia 20"></label>'
    +'<label>Colonia<select id="colonia" class="in">'+coloniaOptions()+'</select></label>'
    +'<p class="hint">Colonias y localidades de Perote, para esta vista previa.</p>'
    +'<label>Referencias<input id="refs" class="in" maxlength="160" placeholder="Ej. portón azul, frente al parque" value="'+E(S.refs)+'"></label>'
    +'<button type="button" class="calc" id="calc"'+(S.loading?' disabled':'')+'>'+(S.loading?'Buscando…':'Calcular zona')+'</button>';
}
function zoneHtml(){
  if(S.mode==='ok'&&S.km!=null){
    var z=zoneFromKm(S.km),cls=z.band==='fuera'?'bad':'ok';
    var extra=z.band==='fuera'?'':z.label+' · '+z.when+' · '+(z.fee?'envío '+money(z.fee):'envío gratis')+' · ';
    return '<p class="zone '+cls+'">'+(z.band==='fuera'?'Fuera de zona de entrega · ':'')+extra+E(fromStore(S.km))+'</p>';
  }
  if(S.mode==='confirmar')return '<p class="zone wait">Zona por confirmar. Te decimos en WhatsApp si es Exprés o Estándar.</p>';
  return '';
}
function msgHtml(){return S.msg?'<p class="err">'+E(S.msg)+'</p>':'';}
function render(){
  [].forEach.call(document.querySelectorAll('.opt'),function(b){
    var on=b.dataset.opt===S.opt;
    b.classList.toggle('on',on);
    b.setAttribute('aria-selected',on?'true':'false');
  });
  $('#opthint').textContent=HINT[S.opt]||'';
  var h='<section class="addr"><h2>Dirección de entrega</h2>';
  if(S.opt==='a'){
    h+='<div class="tabs" role="tablist">';
    h+='<button type="button" class="tab'+(S.tab==='gps'?' on':'')+'" data-tab="gps" role="tab" aria-selected="'+(S.tab==='gps')+'">📍 Usar mi ubicación</button>';
    h+='<button type="button" class="tab'+(S.tab==='write'?' on':'')+'" data-tab="write" role="tab" aria-selected="'+(S.tab==='write')+'">✍️ Escribir dirección</button>';
    h+='</div>';
    if(S.tab==='gps'){
      h+='<button type="button" class="geo" id="geo"'+(S.loading?' disabled':'')+'>'+(S.loading?'Buscando ubicación…':'📍 Usar mi ubicación')+'</button>';
      h+=msgHtml();
      if(S.calle||S.colonia||S.mode)h+=formHtml().replace('class="calc"','class="calc" hidden')+zoneHtml();
    }else{
      h+=formHtml()+msgHtml()+zoneHtml();
    }
  }else if(S.opt==='b'){
    h+=formHtml();
    h+='<button type="button" class="linkish" id="geo">o usa tu ubicación</button>';
    h+=msgHtml()+zoneHtml();
  }else{
    h+='<button type="button" class="geo" id="geo"'+(S.loading?' disabled':'')+'>'+(S.loading?'Buscando ubicación…':'📍 Usar mi ubicación')+'</button>';
    h+='<button type="button" class="writebtn" id="showform">Prefiero escribirla</button>';
    if(S.form)h+=formHtml();
    h+=msgHtml()+zoneHtml();
  }
  h+='</section>';
  var focus=document.activeElement&&document.activeElement.id;
  $('#addr').innerHTML=h;
  if(focus&&$('#'+focus)){$('#'+focus).focus();if($('#'+focus).setSelectionRange){var v=$('#'+focus).value||'';$('#'+focus).setSelectionRange(v.length,v.length)}}
}
function setModeFromKm(){
  S.mode='ok';
  S.msg='';
}
function geocodeQuery(){
  var bits=[S.calle,S.colonia,'Perote','Veracruz','México'].filter(Boolean);
  return bits.join(', ');
}
function onSearch(rows){
  var hit=rows&&rows[0];
  if(!hit||hit.lat==null){
    S.lat=null;S.lng=null;S.km=null;S.mode='confirmar';S.loading=false;
    S.msg=S.colonia
      ?'No ubicamos esa calle. Con la colonia elegida, la zona queda por confirmar.'
      :'No ubicamos esa calle. Elige tu colonia. La zona queda por confirmar.';
    render();
    var sel=$('#colonia');if(sel)sel.focus();
    return;
  }
  S.lat=+hit.lat;S.lng=+hit.lon;S.km=haversineKm(STORE_ORIGIN,{lat:S.lat,lng:S.lng});
  var a=hit.address||{};
  var col=matchColonia(a.suburb||a.neighbourhood||a.quarter||a.city_district||S.colonia);
  if(col)S.colonia=col;
  setModeFromKm();
  S.loading=false;
  render();
}
function calcZone(){
  readForm();
  if(!S.calle&&!S.colonia){S.msg='Escribe la calle o elige la colonia.';S.mode='';render();return}
  S.loading=true;S.msg='';render();
  var url='https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=1&accept-language=es&countrycodes=mx&q='+encodeURIComponent(geocodeQuery());
  fetch(url,{headers:{Accept:'application/json'}}).then(function(r){if(!r.ok)throw new Error('http');return r.json()}).then(onSearch).catch(function(){
    S.loading=false;S.lat=null;S.lng=null;S.km=null;S.mode='confirmar';
    S.msg='No pudimos ubicar la calle. Elige tu colonia. La zona queda por confirmar.';
    render();
  });
}
function useGps(){
  if(!navigator.geolocation){S.msg='Este navegador no comparte la ubicación. Puedes escribir la dirección.';render();return}
  S.loading=true;S.msg='';render();
  navigator.geolocation.getCurrentPosition(function(pos){
    var lat=pos.coords.latitude,lng=pos.coords.longitude;
    S.lat=lat;S.lng=lng;S.km=haversineKm(STORE_ORIGIN,{lat:lat,lng:lng});
    setModeFromKm();
    var url='https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&accept-language=es&lat='+encodeURIComponent(lat)+'&lon='+encodeURIComponent(lng);
    fetch(url,{headers:{Accept:'application/json'}}).then(function(r){if(!r.ok)throw new Error('http');return r.json()}).then(function(j){
      var a=j&&j.address||{};
      var street=[a.road||a.pedestrian||a.residential||'',a.house_number||''].filter(Boolean).join(' ');
      var col=matchColonia(a.suburb||a.neighbourhood||a.quarter||a.city_district||'');
      if(street)S.calle=street;
      if(col)S.colonia=col;
      if(!street)S.msg='Encontramos el punto, pero no la calle. Escríbela tú.';
      S.loading=false;
      if(S.opt==='c')S.form=true;
      render();
    }).catch(function(){
      S.loading=false;
      S.msg='Encontramos el punto, pero no la calle. Escríbela tú.';
      if(S.opt==='c')S.form=true;
      render();
    });
  },function(){
    S.loading=false;
    S.msg='No se permitió la ubicación. Puedes escribir la dirección.';
    if(S.opt==='a')S.tab='write';
    if(S.opt==='c')S.form=true;
    render();
  },{enableHighAccuracy:true,timeout:12000,maximumAge:0});
}
document.addEventListener('click',function(e){
  var b=e.target.closest('button');
  if(!b)return;
  if(b.dataset.opt){
    S.opt=b.dataset.opt;
    blankKeepOpt();
    var u=new URL(location.href);u.searchParams.set('opt',S.opt);history.replaceState(null,'',u);
    render();
    return;
  }
  if(b.dataset.tab){readForm();S.tab=b.dataset.tab;render();return}
  if(b.id==='showform'){readForm();S.form=true;render();var c=$('#calle');if(c)c.focus();return}
  if(b.id==='geo'){useGps();return}
  if(b.id==='calc'){calcZone();return}
});
document.addEventListener('input',function(e){
  var t=e.target;
  if(t.id==='calle')S.calle=t.value;
  if(t.id==='colonia')S.colonia=t.value;
  if(t.id==='refs')S.refs=t.value;
});
document.addEventListener('change',function(e){
  if(e.target.id==='colonia')S.colonia=e.target.value;
});
var q=new URLSearchParams(location.search).get('opt');
if(q==='a'||q==='b'||q==='c')S.opt=q;
render();
window.DIR={store:STORE_ORIGIN,zoneFromKm:zoneFromKm,haversineKm:haversineKm,state:function(){return S}};
})();
