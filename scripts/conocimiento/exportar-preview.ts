import fs from 'node:fs';
import {datosConocimiento} from '../../src/lib/conocimiento/datos';
const d=datosConocimiento();fs.mkdirSync('knowledge-preview',{recursive:true});fs.writeFileSync('knowledge-preview/datos.json',JSON.stringify(d));console.log(JSON.stringify(d.cobertura,null,2));
