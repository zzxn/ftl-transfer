const $ = s => document.querySelector(s);
function createDeviceId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  if (globalThis.crypto?.getRandomValues) {
    const bytes = new Uint8Array(16);
    globalThis.crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 15) | 64;
    bytes[8] = (bytes[8] & 63) | 128;
    const hex = [...bytes].map(value => value.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
  }
  return `device-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}
const state = {
  id: localStorage.ftlId || (localStorage.ftlId = createDeviceId()),
  name: localStorage.ftlName || (localStorage.ftlName = defaultName()),
  target: null, devices: [], transfers: [], address: ""
};

function defaultName() {
  const mobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
  return `${mobile ? "移动设备" : "电脑"} ${Math.floor(100 + Math.random() * 900)}`;
}
function esc(s) { const d=document.createElement("div"); d.textContent=s; return d.innerHTML; }
function size(n) { if(n<1024)return n+" B"; if(n<1048576)return (n/1024).toFixed(1)+" KB"; if(n<1073741824)return (n/1048576).toFixed(1)+" MB"; return (n/1073741824).toFixed(2)+" GB"; }
function toast(msg) { const el=$("#toast"); el.textContent=msg; el.classList.add("show"); clearTimeout(toast.t); toast.t=setTimeout(()=>el.classList.remove("show"),2600); }
async function copyText(text) {
  if (navigator.clipboard?.writeText && globalThis.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  const input=document.createElement("textarea");
  input.value=text;
  input.setAttribute("readonly","");
  input.style.cssText="position:fixed;left:-9999px;top:0;opacity:0";
  document.body.appendChild(input);
  input.focus();
  input.select();
  input.setSelectionRange(0,input.value.length);
  let copied=false;
  try { copied=document.execCommand("copy"); } catch {}
  input.remove();
  return copied;
}
async function api(url, options) {
  const res = await fetch(url, options);
  const data = await res.json().catch(()=>({}));
  if (!res.ok) throw new Error(data.error || "请求失败");
  return data;
}
async function heartbeat() {
  await api("/api/heartbeat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:state.id,name:state.name})});
}
async function refresh() {
  try {
    await heartbeat();
    const [devices, transfers] = await Promise.all([
      api(`/api/devices?self=${encodeURIComponent(state.id)}`),
      api(`/api/transfers?device=${encodeURIComponent(state.id)}`)
    ]);
    state.devices=devices; state.transfers=transfers.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
    if(state.target && !devices.some(d=>d.id===state.target.id)) state.target=null;
    render();
  } catch(e) { toast(e.message); }
}
async function loadInfo() {
  try {
    const info=await api("/api/info");
    state.address=info.addresses[0] || location.origin;
    $("#addressText").textContent=state.address;
  } catch(e) {
    state.address=location.origin;
    $("#addressText").textContent=state.address;
  }
}
function render() {
  $("#myName").textContent=state.name;
  $("#devices").innerHTML=state.devices.map(d=>`<button class="device ${state.target?.id===d.id?"selected":""}" data-device="${d.id}"><span class="device-icon">${/手机|移动|iPhone/i.test(d.name)?"▯":"▭"}</span><strong>${esc(d.name)}</strong><small>在线 · 点击选择</small></button>`).join("");
  $("#emptyDevices").hidden=state.devices.length>0;
  $("#targetLabel").textContent=state.target?`发送至 ${state.target.name}`:"尚未选择设备";
  $("#transferCount").textContent=`${state.transfers.length} 项`;
  $("#emptyTransfers").hidden=state.transfers.length>0;
  $("#transferList").innerHTML=state.transfers.map(transferHTML).join("");
}
function transferHTML(t) {
  const incoming=t.to===state.id, pending=t.status==="pending";
  const labels={pending:incoming?"等待你接收":"等待对方接收",accepted:incoming?"可以下载":"对方正在接收",completed:"传输完成",rejected:"已拒绝"};
  let action=`<span class="badge ${t.status==="completed"?"ok":t.status==="rejected"?"no":""}">${labels[t.status]||t.status}</span>`;
  if(incoming&&pending) action=`<div class="actions"><button data-reject="${t.id}">拒绝</button><button class="accept" data-accept="${t.id}">接收</button></div>`;
  if(incoming&&t.status==="accepted") action=`<div class="actions"><button class="accept" data-download="${t.id}">下载文件</button></div>`;
  return `<div class="transfer-item"><span class="file-icon">↗</span><div class="transfer-info"><strong>${esc(t.name)}</strong><small>${incoming?`来自 ${esc(t.fromName)}`:`发送给 ${esc(state.devices.find(d=>d.id===t.to)?.name||"另一台设备")}`} · ${size(t.size)}</small></div>${action}</div>`;
}
async function sendFiles(files) {
  if(!state.target) return toast("请先选择接收设备");
  for(const file of files) {
    const row=document.createElement("div"); row.className="queue-item"; row.innerHTML=`<span>${esc(file.name)}</span><progress max="100" value="0"></progress>`; $("#queue").append(row);
    try {
      await uploadFile(file,state.target.id,p=>row.querySelector("progress").value=p);
      row.querySelector("span").textContent=`✓ ${file.name}`;
      toast(`${file.name} 已发送`);
    } catch(e) { row.querySelector("span").textContent=`发送失败：${file.name}`; toast(e.message); }
    setTimeout(()=>row.remove(),2500);
  }
  await refresh();
}
function uploadFile(file,to,onProgress) {
  return new Promise((resolve,reject)=>{
    const fd=new FormData(); fd.append("from",state.id); fd.append("to",to); fd.append("file",file);
    const xhr=new XMLHttpRequest(); xhr.open("POST","/api/transfers");
    xhr.upload.onprogress=e=>e.lengthComputable&&onProgress(e.loaded/e.total*100);
    xhr.onload=()=>xhr.status<300?resolve():reject(new Error(JSON.parse(xhr.responseText||"{}").error||"发送失败"));
    xhr.onerror=()=>reject(new Error("网络连接中断")); xhr.send(fd);
  });
}
$("#devices").onclick=e=>{const btn=e.target.closest("[data-device]");if(!btn)return;state.target=state.devices.find(d=>d.id===btn.dataset.device);render();};
$("#renameBtn").onclick=()=>{const n=prompt("给这台设备起个名字",state.name);if(n?.trim()){state.name=n.trim().slice(0,40);localStorage.ftlName=state.name;refresh();}};
$("#addressBtn").onclick=async()=>{
  try {
    if(await copyText(state.address)) toast("局域网连接地址已复制");
    else prompt("浏览器不允许自动复制，请手动复制：",state.address);
  } catch {
    prompt("浏览器不允许自动复制，请手动复制：",state.address);
  }
};
$("#fileInput").onchange=e=>{sendFiles([...e.target.files]);e.target.value="";};
for(const ev of ["dragenter","dragover"]) $("#dropzone").addEventListener(ev,e=>{e.preventDefault();$("#dropzone").classList.add("drag")});
for(const ev of ["dragleave","drop"]) $("#dropzone").addEventListener(ev,e=>{e.preventDefault();$("#dropzone").classList.remove("drag")});
$("#dropzone").addEventListener("drop",e=>sendFiles([...e.dataTransfer.files]));
$("#transferList").onclick=async e=>{
  const id=e.target.dataset.accept||e.target.dataset.reject||e.target.dataset.download;
  if(!id)return;
  try{
    if(e.target.dataset.accept) await api(`/api/transfers/${id}/accept?device=${state.id}`,{method:"POST"});
    if(e.target.dataset.reject) await api(`/api/transfers/${id}/reject?device=${state.id}`,{method:"POST"});
    if(e.target.dataset.download){
      const a=document.createElement("a");a.href=`/api/transfers/${id}/download?device=${state.id}`;a.click();
      setTimeout(()=>api(`/api/transfers/${id}/complete?device=${state.id}`,{method:"POST"}).then(refresh),1200);
    }
    await refresh();
  }catch(err){toast(err.message)}
};
loadInfo(); refresh(); setInterval(refresh,4000);
