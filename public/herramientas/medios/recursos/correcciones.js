/* V8.2: selección automática, español por defecto y Word solo aprobado. */
let autoTimer=null,autoPaused=false,exporting=false,translationJob=null;
const sourcesOf=r=>({title:String(r.originalTitle||'').trim()||String(r.title||'').trim()||'(Sin título)',description:Editorial.clean(r.description||r.summary||r.translatedDescription||'').text});
const sourceHash=r=>Core.hash(JSON.stringify(sourcesOf(r)));
const reviewHash=r=>Core.hash(JSON.stringify([r.review.finalTitle,r.review.finalSummary,r.review.notes]));
const reviewReady=r=>true;
const esReady=r=>true;
const exportTitle=r=>r.review.finalTitle?.trim()||sourcesOf(r).title;
let exportSummary=r=>r.review.finalSummary?.trim()||Editorial.summarize(exportTitle(r),sourcesOf(r).description);
const exportNotes=r=>r.review.notes||'';
// El idioma del artículo NO garantiza el idioma de su título o su descripción.
// No se confía en etiquetas originales, heurísticas ni cachés de versiones anteriores.
initTranslation=function(r){r.translation={status:'original',title:sourcesOf(r).title,description:sourcesOf(r).description,method:'Texto original'};};
preferredTitle=function(r){return exportTitle(r);};
spanishDescription=function(r){return sourcesOf(r).description||'El archivo no contiene descripción.';};
const originalVisible=visible;
visible=function(){const mode=$('match').value;return originalVisible().filter(r=>mode==='selected'?r.recommended&&esReady(r):mode==='excluded'?!r.recommended&&esReady(r):mode==='translation'?!esReady(r):mode==='duplicates'?((r.duplicateCount||0)>0||(r.origins?.length||0)>1||r.versions?.length||r.similarCount>0||r.group):true);};
const originalCard=card;
card=function(r){let html=originalCard(r);let label='';const duplicates=Math.max(r.duplicateCount||0,(r.origins?.length||0)-1);if(duplicates)label+=`<span class="badge medium">Repetida · ${duplicates+1} apariciones consolidadas</span>`;if(r.versions?.length)label+=`<span class="badge medium">${r.versions.length} versión(es) anterior(es)</span>`;if(r.similarCount>0)label+=`<span class="badge group">${r.similarCount} noticia(s) parecida(s) · revisar grupo</span>`;html=html.replace('<div class="badges">','<div class="badges">'+label);html=html.replace('Es una sugerencia de lectura.',esc(r.selectionReason||'Es una sugerencia de lectura.'));if(!esReady(r))html=html.replace(/data-action="aprobada"/g,'disabled data-action="aprobada"');return html;};
stats=function(){const rows=current?.records||[];const ready=rows.filter(esReady),sel=ready.filter(r=>r.recommended&&!historyExcluded(r)),excluded=ready.filter(r=>!r.recommended),approved=rows.filter(r=>r.review.status==='aprobada'&&!historyExcluded(r));const duplicates=(current?.reports||[]).reduce((n,r)=>n+(r.duplicates||0),0),similar=rows.filter(r=>r.similarCount>0).length;const values=[['Noticias únicas',rows.length,'','all'],['Selección automática',sel.length,'green','selected'],['Apartadas por el filtro',excluded.length,'','excluded'],['Repeticiones consolidadas',duplicates,'','duplicates'],['Noticias parecidas',similar,'','duplicates'],['Aprobadas para Word',approved.length,'green','approved']];$('stats').innerHTML=values.map(([name,n,style,view])=>`<button class="stat ${style}" data-view="${view}"><span>${name}</span><strong>${n}</strong></button>`).join('');$('stats').querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{clearFilters(false);$('status').value=b.dataset.view==='approved'?'aprobada':'all';$('match').value=b.dataset.view==='approved'?'all':b.dataset.view;page=1;render();});};
const baseRender=render;
render=function(){baseRender();if(current){const n=current.records.filter(r=>r.recommended&&esReady(r)&&!historyExcluded(r)).length,wait=current.records.filter(r=>!esReady(r)).length,apart=current.records.filter(r=>esReady(r)&&!r.recommended).length;$('searchSubtitle').textContent=`${current.records.length} noticias únicas → ${n} seleccionadas automáticamente · ${apart} apartadas${wait?' · '+wait+' pendientes de español':''}`;if(!visible().length&&wait&&$('match').value==='selected')$('list').innerHTML='<div class="empty"><h2>Preparando la selección en español</h2><p>La traducción y el filtrado se actualizan automáticamente. Puedes consultar el contador “Pendientes de español”.</p></div>';}$('wordBtn').textContent=`Word · solo aprobadas (${current?.records.filter(r=>r.review.status==='aprobada').length||0})`;};
function reclassifyRecord(r,compiled){initTranslation(r);const event=r.eventType;Object.assign(r,Core.classify(r,compiled));if(r.eventManual)r.eventType=event;if(!r.geoManual&&!r.geoVerified&&esReady(r))Object.assign(r,Core.geo({...r,title:r.translation.title,description:r.translation.description},settings.customPlaces));}
function reclassifyAll(){if(!current)return;const compiled=Core.compile(settings.keywords);for(const r of current.records){if(r.translation?.status==='translating')r.translation.status='pending';reclassifyRecord(r,compiled);}Core.group(current.records);}
function scheduleAutomaticSpanish(){}
ensureConsent=async()=>false;
translateText=async text=>String(text||'');
runTranslations=async()=>{};
const baseSetReview=setReview;
setReview=async function(ids,value){if(value==='aprobada'){const missing=current.records.filter(r=>ids.includes(r.id)&&!esReady(r));if(missing.length){message('Espera a que estas noticias estén en español antes de aprobarlas. Usa “Reintentar español” si hubo un error.');return;}}return baseSetReview(ids,value);};
// A single export gate is shared by Excel, DOCX and PDF: no foreign-language fallback.
async function prepareSpanishExport(rows){return rows.length>0;}
exportRows=function(rows){return rows.map(r=>({titulo:exportTitle(r),descripcion:sourcesOf(r).description||'',resumen_final:exportSummary(r),observaciones:exportNotes(r),estado_revision:r.review.status,prioridad_lectura:r.priority,motivo_seleccion:r.selectionReason,coincidencias:r.matches.join(' | '),ambito:r.scope,departamento:r.department,municipio:r.municipality,ubicacion_verificada:r.geoVerified?'Sí':'No',evento:r.eventType,fecha_publicacion:Core.day(r.publicationDate)||'',fecha_evento:Core.day(r.eventDate)||'',fecha_importacion:Core.day(r.importDateUTC)||'',fuente:r.source||r.sourceName||'',enlace:safeLink(r.externalLink),grupo:r.group,noticias_parecidas:r.similarCount||0,apariciones:r.origins.length,archivos_origen:r.origins.map(o=>o.file).join(' | ')}));};
exportExcel=async function(){await flush();const rows=visible();if(noRows(rows)||!await prepareSpanishExport(rows))return;const data=exportRows(rows),ws=XLSX.utils.json_to_sheet(data);ws['!cols']=Object.keys(data[0]).map(k=>({wch:/titulo|descripcion|resumen|observaciones/.test(k)?65:26}));ws['!autofilter']={ref:ws['!ref']};for(const k of Object.keys(ws))if(!k.startsWith('!')){ws[k].t='s';ws[k].v=String(ws[k].v??'');delete ws[k].f;}const w=XLSX.utils.book_new();XLSX.utils.book_append_sheet(w,ws,'Noticias');download(exportName('xlsx'),new Blob([XLSX.write(w,{bookType:'xlsx',type:'array'})],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));};
function approvedRows(){return current?.records.filter(r=>r.review.status==='aprobada')||[];}
exportWord=async function(){await flush();const rows=approvedRows();if(!rows.length){message('No hay noticias incluidas para Word. Aprueba noticias en el primer filtro o vuelve a incluirlas en el segundo.');return;}if(!await prepareSpanishExport(rows))return;const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,WidthType,HeadingLevel}=docx;const para=(v,bold=false)=>new Paragraph({children:[new TextRun({text:String(v??''),bold,size:22,font:'Arial'})],spacing:{after:120}});const children=[new Paragraph({text:'Noticias seleccionadas para el informe',heading:HeadingLevel.TITLE}),para(`${rows.length} noticias · ${new Date().toLocaleString('es-CO')}`),para('Selección revisada por el usuario. Contenido en el idioma original o editado por el usuario. Las noticias de un mismo evento no se suman como casos.')];let sectionBefore='';for(const [i,r] of rows.entries()){const sectionNow=Editorial.section(r,exportTitle(r)).label;if(sectionNow!==sectionBefore){children.push(new Paragraph({text:sectionNow,heading:HeadingLevel.HEADING_1}));sectionBefore=sectionNow;}children.push(new Paragraph({text:`${i+1}. ${exportTitle(r)}`,heading:HeadingLevel.HEADING_2}),new Table({width:{size:100,type:WidthType.PERCENTAGE},rows:[['Fuente',r.source||r.sourceName||'No informada'],['Enlace',safeLink(r.externalLink)||'No informado'],['Ubicación',`${r.scope} · ${r.department||''} · ${r.municipality||''}`],['Fechas',`Publicación: ${Core.day(r.publicationDate)||'No informada'} · Evento: ${Core.day(r.eventDate)||'No informado'} · Importación: ${Core.day(r.importDateUTC)||'No informada'}`],['Resumen',exportSummary(r)],['Observaciones',exportNotes(r)],['Noticias relacionadas',r.group?`${r.group} · ${r.similarCount||0} noticia(s) parecida(s)`:'Sin agrupación']].map(([a,b])=>new TableRow({children:[new TableCell({children:[para(a,true)]}),new TableCell({children:[para(b)]})]}))}));}
 const d=new Document({sections:[{properties:{page:{margin:{top:900,bottom:900,left:900,right:900}}},children}]});download('EIOS_INFORME_'+new Date().toISOString().slice(0,10)+'.docx',await Packer.toBlob(d));};
printView=async function(){await flush();const rows=approvedRows();if(!rows.length){message('No hay noticias confirmadas en el segundo filtro para imprimir.');return;}const w=window.open('','_blank');if(!w){message('Permite abrir la ventana de impresión.');return;}w.document.write('<p>Preparando noticias aprobadas…</p>');if(!await prepareSpanishExport(rows)){w.close();return;}w.document.open();w.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Noticias aprobadas</title><style>body{font:12px/1.5 Arial;color:#173446;max-width:850px;margin:30px auto}article{border-top:2px solid #14757c;padding:15px 0;break-inside:avoid}h2{font-size:17px}p{white-space:pre-wrap;overflow-wrap:anywhere}a{color:#146b81}@media print{button{display:none}}@page{size:A4;margin:18mm}</style></head><body><button onclick="window.print()">Imprimir / Guardar como PDF</button><h1>Noticias aprobadas</h1><p>${rows.length} noticias</p>${rows.map((r,i)=>`<article><h2>${i+1}. ${esc(exportTitle(r))}</h2><p>${esc(r.source||r.sourceName||'')} · ${esc(r.scope)} · ${esc(r.department)} / ${esc(r.municipality)}</p><p>Publicación: ${esc(Core.day(r.publicationDate)||'No informada')}</p><p>${esc(exportSummary(r))}</p><p>${esc(exportNotes(r))}</p>${safeLink(r.externalLink)?`<a href="${esc(safeLink(r.externalLink))}">${esc(safeLink(r.externalLink))}</a>`:''}</article>`).join('')}</body></html>`);w.document.close();};
help=function(){modal('Cómo usar EIOS V9.3','<ol><li>Carga tus archivos CSV o Excel. La lectura y el filtrado funcionan sin Internet.</li><li>Revisa las noticias en su idioma original. Aprueba las que deban pasar al segundo filtro.</li><li>Todas las aprobadas se incluyen por defecto en Word y PDF. Usa No incluir en Word para excluir alguna, o Volver a incluir para recuperarla.</li><li>Puedes editar y ordenar. Las capturas muestran avisos de coincidencias sin bloquear la exportación.</li><li>Descarga respaldos para conservar tus búsquedas.</li></ol>');};
$('translateBtn').onclick=()=>{autoPaused=false;runTranslations(current?.records.filter(r=>!esReady(r))||[]).catch(handleError);};
$('cancelTranslation').onclick=()=>{cancelTranslate=true;autoPaused=true;$('progressText').textContent='Se detendrá tras la noticia en curso. Pulsa “Reintentar español” para continuar.';};

const importV8=importFiles;importFiles=async function(...args){autoPaused=false;return importV8(...args);};
const openV8=openSearch;openSearch=async function(...args){autoPaused=false;return openV8(...args);};

$('settingsBtn').onclick=settingsDialog;$('helpBtn').onclick=help;

// Inicia una búsqueda nueva sin reemplazar ni borrar las anteriores.
// Ambos botones (“Nueva búsqueda” y “Reiniciar búsqueda”) usan este flujo para
// evitar que una nueva carga se mezcle accidentalmente con la búsqueda abierta.
let restarting=false;
async function startFreshSearch(){
 if(restarting||busy||translating||exporting){message('Espera a que termine la tarea actual antes de iniciar otra búsqueda.');return;}
 const name=prompt('Nombre de la nueva búsqueda',`Revisión ${new Date().toLocaleDateString('es-CO')}`);
 if(!name?.trim())return;
 restarting=true;$('restartBtn').disabled=true;$('newBtn').disabled=true;
 try{
  clearTimeout(autoTimer);autoPaused=true;
  if(translationJob){cancelTranslate=true;message('Terminando la noticia en curso para guardar la búsqueda actual…');await translationJob;}
  // Primero guardamos completamente la búsqueda actual. Nunca se reutiliza ni se sobreescribe.
  await flush();
  importMode='new';importName=name.trim();
  $('files').value='';
  // El selector usará el modo y el nombre compartidos con el controlador de carga.
  $('files').click();
 }catch(e){handleError(e);}
 finally{restarting=false;$('restartBtn').disabled=false;$('newBtn').disabled=false;autoPaused=false;cancelTranslate=false;}
}
$('newBtn').onclick=()=>startFreshSearch();
$('restartBtn').onclick=()=>clearCurrentSearch().catch(handleError);

// Historial: contenido idéntico; un cambio de contenido conserva la noticia.
function historicalText(r){return JSON.stringify([r.originalTitle||r.title||'',r.description||r.summary||''].map(Core.norm));}
async function markHistory(search){
 const previous=(await Store.all()).filter(s=>s.id!==search.id&&s.createdAt<=search.createdAt);
 const identities=new Map(),texts=new Map();
 for(const s of previous)for(const r of s.records){
  const entry={search:s.name,date:s.createdAt,text:historicalText(r)};
  if(!identities.has(r.key))identities.set(r.key,[]);identities.get(r.key).push(entry);
  if(entry.text.length>=80)texts.set(entry.text,entry);
 }
 for(const r of search.records){const t=historicalText(r),same=identities.get(r.key)||[],hit=same.find(e=>e.text===t)||(t.length>=80?texts.get(t):null);
  r.previousDuplicate=hit?{search:hit.search,date:hit.date}:null;
  r.previousUpdate=!hit&&same.length>0;
 }
}
const historyExcluded=r=>current?.excludeHistory!==false&&!!r.previousDuplicate;
const visibleBeforeHistory=visible;
visible=function(){return visibleBeforeHistory().filter(r=>$('match').value==='history'?!!r.previousDuplicate:!historyExcluded(r));};
approvedRows=function(){return current?.records.filter(r=>r.review.status==='aprobada'&&!historyExcluded(r))||[];};
const cardBeforeHistory=card;
card=function(r){let s=cardBeforeHistory(r);const badge=r.previousDuplicate?`<span class="badge medium">Ya apareció en ${esc(r.previousDuplicate.search)} · ${esc(Core.day(r.previousDuplicate.date))}</span>`:r.previousUpdate?'<span class="badge group">Contenido actualizado respecto a una búsqueda anterior · revisar</span>':'';return s.replace('<div class="badges">','<div class="badges">'+badge);};
const renderBeforeHistory=render;
render=function(){renderBeforeHistory();$('excludeHistory').checked=current?.excludeHistory!==false;refreshSearchList();const n=current?.records.filter(r=>r.previousDuplicate).length||0;$('historyInfo').textContent=`${n} noticias repetidas de búsquedas anteriores. ${current?.excludeHistory!==false?'Ocultas en el primer filtro; las aprobadas se gestionan en el segundo.':'Exclusión desactivada.'} Consulta el filtro “Repetidas de búsquedas anteriores”.`;$('wordBtn').textContent=`Word · solo aprobadas (${approvedRows().length})`;};
$('excludeHistory').onchange=async()=>{if(!current)return;if(exporting){$('excludeHistory').checked=current.excludeHistory!==false;message('Espera a que termine la exportación.');return;}current.excludeHistory=$('excludeHistory').checked;queueSave();render();};
async function deleteSearchById(id){
 if(busy||translating||exporting||restarting){message('Espera a que termine la tarea actual antes de borrar.');return;}
 const list=await Store.all();
 const target=list.find(s=>s.id===id);
 if(!target)return;
 if(!confirm(`¿Borrar la búsqueda “${target.name}” y sus ${target.records.length} noticias? No se puede deshacer sin un respaldo. Las demás búsquedas se conservan.`))return;
 clearTimeout(autoTimer);autoPaused=true;busy=true;closeSearchMenu();render();
 try{
  await flush();
  await Store.removeSearch(target.id,target.rev);
  const remaining=(await Store.all()).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt));
  if(current?.id===target.id){
   current=null;dirty=false;selected.clear();undo=[];clearFilters(false);
   const next=remaining[0];
   if(next){current=await Store.read('searches',next.id);reclassifyAll();await markHistory(current);await Store.put('settings',{id:'last',value:next.id});}
   else await Store.put('settings',{id:'last',value:''});
  }
  await refreshSearchList();render();
  message(current?`Búsqueda “${target.name}” borrada. Se abrió “${current.name}”.`:'Búsqueda borrada. No quedan búsquedas guardadas; pulsa “Nueva búsqueda” para empezar.');
 }catch(e){handleError(e);}finally{busy=false;autoPaused=false;render();}
} 


// Vaciar solamente la búsqueda abierta, conservando identidad y nombre.
async function clearCurrentSearch(){
 if(!current){message('Abre primero la búsqueda cuyos datos quieres borrar.');return;}
 if(restarting||busy||exporting){message('Espera a que termine la carga o exportación.');return;}
 const target=current;
 if(!confirm(`¿Borrar las ${target.records.length} noticias, revisiones y registros de carga de “${target.name}”? Se conservarán su nombre, las demás búsquedas y la configuración. No se puede deshacer sin un respaldo.`))return;
 const previousPause=autoPaused;
 restarting=true;busy=true;autoPaused=true;clearTimeout(autoTimer);$('restartBtn').disabled=true;
 try{
  if(translationJob){cancelTranslate=true;message('Terminando la noticia en curso antes de vaciar esta búsqueda…');await translationJob;}
  await flush();
  const empty={...target,records:[],reports:[],references:[],reportOrder:[]};
  await Store.save(empty);
  current=empty;dirty=false;saveError=false;selected.clear();undo=[];dismissedInView.clear();
  $('files').value='';clearFilters(false);closeSearchMenu();
  await refreshSearchList();status('Guardado en este navegador');
  message(`Se borraron los datos de “${empty.name}”. Pulsa “Agregar archivos” para cargar nuevas noticias en esta misma búsqueda.`);
 }finally{busy=false;restarting=false;autoPaused=previousPause;cancelTranslate=false;$('restartBtn').disabled=false;render();}
}
