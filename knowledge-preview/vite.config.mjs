import {defineConfig} from 'vite';
import path from 'node:path';
export default defineConfig({root:path.resolve('knowledge-preview'),css:{postcss:{plugins:[]}},resolve:{alias:{'@':path.resolve('src')},dedupe:['react','react-dom']},server:{host:'0.0.0.0',allowedHosts:true,fs:{allow:[path.resolve('.')]}}});
