const frames=new Map();
const titles={notificaciones:'Notificación inmediata y superinmediata',sivilab:'SIVILAB',medios:'Monitoreo de medios',bes:'BES · Boletín Epidemiológico Semanal'};
function home(){document.getElementById('homeHeader').hidden=false;document.getElementById('home').hidden=false;document.getElementById('workspace').hidden=true;document.getElementById('footer').hidden=false;document.title='INS · Herramientas de vigilancia';window.scrollTo(0,0);}
const externalLinks={
 sivilab:{label:'Abrir SIVILAB ↗',url:'https://sivilab.ins.gov.co/SIVILAB/Account/Login?ReturnUrl=%2FSIVILAB%2FMuestras%2FListaReportesMS%3FmenuId%3D190'},
 medios:{label:'Abrir EIOS ↗',url:'https://eios.who.int/portal/monitoring/boards'}
};
function openTool(key){if(!titles[key])return;
 document.getElementById('homeHeader').hidden=true;
 const access=document.getElementById('externalAccess'),link=externalLinks[key];
 access.hidden=!link;if(link){access.href=link.url;access.textContent=link.label;}else{access.removeAttribute('href');access.textContent='';}
let frame=frames.get(key);if(!frame){frame=document.createElement('iframe');frame.className='frame';frame.title=titles[key];frame.src='herramientas/'+key+'/index.html';frame.id='tool-'+key;frames.set(key,frame);document.getElementById('frames').append(frame);}for(const [k,f] of frames)f.hidden=k!==key;document.getElementById('home').hidden=true;document.getElementById('footer').hidden=true;document.getElementById('workspace').hidden=false;document.getElementById('activeTitle').textContent=titles[key];document.title=titles[key]+' · INS';window.scrollTo(0,0);document.getElementById('back').focus();}
document.querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>openTool(b.dataset.tool));document.getElementById('back').onclick=home;document.querySelector('.brand').onclick=e=>{e.preventDefault();home();};
