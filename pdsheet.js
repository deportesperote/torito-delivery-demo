/* Ficha de producto compartida (Rápido y TikTok). Requiere: BY, ALL, F(precio), E(escape), EMO, COL, window.PD_BASE, window.PD_ADD(id,qty) */
(function(){
var C=window.PD_CTX,F=C.F,E=C.E,EMO=C.EMO,COL=C.COL;
var BASE=window.PD_BASE||'',DESC={},open=null,q=1;
function slug(c){return String(c).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
function dkey(i){return i.id.charAt(0)==='t'?i.id.slice(1):i.id}
function loadDesc(dep,cb){if(DESC[dep])return cb(DESC[dep]);fetch(BASE+'desc/'+slug(dep)+'.json').then(function(r){return r.json()}).then(function(j){DESC[dep]=j;cb(j)}).catch(function(){cb({})})}
var el=document.createElement('div');el.id='pdx';el.className='pdx-ov';el.hidden=true;document.body.appendChild(el);
var st=document.createElement('style');st.textContent='.pdx-ov{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:90;display:flex;align-items:flex-end;justify-content:center}.pdx-ov[hidden]{display:none}.pdx-s{background:#fff;width:100%;max-width:560px;max-height:92vh;overflow:auto;border-radius:20px 20px 0 0;animation:pdxu .18s ease-out;position:relative;font-family:inherit;color:#111}@keyframes pdxu{from{transform:translateY(40px);opacity:.6}to{transform:none;opacity:1}}.pdx-g{width:44px;height:5px;border-radius:3px;background:#ddd;margin:8px auto}.pdx-x{position:absolute;right:12px;top:10px;width:36px;height:36px;border-radius:50%;border:0;background:#f1f1f1;font-size:18px;z-index:2}.pdx-i{background:#fff;display:flex;justify-content:center;align-items:center;height:300px}.pdx-i img{max-width:100%;max-height:300px;object-fit:contain}.pdx-i.emo{background:var(--k);font-size:96px;opacity:.9}.pdx-b{padding:14px 18px 18px}.pdx-p{font-size:26px;font-weight:800}.pdx-b h2{font-size:19px;margin:6px 0 8px;line-height:1.25}.pdx-t{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}.pdx-t span{font-size:12px;background:#f3f4f6;border-radius:999px;padding:4px 10px}.pdx-t .ex{background:#dcfce7;color:#166534}.pdx-t .sl{background:#fef3c7;color:#92400e}.pdx-t .ag{background:#fee2e2;color:#991b1b}.pdx-18{background:#fff1f2;color:#9f1239;border-radius:10px;padding:8px 10px;font-size:13px;margin:8px 0}.pdx-f{width:100%;border-collapse:collapse;font-size:14px;margin:6px 0}.pdx-f td{padding:5px 0;border-bottom:1px solid #f0f0f0}.pdx-f td:first-child{color:#666;width:42%}.pdx-d h3{font-size:15px;margin:14px 0 4px}.pdx-d p{font-size:14px;line-height:1.5;color:#333;margin:0}.pdx-a{position:sticky;bottom:0;background:#fff;display:flex;gap:10px;padding:12px 18px calc(12px + env(safe-area-inset-bottom));border-top:1px solid #eee}.pdx-q{display:flex;align-items:center;border:1px solid #ddd;border-radius:12px}.pdx-q button{width:42px;height:48px;border:0;background:none;font-size:22px}.pdx-q b{min-width:28px;text-align:center}.pdx-go{flex:1;height:50px;border:0;border-radius:12px;background:#E30613;color:#fff;font-size:17px;font-weight:700}.pdx-go[disabled]{background:#ccc}';document.head.appendChild(st);
function fact(k,v){return v?'<tr><td>'+k+'</td><td>'+E(v)+'</td></tr>':''}
function render(i,d){var sp=i.dep==='Deportes';var sub=i.sub||i.cat||'';
 el.innerHTML='<div class="pdx-s" role="dialog" aria-modal="true" aria-label="'+E(i.n)+'"><div class="pdx-g"></div><button class="pdx-x" data-pdx="close" aria-label="Cerrar">✕</button>'+
 (i.img?'<div class="pdx-i"><img alt="'+E(i.n)+'" src="'+(window.PD_BIG?window.PD_BIG(i.img):i.img)+'"></div>':'<div class="pdx-i emo" style="--k:'+(COL[i.dep]||'#666')+'">'+(EMO[i.dep]||'🛍️')+'</div>')+
 '<div class="pdx-b"><div class="pdx-p">'+F(i.p)+(i.iva?' <small>+ IVA</small>':'')+'</div><h2>'+E(i.n)+'</h2><div class="pdx-t">'+(i.a?(i.exp?'<span class="ex">⚡ Express 15 min</span>':'<span class="sl">🕒 Entrega en 6 h</span>'):'<span class="ag">Agotado</span>')+(i.x?'<span class="ag">🔞 +18</span>':'')+'</div>'+
 (i.x?'<div class="pdx-18">🔞 Venta exclusiva a mayores de 18 años. Se solicita identificación oficial al entregar.</div>':'')+
 '<table class="pdx-f">'+fact('Marca',d.b)+fact(sp?'Tallas / medidas':'Contenido / presentación',d.z)+fact('Departamento',i.dep)+fact('Categoría',sub!==i.dep?sub:'')+fact('Código',i.k)+'</table>'+
 '<div class="pdx-d"><h3>Descripción</h3><p>'+E(d.d||'Cargando descripción…')+'</p></div></div>'+
 '<div class="pdx-a"><div class="pdx-q"><button data-pdx="-1" aria-label="Quitar uno">−</button><b id="pdxQ">'+q+'</b><button data-pdx="+1" aria-label="Agregar uno">+</button></div>'+(i.a?'<button class="pdx-go" data-pdx="add">Agregar · '+F(i.p*q)+'</button>':'<button class="pdx-go" disabled>Agotado</button>')+'</div></div>'}
function show(id,push){var i=C.BY()[id];if(!i)return;open=id;q=1;render(i,{});el.hidden=false;document.body.style.overflow='hidden';
 if(push!==false)history.pushState({pdx:id},'','#p='+encodeURIComponent(i.k||i.id));
 loadDesc(i.dep,function(j){if(open===id)render(i,j[dkey(i)]||{d:''})})}
function hide(){open=null;el.hidden=true;document.body.style.overflow=''}
function close(){if(history.state&&history.state.pdx)history.back();else{hide();if(location.hash.indexOf('#p=')===0)history.replaceState(null,'',location.pathname+location.search)}}
el.addEventListener('click',function(e){if(e.target===el)return close();var b=e.target.closest('[data-pdx]');if(!b)return;var a=b.dataset.pdx,i=C.BY()[open];
 if(a==='close')return close();if(a==='+1'||a==='-1'){q=Math.max(1,q+(+a));document.getElementById('pdxQ').textContent=q;var g=el.querySelector('.pdx-go:not([disabled])');if(g)g.textContent='Agregar · '+F(i.p*q);return}
 if(a==='add'){window.PD_ADD(open,q);close()}});
var y0=null,sc=0;el.addEventListener('touchstart',function(e){var s=el.querySelector('.pdx-s');sc=s?s.scrollTop:0;y0=e.touches[0].clientY},{passive:true});
el.addEventListener('touchend',function(e){if(y0!==null&&sc<=0&&e.changedTouches[0].clientY-y0>90)close();y0=null});
window.addEventListener('popstate',function(){if(open&&!(history.state&&history.state.pdx))hide();else if(history.state&&history.state.pdx&&!open)show(history.state.pdx,false)});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&open)close()});
window.PD_OPEN=show;
window.PD_DEEP=function(){var m=location.hash.match(/^#p=(.+)$/);if(!m)return;var c=decodeURIComponent(m[1]);var it=C.ALL().filter(function(i){return i.k===c||i.id===c||i.id==='t'+c})[0];if(it){history.replaceState(null,'',location.pathname+location.search);show(it.id)}};
})();
