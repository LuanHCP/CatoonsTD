import http from 'node:http';
import {createReadStream,statSync} from 'node:fs';
import {extname,join,normalize} from 'node:path';
const root=process.cwd(),port=Number(process.argv[2]||4192);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.mp3':'audio/mpeg','.wav':'audio/wav'};
http.createServer((request,response)=>{
  try{
    const relative=decodeURIComponent(new URL(request.url,'http://localhost').pathname).replace(/^\/+/, '')||'index.html';
    const file=normalize(join(root,relative));if(!file.startsWith(root))throw new Error('invalid path');
    if(!statSync(file).isFile())throw new Error('not a file');
    response.writeHead(200,{'Content-Type':mime[extname(file).toLowerCase()]||'application/octet-stream','Cache-Control':'no-store'});createReadStream(file).pipe(response);
  }catch(_){response.writeHead(404);response.end('Not found');}
}).listen(port,'127.0.0.1',()=>console.log(`Catoons test server: http://127.0.0.1:${port}`));
