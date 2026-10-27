// La clave vive únicamente en las variables de entorno de Netlify.
exports.handler = async event => {
  const reply = (statusCode, body) => ({statusCode, headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'},body:JSON.stringify(body)});
  if(event.httpMethod !== 'POST') return reply(405,{error:'Método no permitido.'});
  const origin=event.headers?.origin;
  const host=event.headers?.host;
  if(origin) { try { if(new URL(origin).host!==host)return reply(403,{error:'Origen no permitido.'}); } catch { return reply(403,{error:'Origen no válido.'}); } }
  let texts;
  try { texts=JSON.parse(event.body||'{}').texts; } catch { return reply(400,{error:'Solicitud no válida.'}); }
  if(!Array.isArray(texts)||texts.length!==3||texts.some(t=>typeof t!=='string')||texts.reduce((n,t)=>n+t.length,0)>15000)
    return reply(400,{error:'El título, resumen y observaciones deben sumar como máximo 15.000 caracteres.'});
  const key=process.env.AZURE_TRANSLATOR_KEY, region=process.env.AZURE_TRANSLATOR_REGION;
  if(!key)return reply(503,{error:'Falta activar la traducción: configura AZURE_TRANSLATOR_KEY y AZURE_TRANSLATOR_REGION en Netlify y vuelve a desplegar.'});
  const indices=texts.map((t,i)=>t.trim()?i:-1).filter(i=>i>=0);
  if(!indices.length)return reply(200,{texts});
  try {
    const headers={'Content-Type':'application/json','Ocp-Apim-Subscription-Key':key};
    if(region)headers['Ocp-Apim-Subscription-Region']=region;
    const response=await fetch('https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=es&textType=plain',{
      method:'POST',headers,body:JSON.stringify(indices.map(i=>({Text:texts[i]}))),signal:AbortSignal.timeout(20000)
    });
    if(!response.ok)return reply(502,{error:response.status===429?'El traductor alcanzó su límite temporal. Reintenta más tarde.':'El servicio de traducción no está disponible. Revisa la clave, región y cuota en Azure.'});
    const data=await response.json(),out=texts.map(()=> '');
    if(!Array.isArray(data)||data.length!==indices.length)throw Error('Invalid response');
    data.forEach((item,n)=>{const t=item.translations?.find(x=>x.to==='es')?.text;if(typeof t!=='string'||!t.trim())throw Error('Missing translation');out[indices[n]]=t;});
    return reply(200,{texts:out});
  }catch{return reply(502,{error:'No se pudo completar la traducción. Conservamos tu revisión; vuelve a intentar.'});}
};
