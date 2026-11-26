const express=require("express"),http=require("http"),path=require("path");
const {Server}=require("socket.io");
const app=express(),server=http.createServer(app),io=new Server(server,{cors:{origin:"*"},pingInterval:25000,pingTimeout:20000});
const PORT=process.env.PORT||3000,players=new Map(),WORLD={w:2600,h:1800};
app.use(express.static(path.join(__dirname,"public")));
app.get("/health",(_q,r)=>r.json({ok:true,players:players.size}));
const num=(v,d,min,max)=>Number.isFinite(Number(v))?Math.max(min,Math.min(max,Number(v))):d;
const name=v=>String(v||"Pirate").replace(/[<>\\r\\n]/g,"").trim().slice(0,16)||"Pirate";
function state(){io.emit("state",{players:[...players].map(([id,p])=>({id,...p}))});}
io.on("connection",s=>{
 s.on("join",d=>{const p={name:name(d?.name),x:num(d?.x,1300,40,2560),y:num(d?.y,900,40,1760),level:num(d?.level,1,1,2450)};players.set(s.id,p);s.emit("notice","Chào mừng "+p.name+"!");s.broadcast.emit("notice",p.name+" đã tham gia.");state();});
 s.on("move",d=>{const p=players.get(s.id);if(!p||!d)return;p.x=num(d.x,p.x,40,2560);p.y=num(d.y,p.y,40,1760);p.level=num(d.level,p.level,1,2450);state();});
 s.on("chat",v=>{const p=players.get(s.id);if(!p)return;const t=String(v||"").replace(/[<>\\r\\n]/g,"").trim().slice(0,120);if(t)io.emit("chat",{name:p.name,text:t});});
 s.on("disconnect",()=>{const p=players.get(s.id);players.delete(s.id);if(p)io.emit("notice",p.name+" đã rời server.");state();});
});
server.listen(PORT,"0.0.0.0",()=>console.log("Island Legends server on "+PORT));
