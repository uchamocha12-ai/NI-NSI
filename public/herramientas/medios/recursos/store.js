// Datos temporales en memoria. No usa IndexedDB, localStorage ni sessionStorage.
const Store=(()=>{
 const tables={searches:new Map(),settings:new Map()};
 const clone=v=>v===undefined?undefined:structuredClone(v);
 async function open(){}
 async function read(table,id){return clone(tables[table].get(id));}
 async function all(table='searches'){return [...tables[table].values()].map(clone);}
 async function put(table,value){tables[table].set(value.id,clone(value));}
 async function save(value){value.rev=(value.rev||0)+1;value.updatedAt=new Date().toISOString();tables.searches.clear();tables.searches.set(value.id,clone(value));}
 async function insertMany(values){for(const value of values)await save(value);}
 async function removeSearch(id){tables.searches.delete(id);}
 return {open,read,all,put,save,insertMany,removeSearch};
})();
