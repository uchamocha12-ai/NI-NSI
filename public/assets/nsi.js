'use strict';
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
 if(vals(['GPCARCEL','GPCARCELA','PPL','PERSONASPRIVADASDELALIBERTAD','POBLACIONPRIVADADELALIBERTAD','CARCELARIOS']).some(yes)||/PRIVAD[AO]S? DE (LA )?LIBERTAD|CARCELARI|\bPPL\b/.test(groups))add('PPL · grupo poblacional');
 if(vals(['GPICBF','GPPOBICBF','GPINFANT','GPINFANTIL','POBLACIONINFANTIL','POBLACIONINFANTILACARGODELICBF']).some(yes)||/INFANTIL|ICBF/.test(groups))add('Población infantil · grupo poblacional/ICBF');
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
   // No omitir eventos válidos por no pertenecer al catálogo de alertas.
   // Se conserva el evento reportado en cod_eve y se toma su nombre de nom_eve cuando exista.
   const row={code:event,cells,source,sourceSheet:sn,sourceRow:r+1};row.name=SPECIAL_EVENTS[event]||text(field(row,['NOMEVE','NOMBREEVENTO','EVENTO']))||known[event]||`Evento ${event}`;row.alert=alertFor(row);rows.push(row);
  }
 }
 return {rows,notes};
}
function makeGroups(rows){const groups=new Map();for(const r of rows){if(!groups.has(r.code))groups.set(r.code,{code:r.code,name:r.name,headers:[],rows:[]});const g=groups.get(r.code);for(const h of r.cells.keys())if(!g.headers.includes(h))g.headers.push(h);g.rows.push(r);}return [...groups.values()].sort((a,b)=>Number(a.code)-Number(b.code));}
const isPriority=r=>!!r.alert.populations?.length;
const isVerify=r=>r.alert.kind==='verify'||r.alert.reason.includes('Verificar');
const fills={population:'FFDCF3E4',both:'FFEEE1FA',critical:'FFFDE2E2',indigenous:'FFF1E6FF',foreign:'FFFFE6CC',verify:'FFFFF5CC'};
const shortNames={'200':'Colera','205':'Chagas','275':'Encef_equina_este_humanos','307':'Vigilancia_rabia_humana','310':'Fiebre_amarilla','348':'IRAG_inusitada','570':'Mortalidad_colera','670':'Rabia_humana','710':'Rubeola','730':'Sarampion','800':'Tos_ferina'};
function sheetName(g){return (g.code+'_'+(shortNames[g.code]||g.name)).replace(/[\\/*?:\[\]]/g,' ').slice(0,31);}
function addEventSheet(wb,g){
 const ws=wb.addWorksheet(sheetName(g),{views:[{state:'frozen',ySplit:1}]});
 const generated=['ESTADO_NSI','MOTIVO_NSI','ARCHIVO_ORIGEN_NSI','HOJA_ORIGEN_NSI','FILA_ORIGEN_NSI'].map(n=>{let b=n;while(g.headers.includes(b))b+='_NUEVO';return b;});
 const hs=[...generated.slice(0,2),...g.headers,...generated.slice(2)];ws.addRow(hs);
 for(const r of groupedColorRows(g.rows,r=>r.code,r=>r.alert)){
  const er=ws.addRow([r.alert.label,r.alert.reason,...g.headers.map(h=>r.cells.get(h)?.v??null),r.source,r.sourceSheet,r.sourceRow]);
  const bg=fills[r.alert.kind];
  er.eachCell({includeEmpty:true},(c,i)=>{
   if(bg)c.fill={type:'pattern',pattern:'solid',fgColor:{argb:bg}};
   if(i===1&&bg)c.font={bold:true,color:{argb:'FF35264A'}};
   if(i>2&&i<=g.headers.length+2){const source=r.cells.get(g.headers[i-3]);if(source?.date)c.numFmt='dd/mm/yyyy';else if(typeof source?.v==='number'&&source.z)c.numFmt=source.z;}
  });
 }
 ws.columns.forEach((c,i)=>{
  if(i<2)c.width=[20,65][i];
  else if(i<g.headers.length+2){let width=Math.max(12,hs[i].length+2);for(const r of g.rows)width=Math.max(width,showCell(r.cells.get(hs[i])).length+2);c.width=Math.min(45,width);}
  else c.width=[40,30,20][i-g.headers.length-2];
 });
 styleHeader(ws);ws.autoFilter={from:{row:1,column:1},to:{row:ws.rowCount,column:hs.length}};
 return ws;
}
function styleHeader(ws){ws.getRow(1).height=32;ws.getRow(1).eachCell(c=>{c.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF163A5F'}};c.font={color:{argb:'FFFFFFFF'},bold:true};c.alignment={vertical:'middle',wrapText:true};});}
function makeWorkbook(groups,summary){const wb=new ExcelJS.Workbook();wb.creator='Organizador de eventos NSI';wb.created=new Date();groups.forEach(g=>addEventSheet(wb,g));if(summary){const ws=wb.addWorksheet('Resumen',{views:[{state:'frozen',ySplit:1}]});ws.addRow(['Código','Evento','Registros','Destacados','Por verificar']);groups.forEach(g=>ws.addRow([g.code,g.name,g.rows.length,g.rows.filter(isPriority).length,g.rows.filter(isVerify).length]));ws.addRow(['TOTAL','',groups.reduce((n,g)=>n+g.rows.length,0),groups.reduce((n,g)=>n+g.rows.filter(isPriority).length,0),groups.reduce((n,g)=>n+g.rows.filter(isVerify).length,0)]);ws.addRow([]);ws.addRow(['Criterios',"Destacados: únicamente poblaciones de interés especial. Súper inmediata procesa TODOS los eventos con código válido de los Excel cargados, estén o no en el catálogo ERI. Sarampión: procedencia exterior o notificación en Amazonas; tos ferina: población indígena; cólera, ébola y difteria: todos los registros. Los demás eventos conservan sus criterios previos."]);ws.addRow(['Siempre','230 difteria; 607 ébola; 275 encefalitis equina del este; 200 cólera; 570 mortalidad por cólera; 670 rabia humana; 307 vigilancia integrada de rabia humana.']);ws.addRow(['Alcance','Todos los registros cargados se conservan. Todos los códigos de evento válidos presentes en los Excel se conservan, pertenezcan o no al catálogo ERI. Sin filtros por fechas, ajustes ni eliminación automática de duplicados.']);ws.addRow(['Lectura','Las marcas orientan la revisión; no indican confirmación diagnóstica. Por verificar puede incluir destacados con datos contradictorios.']);ws.columns=[{width:20},{width:100},{width:18},{width:18},{width:18}];ws.eachRow(r=>r.alignment={wrapText:true,vertical:'top'});[groups.length+4,groups.length+5,groups.length+6,groups.length+7].forEach(i=>ws.getRow(i).height=42);styleHeader(ws);}return wb;}
function safeFile(s){return norm(s).replace(/[^A-Z0-9]+/g,'_').replace(/^_|_$/g,'').slice(0,90)||'EVENTO';}
async function createZip(groups,date){const zip=new JSZip(),folder=zip.folder('Eventos_NSI_'+date);folder.file('00_Todos_los_eventos.xlsx',await makeWorkbook(groups,true).xlsx.writeBuffer());for(const g of groups)folder.file(g.code+'_'+safeFile(g.name)+'.xlsx',await makeWorkbook([g],false).xlsx.writeBuffer());return zip.generateAsync({type:'uint8array',compression:'DEFLATE'});}
let state=null,active='all',page=0,busy=false;
const report=(s,error=false)=>{$('status').textContent=s;$('status').className=error?'status error':'status';};
function setBusy(b){busy=b;$('files').disabled=b;$('process').disabled=b||!$('files').files.length;$('reset').disabled=b;$('download').disabled=b||!state;$('consolidated').disabled=b||!state;}
function clearResult(){state=null;active='all';page=0;$('results').hidden=true;$('download').disabled=true;$('consolidated').disabled=true;}
async function loadFiles(files){
 const entries=[],notes=[];let bytesTotal=0;
 for(const f of files){
  if(/\.zip$/i.test(f.name)){
   const z=await JSZip.loadAsync(await f.arrayBuffer());let zs=Object.values(z.files).filter(e=>!e.dir&&/\.xlsx?$/i.test(e.name)&&!/(^|\/)(__MACOSX|~\$)/.test(e.name));
   // When reloading this tool's own ZIP, use only its consolidated workbook.
   const ours=zs.find(e=>/^Eventos_NSI_[^/]+\/00_Todos_los_eventos\.xlsx$/.test(e.name));
   if(ours&&zs.every(e=>e.name.startsWith(ours.name.split('/')[0]+'/'))){notes.push(`${f.name}: se utilizó el consolidado y se omitieron sus copias por evento.`);zs=[ours];}
   if(!zs.length)throw Error(`${f.name}: no contiene archivos .xls o .xlsx.`);
   for(const e of zs){bytesTotal+=e._data?.uncompressedSize||0;if(bytesTotal>150*1024*1024)throw Error('Los Excel superan 150 MB descomprimidos. Divide la carga.');entries.push({name:f.name+' / '+e.name,load:()=>e.async('uint8array')});}
  }else if(/\.xlsx?$/i.test(f.name)){bytesTotal+=f.size;entries.push({name:f.name,load:()=>f.arrayBuffer()});}else throw Error(`Formato no compatible: ${f.name}. Usa ZIP, XLS o XLSX.`);
 }
 if(bytesTotal>150*1024*1024||entries.length>2000)throw Error('Carga demasiado grande. Usa hasta 2.000 archivos y 150 MB descomprimidos.');
 const rows=[];
 for(let i=0;i<entries.length;i++){
  report(`Leyendo Excel ${i+1} de ${entries.length}…`);await new Promise(r=>setTimeout(r,0));
  const e=entries[i];let p;try{p=parseBook(await readBook(await e.load()),e.name);}catch(err){notes.push(e.name+': no se pudo importar ('+err.message+'). Archivo omitido; comprueba su contenido.');continue;}
  if(!p.rows.length&&!/00_Todos_los_eventos\.xlsx$/i.test(e.name)){notes.push(`${e.name}: sin registros de eventos importables; archivo omitido (consulta encabezados y códigos).`);continue;}
  rows.push(...p.rows);notes.push(...p.notes);
  if(rows.length>100000)throw Error('Se superaron 100.000 registros. Divide la carga.');
 }
 if(!rows.length)throw Error('No se encontraron registros de eventos.');
 return {rows,groups:makeGroups(rows),notes,files:entries.length};
}
function render(){
 $('results').hidden=false;const r=state.rows;
 $('stats').innerHTML=[['Registros',r.length],['Eventos',state.groups.length],...(r.some(isPriority)?[['Destacados · población especial',r.filter(isPriority).length]]:[]),['Por verificar',r.filter(isVerify).length]].map(([t,n])=>`<div class="stat"><strong>${n}</strong><span>${t}</span></div>`).join('');
 $('notes').textContent=state.notes.join('\n');$('notesBox').hidden=!state.notes.length;
 $('tabs').innerHTML=`<button data-view="all" class="tab">Todos (${r.length})</button>`+state.groups.map(g=>`<button data-view="${esc(g.code)}" class="tab">${esc(g.code+' · '+g.name)} (${g.rows.length})${g.rows.some(isPriority)?' ●':''}</button>`).join('');
 $('tabs').querySelectorAll('button').forEach(b=>b.onclick=()=>{active=b.dataset.view;page=0;renderTable();});renderTable();
}
function renderTable(){
 if(!state)return;
 $('tabs').querySelectorAll('button').forEach(b=>{b.classList.toggle('selected',b.dataset.view===active);b.setAttribute('aria-pressed',String(b.dataset.view===active));});
 const search=norm($('search').value),mode=$('filter').value;
 const base=active==='all'?state.rows:state.groups.find(g=>g.code===active).rows;
 const list=groupedColorRows(base,r=>r.code,r=>r.alert).filter(r=>(mode==='all'||mode==='priority'&&isPriority(r)||mode==='verify'&&isVerify(r))&&(!search||[r.code,r.name,r.alert.reason,...r.cells.values()].some(c=>norm(c&&typeof c==='object'&&'v'in c?showCell(c):c).includes(search))));
 const pages=Math.max(1,Math.ceil(list.length/50));page=Math.min(page,pages-1);
 const rows=list.slice(page*50,page*50+50),headers=[...new Set(base.flatMap(r=>[...r.cells.keys()]))];
 $('tableTitle').textContent=active==='all'?'Todos los eventos':state.groups.find(g=>g.code===active).name;
 $('table').innerHTML='<thead><tr><th>Estado</th><th>Motivo</th>'+headers.map(h=>'<th>'+esc(h)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(r=>`<tr class="${r.alert.kind}"><td><b>${esc(r.alert.label||'—')}</b></td><td>${esc(r.alert.reason)}</td>${headers.map(h=>'<td>'+esc(showCell(r.cells.get(h)))+'</td>').join('')}</tr>`).join('')+'</tbody>';
 $('pageInfo').textContent=`${list.length} registros · Página ${page+1} de ${pages} · 50 por página`;$('prev').disabled=page===0;$('next').disabled=page===pages-1;
}
function save(bytes,name,type){const url=URL.createObjectURL(new Blob([bytes],{type})),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
function today(){return new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Bogota',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
$('files').onchange=()=>{clearResult();setBusy(false);report(`${$('files').files.length} archivo(s) seleccionados. Pulsa Organizar.`);};
$('process').onclick=async()=>{clearResult();setBusy(true);try{state=await loadFiles([...$('files').files]);render();report(`Listo: ${state.rows.length} registros en ${state.groups.length} eventos. La descarga incluye todos los registros, independientemente de la búsqueda en pantalla.`);}catch(e){clearResult();report('No se generó un resultado parcial. '+e.message,true);}finally{setBusy(false);}};
$('reset').onclick=()=>{clearResult();$('files').value='';$('search').value='';$('filter').value='all';setBusy(false);report('Carga un ZIP o selecciona varios Excel para comenzar.');};
$('search').oninput=()=>{page=0;renderTable();};$('filter').onchange=()=>{page=0;renderTable();};$('prev').onclick=()=>{page--;renderTable();};$('next').onclick=()=>{page++;renderTable();};
$('download').onclick=async()=>{if(!state||busy)return;setBusy(true);report('Preparando la carpeta con los Excel y sus colores…');await new Promise(r=>setTimeout(r,0));try{const d=today();save(await createZip(state.groups,d),'Eventos_NSI_'+d+'.zip','application/zip');report('Descarga preparada. Descomprime el ZIP para abrir la carpeta.');}catch(e){report('No se pudo generar la descarga: '+e.message,true);}finally{setBusy(false);}};
$('consolidated').onclick=async()=>{if(!state||busy)return;setBusy(true);report('Preparando el consolidado…');try{save(await makeWorkbook(state.groups,true).xlsx.writeBuffer(),'Todos_los_eventos_'+today()+'.xlsx','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');report('Consolidado preparado.');}catch(e){report('No se pudo generar el Excel: '+e.message,true);}finally{setBusy(false);}};
setBusy(false);

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

$('sendCross').onclick=async()=>{if(!state||busy)return;setBusy(true);try{const bytes=await makeWorkbook(state.groups,true).xlsx.writeBuffer();await parent.receiveFromModule(bytes,'Super_inmediata_NSI.xlsx','B',today());}catch(e){report(e.message,true)}finally{setBusy(false)}};

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

const fullEventSheet=addEventSheet;addEventSheet=function(w,g){return compactEventSheet(fullEventSheet(w,g));};
// Sort presentation copies only; original selection and deduplication order stay intact.
function groupedColorRows(rows,eventOf,alertOf){
 const ranks={both:0,population:1,indigenous:1,foreign:1,critical:2,verify:3,normal:4};
 return rows.map((row,index)=>{const a=alertOf(row);return {row,index,event:String(eventOf(row)||''),rank:ranks[a.kind]??4,pop:(a.populations||[]).map(p=>p.split(' · ')[0]).sort().join('|')};}).sort((a,b)=>a.event.localeCompare(b.event,'es',{numeric:true})||a.rank-b.rank||a.pop.localeCompare(b.pop,'es')||a.index-b.index).map(x=>x.row);
}
