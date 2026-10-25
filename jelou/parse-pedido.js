// Jelou code node. Paste this file into the code node.
// PRICES: clave → pesos, or { precio, express }.
// DEPORTES: clave → true for every Deportes Perote product.
// EXPRESS: clave → true only when that product is express.
// A Deportes clave with no true flag is 6 hours.
// A clave in neither list is Torito Delivery and is express.
// Do not put purchase costs in these lists.
//
// Efectivo is allowed only when the recalculated total (products + shipping)
// is $300 MXN or less. Above that, pago efectivo is forced to mercadopago
// and pedido.motivo is "efectivo_maximo". pedido.ok stays true when the
// rest of the order is valid, so Pagos can charge the corrected method.
// Do not offer Efectivo when pedido.efectivoPermitido is false.
var ZONA_CLIENTE = ""; // expres | estandar | fuera — from Jelou, never from the message
var PRICES = {};
var DEPORTES = {};
var EXPRESS = {};
var EFECTIVO_MAX = 30000;

function esExpress(clave) {
  if (EXPRESS && Object.prototype.hasOwnProperty.call(EXPRESS, clave)) return EXPRESS[clave] === true;
  var v = PRICES ? PRICES[clave] : null;
  if (v && typeof v === "object" && (v.express === true || v.exp === true)) return true;
  if (v && typeof v === "object" && (v.express === false || v.exp === false)) return false;
  if (DEPORTES && Object.prototype.hasOwnProperty.call(DEPORTES, clave)) return false;
  return true;
}
function precioDe(clave) {
  var v = PRICES ? PRICES[clave] : null;
  if (v == null) return null;
  if (typeof v === "number") return v;
  if (typeof v === "object") return v.precio != null ? v.precio : v.p;
  return null;
}
function parsePedido(text) {
  text = String(text || "").replace(/\r\n/g, "\n").replace(/^\uFEFF/, "").trim();
  if (text.indexOf("PEDIDO #") !== 0) return null;
  var lines = text.split("\n");
  var folio = lines[0].slice("PEDIDO #".length).trim();
  var i = 1, header = {};
  while (i < lines.length && lines[i] !== "---") {
    var p = lines[i].indexOf(":");
    if (p > 0) header[lines[i].slice(0, p).trim()] = lines[i].slice(p + 1).trim();
    i++;
  }
  if (lines[i] !== "---") return null;
  i++;
  var items = [];
  while (i < lines.length && lines[i] !== "---") {
    var parts = lines[i].split("|");
    if (parts.length >= 4) items.push({ qty: parseInt(parts[0], 10), clave: parts[1], nombre: parts[2], precioUnitario: Number(parts[3]) });
    i++;
  }
  if (lines[i] !== "---") return null;
  i++;
  var nota = "", totalCentavosMensaje = null, pagoMetodo = "";
  while (i < lines.length) {
    var ln = lines[i++];
    if (ln.indexOf("TOTAL_CENTAVOS:") === 0) totalCentavosMensaje = parseInt(ln.slice("TOTAL_CENTAVOS:".length).trim(), 10);
    else if (ln.indexOf("PAGO_METODO:") === 0) pagoMetodo = ln.slice("PAGO_METODO:".length).trim();
    else if (ln.indexOf("NOTA:") === 0) nota = ln.slice(5).trim();
  }
  var missing = [], subCents = 0, lento = false;
  items.forEach(function (it) {
    var precio = precioDe(it.clave);
    if (precio == null || !(it.qty > 0)) { missing.push(it.clave || "?"); return; }
    var unitCents = Math.round(Number(precio) * 100);
    it.precioLista = unitCents / 100;
    it.importeCentavos = unitCents * it.qty;
    it.express = esExpress(it.clave);
    subCents += it.importeCentavos;
    if (!it.express) lento = true;
  });
  var z = String(ZONA_CLIENTE || "").toLowerCase();
  var entrega = header.ENTREGA, tiempo = "", envioCents = null, zona = "";
  if (missing.length === 0) {
    if (z === "fuera" || entrega === "TIENDA") {
      entrega = "TIENDA";
      tiempo = lento ? "6H" : "15MIN";
      envioCents = 0;
      zona = z === "expres" && !lento ? "EXPRES" : "ESTANDAR";
    } else if (entrega === "DOMICILIO") {
      if (lento) {
        tiempo = "6H"; zona = "ESTANDAR"; envioCents = subCents >= 29900 ? 0 : 1900;
      } else if (z === "estandar" || header.ENTREGA_TIEMPO !== "15MIN") {
        tiempo = "1H"; zona = "ESTANDAR"; envioCents = subCents >= 29900 ? 0 : 1900;
      } else {
        tiempo = "15MIN"; zona = "EXPRES"; envioCents = subCents >= 29900 ? 0 : 2900;
      }
    } else missing.push("ENVIO");
  }
  var totalCents = envioCents == null ? null : subCents + envioCents;
  var bajoMinimo = missing.length === 0 && subCents < 10000;
  var faltanMin = bajoMinimo ? 10000 - subCents : 0;
  var pideEfectivo = String(pagoMetodo || "").toLowerCase() === "efectivo" || String(header.PAGO || "").toUpperCase() === "EFECTIVO";
  var sobreEfectivo = !bajoMinimo && totalCents != null && totalCents > EFECTIVO_MAX && pideEfectivo;
  var pagoOut = header.PAGO || "";
  var metodoOut = pagoMetodo;
  var motivo = bajoMinimo ? "compra_minima" : "";
  var razon = bajoMinimo ? ("Compra mínima $100 — te faltan $" + (faltanMin / 100).toFixed(2)) : "";
  if (sobreEfectivo) {
    pagoOut = "EN_LINEA";
    metodoOut = "mercadopago";
    motivo = "efectivo_maximo";
    razon = "Por seguridad, pedidos mayores a $300 se pagan en línea (tarjeta, OXXO o SPEI).";
  }
  return {
    ok: missing.length === 0 && totalCents != null && !bajoMinimo,
    folio: folio,
    cliente: header.CLIENTE || "",
    zona: zona,
    entrega: entrega || "",
    entregaTiempo: tiempo,
    pago: pagoOut,
    origen: header.ORIGEN || "",
    items: items,
    nota: nota,
    faltantes: missing,
    subtotalCentavos: subCents,
    envioCentavos: envioCents,
    totalCentavos: totalCents,
    total: totalCents == null ? null : (totalCents / 100).toFixed(2),
    totalCentavosMensaje: totalCentavosMensaje,
    pagoMetodo: metodoOut,
    envioGratis: envioCents === 0 && entrega === "DOMICILIO" && subCents >= 29900,
    cobertura: z !== "fuera",
    efectivoPermitido: totalCents != null && totalCents <= EFECTIVO_MAX,
    pagoCorregido: sobreEfectivo,
    motivo: motivo,
    razon: razon,
    coincide: missing.length === 0 && !bajoMinimo && totalCentavosMensaje === totalCents
  };
}

var raw = typeof input === "string" ? input : (typeof input !== "undefined" && input && (input.text || input.message || input.body)) || "";
var pedido = raw ? parsePedido(raw) : null;
// Charge pedido.totalCentavos / 100 MXN only when pedido.ok && pedido.coincide.
// If pedido.motivo === "compra_minima", do not open Pagos. Reply with pedido.razon.
// If pedido.motivo === "efectivo_maximo", pedido.pagoMetodo is mercadopago.
// Do not offer Efectivo. Open Pagos when pedido.ok && pedido.coincide.
// Use pedido.entregaTiempo. 6H only when a Deportes line has no express flag.

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    parsePedido: parsePedido,
    PRICES: PRICES,
    DEPORTES: DEPORTES,
    EXPRESS: EXPRESS,
    zona: function (z) { if (arguments.length) ZONA_CLIENTE = z; return ZONA_CLIENTE; }
  };
}
