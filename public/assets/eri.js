
const DEFAULT_ERI=[{"codigo": "200", "nombre": "COLERA"}, {"codigo": "205", "nombre": "CHAGAS"}, {"codigo": "230", "nombre": "DIFTERIA"}, {"codigo": "250", "nombre": "ENCEFALITIS DEL NILO OCCIDENTAL EN HUMANOS"}, {"codigo": "270", "nombre": "ENCEFALITIS EQUINA DEL OESTE EN HUMANOS"}, {"codigo": "290", "nombre": "ENCEFALITIS EQUINA VENEZOLANA EN HUMANOS"}, {"codigo": "295", "nombre": "ENFERMEDADES DE ORIGEN PRIONICO"}, {"codigo": "310", "nombre": "FIEBRE AMARILLA"}, {"codigo": "350", "nombre": "ENFERMEDADES TRANSMITIDAS POR ALIMENTOS O AGUA ETA (BROTES)"}, {"codigo": "360", "nombre": "INTOXICACION POR PLAGUICIDAS"}, {"codigo": "380", "nombre": "INTOXICACION POR METANOL"}, {"codigo": "390", "nombre": "INTOXICACION POR METALES PESADOS"}, {"codigo": "400", "nombre": "INTOXICACION POR SOLVENTES"}, {"codigo": "410", "nombre": "INTOXICACION POR OTRAS SUSTANCIAS QUIMICAS"}, {"codigo": "412", "nombre": "INTOXICACION POR GASES"}, {"codigo": "440", "nombre": "LEISHMANIASIS VISCERAL"}, {"codigo": "500", "nombre": "MENINGITIS  MENINGOCOCCICA"}, {"codigo": "570", "nombre": "MORTALIDAD POR COLERA"}, {"codigo": "610", "nombre": "PARALISIS FLACIDA AGUDA (MENORES DE 15 AÑOS)"}, {"codigo": "670", "nombre": "RABIA HUMANA"}, {"codigo": "710", "nombre": "RUBEOLA"}, {"codigo": "720", "nombre": "SINDROME DE RUBEOLA CONGENITA"}, {"codigo": "730", "nombre": "SARAMPION"}, {"codigo": "770", "nombre": "TETANOS NEONATAL"}, {"codigo": "452", "nombre": "LESIONES POR ARTEFACTOS EXPLOSIVOS (POLVORA Y MINAS ANTIPERSONAL)"}, {"codigo": "535", "nombre": "MENINGITIS BACTERIANA Y ENFERMEDAD MENINGOCÓCICA"}, {"codigo": "307", "nombre": "VIGILANCIA INTEGRADA DE RABIA HUMANA"}, {"codigo": "365", "nombre": "INTOXICACIONES"}, {"codigo": "607", "nombre": "EBOLA"}, {"codigo": "725", "nombre": "SÍNDROME NEUROLÓGICO PROBABLEMENTE ASOCIADO A VIRUS ZIKA"}, {"codigo": "275", "nombre": "ENCEFALITIS EQUINA DEL ESTE EN HUMANOS"}, {"codigo": "349", "nombre": "BROTES DE ENFERMEDADES TRANSMITIDAS POR ALIMENTOS Y VEHICULIZADAS POR AGUA, HEPATITIS A, FIEBRE TIFOIDE/PARATIFOIDEA, CÓLERA"}, {"codigo": "739", "nombre": "SÍNDROME INFLAMATORIO MULTISISTÉMICO EN NIÑOS ASOCIADO A SARS-COV2"}, {"codigo": "355", "nombre": "ENFERMEDAD TRANSMITIDA POR ALIMENTOS O AGUA (ETA)"}, {"codigo": "800", "nombre": "TOS FERINA"}];
let baseRows=[],catalog=DEFAULT_ERI,preRows=[],finalRows=[],headers=[];
const $=id=>document.getElementById(id);
function isoDate(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function fmt(d){return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear()}
function parseDate(v){if(v instanceof Date&&!isNaN(v))return v; if(typeof v==='number'){const x=new Date(Math.round((v-25569)*86400*1000));return isNaN(x)?null:x} if(v==null)return null; let s=String(v).trim().split(' ')[0]; let m=s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/); if(m)return new Date(+m[3],+m[2]-1,+m[1]); m=s.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/); if(m)return new Date(+m[1],+m[2]-1,+m[3]); return null}
function norm(v){return String(v??'').trim().toUpperCase().replace(/\.0$/,'')}
function findCol(hints){return headers.findIndex(h=>hints.includes(norm(h)))}
function dates(){let d=new Date($('runDate').value+'T12:00:00');if(isNaN(d))d=new Date();let a=[];for(let i=0;i<3;i++){let x=new Date(d);x.setDate(d.getDate()-i);a.push(x)}return a}
function setDateUI(){let d=dates();$('dateRange').textContent=d.map(fmt).join(' • ')}
function readWorkbook(file,cb){let r=new FileReader();r.onload=e=>{try{let wb=XLSX.read(e.target.result,{type:'array',cellDates:true});let ws=wb.Sheets[wb.SheetNames[0]];cb(XLSX.utils.sheet_to_json(ws,{defval:null,raw:true}),null)}catch(err){cb(null,err)}};r.readAsArrayBuffer(file)}
function catalogFrom(rows){if(!rows?.length)return[];let h=Object.keys(rows[0]);let c=h.find(x=>/cod.?eve|c[oó]digo/i.test(x));let n=h.find(x=>/nom.?eve|evento|nombre/i.test(x));return rows.map(r=>({codigo:norm(r[c]),nombre:String(r[n]??'').trim()})).filter(x=>x.codigo&&x.codigo!=='NULL')}
function esc(x){return String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function plain(v){return norm(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
function field(r,names){let k=Object.keys(r).find(k=>names.includes(plain(k)));return k===undefined?'':r[k]}
function eventCode(r){return norm(field(r,['COD_EVE','COD EVE','CODIGO EVENTO']))}
function alertInfo(r){
 const c=eventCode(r), et=plain(field(r,['PER_ETN_','PER_ETN'])), indigenous=plain(field(r,['GP_INDIGEN','GP_INDIGEN_']));
 const always={'275':'Encefalitis equina del este en humanos','200':'Cólera','570':'Mortalidad por cólera','670':'Rabia humana','307':'Vigilancia integrada de rabia humana'};
 if(always[c])return {label:'REVISAR · '+always[c],priority:true};
 if(c==='800'&&(et==='1'||/^INDIGENA(S)?$/.test(et)))return {label:'REVISAR · Tos ferina en población indígena'+(indigenous==='2'?' · Verificar discrepancia con gp_indigen':''),priority:true};
 if(c==='800'&&(indigenous==='1'||indigenous==='SI')&&et&&et!=='1')return {label:'VERIFICAR · Tos ferina: pertenencia étnica y gp_indigen contradictorios',priority:false};
 if(c==='730'){
  const code=norm(field(r,['COD_PAIS_O'])),name=plain(field(r,['NPAIS_PROCE','PAIS_PROCEDENCIA']));
  const unknown=new Set(['','0','000','999','9999','99999','-','--','NA','N/A','#N/D','#N/A','SIN INFORMACION','DESCONOCIDO','NO DEFINIDO','NO APLICA','NULL']);
  const hasCode=/^\d{1,3}$/.test(code)&&!unknown.has(code),hasName=!unknown.has(name)&&/[A-Z]/.test(name);
  const localCode=hasCode&&Number(code)===170,localName=hasName&&name==='COLOMBIA';
  if(hasCode&&hasName&&localCode!==localName)return {label:'VERIFICAR · Sarampión: procedencia contradictoria',priority:false};
  if((hasCode&&!localCode)||(hasName&&!localName))return {label:'REVISAR · Sarampión con procedencia/ocurrencia del exterior',priority:true};
  if(!hasCode&&!hasName)return {label:'VERIFICAR · Sarampión sin procedencia válida',priority:false};
 }
 if(c==='800'&&!et)return {label:'VERIFICAR · Tos ferina sin dato de pertenencia indígena',priority:false};
 return {label:'',priority:false};
}
function exportSheet(rows){rows=groupedColorRows(rows,eventCode,alertInfo);const leading=['ALERTA_ERI','ERI_ESTADO','ERI_MOTIVO','ERI_CAMBIOS','ERI_FILA_ORIGEN'];const columns=[...leading,...new Set([...headers,...rows.flatMap(r=>Object.keys(r))].filter(h=>!leading.includes(h)))];return XLSX.utils.json_to_sheet(rows.map(r=>({...r,ALERTA_ERI:alertInfo(r).label})),{header:columns})}

function makeTable(rows){rows=groupedColorRows(rows,eventCode,alertInfo);if(!rows.length)return '<p class="note">Sin registros para este filtro.</p>';let h=[...new Set(rows.flatMap(r=>Object.keys(r)))];return '<div class="tablewrap"><table><thead><tr><th>ALERTA ERI</th>'+h.map(x=>'<th>'+esc(x)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(r=>{let a=alertInfo(r);return '<tr class="'+(a.priority?'alerta-fila':'')+'"><td>'+esc(a.label)+'</td>'+h.map(x=>'<td>'+esc(r[x] instanceof Date?fmt(r[x]):r[x])+'</td>').join('')+'</tr>'}).join('')+'</tbody></table></div>'}
function eventLabelForAlert(r){
 const code=eventCode(r)||'Sin código';
 const catalogName=catalog.find(x=>norm(x.codigo)===code)?.nombre;
 const fileName=field(r,['NOM_EVE','NOM_EVE_','NOMBRE EVENTO','NOMBRE_EVENTO','EVENTO']);
 const name=String(catalogName||fileName||'Evento sin nombre').trim();
 return code+' · '+name;
}
function renderAlerts(){
 const marked=finalRows.filter(r=>alertInfo(r).priority);
 const counts=new Map();
 for(const r of marked){
  const a=alertInfo(r),code=eventCode(r)||'Sin código',eventName=eventLabelForAlert(r);
  // A record is counted only once per alert category, regardless of the number of matching fields.
  const labels=[...new Set((a.populations?.length?a.populations:[a.label]).filter(Boolean))];
  for(const label of labels){
   if(!counts.has(label))counts.set(label,{total:0,events:new Map()});
   const group=counts.get(label);
   group.total++;
   if(!group.events.has(code))group.events.set(code,{name:eventName,count:0});
   group.events.get(code).count++;
  }
 }
 $('alertSummary').hidden=!marked.length;
 $('alertSummary').innerHTML=marked.length?'<div class="alerta-resumen"><h3>'+marked.length+' registros con alerta prioritaria</h3>'+
  [...counts.entries()].map(([label,group])=>{
   const events=[...group.events.values()].sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name,'es',{numeric:true}));
   return '<div class="alerta-grupo"><div class="alerta-texto">'+esc(label)+' — '+group.total+'</div>'+
    '<div class="alerta-eventos"><strong>Eventos:</strong> '+events.map(e=>esc(e.name)+' ('+e.count+')').join(' · ')+'</div></div>';
  }).join('')+
  '<p>El total corresponde a registros únicos con alerta; un mismo registro puede aparecer en varias categorías. Dentro de cada categoría, los eventos suman su total. Las alertas orientan la revisión.</p></div>':'';
}
function resultViews(){let views=[{name:'Preliminar',rows:preRows},{name:'Nuevos',rows:newRows},{name:'Actualizados',rows:changedRows},{name:'Ya_registrados',rows:seenRows},{name:'Por_verificar',rows:verifyRows},{name:'Repetidos_base',rows:duplicateRows}];let groups=new Map();for(const r of finalRows){const c=eventCode(r);if(!groups.has(c))groups.set(c,[]);groups.get(c).push(r)}for(const [c,rows] of [...groups].sort((a,b)=>Number(a[0])-Number(b[0]))){const name=c+' '+(catalog.find(x=>norm(x.codigo)===c)?.nombre||'Evento');views.push({name,rows,event:true})}return views}
function render(){renderAlerts();const views=resultViews();$('tabs').innerHTML=views.map((v,i)=>'<button class="tab '+(i===0?'active ':'')+(v.rows.some(r=>alertInfo(r).priority)?'con-alerta':'')+'" data-tab="'+i+'">'+esc(v.name)+' ['+v.rows.length+']</button>').join('');$('panels').innerHTML=views.map((v,i)=>'<div class="panel '+(i===0?'active':'')+'" id="panel-'+i+'"><h3>'+esc(v.name)+'</h3>'+makeTable(v.rows)+'</div>').join('');document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tab,.panel').forEach(x=>x.classList.remove('active'));b.classList.add('active');$('panel-'+b.dataset.tab).classList.add('active')});$('comparisonStats').innerHTML=[['Nuevos',newRows.length],['Actualizados',changedRows.length],['Ya registrados',seenRows.length],['Por verificar',verifyRows.length],['Repetidos en base',duplicateRows.length],['Histórico acumulado',nextHistory.length]].map(([n,v])=>'<div class="stat">'+n+'<b>'+v+'</b></div>').join('')}
function buildSheets(){const wb=XLSX.utils.book_new();for(const v of resultViews())XLSX.utils.book_append_sheet(wb,exportSheet(v.rows),v.name.replace(/[\\/?*\[\]:]/g,'').slice(0,31));XLSX.utils.book_append_sheet(wb,historySheet(),'Historico');return {wb}}
function safeName(s){return String(s).replace(/[\\\/?*\[\]:]/g,'').replace(/\s+/g,'_').slice(0,70)||'Hoja'}
function process(){if(!baseRows.length)return;headers=Object.keys(baseRows[0]);let cCol=findCol(['COD_EVE','COD EVE','CODIGO EVENTO','CÓDIGO EVENTO']);let dCol=findCol(['FEC_NOT','FEC NOT','FECHA NOTIFICACION','FECHA DE NOTIFICACION']);let aCol=findCol(['AJUSTE','AJUSTE_','AJUSTES']);if(cCol<0||dCol<0){$('status').innerHTML='<span class="warning">No se encontraron las columnas cod_eve y fec_not.</span>';return}let allowed=new Map(catalog.map(x=>[norm(x.codigo),x]));let wanted=new Set(dates().map(x=>x.toDateString()));preRows=baseRows.filter(r=>allowed.has(norm(r[headers[cCol]]))&&(()=>{let d=parseDate(r[headers[dCol]]);return d&&wanted.has(d.toDateString())})());finalRows=preRows.filter(r=>{let a=aCol>=0?norm(r[headers[aCol]]):'';return a!=='6'&&a!=='D'});eligibleRows=finalRows;compareHistory();$('nLoaded').textContent=baseRows.length.toLocaleString();$('nPre').textContent=preRows.length.toLocaleString();$('nFinal').textContent=eligibleRows.length.toLocaleString();$('nEvents').textContent=new Set(finalRows.map(r=>norm(r[headers[cCol]]))).size;$('results').classList.remove('hidden');$('download').disabled=false;$('downloadPackage').disabled=false;render();$('status').innerHTML='<span class="ok">Procesamiento terminado.</span> Cruce terminado: '+newRows.length+' nuevos, '+changedRows.length+' actualizados, '+seenRows.length+' ya registrados, '+verifyRows.length+' por verificar y '+duplicateRows.length+' repeticiones internas.'}
 $('baseFile').onchange=e=>{if(!e.target.files[0])return;readWorkbook(e.target.files[0],(r,err)=>{if(err)return $('status').textContent='Error: '+err.message;baseRows=r||[];$('process').disabled=false;$('status').textContent='Base cargada: '+baseRows.length.toLocaleString()+' filas.'})};$('eriFile').onchange=e=>{if(!e.target.files[0])return;readWorkbook(e.target.files[0],(r,err)=>{if(!err){let c=catalogFrom(r);if(c.length){catalog=c;$('status').textContent='Catálogo ERI personalizado cargado: '+c.length+' códigos.'}}})};$('runDate').onchange=setDateUI;$('process').onclick=process;$('reset').onclick=()=>location.reload();$('download').onclick=()=>{let {wb}=buildSheets();XLSX.writeFile(wb,'Resultado_ERI_'+isoDate(new Date()).replaceAll('-','')+'.xlsx')};$('downloadPackage').onclick=async()=>{let {wb,by}=buildSheets(),zip=new JSZip(),date=isoDate(new Date()).replaceAll('-',''),folder=zip.folder('Resultado_ERI_'+date);folder.file('Resultado_ERI_'+date+'.xlsx',XLSX.write(wb,{bookType:'xlsx',type:'array'}));folder.file('LEEME.txt','Contiene el Excel consolidado y una carpeta con cada hoja como archivo independiente.\nPreliminar: eventos ERI de hoy y los dos días anteriores antes de excluir ajustes 6 y D.\nHojas de eventos: resultado final después de excluir ajustes 6 y D.');folder.folder('Hojas_individuales').file('Preliminar.xlsx',XLSX.write({SheetNames:['Preliminar'],Sheets:{Preliminar:exportSheet(preRows)}},{bookType:'xlsx',type:'array'}));for(let c of Object.keys(by)){let label=safeName(catalog.find(x=>norm(x.codigo)===c)?.nombre||'Evento_'+c)+'_'+c,one=XLSX.utils.book_new(),sheet=exportSheet(by[c]);XLSX.utils.book_append_sheet(one,sheet,'Datos');folder.folder('Hojas_individuales').file(label+'.xlsx',XLSX.write(one,{bookType:'xlsx',type:'array'}))}let blob=await zip.generateAsync({type:'blob'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='Resultado_ERI_'+date+'_carpeta.zip';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
let today=new Date();$('runDate').value=new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Bogota',year:'numeric',month:'2-digit',day:'2-digit'}).format(today);setDateUI();


let historyRows=[],eligibleRows=[],newRows=[],changedRows=[],seenRows=[],verifyRows=[],duplicateRows=[],nextHistory=[],historyLoaded=false;
const CONTROL=new Set(['FECHAHORA','FEC_ARC_XL','REGINIFEC','VACIO','VERSION','FEC_AJU_']);
const META=new Set(['ALERTA_ERI','ERI_ESTADO','ERI_MOTIVO','ERI_CAMBIOS','ERI_FILA_ORIGEN']);
function rawRow(r){return Object.fromEntries(Object.entries(r).filter(([k])=>!META.has(plain(k))))}
function normalizedValue(k,v){if(v==null)return '';if(v instanceof Date&&!isNaN(v))return isoDate(v);const name=plain(k);if(/FEC|FECHA|INI_SIN/.test(name)){const d=parseDate(v);if(d)return isoDate(d)}return norm(v).replace(/\s+/g,' ')}
function canonical(r){const result={};for(const [k,v] of Object.entries(rawRow(r)))if(!CONTROL.has(plain(k)))result[plain(k)]=normalizedValue(k,v);return result}
function fingerprint(r){const c=canonical(r);return JSON.stringify(Object.keys(c).sort().filter(k=>c[k]!=='').map(k=>[k,c[k]]))}
function validPart(v){const s=norm(v);return !['','0','NA','N/A','#N/D','#N/A','NULL','SIN DATO','SIN INFORMACION','-','--'].includes(s)?s:''}
function baseKey(r){const t=validPart(field(r,['TIP_IDE_','TIP_IDE'])),n=validPart(field(r,['NUM_IDE_','NUM_IDE'])),e=validPart(eventCode(r));return t&&n&&e?JSON.stringify([t,n,e]):null}
function onsetKey(r){const v=field(r,['INI_SIN_','INI_SIN']);if(!validPart(v))return null;const d=parseDate(v);if(!d||isNaN(d))return null;const text=String(v).trim().split(' ')[0];const parts=text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);if(parts&&(d.getDate()!==+parts[1]||d.getMonth()+1!==+parts[2]))return null;return isoDate(d)}
function caseKey(r){const b=baseKey(r),d=onsetKey(r);return b&&d?b+'|'+d:null}
function differences(a,b){const x=canonical(a),y=canonical(b);return [...new Set([...Object.keys(x),...Object.keys(y)])].filter(k=>(x[k]||'')!==(y[k]||'')).map(k=>k+': '+(x[k]||'(vacío)')+' → '+(y[k]||'(vacío)')).join(' | ')}
function uniqueRaw(rows){const seen=new Set();return rows.map(rawRow).filter(r=>{const key=fingerprint(r);if(seen.has(key))return false;seen.add(key);return true})}
function classifyRows(current,prior){const hist=uniqueRaw(prior),oldByKey=new Map(),oldByBase=new Map(),dailyKeys=new Map(),within=new Set(),out={new:[],changed:[],seen:[],verify:[],duplicates:[],history:hist.slice()};
for(const r of hist){const k=caseKey(r),b=baseKey(r);if(k){if(!oldByKey.has(k))oldByKey.set(k,[]);oldByKey.get(k).push(r)}if(b){if(!oldByBase.has(b))oldByBase.set(b,[]);oldByBase.get(b).push(r)}}
for(const r of current){const k=caseKey(r);if(k){if(!dailyKeys.has(k))dailyKeys.set(k,new Set());dailyKeys.get(k).add(fingerprint(r))}}
function tagged(r,i,state,reason,changes=''){return {ERI_ESTADO:state,ERI_MOTIVO:reason,ERI_CAMBIOS:changes,ERI_FILA_ORIGEN:baseRows.includes(r)?baseRows.indexOf(r)+2:i+2,...rawRow(r)}}
for(let i=0;i<current.length;i++){const r=current[i],fp=fingerprint(r),k=caseKey(r),b=baseKey(r);
if(within.has(fp)){out.duplicates.push(tagged(r,i,'REPETIDO EN BASE','Repetición exacta de otro registro de esta base; se conserva por separado.'));continue}within.add(fp);
if(!k){out.verify.push(tagged(r,i,'POR VERIFICAR','Falta tipo/documento/evento o una fecha de inicio de síntomas válida. No se descarta ni incorpora al histórico.'));continue}
if(dailyKeys.get(k).size>1){out.verify.push(tagged(r,i,'POR VERIFICAR','Varias versiones con la misma identidad y episodio en la base diaria.'));continue}
const matches=oldByKey.get(k)||[];
if(matches.length>1){out.verify.push(tagged(r,i,'POR VERIFICAR','El histórico contiene versiones distintas para la misma identidad y episodio.'));continue}
if(matches.length===1){const old=matches[0],changes=differences(old,r);if(!changes)out.seen.push(tagged(r,i,'YA REGISTRADO','Coincide con el histórico, sin cambios en los campos comparados.'));else{out.changed.push(tagged(r,i,'ACTUALIZADO','Misma identidad y episodio; se detectaron cambios.',changes));out.history[out.history.indexOf(old)]=rawRow(r)}continue}
if(oldByBase.has(b)){out.verify.push(tagged(r,i,'POR VERIFICAR','Persona y evento ya presentes, con distinta fecha de inicio o fecha ausente en el histórico. Verificar nuevo episodio o corrección.'));continue}
out.new.push(tagged(r,i,'NUEVO','No se encontró la identidad y episodio en el histórico.'));out.history.push(rawRow(r));
}return out}
function compareHistory(){const r=classifyRows(eligibleRows,historyRows);newRows=r.new;changedRows=r.changed;seenRows=r.seen;verifyRows=r.verify;duplicateRows=r.duplicates;nextHistory=r.history;finalRows=[...newRows,...changedRows,...verifyRows]}
function historySheet(){const columns=[...new Set([...headers.filter(k=>!META.has(plain(k))),...nextHistory.flatMap(r=>Object.keys(r))])];return XLSX.utils.json_to_sheet(nextHistory,{header:columns})}
function historyWorkbook(){const w=XLSX.utils.book_new();XLSX.utils.book_append_sheet(w,historySheet(),'Historico');return w}
function invalidate(){['download','downloadPackage','historyDownload'].forEach(id=>$(id).disabled=true);$('results').classList.add('hidden');$('comparisonStats').innerHTML='';$('status').textContent='Datos o fecha cambiados. Pulsa Procesar base para actualizar los resultados.'}
function historyFromWorkbook(wb){const hn=wb.SheetNames.find(n=>plain(n)==='HISTORICO');if(hn)return {rows:XLSX.utils.sheet_to_json(wb.Sheets[hn],{defval:null,raw:true}),source:'hoja Historico'};
if(wb.SheetNames.some(n=>plain(n)==='PRELIMINAR')){const names=wb.SheetNames.filter(n=>/^[0-9]+ |_[0-9]+$/.test(n));if(!names.length)throw Error('No se encontraron hojas finales por evento. Carga un archivo Historico_ERI.');return {rows:names.flatMap(n=>XLSX.utils.sheet_to_json(wb.Sheets[n],{defval:null,raw:true})),source:'hojas finales por evento; Preliminar excluido'}}
return {rows:XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{defval:null,raw:true}),source:'primera hoja (base anterior)'}}
$('historyFile').onchange=async e=>{invalidate();historyRows=[];historyLoaded=false;const f=e.target.files[0];if(!f)return;try{if(typeof XLSX==='undefined')throw Error('No se cargó el lector de Excel. Abre el HTML con conexión a Internet.');const wb=XLSX.read(await f.arrayBuffer(),{type:'array',cellDates:true});const h=historyFromWorkbook(wb);if(h.rows.length&&!Object.keys(h.rows[0]).some(k=>['COD_EVE','COD EVE','CODIGO EVENTO'].includes(plain(k))))throw Error('El archivo no contiene cod_eve.');historyRows=uniqueRaw(h.rows);historyLoaded=true;$('historyStatus').textContent=f.name+' · '+historyRows.length+' registros · '+h.source+'.';$('process').disabled=!baseRows.length}catch(err){$('historyStatus').textContent='No se cargó el histórico: '+err.message;$('process').disabled=true}};
$('clearHistory').onclick=()=>{historyRows=[];historyLoaded=false;$('historyFile').value='';$('historyStatus').textContent='Sin histórico seleccionado.';invalidate();$('process').disabled=!baseRows.length};
const oldBaseHandler=$('baseFile').onchange;$('baseFile').onchange=e=>{invalidate();oldBaseHandler(e)};
const oldCatalogHandler=$('eriFile').onchange;$('eriFile').onchange=e=>{invalidate();oldCatalogHandler(e)};
$('runDate').onchange=()=>{setDateUI();invalidate()};
const originalProcess=process;$('process').onclick=()=>{if($('historyFile').files?.length&&!historyLoaded){$('status').textContent='Corrige la carga del histórico o pulsa Quitar histórico.';return}if(!baseRows.length)return;const hs=Object.keys(baseRows[0]);if(!hs.some(k=>['AJUSTE','AJUSTE_','AJUSTES'].includes(plain(k)))){invalidate();$('status').textContent='Falta la columna ajuste. No se puede aplicar el filtro 6/D.';return}originalProcess();$('historyDownload').disabled=$('download').disabled};
function fileDate(){return $('runDate').value.replaceAll('-','')}
$('download').onclick=()=>XLSX.writeFile(buildSheets().wb,'Resultado_ERI_'+fileDate()+'.xlsx');
$('historyDownload').onclick=()=>XLSX.writeFile(historyWorkbook(),'Historico_ERI_'+fileDate()+'.xlsx');
$('downloadPackage').onclick=async()=>{const btn=$('downloadPackage');btn.disabled=true;try{if(typeof JSZip==='undefined')throw Error('No se cargó el compresor ZIP. Abre el HTML con conexión a Internet.');const {wb}=buildSheets(),zip=new JSZip(),folder=zip.folder('Resultado_ERI_'+fileDate());folder.file('Resultado_ERI_'+fileDate()+'.xlsx',XLSX.write(wb,{bookType:'xlsx',type:'array'}));folder.file('Historico_ERI_'+fileDate()+'.xlsx',XLSX.write(historyWorkbook(),{bookType:'xlsx',type:'array'}));for(const name of wb.SheetNames){const one=XLSX.utils.book_new();XLSX.utils.book_append_sheet(one,wb.Sheets[name],name);folder.folder('Hojas_individuales').file(safeName(name)+'.xlsx',XLSX.write(one,{bookType:'xlsx',type:'array'}))}folder.file('LEEME.txt','Próxima jornada: carga la base nueva y Historico_ERI. El histórico conserva casos anteriores y agrega nuevos identificables; reemplaza la versión anterior de los actualizados. No certifica revisión manual. Por_verificar queda fuera de las incorporaciones automáticas: revisa esos casos antes de dar por terminada la jornada. Preliminar mantiene ajustes 6/D. Eventos contienen nuevos y actualizados. ERI_CAMBIOS muestra valores anteriores y actuales. La base original no se modifica.');const blob=await zip.generateAsync({type:'blob',compression:'DEFLATE'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='Resultado_ERI_'+fileDate()+'_carpeta.zip';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}catch(err){$('status').textContent='No se pudo descargar: '+err.message}finally{btn.disabled=false}};


const SuiteIO=(()=>{'use strict';
const $=id=>document.getElementById(id);
const text=v=>String(v??'').trim();
const norm=v=>text(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();
const key=v=>norm(v).replace(/[^A-Z0-9]/g,'');
const code=v=>text(v).replace(/\.0+$/,'').replace(/^0+(?=\d)/,'');
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const known={'200':'Cólera','205':'Chagas','275':'Encefalitis equina del este en humanos','307':'Vigilancia integrada de rabia humana','310':'Fiebre amarilla','348':'IRAG inusitada','570':'Mortalidad por cólera','670':'Rabia humana','710':'Rubéola','730':'Sarampión','800':'Tos ferina'};
const countryCodes=new Set('004 008 010 012 016 020 024 028 031 032 036 040 044 048 050 051 052 056 060 064 068 070 072 074 076 084 086 090 092 096 100 104 108 112 116 120 124 132 136 140 144 148 152 156 158 162 166 170 174 175 178 180 184 188 191 192 196 203 204 208 212 214 218 222 226 231 232 233 234 238 239 242 246 248 250 254 258 260 262 266 268 270 275 276 288 292 296 300 304 308 312 316 320 324 328 332 334 336 340 344 348 352 356 360 364 368 372 376 380 384 388 392 398 400 404 408 410 414 417 418 422 426 428 430 434 438 440 442 446 450 454 458 462 466 470 474 478 480 484 492 496 498 499 500 504 508 512 516 520 524 528 531 533 534 535 540 548 554 558 562 566 570 574 578 580 581 583 584 585 586 591 598 600 604 608 612 616 620 624 626 630 634 638 642 643 646 652 654 659 660 662 663 666 670 674 678 682 686 688 690 694 702 703 704 705 706 710 716 724 728 729 732 740 744 748 752 756 760 762 764 768 772 776 780 784 788 792 795 796 798 800 804 807 818 826 831 832 833 834 840 850 854 858 860 862 876 882 887 894'.split(' ').map(Number));
const missing=new Set(['','0','999','9999','99999','-','--','NA','N/A','#N/D','#N/A','SIN INFORMACION','SIN DATO','SIN DATOS','DESCONOCIDO','NO DEFINIDO','NO APLICA','NULL','NONE']);
function field(row,aliases){for(const [h,c] of row.cells)if(aliases.includes(key(h)))return c.v;return '';}
const SPECIAL_EVENTS={"200": "COLERA", "205": "CHAGAS", "230": "DIFTERIA", "250": "ENCEFALITIS DEL NILO OCCIDENTAL EN HUMANOS", "270": "ENCEFALITIS EQUINA DEL OESTE EN HUMANOS", "290": "ENCEFALITIS EQUINA VENEZOLANA EN HUMANOS", "295": "ENFERMEDADES DE ORIGEN PRIONICO", "310": "FIEBRE AMARILLA", "348": "INFECCION RESPIRATORIA AGUDA GRAVE IRAG INUSITADA", "350": "ENFERMEDADES TRANSMITIDAS POR ALIMENTOS O AGUA ETA (BROTES)", "360": "INTOXICACION POR PLAGUICIDAS", "380": "INTOXICACION POR METANOL", "390": "INTOXICACION POR METALES PESADOS", "400": "INTOXICACION POR SOLVENTES", "410": "INTOXICACION POR OTRAS SUSTANCIAS QUIMICAS", "412": "INTOXICACION POR GASES", "440": "LEISHMANIASIS VISCERAL", "500": "MENINGITIS  MENINGOCOCCICA", "570": "MORTALIDAD POR COLERA", "610": "PARALISIS FLACIDA AGUDA (MENORES DE 15 AÑOS)", "670": "RABIA HUMANA", "710": "RUBEOLA", "720": "SINDROME DE RUBEOLA CONGENITA", "730": "SARAMPION", "770": "TETANOS NEONATAL", "452": "LESIONES POR ARTEFACTOS EXPLOSIVOS (POLVORA Y MINAS ANTIPERSONAL)", "535": "MENINGITIS BACTERIANA Y ENFERMEDAD MENINGOCÓCICA", "307": "VIGILANCIA INTEGRADA DE RABIA HUMANA", "365": "INTOXICACIONES", "607": "EBOLA", "725": "SÍNDROME NEUROLÓGICO PROBABLEMENTE ASOCIADO A VIRUS ZIKA", "275": "ENCEFALITIS EQUINA DEL ESTE EN HUMANOS", "349": "BROTES DE ENFERMEDADES TRANSMITIDAS POR ALIMENTOS Y VEHICULIZADAS POR AGUA, HEPATITIS A, FIEBRE TIFOIDE/PARATIFOIDEA, CÓLERA", "739": "SÍNDROME INFLAMATORIO MULTISISTÉMICO EN NIÑOS ASOCIADO A SARS-COV2", "355": "ENFERMEDAD TRANSMITIDA POR ALIMENTOS O AGUA (ETA)", "800": "TOS FERINA "};
function alertFor(row){
 const vals=aliases=>[...row.cells].filter(([h])=>aliases.includes(key(h).replace(/^\d+/,''))).map(([,c])=>c.v);
 const val=aliases=>vals(aliases).find(v=>!missing.has(norm(v)))??'';
 const yes=v=>v===true||/^(1(?:\.0+)?|SI|S|TRUE|X|SI[ .:-].*)$/.test(norm(v));
 const pop=[],ev=[],review=[];
 const add=(s)=>{if(!pop.includes(s))pop.push(s)};
 const et=norm(val(['PERETN','PERTENENCIAETNICA']));
 const indigenous=/^1(?:\.0+)?$/.test(et)||/^1\s*[-.:]\s*INDIGENA/.test(et)||/^INDIGENAS?$/.test(et);
 if(indigenous)add('Indígena · pertenencia étnica');
 const groups=norm(vals(['GRUPOSPOBLACIONALES','GRUPOPOBLACIONAL','GRUPOSPOBLACIONALESALOSQUEPERTENECEELPACIENTE']).join(' | '));
 if(vals(['GPCARCEL','PPL','PERSONASPRIVADASDELALIBERTAD','POBLACIONPRIVADADELALIBERTAD','CARCELARIOS']).some(yes)||/PRIVAD[AO]S? DE (LA )?LIBERTAD|CARCELARI|\bPPL\b/.test(groups))add('PPL · grupo poblacional');
 if(vals(['GPICBF','GPINFANT','GPINFANTIL','POBLACIONINFANTIL','POBLACIONINFANTILACARGODELICBF']).some(yes)||/INFANTIL|ICBF/.test(groups))add('Población infantil · grupo poblacional/ICBF');
 if(vals(['GPMIGRANT','GPMIGRANTE','GPMIGRANTES','MIGRANTES']).some(yes)||/MIGRANTE/.test(groups))add('Migrante · grupo poblacional');
 const upgd=String(val(['UPGD','CODPRE','CODUPGD','CODIGOUPGD','CODIGODELAUPGD'])).trim().replace(/\.0+$/,'').replace(/[ -]/g,'');
 const sub=String(val(['CODSUB','CODSUBINDICE','CODSUBIND','SUBINDICE','SUBIND','SUBINDUPGD','SUBINDICEUPGD'])).replace(/\.0+$/,'');
 if(sub==='99'||(/^\d{12}$/.test(upgd)&&upgd.endsWith('99')))add('PPL · subíndice UPGD 99');
 const admin=norm(val(['CODASE','CODEAPB','EAPB','ADMINISTRADORA','CODIGOADMINISTRADORA','NOMASE','NOMEAPB','NOMBREDELAADMINISTRADORADEPLANESDEBENEFICIOS']));
 const occupation=norm(val(['OCUPACION','OCUPACIONDELPACIENTE','NOCUPACION','NOMOCUPACION','OCUPAC']));
 const institution=norm(val(['NUNIMODIF','NOMUPGD','NOMBREUPGD','RAZONSOCIAL','RAZONSOCIALDELAUNIDADPRIMARIAGENERADORADELDATO']));
 if(/RES001|POLICIA|POLICIAL/.test(admin))add('Policía · administradora (vinculación por verificar)');
 if(/RES003|FUERZAS MILITARES|SANIDAD MILITAR/.test(admin))add('Fuerzas Militares · administradora (vinculación por verificar)');
 if(/\b(MILITAR|MILITARES|SOLDADO|POLICIA|POLICIAS|MARINO|INFANTE DE MARINA)\b|EJERCITO|ARMADA|FUERZA AEREA|FUERZA AEROESPACIAL/.test(occupation))add('Fuerza Pública · ocupación: '+occupation);
 if(/^\d{10}(\d{2})?$/.test(upgd)&&['7','8'].includes(upgd[5]))add((upgd[5]==='7'?'Policía':'Fuerzas Militares')+' · UPGD (vinculación por verificar)');
 if(/MILITAR|POLICIA|EJERCITO|ARMADA|NAVAL|FUERZA AEREA|FUERZA AEROESPACIAL/.test(institution))add('Posible Fuerza Pública · institución (verificar)');
 const regime=norm(val(['TIPSS','TIPOREGIMEN','REGIMEN','TIPODEREGIMENENSALUD']));
 if(/POLICIA|MILITAR/.test(regime))add('Fuerza Pública · régimen descrito (verificar)');
 else if(['P','E','EXCEPCION','ESPECIAL'].includes(regime)&&!pop.some(p=>/Fuerza|Policía/.test(p)))review.push('Régimen de excepción/especial: insuficiente para identificar Fuerza Pública');
 const cv=val(['CODPAISO','CODIGOPAISPROCEDENCIA']),nc=code(cv),pn=norm(val(['NPAISPROCE','PAISPROCEDENCIA','PAISOCURRENCIA']));
 const valid=/^\d+$/.test(nc)&&countryCodes.has(Number(nc));
 const cs=valid?(Number(nc)===170?'local':'foreign'):null;
 const ns=!missing.has(pn)&&/[A-Z]/.test(pn)?(['COLOMBIA','COL','CO','REPUBLICA DE COLOMBIA'].includes(pn)?'local':'foreign'):null;
 const conflict=cs&&ns&&cs!==ns;
 const invalid=!missing.has(norm(cv))&&!valid;
 const exterior=!conflict&&!invalid&&(cs==='foreign'||ns==='foreign');
 if(exterior)add('Procedencia del exterior · '+(pn||nc)+' (no determina nacionalidad)');
 if(conflict||invalid)review.push('Verificar país de procedencia: código/nombre inválido o contradictorio');
 const c=code(row.code),name=norm(row.name||val(['NOMEVE','NOMBREEVENTO','EVENTO']));
 const all={'275':'Encefalitis equina del este en humanos','200':'Cólera','570':'Mortalidad por cólera','230':'Difteria','607':'Ébola','670':'Rabia humana','307':'Vigilancia integrada de rabia humana'};
 if(all[c])ev.push(all[c]+' · todos los registros');

 const sar=c==='730'||name==='SARAMPION',tos=c==='800'||name==='TOS FERINA';
 const dn=norm(val(['NDEP NOT','NDEPNOT','DEPARTAMENTONOTIFICACION','DEPARTAMENTODENOTIFICACION','NOMBREDEPARTAMENTONOTIFICACION'].map(key)));
 const dc=code(val(['CODDPTO','CODDPTON','CODDEPNOT','DEPNOT','CODIGODEPARTAMENTONOTIFICACION']));
 const amazon=dc==='91'||dn==='AMAZONAS'||(/^\d{10}(\d{2})?$/.test(upgd)&&upgd.startsWith('91'));
 if(sar&&(exterior||amazon))ev.push('Sarampión · '+[exterior?'procedencia exterior':'',amazon?'notificado en Amazonas':''].filter(Boolean).join(' y '));
 if(sar&&!cs&&!ns)review.push('Sarampión: falta país de procedencia');
 if(sar&&!dc&&!dn&&!upgd)review.push('Sarampión: falta ubicación de notificación');
 if(tos&&indigenous)ev.push('Tos ferina · población indígena');
 if(tos&&!et)review.push('Tos ferina: falta pertenencia étnica');
 if(vals(['GPINDIGEN']).some(yes)&&!indigenous)review.push('Verificar gp_indigen frente a pertenencia étnica');
 const kind=pop.length&&ev.length?'both':pop.length?'population':ev.length?'critical':review.length?'verify':'normal';
 return {kind,label:({both:'POBLACIÓN + EVENTO',population:'POBLACIÓN ESPECIAL',critical:'CRITERIO DE EVENTO',verify:'VERIFICAR',normal:'SIN CRITERIO ESPECIAL'})[kind],
 reason:[pop.length?'Poblaciones: '+pop.join('; '):'',ev.length?'Evento: '+ev.join('; '):'',review.length?'Verificar: '+review.join('; '):''].filter(Boolean).join(' | ')||'Registro conservado; sin criterio especial identificado',populations:pop,eventCriteria:ev};
}

function isDateColumn(header){return /^(FEC|FECHA)/.test(key(header))||['INISIN','REGINIFEC'].includes(key(header));}
function textDate(value){
 const s=text(value);let y,m,d;
 let a=s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[ T].*)?$/);
 if(a){[,y,m,d]=a.map(Number);}else{
  a=s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})(?:[ T].*)?$/);if(!a)return null;
  d=Number(a[1]);m=Number(a[2]);y=Number(a[3]);
  // Text dates default to day/month; infer month/day only when unambiguous.
  if(m>12&&d<=12)[d,m]=[m,d];
 }
 const date=new Date(Date.UTC(y,m-1,d));
 return date.getUTCFullYear()===y&&date.getUTCMonth()===m-1&&date.getUTCDate()===d?date:null;
}
function readCell(cell,date1904,header){
 if(!cell)return {v:null};
 if(cell.t==='e')return {v:cell.w||'#ERROR'};
 if(cell.t==='n'&&((cell.z&&XLSX.SSF.is_date(cell.z))||(isDateColumn(header)&&cell.v>0&&cell.v<2958466))){
  const d=XLSX.SSF.parse_date_code(cell.v,{date1904});
  if(d)return {v:new Date(Date.UTC(d.y,d.m-1,d.d,d.H,d.M,d.S)),date:true,z:'dd/mm/yyyy'};
 }
 if(typeof cell.v==='string'&&isDateColumn(header)){const d=textDate(cell.v);if(d)return {v:d,date:true,z:'dd/mm/yyyy'};}
 return {v:cell.v??null,z:cell.z};
}
function showCell(c){if(!c)return '';if(c.date){const d=c.v;return `${String(d.getUTCDate()).padStart(2,'0')}/${String(d.getUTCMonth()+1).padStart(2,'0')}/${d.getUTCFullYear()}`;}return text(c.v);}
function parseBook(bytes,source){
 const wb=bytes?.SheetNames?bytes:XLSX.read(bytes,{type:'array',cellDates:false,cellNF:true});
 const date1904=!!wb.Workbook?.WBProps?.date1904, rows=[],notes=[];
 for(const sn of wb.SheetNames){
  const ws=wb.Sheets[sn];if(!ws['!ref']){notes.push(`${source} / ${sn}: hoja vacía`);continue;}
  const range=XLSX.utils.decode_range(ws['!ref']);let hr=-1,ec=-1;
  if(range.e.c>2000||range.e.r>200000)throw Error(`${source}: hoja demasiado grande (máximo 200.000 filas y 2.000 columnas).`);
  for(let r=range.s.r;r<=Math.min(range.e.r,range.s.r+49)&&hr<0;r++)for(let c=range.s.c;c<=range.e.c;c++)if(['CODEVE','CODIGOEVENTO','CODIGODELEVENTO'].includes(key(ws[XLSX.utils.encode_cell({r,c})]?.v))){hr=r;ec=c;break;}
  if(hr<0){notes.push(`${source} / ${sn}: hoja sin columna cod_eve, omitida`);continue;}
  const headers=[],used=new Set();
  for(let c=range.s.c;c<=range.e.c;c++){
   let h=text(ws[XLSX.utils.encode_cell({r:hr,c})]?.v)||`Columna_${c+1}`,b=h,i=2;while(used.has(h))h=b+'_'+i++;
   headers.push(h);used.add(h);
  }
  for(let r=hr+1;r<=range.e.r;r++){
   const cells=new Map();let filled=false;
   for(let c=range.s.c;c<=range.e.c;c++){const v=readCell(ws[XLSX.utils.encode_cell({r,c})],date1904,headers[c-range.s.c]);cells.set(headers[c-range.s.c],v);if(v.v!==null&&text(v.v)!=='')filled=true;}
   if(!filled)continue;
   const event=code(ws[XLSX.utils.encode_cell({r,c:ec})]?.v);if(!/^\d+$/.test(event))throw Error(`${source} / ${sn}, fila ${r+1}: falta un código de evento numérico válido. Corrige el archivo y vuelve a cargarlo.`);
   if(!Object.prototype.hasOwnProperty.call(SPECIAL_EVENTS,event))continue;
   const row={code:event,cells,source,sourceSheet:sn,sourceRow:r+1};row.name=SPECIAL_EVENTS[event]||text(field(row,['NOMEVE','NOMBREEVENTO','EVENTO']))||known[event]||`Evento ${event}`;row.alert=alertFor(row);rows.push(row);
  }
 }
 return {rows,notes};
}

async function readBook(bytes){
 const u=bytes instanceof Uint8Array?bytes:new Uint8Array(bytes);
 const original=XLSX.read(bytes,{type:'array',cellDates:false,cellNF:true});
 if(u[0]!==80||u[1]!==75)return original;
 const zip=await JSZip.loadAsync(u);let changed=false;const date1904=!!original.Workbook?.WBProps?.date1904;
 // Read ISO date cells directly to avoid timezone drift in older XLSX readers.
 for(const entry of Object.values(zip.files)){
  if(entry.dir||!/^xl\/worksheets\/.*\.xml$/.test(entry.name))continue;
  let xml=await entry.async('string'),edited=false;
  xml=xml.replace(/(<(?:[\w.-]+:)?c\b[^>]*\bt=")d("[^>]*>)([\s\S]*?)(<\/(?:[\w.-]+:)?c>)/g,(whole,start,attrs,body,end)=>{
   const m=body.match(/(<(?:[\w.-]+:)?v>)([^<]+)(<\/(?:[\w.-]+:)?v>)/);if(!m)return whole;
   const iso=m[2].trim();const dt=new Date(/^\d{4}-\d{2}-\d{2}$/.test(iso)?iso+'T00:00:00Z':/[zZ]|[+-]\d{2}:\d{2}$/.test(iso)?iso:iso+'Z');if(isNaN(dt))return whole;
   const serial=(dt.getTime()-Date.UTC(1899,11,30))/86400000-(date1904?1462:0);edited=true;
   return start+'n'+attrs+body.replace(m[0],m[1]+serial+m[3])+end;
  });
  if(edited){zip.file(entry.name,xml);changed=true;}
 }
 return changed?XLSX.read(await zip.generateAsync({type:'uint8array'}),{type:'array',cellDates:false,cellNF:true}):original;
}

return {readBook,readCell,isDateColumn,textDate,alertFor};})();
// Read all Excel dates without time-zone shifts, then use local calendar dates in ERI.
function normalizedWorkbook(wb){const is1904=!!wb.Workbook?.WBProps?.date1904;for(const sn of wb.SheetNames){const ws=wb.Sheets[sn];if(!ws['!ref'])continue;const range=XLSX.utils.decode_range(ws['!ref']);for(let col=range.s.c;col<=range.e.c;col++){const h=ws[XLSX.utils.encode_cell({r:range.s.r,c:col})]?.v||'';for(let row=range.s.r+1;row<=range.e.r;row++){const addr=XLSX.utils.encode_cell({r:row,c:col}),c=ws[addr];if(!c)continue;const v=SuiteIO.readCell(c,is1904,h);if(v.date){const d=v.v;ws[addr]={t:'d',v:new Date(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()),z:'dd/mm/yyyy'};}}}}return wb;}
parseDate=function(v){if(v instanceof Date&&!isNaN(v))return v;if(typeof v==='number'){const d=XLSX.SSF.parse_date_code(v);return d?new Date(d.y,d.m-1,d.d):null;}const d=SuiteIO.textDate(v);return d?new Date(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()):null;};
readWorkbook=async function(file,cb){try{const w=normalizedWorkbook(await SuiteIO.readBook(await file.arrayBuffer()));cb(XLSX.utils.sheet_to_json(w.Sheets[w.SheetNames[0]],{defval:null,raw:true}),null)}catch(e){cb(null,e)}};
alertInfo=function(r){const row={code:eventCode(r),cells:new Map(Object.entries(r).map(([h,v])=>[h,{v}]))},a=SuiteIO.alertFor(row);return {label:[a.label,a.reason].filter(Boolean).join(' · '),priority:!!a.populations.length,populations:a.populations,eventCriteria:a.eventCriteria,kind:a.kind};};
$('historyFile').onchange=async e=>{invalidate();historyRows=[];historyLoaded=false;const f=e.target.files[0];if(!f)return;try{const wb=normalizedWorkbook(await SuiteIO.readBook(await f.arrayBuffer())),h=historyFromWorkbook(wb);if(h.rows.length&&!Object.keys(h.rows[0]).some(k=>['COD_EVE','COD EVE','CODIGO EVENTO'].includes(plain(k))))throw Error('El archivo no contiene cod_eve.');historyRows=uniqueRaw(h.rows);historyLoaded=true;$('historyStatus').textContent=f.name+' · '+historyRows.length+' registros · '+h.source;$('process').disabled=!baseRows.length}catch(e){$('historyStatus').textContent='No se cargó el histórico: '+e.message;$('process').disabled=true}};
const baseHistoryReader=historyFromWorkbook;
historyFromWorkbook=function(wb){if(wb.SheetNames.some(n=>plain(n)==='HISTORICO'))return baseHistoryReader(wb);const names=wb.SheetNames.filter(n=>/^\d{3}[ _-]/.test(n));if(names.length)return {rows:names.flatMap(n=>XLSX.utils.sheet_to_json(wb.Sheets[n],{defval:null,raw:true})),source:'pestañas por evento'};return baseHistoryReader(wb);};
// Cross/NSI audit metadata must not become epidemiological changes when re-imported.
rawRow=function(r){return Object.fromEntries(Object.entries(r).filter(([k])=>!META.has(plain(k))&&!/^(CRUCE_|ALERTA_|MOTIVO_ALERTA|ESTADO_NSI|MOTIVO_NSI|ARCHIVO_ORIGEN_NSI|HOJA_ORIGEN_NSI|FILA_ORIGEN_NSI)/.test(plain(k))))};
function styledEriWorkbook(views){const wb=new ExcelJS.Workbook();for(const view of views){const rows=groupedColorRows(view.rows,eventCode,alertInfo),lead=['ALERTA_ERI','ERI_ESTADO','ERI_MOTIVO','ERI_CAMBIOS','ERI_FILA_ORIGEN'],hs=[...lead,...new Set([...headers,...rows.flatMap(r=>Object.keys(r))].filter(h=>!lead.includes(h)))];const name=view.name.replace(/[\\/?*\[\]:]/g,'').slice(0,31),s=wb.addWorksheet(name,{views:[{state:'frozen',ySplit:1}]});s.addRow(hs);
 for(const r of rows){const a=alertInfo(r),er=s.addRow(hs.map(h=>{if(h==='ALERTA_ERI')return a.label;const v=r[h];if(v instanceof Date)return new Date(Date.UTC(v.getFullYear(),v.getMonth(),v.getDate()));if(SuiteIO.isDateColumn(h)){const d=parseDate(v);if(d)return new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));}return v??null;}));er.eachCell({includeEmpty:true},(c,i)=>{if(c.value instanceof Date)c.numFmt='dd/mm/yyyy';const bg={population:'FFDCF3E4',both:'FFEEE1FA',critical:'FFFFE1E5',indigenous:'FFEEE1FA',foreign:'FFFFE5CC',verify:'FFFFF2CC'}[a.kind]||(['ACTUALIZADO','POR VERIFICAR'].includes(r.ERI_ESTADO)?'FFFFF2CC':null);if(bg)c.fill={type:'pattern',pattern:'solid',fgColor:{argb:bg}};if(i===1)c.font={bold:!!a.label};});}
 s.columns.forEach((c,i)=>c.width=i===0||i===2||i===3?60:Math.min(40,Math.max(15,hs[i].length+2)));s.getRow(1).height=34;s.getRow(1).eachCell(c=>{c.font={bold:true,color:{argb:'FFFFFFFF'}};c.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF163A5F'}};c.alignment={wrapText:true,vertical:'middle'}});s.autoFilter={from:{row:1,column:1},to:{row:Math.max(1,s.rowCount),column:hs.length}};}return wb;}
function saveEri(bytes,name,mime){const url=URL.createObjectURL(new Blob([bytes],{type:mime})),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
let exportingEri=false;
async function exportEri(mode){if(exportingEri)return;exportingEri=true;const ids=['download','downloadPackage','historyDownload','process','reset','baseFile','historyFile','eriFile','runDate','sendCross','clearHistory'];const previous=ids.map(id=>$(id).disabled);ids.forEach(id=>$(id).disabled=true);$('status').textContent='Preparando Excel con alertas, colores y fechas día/mes/año…';await new Promise(r=>setTimeout(r,0));try{const views=[...resultViews(),{name:'Historico',rows:nextHistory}],date=fileDate();if(mode==='zip'){const z=new JSZip(),f=z.folder('Resultado_ERI_'+date);f.file('Resultado_ERI_'+date+'.xlsx',await styledEriWorkbook(views).xlsx.writeBuffer());f.file('Historico_ERI_'+date+'.xlsx',await styledEriWorkbook([{name:'Historico',rows:nextHistory}]).xlsx.writeBuffer());for(const v of views)f.folder('Hojas_individuales').file(safeName(v.name)+'.xlsx',await styledEriWorkbook([v]).xlsx.writeBuffer());f.file('LEEME.txt','Próxima jornada: usa Historico_ERI como histórico. Los casos por verificar permanecen en su evento y en Por_verificar, fuera de las incorporaciones automáticas al histórico. El preliminar conserva ajustes 6/D. Todas las fechas se muestran día/mes/año.');saveEri(await z.generateAsync({type:'uint8array',compression:'DEFLATE'}),'Resultado_ERI_'+date+'.zip','application/zip');}else saveEri(await styledEriWorkbook(mode==='history'?[{name:'Historico',rows:nextHistory}]:views).xlsx.writeBuffer(),(mode==='history'?'Historico_ERI_':'Resultado_ERI_')+date+'.xlsx','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');$('status').textContent='Descarga preparada.';}catch(e){$('status').textContent='No se pudo descargar: '+e.message}finally{exportingEri=false;ids.forEach((id,i)=>$(id).disabled=previous[i]);}}
$('download').onclick=()=>exportEri('result');$('downloadPackage').onclick=()=>exportEri('zip');$('historyDownload').onclick=()=>exportEri('history');
$('sendCross').onclick=async()=>{if($('download').disabled||!finalRows.length){$('status').textContent='Procesa primero la base diaria.';return;}const btn=$('sendCross');btn.disabled=true;try{const bytes=await styledEriWorkbook(resultViews().filter(v=>v.event)).xlsx.writeBuffer();await parent.receiveFromModule(bytes,'Inmediata_ERI_'+fileDate()+'.xlsx','A',$('runDate').value,catalog);}catch(e){$('status').textContent=e.message}finally{btn.disabled=false}};

// Compact exported data sheets without deleting columns or changing cell values.
function compactEventSheet(ws){
 const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]/g,'');
 const names=ws.getRow(1).values.slice(1).map(String);
 if(!names.some(h=>['CODEVE','CODIGOEVENTO','CODIGODELEVENTO'].includes(normalize(h))))return ws;
 function cellText(c){const v=c.value;if(v==null)return '';if(v instanceof Date)return '00/00/0000';return typeof v==='object'?c.text||'':String(v);}
 ws.columns.forEach((col,i)=>{const label=names[i]||'',k=normalize(label);let longest=0,filled=0;
  col.eachCell({includeEmpty:false},(c,row)=>{if(row===1)return;const s=cellText(c);if(s.trim()){filled++;longest=Math.max(longest,...s.split(/\r?\n/).map(t=>t.length));}});
  const audit=/^(ALERTA|ERI|ESTADONSI|MOTIVONSI|CRUCE|ARCHIVOORIGENNSI|HOJAORIGENNSI|FILAORIGENNSI|MOTIVOALERTA)/.test(k);
  const isDate=/^(FEC|FECHA)/.test(k)||['INISIN','REGINIFEC'].includes(k);
  const max=audit?(/MOTIVO|CAMBIOS|REVISION|ALERTA/.test(k)?30:22):30;
  const headerHint=Math.min(label.length+1,audit?14:18);
  col.width=isDate?12:filled?Math.min(max,Math.max(9,headerHint,longest+2)):Math.min(12,Math.max(9,headerHint));
 });
 ws.getRow(1).height=32;
 ws.eachRow((row,index)=>{let lines=1;row.eachCell({includeEmpty:true},(c,col)=>{c.alignment={...c.alignment,vertical:'top',wrapText:true};c.font={...c.font,size:10};if(index>1){const width=Math.max(7,ws.getColumn(col).width-2);lines=Math.max(lines,Math.min(3,cellText(c).split(/\r?\n/).reduce((n,s)=>n+Math.max(1,Math.ceil(s.length/width)),0)));}});if(index>1)row.height=Math.max(15,lines*14);});
 return ws;
}

const fullEriWorkbook=styledEriWorkbook;styledEriWorkbook=function(views){const w=fullEriWorkbook(views);w.worksheets.forEach(compactEventSheet);return w;};

// ---- 2026-10-20: SAME ERI DEPURATION FOR HISTORIC DATA, WITHOUT THE 3-DAY WINDOW ----
// The original rows are kept only in memory to allow re-filtering after a custom catalogue change.
let historyInputRows=[],historyInputSource='',historyInputFilename='',historyAudit={};
function hasColumnName(rows,aliases){
 if(!rows.length)return true;
 const names=Object.keys(rows[0]).map(plain);
 return aliases.some(x=>names.includes(x));
}
function cleanHistoricalERI(input){
 const rows=Array.isArray(input)?input:[];
 if(rows.length&&!hasColumnName(rows,['COD_EVE','COD EVE','CODIGO EVENTO','CÓDIGO EVENTO']))throw Error('Al histórico le falta cod_eve. No se puede filtrar por el catálogo ERI.');
 if(rows.length&&!hasColumnName(rows,['AJUSTE','AJUSTE_','AJUSTES']))throw Error('Al histórico le falta la columna ajuste. No se puede excluir 6/D de manera segura.');
 const allowed=new Set(catalog.map(x=>norm(x.codigo)));
 const byCatalog=rows.filter(r=>allowed.has(eventCode(r)));
 const withoutAdjustments=byCatalog.filter(r=>!['6','D'].includes(norm(field(r,['AJUSTE','AJUSTE_','AJUSTES']))));
 const deduplicated=uniqueRaw(withoutAdjustments);
 return {rows:deduplicated, audit:{read:rows.length,accepted:deduplicated.length,
  outOfCatalog:rows.length-byCatalog.length,adjustments:byCatalog.length-withoutAdjustments.length,
  exactDuplicates:withoutAdjustments.length-deduplicated.length}};
}
function statusHistoricalERI(){
 if(!historyLoaded)return;
 const a=historyAudit;
 $('historyStatus').textContent=historyInputFilename+' · '+a.accepted+' de '+a.read+' registros conservados ('+historyInputSource+'). Excluidos: '+a.outOfCatalog+' fuera del catálogo ERI, '+a.adjustments+' por ajuste 6/D y '+a.exactDuplicates+' duplicados exactos. Sin recorte de fechas.';
}
function refreshHistoricalERI(){
 if(!historyLoaded)return;
 const cleaned=cleanHistoricalERI(historyInputRows);
 historyRows=cleaned.rows;historyAudit=cleaned.audit;
 statusHistoricalERI();
}
// This overrides the older uploader and prevents accidentally comparing an unfiltered raw history.
$('historyFile').onchange=async e=>{
 invalidate();historyRows=[];historyInputRows=[];historyAudit={};historyLoaded=false;
 const f=e.target.files[0];if(!f)return;
 try{
  const wb=normalizedWorkbook(await SuiteIO.readBook(await f.arrayBuffer()));
  const h=historyFromWorkbook(wb);
  historyInputRows=h.rows;historyInputSource=h.source;historyInputFilename=f.name;
  const cleaned=cleanHistoricalERI(historyInputRows);
  historyRows=cleaned.rows;historyAudit=cleaned.audit;historyLoaded=true;
  statusHistoricalERI();$('process').disabled=!baseRows.length;
 }catch(err){historyInputRows=[];historyRows=[];historyLoaded=false;
  $('historyStatus').textContent='No se cargó el histórico: '+err.message;
  $('process').disabled=true;
 }
};
const originalClearHistoricalERI=$('clearHistory').onclick;
$('clearHistory').onclick=()=>{historyInputRows=[];historyInputSource='';historyInputFilename='';historyAudit={};originalClearHistoricalERI();};
const originalClickProcessERI=$('process').onclick;
$('process').onclick=()=>{
 if(historyLoaded){try{refreshHistoricalERI()}catch(err){invalidate();$('status').textContent='No se pudo depurar el histórico: '+err.message;return;}}
 originalClickProcessERI();
};
// Keep the catalog change invalidation; the history is re-filtered against the active catalog on processing.
// ---- END HISTORIC DEPURATION PATCH ----

// Sort presentation copies only; original selection and deduplication order stay intact.
function groupedColorRows(rows,eventOf,alertOf){
 const ranks={both:0,population:1,indigenous:1,foreign:1,critical:2,verify:3,normal:4};
 return rows.map((row,index)=>{const a=alertOf(row);return {row,index,event:String(eventOf(row)||''),rank:ranks[a.kind]??4,pop:(a.populations||[]).map(p=>p.split(' · ')[0]).sort().join('|')};}).sort((a,b)=>a.event.localeCompare(b.event,'es',{numeric:true})||a.rank-b.rank||a.pop.localeCompare(b.pop,'es')||a.index-b.index).map(x=>x.row);
}
