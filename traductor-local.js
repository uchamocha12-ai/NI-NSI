/* Modelos del navegador; no guarda noticias ni claves. */
const LocalSpanish=(()=>{
  let detector=null;
  const translators=new Map(),needed=new Set(),cache=new Map();
  const supported=()=>globalThis.isSecureContext&&'Translator' in globalThis&&'LanguageDetector' in globalThis;
  const needs=()=>[...needed];
  // Se llama directamente desde un clic: create() puede necesitar activación.
  async function activate(report=()=>{}){
    if(!supported())throw Error('La traducción local no está disponible en este navegador. Abre el portal HTTPS en Chrome de escritorio compatible, o configura Microsoft Translator en Netlify.');
    const monitor=m=>m.addEventListener('downloadprogress',e=>report('Descargando modelo: '+Math.round(e.loaded*100)+' %'));
    const jobs=[];
    if(!detector)jobs.push(LanguageDetector.create({monitor}).then(x=>{detector=x;}));
    // Preparar inglés al activar; los demás idiomas se descubren en las noticias.
    const languages=needed.size?[...needed]:['en'];
    for(const lang of languages)if(lang!=='es'&&!translators.has(lang)){
      jobs.push(Translator.create({sourceLanguage:lang,targetLanguage:'es',monitor}).then(x=>{translators.set(lang,x);needed.delete(lang);}));
    }
    const results=await Promise.allSettled(jobs);
    const failed=results.find(x=>x.status==='rejected');
    if(failed)throw Error('No se pudo preparar un modelo local. Reintenta con Internet; comprueba que el navegador permita la traducción.');
  }
  async function translate(texts){
    if(!supported())throw Error('Este navegador no ofrece traducción local. Usa Chrome de escritorio compatible por HTTPS o configura Microsoft Translator en Netlify.');
    if(!detector)throw Error('Pulsa Activar traducción local para descargar y preparar los idiomas.');
    const langs=[];
    for(const text of texts){
      if(!text.trim()){langs.push(null);continue;}
      const match=(await detector.detect(text))[0];
      if(!match||match.confidence<0.65||match.detectedLanguage==='und')throw Error('El idioma de un texto es incierto. Revisa el original o utiliza el traductor de Netlify.');
      const lang=match.detectedLanguage.split('-')[0];langs.push(lang);
      if(lang!=='es'&&!translators.has(lang))needed.add(lang);
    }
    if(langs.some(lang=>lang&&lang!=='es'&&!translators.has(lang)))throw Error('Pulsa Preparar idiomas pendientes para continuar la traducción local.');
    const out=[];
    for(let i=0;i<texts.length;i++){
      const text=texts[i],lang=langs[i];
      if(!lang||lang==='es'){out.push(text);continue;}
      const key=JSON.stringify([lang,text]);
      if(!cache.has(key)){
        const result=await translators.get(lang).translate(text);
        if(typeof result!=='string'||!result.trim())throw Error('El traductor local devolvió un texto vacío.');
        if(cache.size>=500)cache.delete(cache.keys().next().value);
        cache.set(key,result);
      }
      out.push(cache.get(key));
    }
    return out;
  }
  return {supported,needs,activate,translate};
})();
