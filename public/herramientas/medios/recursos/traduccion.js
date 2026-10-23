/* Traducción del texto editorial aprobado. Solo memoria; originales intactos. */
(() => {
  let running=null,timer,paused=false,lastError='';
  const payload=r=>[titleES(r),summaryES(r),exportNotes(r)];
  const signature=r=>JSON.stringify(payload(r));
  const ready=r=>r.spanishExportSignature===signature(r);
  const candidates=()=>current?.records.filter(r=>r.review.status==='aprobada')||[];
  const panel=document.createElement('div');
  panel.className='notice';panel.setAttribute('role','status');panel.setAttribute('aria-live','polite');
  const label=document.createElement('span'),retry=document.createElement('button');
  retry.type='button';retry.textContent='Reintentar traducción';retry.style.marginLeft='12px';
  panel.append(label,retry);document.querySelector('.notice').after(panel);
  function status(){const rows=candidates(),done=rows.filter(ready).length;
    label.textContent=lastError||(!rows.length?'Traducción al español lista para las noticias que apruebes.':`${done} de ${rows.length} noticias aprobadas en español.${running?' Traduciendo…':''}`);
    retry.hidden=!lastError;retry.disabled=!!running;
  }
  function redraw(){if(!document.activeElement?.matches('input,textarea'))render();else status();}
  async function translateOne(r,owner){
    const before=signature(r),texts=payload(r);
    const response=await fetch('/.netlify/functions/translate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({texts}),signal:AbortSignal.timeout(25000)});
    let data;try{data=await response.json();}catch{throw Error('La traducción requiere el sitio desplegado en Netlify con el servicio configurado.');}
    if(!response.ok)throw Error(data.error||'No se pudo traducir. Reintenta.');
    if(!Array.isArray(data.texts)||data.texts.length!==3||data.texts.some((t,i)=>typeof t!=='string'||(texts[i].trim()&&!t.trim())))throw Error('El traductor devolvió una respuesta incompleta. Reintenta.');
    // No sobrescribir ediciones hechas mientras llega la respuesta ni otra sesión.
    if(current!==owner||signature(r)!==before)return;
    r.beforeSpanish ??= {title:texts[0],summary:texts[1],notes:texts[2]};
    r.review.finalTitle=data.texts[0];r.review.finalSummary=data.texts[1];r.review.notes=data.texts[2];
    r.spanishExportSignature=signature(r);r.editorVerified=null;
    queueSave();
  }
  async function translate(rows){
    if(running)await running;
    const pending=rows.filter(r=>!ready(r));if(!pending.length)return;
    const owner=current;
    running=(async()=>{for(const r of pending){if(current!==owner)break;if(!ready(r))await translateOne(r,owner);status();}})();
    status();
    try{await running;lastError='';}
    catch(e){paused=true;lastError=e.name==='TimeoutError'?'La conexión tardó demasiado. Reintenta la traducción.':e.message;throw e;}
    finally{running=null;status();redraw();}
  }
  function schedule(){clearTimeout(timer);if(paused||running||finalExportActive)return;
    if(candidates().some(r=>!ready(r)))timer=setTimeout(()=>translate(candidates()).catch(()=>{}),600);
  }
  const oldRender=render;
  render=function(){oldRender();status();schedule();};
  retry.onclick=()=>{paused=false;lastError='';translate(candidates()).catch(()=>{});};
  const oldGate=prepareSpanishExport;
  prepareSpanishExport=async function(rows){
    const owner=current;
    const selectedBefore=finalExportActive?JSON.stringify(approvedRows().map(r=>r.id).sort()):null;
    try{await translate(rows);}catch{message(lastError+' No se exportó un archivo con textos pendientes de español.');return false;}
    if(current!==owner||rows.some(r=>!ready(r))||(selectedBefore!==null&&selectedBefore!==JSON.stringify(approvedRows().map(r=>r.id).sort()))){message('Cambió el texto o la búsqueda durante la traducción. Revisa y vuelve a exportar.');return false;}
    return oldGate(rows);
  };
  $('list').addEventListener('input',schedule);
  status();schedule();
})();
