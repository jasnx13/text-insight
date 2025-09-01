// Node.js API server for Text Insight Dual Mode
const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 8080;

function send(res, status, body, type='application/json'){
  res.writeHead(status, {'Content-Type': type, 'Access-Control-Allow-Origin':'*'});
  res.end(body);
}

function analyze(text){
  const words=text.split(/\s+/).filter(Boolean);
  let fixed=text.replace(/\bi\b/g,'I');
  fixed=fixed.replace(/\bdont\b/gi,"don't");
  fixed=fixed.replace(/\bcant\b/gi,"can't");
  return {analysis:{words:words.length},corrected_text:fixed,formality:50,sentiment_score:50};
}

const server=http.createServer((req,res)=>{
  const {pathname}=url.parse(req.url,true);
  if(req.method==='GET' && pathname==='/health'){
    return send(res,200,JSON.stringify({status:'ok',model:'heuristic-v1'}));
  }
  if(req.method==='POST' && pathname==='/analyze'){
    let body='';
    req.on('data',c=>body+=c);
    req.on('end',()=>{
      try{
        const {text}=JSON.parse(body);
        if(!text) return send(res,400,JSON.stringify({error:'Missing text'}));
        return send(res,200,JSON.stringify(analyze(text)));
      }catch(e){return send(res,500,JSON.stringify({error:e.message}));}
    });
    return;
  }
  send(res,404,JSON.stringify({error:'Not found'}));
});

server.listen(PORT,()=>console.log('Server running http://localhost:'+PORT));
