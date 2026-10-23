/* Mesa de aprobadas, actualidad, orden y contraste local con capturas. */
let deskMode=false,ocrBusy=false,ocrWorker=null;
function titleES(r){return exportTitle(r);}
function summaryES(r){return r.review.finalSummary?.trim()||Editorial.summarize(titleES(r),sourcesOf(r).description);}
function checkHash(r){return Core.hash(JSON.stringify([titleES(r),r.translation?.description,r.review.finalTitle,r.review.finalSummary]));}
function contentCheck(r){const t=titleES(r),body=sourcesOf(r).description,final=r.review.finalSummary||summaryES(r);const issues=[];
 if(!t||/^(\(?sin t[ií]tulo\)?|untitled|no title)$/i.test(t))issues.push('Falta el título de la noticia. Corrígelo desde la fuente.');
 if(!body.trim())issues.push('El archivo no contiene cuerpo de la noticia.');
 if(Editorial.clean(r.description||r.summary||body).removed)issues.push('Se detectó un bloque de noticias relacionadas; revisa el resumen propuesto.');
 if(t&&body&&Editorial.overlap(t,body)<.15)issues.push('El título comparte pocos términos con el contenido; puede tratarse de otra noticia.');
 const nums=(t.match(/\b\d+\b/g)||[]);if(nums.some(n=>!new RegExp('\\b'+n+'\\b').test(final)))issues.push('Hay cifras del título que no aparecen en el resumen; comprueba que correspondan al mismo hecho.');
 if(!final.trim())issues.push('No se pudo extraer un resumen relacionado con el título.');
 else if(t&&Editorial.overlap(t,final)<.15)issues.push('El resumen requiere comprobar su relación con el título.');
 return {issues,verified:r.editorVerified===checkHash(r),missingTitle:!t||/^\(?sin t[ií]tulo\)?$/i.test(t)};
}
function referenceHash(){return Core.hash((current?.references||[]).map(x=>x.id+'|'+x.text+'|'+x.status).join('\n'));}
function referenceMatch(r){let best={score:0,exact:false,snippet:'',name:''};for(const x of current?.references||[]){if(x.status!=='ready')continue;let m=Editorial.compare(titleES(r),x.text);const summary=summaryES(r);if(summary.length>=90){const bodyMatch=Editorial.compare(summary.slice(0,350),x.text);if(bodyMatch.score>=.9&&bodyMatch.score*.9>m.score)m={score:bodyMatch.score*.9,exact:false,snippet:bodyMatch.snippet};}const places=[r.municipality,r.department,...String(r.country||'').split(' / ')].filter(v=>v&&Editorial.norm(titleES(r)).includes(Editorial.norm(v)));if(!m.exact&&places.length&&!places.some(v=>Editorial.norm(m.snippet).includes(Editorial.norm(v))))m.score*=.7;if(m.score>best.score)best={...m,name:x.name};}return best;}
function comparisonDecision(r){const h=Core.hash(referenceHash()+'|'+titleES(r)+'|'+summaryES(r));return r.comparison?.hash===h?r.comparison.value:null;}
function finalHash(r){return Core.hash(JSON.stringify([titleES(r),summaryES(r),r.review.notes,r.scope,r.country,r.department,r.municipality,r.publicationDate]));}
function finalState(r){return r.wordDecision?.status==='excluded'?'excluded':'confirmed';}
function eligible(r){return r.review.status==='aprobada'&&finalState(r)!=='excluded';}
function finalProblems(rows){return [];}
function ordered(rows){const all=current?.reportOrder||[],rank=new Map(all.map((id,i)=>[id,i]));return [...rows].sort((a,b)=>Editorial.section(a,titleES(a)||a.originalTitle||a.title).key.localeCompare(Editorial.section(b,titleES(b)||b.originalTitle||b.title).key)||(rank.get(a.id)??1e9)-(rank.get(b.id)??1e9)||b.score-a.score);}
function uniqueApproved(){return ordered(current?.records.filter(eligible)||[]);}
// Adaptar columnas internacionales sin inventar titulares ausentes.
const createBeforeEditorial=Core.createRecord;
Core.createRecord=function(raw,...args){const v={...raw};for(const [key,value] of Object.entries(raw)){const mapped=Core.mapHeader(key);if(mapped&&!String(v[mapped]||'').trim())v[mapped]=value;}
 if(!v.title&&v.originalTitle)v.title=v.originalTitle;
 if(!v.title){v.title='';v.titleMissing='true';}
 return createBeforeEditorial(v,...args);
};
const visibleBeforeEditorial=visible;
visible=function(){if(deskMode)return ordered(current?.records.filter(r=>r.review.status==='aprobada')||[]);
 return ordered(visibleBeforeEditorial().filter(r=>!dismissedInView.has(r.id))); };
approvedRows=uniqueApproved;
const cardBeforeEditorial=card;
card=function(r){let h=cardBeforeEditorial(r),f={label:'Publicación: '+(r.publicationDate||'No informada')},c=contentCheck(r),m=referenceMatch(r),decision=comparisonDecision(r);
 let extra=`<div class="editor-check"><strong>${esc(f.label)}</strong><button data-editor="date" data-id="${esc(r.id)}">Verificar fecha y ámbito</button><button data-editor="content" data-id="${esc(r.id)}">Editar título y resumen</button>`;
 if(c.issues.length)extra+=`<p>${esc(c.issues.join(' '))} ${c.verified?'Revisado por el usuario.':''}</p>`;
 if(m.score>=.72)extra+=`<div class="reference-hit"><strong>${m.exact?'Título encontrado':'Posible repetición'} en ${esc(m.name)}</strong><p>${esc(m.snippet)}</p><button data-editor="exclude" data-id="${esc(r.id)}">Excluir del informe</button><button data-editor="keep" data-id="${esc(r.id)}">Conservar: es diferente o una actualización</button><small>${decision==='exclude'?'Coincidencia excluida':decision==='keep'?'Conservada por revisión humana':'Aviso de coincidencia: incluida salvo que decidas excluirla'}</small></div>`;
 if(deskMode&&m.score<.72)extra+=`<div class="reference-hit">${(current.references||[]).some(x=>x.status!=='ready'||!x.text.trim())?'Comparación pendiente: termina o corrige la lectura de las capturas.':(current.references||[]).length?'Comparación realizada: no se encontró una coincidencia fuerte en los textos disponibles.':'Sin capturas añadidas: puedes agregarlas para comparar.'}</div>`;
 if(deskMode)extra+=`<div class="order-tools"><button data-editor="up" data-id="${esc(r.id)}">↑ Subir</button><button data-editor="down" data-id="${esc(r.id)}">↓ Bajar</button><label>Posición en su sección <input type="number" min="1" value="${ordered(current.records.filter(x=>x.review.status==='aprobada'&&Editorial.section(x,titleES(x)).key===Editorial.section(r,titleES(r)).key)).findIndex(x=>x.id===r.id)+1}" data-order="${esc(r.id)}"></label><button class="primary" data-editor="confirm-word" data-id="${esc(r.id)}">${eligible(r)?'Incluida en Word ✓':'Volver a incluir en Word'}</button><button data-editor="remove-word" data-id="${esc(r.id)}">No incluir en Word</button><strong class="final-state">${eligible(r)?'Incluida automáticamente en Word':finalState(r)==='excluded'?'Excluida del Word':'Incluida en Word'}</strong></div>`;
 extra+='</div>';if(deskMode)h=h.replace(/<button\b[^>]*data-action="(?:aprobada|descartada|pendiente)"[^>]*>.*?<\/button>/g,'');return h.replace('<div class="card-actions">',extra+'<div class="card-actions">');};
const renderBeforeEditorial=render;
render=function(){renderBeforeEditorial();$('approvedDesk').classList.toggle('active',deskMode);$('newsDesk').classList.toggle('active',!deskMode);$('referencesPanel').hidden=!deskMode;
 document.querySelector('.filters').hidden=deskMode;document.querySelector('.actions').querySelector('div').hidden=deskMode;
 const rows=visible(),per=+$('perPage').value,shown=rows.slice((page-1)*per,page*per);let prev='';if(shown.length)$('list').innerHTML=shown.map(r=>{const sec=Editorial.section(r,titleES(r)||r.originalTitle||r.title),head=sec.key!==prev?`<h2 class="news-section">${esc(sec.label)}</h2>`:'';prev=sec.key;return head+card(r);}).join('');
 const approved=current?.records.filter(r=>r.review.status==='aprobada').length||0,ready=uniqueApproved().length;$('deskInfo').textContent=`Primer filtro: ${approved} aprobadas · Segundo filtro: ${ready} incluidas en Word · ${approved-ready} excluidas.`;
 const recentSelected=(current?.records||[]).filter(r=>r.recommended&&esReady(r)&&!historyExcluded(r)).length;const selectedCounter=$('stats').querySelector('[data-view="selected"] strong');if(selectedCounter)selectedCounter.textContent=recentSelected;if(current)$('searchSubtitle').textContent=`${current.records.length} noticias únicas · ${recentSelected} seleccionadas automáticamente`;
 const counter=$('stats').querySelector('[data-view="approved"]');if(counter){counter.querySelector('strong').textContent=ready;counter.querySelector('span').textContent='Incluidas en Word';counter.onclick=()=>switchDesk(true);}
 $('wordBtn').textContent=`Word · incluidas (${ready})`;$('printBtn').textContent='PDF · incluidas';$('exportHint').textContent='Word y PDF incluyen todas las aprobadas salvo las marcadas No incluir en Word, en el orden mostrado. Las coincidencias con capturas son avisos.';
 updateComparisonSummary();
 const items=current?.references||[];$('referenceList').innerHTML=items.map(x=>`<div class="reference-item">${x.image?`<img src="${x.image}" alt="Captura ${esc(x.name)}">`:''}<strong>${esc(x.name)}</strong><small>${x.status==='ready'?'Texto disponible':x.status==='failed'?'No se pudo leer: completa el texto manualmente':'Lectura pendiente'}</small><button data-reference-edit="${esc(x.id)}">Revisar texto leído</button><button data-reference-remove="${esc(x.id)}">Eliminar referencia</button></div>`).join('');
};
function switchDesk(value){deskMode=value;dismissedInView.clear();page=1;selected.clear();render();}
$('approvedDesk').onclick=()=>switchDesk(true);$('newsDesk').onclick=()=>switchDesk(false);
const openBeforeEditorial=openSearch;openSearch=async function(...a){if(ocrBusy)throw Error('Espera a que termine la lectura de imágenes.');deskMode=false;return openBeforeEditorial(...a);};
const importBeforeEditorial=importFiles;importFiles=async function(...a){if(ocrBusy)throw Error('Espera a que termine la lectura de imágenes.');deskMode=false;return importBeforeEditorial(...a);};
function moveRecord(r,position){const section=Editorial.section(r,titleES(r)).key,group=ordered(current.records.filter(x=>x.review.status==='aprobada'&&Editorial.section(x,titleES(x)).key===section));const i=group.findIndex(x=>x.id===r.id);if(i<0)return;group.splice(i,1);group.splice(Math.max(0,Math.min(group.length,position)),0,r);const others=(current.reportOrder||[]).filter(id=>!group.some(x=>x.id===id));current.reportOrder=[...others,...group.map(x=>x.id)];queueSave();render();}
$('list').addEventListener('change',e=>{if(e.target.dataset.order){const r=current.records.find(x=>x.id===e.target.dataset.order);if(r)moveRecord(r,Number(e.target.value)-1);}});
$('list').addEventListener('click',async e=>{const b=e.target.closest('[data-editor]');if(!b||!current)return;const r=current.records.find(x=>x.id===b.dataset.id);if(!r)return;const action=b.dataset.editor;
 if(action==='date'){editRecord(r);return;}
 if(action==='content'){editContent(r);return;}
 if(action==='confirm-word'){await confirmWord(r).catch(handleError);return;}
 if(action==='remove-word'){r.wordDecision={status:'excluded',hash:finalHash(r)};} 
 if(action==='keep')r.wordDecision={status:'confirmed'};
 if(action==='exclude')r.wordDecision={status:'excluded',hash:finalHash(r)};
 if(action==='exclude'||action==='keep')r.comparison={hash:Core.hash(referenceHash()+'|'+titleES(r)+'|'+summaryES(r)),value:action};
 if(action==='up'||action==='down'){const group=ordered(current.records.filter(x=>x.review.status==='aprobada'&&Editorial.section(x,titleES(x)).key===Editorial.section(r,titleES(r)).key));moveRecord(r,group.findIndex(x=>x.id===r.id)+(action==='up'?-1:1));return;}
 queueSave();render();});
function editContent(r){modal('Verificar la noticia y su resumen',`<p>Compara con la fuente antes de confirmar. Se detectan coincidencias de palabras, pero eso no garantiza coherencia factual.</p>${safeLink(r.externalLink)?`<a href="${esc(safeLink(r.externalLink))}" target="_blank" rel="noopener">Abrir fuente original</a>`:''}<label>Título<textarea id="editorTitle" rows="3">${esc(titleES(r))}</textarea></label><label>Resumen<textarea id="editorSummary" rows="6">${esc(r.review.finalSummary||summaryES(r))}</textarea></label><details open><summary>Texto disponible de la noticia</summary><pre>${esc(r.translation?.description||r.description||'Sin texto')}</pre></details><label><input type="checkbox" id="editorConfirm"> Comprobé que el título, resumen, lugar, cifras y fecha corresponden a esta noticia.</label><button id="saveContent" class="primary">Guardar revisión</button>`);
 $('saveContent').onclick=async()=>{const t=$('editorTitle').value.trim(),s=$('editorSummary').value.trim();if(!t||!s){message('Completa el título y el resumen.');return;}
 const verified=$('editorConfirm').checked;
 r.review.finalTitle=t;r.review.finalSummary=s;r.reviewSpanish=null;r.editorVerified=verified?checkHash(r):null;queueSave();await flush();$('modal').close();render();message('Cambios guardados. Se conserva tu decisión de incluir o excluir del Word.');};
}
const spanishGate=prepareSpanishExport;
prepareSpanishExport=async function(rows){
 if(finalExportActive){const problems=finalProblems(rows);if(problems.length){showFinalProblems(problems);return false;}}
 if(!await spanishGate(rows))return false;
 if(finalExportActive){const problems=finalProblems(rows);if(problems.length){showFinalProblems(problems);return false;}}
 return true;};
// Resumen limpio y orden agrupado también en Word y PDF.
exportSummary=function(r){return summaryES(r);};
const previousSetReview=setReview;setReview=async function(ids,value){await previousSetReview(ids,value);for(const id of ids){if(value==='pendiente')dismissedInView.delete(id);else dismissedInView.add(id);}render();};
// Cambiar de bandeja vuelve a mostrar sus noticias; no se eliminan del historial.
$('status').addEventListener('change',()=>{dismissedInView.clear();render();});
function bytes64(s){return Uint8Array.from(atob(s),c=>c.charCodeAt(0));}
async function getOCR(){if(ocrWorker)return ocrWorker;
 const workerURL=URL.createObjectURL(new Blob(["self.addEventListener('message',e=>{if(e.data.action==='initialize'&&Array.isArray(e.data.payload.langs))e.data.payload.langs=e.data.payload.langs.map(x=>typeof x==='string'?x:x.code);});\n",bytes64(OCR_ASSETS.core),'\n',bytes64(OCR_ASSETS.worker)],{type:'application/javascript'}));

 try{ocrWorker=await Tesseract.createWorker([{code:'spa',data:bytes64(OCR_ASSETS.lang)}],1,{workerPath:workerURL,workerBlobURL:false,cacheMethod:'none',gzip:true,logger:m=>{if(m.status==='recognizing text')$('ocrStatus').textContent=`Leyendo imagen · ${Math.round((m.progress||0)*100)} %`;}});return ocrWorker;}catch(e){URL.revokeObjectURL(workerURL);throw e;}
}
async function imageData(file){if(file.size>20*1024*1024)throw Error('La imagen supera 20 MB. Divide la captura.');return new Promise((resolve,reject)=>{const f=new FileReader();f.onload=()=>resolve(f.result);f.onerror=()=>reject(Error('No se pudo leer la imagen.'));f.readAsDataURL(file);});}
async function addImages(files){if(!current){message('Abre una búsqueda antes de comparar.');return;}if(busy||translating||exporting||ocrBusy){message('Espera a que termine la tarea actual.');return;}
 const target=current;ocrBusy=true;busy=true;clearTimeout(autoTimer);
 try{for(const file of files){if(!/^image\/(png|jpeg|webp|bmp)$/.test(file.type)){message('Usa una captura PNG, JPG, WebP o BMP.');continue;}
 const item={id:Core.uid(),name:file.name||'Imagen pegada',date:$('referenceDate').value,text:'',status:'processing',image:await imageData(file)};
 (target.references||=[]).push(item);queueSave();await flush();render();
 try{const worker=await getOCR(),result=await worker.recognize(item.image);item.text=result.data.text.trim();item.confidence=result.data.confidence;item.status=item.text?'ready':'failed';}catch(e){console.error('OCR:',e);item.status='failed';item.error='No se pudo leer. Revisa o pega el texto manualmente.';}
 queueSave();await flush();render();}
 }finally{ocrBusy=false;busy=false;$('ocrStatus').textContent='Lectura finalizada. Revisa el texto reconocido: el OCR puede confundir letras, cifras o columnas.';render();}
}
$('imageInput').onchange=e=>{const files=[...e.target.files];e.target.value='';addImages(files).catch(handleError);};
$('addImages').onclick=()=>$('imageInput').click();
$('pasteTarget').addEventListener('paste',e=>{const images=[...e.clipboardData.items].filter(x=>x.kind==='file'&&x.type.startsWith('image/')).map(x=>x.getAsFile());if(images.length){e.preventDefault();addImages(images).catch(handleError);}});
$('addReferenceText').onclick=()=>{if(!current||busy||exporting){message('Abre una búsqueda y espera a que termine la tarea actual.');return;}modal('Texto de noticias de días anteriores','<label>Nombre de la referencia<input id="referenceName" value="Informe anterior"></label><label>Pega los títulos o el texto del informe<textarea id="referenceText" rows="12"></textarea></label><button id="saveReferenceText">Guardar y comparar</button>');$('saveReferenceText').onclick=async()=>{const text=$('referenceText').value.trim();if(!text){message('Pega el texto que quieres comparar.');return;}(current.references||=[]).push({id:Core.uid(),name:$('referenceName').value||'Informe anterior',text,status:'ready',date:$('referenceDate').value});queueSave();await flush();$('modal').close();render();};};
$('referenceList').onclick=async e=>{const edit=e.target.closest('[data-reference-edit]'),remove=e.target.closest('[data-reference-remove]');if(ocrBusy||exporting)return;
 if(remove){current.references=current.references.filter(x=>x.id!==remove.dataset.referenceRemove);queueSave();await flush();render();}
 if(edit){const x=current.references.find(x=>x.id===edit.dataset.referenceEdit);modal('Revisar texto reconocido',`<p>Corrige títulos cortados, columnas mezcladas y errores de lectura. Las comparaciones se actualizarán.</p><textarea id="ocrTextEdit" rows="16">${esc(x.text)}</textarea><button id="saveOCRText">Guardar texto y comparar</button>`);$('saveOCRText').onclick=async()=>{x.text=$('ocrTextEdit').value.trim();x.status=x.text?'ready':'failed';queueSave();await flush();$('modal').close();render();};}};
$('referenceDate').value=new Date(Date.now()-86400000).toISOString().slice(0,10);
// El vaciado incluye las imágenes y el orden de ESTA búsqueda.
const clearBeforeEditorial=clearCurrentSearch;
clearCurrentSearch=async function(){if(ocrBusy){message('Espera a que termine la lectura de imágenes.');return;}return clearBeforeEditorial();};

spanishDescription=function(r){if(!esReady(r))return 'Preparando la noticia en español…';return summaryES(r)||'Resumen pendiente de revisión. Abre “Revisar título y resumen” para comprobar el contenido.';};

const editBeforeEditorial=editRecord;
editRecord=function(r){editBeforeEditorial(r);const input=$('editPub');input.type='datetime-local';input.step='1';const t=Date.parse(r.publicationDate||'');input.value=Number.isFinite(t)&&/\d{1,2}:\d{2}/.test(r.publicationDate)?new Date(t-5*3600000).toISOString().slice(0,19):'';
 const label=document.createElement('label');label.textContent='Zona horaria de la publicación ';const zone=document.createElement('select');zone.innerHTML='<option value="-05:00">Colombia (UTC−5)</option><option value="Z">UTC / GMT</option>';label.append(zone);input.parentNode.after(label);const note=input.parentNode.querySelector('small');if(note)note.textContent='Confirma fecha y hora en la fuente. Para otras zonas, convierte la hora a UTC.';
 const save=$('saveRecord').onclick;$('saveRecord').onclick=async()=>{const value=input.value;input.type='text';input.value=value?value+zone.value:'';await save();};};

const classifyBeforeEditorial=reclassifyRecord;
reclassifyRecord=function(r,compiled){if(!String(r.originalTitle||r.title||'').trim()||/^\(?sin t[ií]tulo\)?$/i.test(String(r.originalTitle||r.title||''))){const candidates=Object.entries(r).filter(([k,v])=>['title','originalTitle'].includes(Core.mapHeader(k))&&typeof v==='string'&&v.trim()&&!/^\(?sin t[ií]tulo\)?$/i.test(v));if(candidates.length){r.title=candidates[0][1];r.originalTitle=r.title;r.contentHash=Core.contentHash(r);}}return classifyBeforeEditorial(r,compiled);};
// Segundo filtro explícito. Las aprobaciones anteriores nunca se convierten solas en confirmaciones.
let finalExportActive=false;
preferredTitle=function(r){return titleES(r)||'Preparando título en español…';};
function showFinalProblems(problems){modal('Revisar selección final antes de exportar',`<p>No se generó ningún archivo parcial. Se conserva tu selección.</p><ul>${problems.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><p>Resuelve estas decisiones en el segundo filtro y vuelve a exportar.</p>`);}
async function confirmWord(r){
 if(busy||exporting||finalExportActive)return;
 r.wordDecision={status:'confirmed',at:new Date().toISOString()};
 if(comparisonDecision(r)==='exclude')r.comparison={hash:Core.hash(referenceHash()+'|'+titleES(r)+'|'+summaryES(r)),value:'keep'};
 queueSave();await flush();render();message('Noticia incluida en Word.');
}
function updateComparisonSummary(){const el=$('comparisonSummary');if(!el)return;const candidates=current?.records.filter(r=>r.review.status==='aprobada')||[],confirmed=candidates.filter(eligible),refs=current?.references||[],ready=refs.filter(x=>x.status==='ready'&&x.text.trim()).length;
 const hits=confirmed.filter(r=>referenceMatch(r).score>=.72),pending=hits.filter(r=>!comparisonDecision(r));
 el.textContent=refs.length?`${ready}/${refs.length} referencias leídas · ${confirmed.length} confirmadas comparadas · ${hits.length} posibles repeticiones · ${pending.length} decisiones pendientes · ${candidates.filter(r=>comparisonDecision(r)==='exclude').length} excluidas por coincidencia. ${ready<refs.length?'Completa o retira las referencias que no se pudieron leer.':''}`:`Sin capturas añadidas. ${confirmed.length} incluidas en Word. Agrega imágenes o pega una captura para comparar con el segundo filtro.`;
}
$('compareFinal').onclick=()=>{render();message('Comparación actualizada con el título y resumen editados. Revisa los resultados de cada noticia del segundo filtro.');};
// Edición directa sin reconstruir la tarjeta ni perder el cursor.
const inputBeforeFinal=$('list').oninput;
$('list').oninput=e=>{if(finalExportActive)return;if(inputBeforeFinal)inputBeforeFinal(e);if(!e.target.dataset.field||!current)return;const r=current.records.find(x=>x.id===e.target.dataset.id);if(!r)return;r.editorVerified=null;
 const card=e.target.closest('.card');if(card){card.querySelector('h2').textContent=titleES(r);const state=card.querySelector('.final-state');if(state)state.textContent='Edición guardada; se conserva la selección para Word.';const confirmButton=card.querySelector('[data-editor="confirm-word"]');if(confirmButton)confirmButton.textContent=eligible(r)?'Incluida en Word ✓':'Volver a incluir en Word';}
 $('wordBtn').textContent=`Word · incluidas (${approvedRows().length})`;updateComparisonSummary();};
// Al editar una tarjeta también se actualizan sus resultados de comparación al terminar la edición.
$('list').addEventListener('focusout',e=>{if(e.target.dataset.field)setTimeout(()=>{if(!document.activeElement?.matches('textarea,input'))render();},150);});
const wordBeforeFinal=exportWord,pdfBeforeFinal=printView;
async function withFinalExport(fn){if(finalExportActive)return;finalExportActive=true;try{await fn();}finally{finalExportActive=false;render();}}
exportWord=()=>withFinalExport(wordBeforeFinal);printView=()=>withFinalExport(pdfBeforeFinal);
$('wordBtn').onclick=()=>exportWord().catch(handleError);$('printBtn').onclick=()=>printView().catch(handleError);
for(const name of ['click','input','change'])document.addEventListener(name,e=>{if(finalExportActive&&e.target.closest('#list,#searchPicker,#modal,#referencesPanel,aside')){e.preventDefault();e.stopImmediatePropagation();}},true);
