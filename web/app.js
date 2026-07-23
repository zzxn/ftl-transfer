const $ = selector => document.querySelector(selector);
const detectedLanguage = (localStorage.ftlLanguage || navigator.language || "en").toLowerCase();

const messages = {
  zh: {
    title:"FTL · 局域网快传",copyTitle:"点击复制局域网地址",gettingAddress:"正在获取连接地址",copy:"复制",
    eyebrow:"LOCAL FILE TRANSFER",hero1:"隔空一扔，",hero2:"文件就到了。",subtitle:"无需登录，不经云端。选择同一局域网内的设备，立即发送。",
    selectDevice:"选择设备",thisDevice:"本机：",searchingDevices:"正在寻找附近设备",openOnOthers:"在其他设备上打开这个页面，它会自动出现",
    selectFiles:"选择文件",noDeviceSelected:"尚未选择设备",dropFiles:"拖放文件到这里",browseFiles:"或点击浏览文件 · 单文件最大 2GB",
    activity:"传输动态",noTransfers:"还没有传输记录",onlineSelect:"在线 · 点击选择",sendTo:"发送至 {name}",items:"{count} 项",
    waitingYou:"等待你接收",waitingThem:"等待对方接收",readyDownload:"可以下载",receiving:"对方正在接收",completed:"传输完成",rejected:"已拒绝",
    reject:"拒绝",accept:"接收",download:"下载文件",from:"来自 {name}",to:"发送给 {name}",otherDevice:"另一台设备",
    chooseReceiver:"请先选择接收设备",sent:"{name} 已发送",sendFailed:"发送失败：{name}",requestFailed:"请求失败",networkError:"网络连接中断",
    renamePrompt:"给这台设备起个名字",addressCopied:"局域网连接地址已复制",manualCopy:"浏览器不允许自动复制，请手动复制：",
    mobileDevice:"移动设备",computer:"电脑"
  },
  "zh-TW": {
    title:"FTL · 區域網路快傳",copyTitle:"點擊複製區域網路位址",gettingAddress:"正在取得連線位址",copy:"複製",
    eyebrow:"LOCAL FILE TRANSFER",hero1:"隔空一丟，",hero2:"檔案就到了。",subtitle:"無需登入，不經雲端。選擇同一區域網路內的裝置，立即傳送。",
    selectDevice:"選擇裝置",thisDevice:"本機：",searchingDevices:"正在尋找附近裝置",openOnOthers:"在其他裝置上開啟此頁面，它會自動出現",
    selectFiles:"選擇檔案",noDeviceSelected:"尚未選擇裝置",dropFiles:"將檔案拖放到這裡",browseFiles:"或點擊瀏覽檔案 · 單一檔案最大 2GB",
    activity:"傳輸動態",noTransfers:"尚無傳輸記錄",onlineSelect:"線上 · 點擊選擇",sendTo:"傳送至 {name}",items:"{count} 項",
    waitingYou:"等待你接收",waitingThem:"等待對方接收",readyDownload:"可以下載",receiving:"對方正在接收",completed:"傳輸完成",rejected:"已拒絕",
    reject:"拒絕",accept:"接收",download:"下載檔案",from:"來自 {name}",to:"傳送給 {name}",otherDevice:"另一台裝置",
    chooseReceiver:"請先選擇接收裝置",sent:"已傳送 {name}",sendFailed:"傳送失敗：{name}",requestFailed:"請求失敗",networkError:"網路連線中斷",
    renamePrompt:"為這台裝置命名",addressCopied:"已複製區域網路連線位址",manualCopy:"瀏覽器不允許自動複製，請手動複製：",
    mobileDevice:"行動裝置",computer:"電腦"
  },
  en: {
    title:"FTL · Local File Transfer",copyTitle:"Click to copy the LAN address",gettingAddress:"Getting connection address",copy:"Copy",
    eyebrow:"LOCAL FILE TRANSFER",hero1:"Drop it here.",hero2:"It lands over there.",subtitle:"No sign-in. No cloud. Pick a device on your local network and send.",
    selectDevice:"Choose a device",thisDevice:"This device: ",searchingDevices:"Looking for nearby devices",openOnOthers:"Open this page on another device and it will appear automatically",
    selectFiles:"Choose files",noDeviceSelected:"No device selected",dropFiles:"Drop files here",browseFiles:"or click to browse · 2 GB max per file",
    activity:"Transfer activity",noTransfers:"No transfers yet",onlineSelect:"Online · Click to select",sendTo:"Send to {name}",items:"{count} items",
    waitingYou:"Waiting for you",waitingThem:"Waiting for receiver",readyDownload:"Ready to download",receiving:"Receiver is downloading",completed:"Transfer complete",rejected:"Rejected",
    reject:"Reject",accept:"Accept",download:"Download",from:"From {name}",to:"Sent to {name}",otherDevice:"another device",
    chooseReceiver:"Choose a receiving device first",sent:"{name} sent",sendFailed:"Failed to send: {name}",requestFailed:"Request failed",networkError:"Network connection lost",
    renamePrompt:"Name this device",addressCopied:"LAN address copied",manualCopy:"Automatic copy is blocked. Copy this address manually:",
    mobileDevice:"Mobile device",computer:"Computer"
  },
  ja: {
    title:"FTL · ローカルファイル転送",copyTitle:"クリックしてLANアドレスをコピー",gettingAddress:"接続アドレスを取得中",copy:"コピー",
    eyebrow:"LOCAL FILE TRANSFER",hero1:"ここに投げれば、",hero2:"すぐ届く。",subtitle:"ログイン不要、クラウド不要。同じLAN上のデバイスを選んですぐ送信。",
    selectDevice:"デバイスを選択",thisDevice:"このデバイス：",searchingDevices:"近くのデバイスを検索中",openOnOthers:"他のデバイスでこのページを開くと自動的に表示されます",
    selectFiles:"ファイルを選択",noDeviceSelected:"デバイス未選択",dropFiles:"ここにファイルをドロップ",browseFiles:"またはクリックして選択 · 1ファイル最大2GB",
    activity:"転送履歴",noTransfers:"転送履歴はありません",onlineSelect:"オンライン · クリックして選択",sendTo:"{name} に送信",items:"{count} 件",
    waitingYou:"受信待ち",waitingThem:"相手の受信待ち",readyDownload:"ダウンロード可能",receiving:"相手が受信中",completed:"転送完了",rejected:"拒否済み",
    reject:"拒否",accept:"受信",download:"ダウンロード",from:"{name} から",to:"{name} に送信",otherDevice:"別のデバイス",
    chooseReceiver:"受信デバイスを選択してください",sent:"{name} を送信しました",sendFailed:"送信失敗：{name}",requestFailed:"リクエストに失敗しました",networkError:"ネットワーク接続が切断されました",
    renamePrompt:"このデバイスの名前",addressCopied:"LANアドレスをコピーしました",manualCopy:"自動コピーできません。手動でコピーしてください：",
    mobileDevice:"モバイル",computer:"コンピューター"
  }
};

const traditionalChinese=/^zh-(tw|hk|mo|hant)/.test(detectedLanguage);
let language=traditionalChinese?"zh-TW":detectedLanguage.startsWith("zh")?"zh":detectedLanguage.startsWith("ja")?"ja":"en";
function t(key, values={}) {
  let value=(messages[language]||messages.en)[key] || messages.en[key] || key;
  for(const [name,replacement] of Object.entries(values)) value=value.replaceAll(`{${name}}`,replacement);
  return value;
}
function applyLanguage() {
  document.documentElement.lang=language==="zh"?"zh-CN":language;
  document.title=t("title");
  $("#languageSelect").value=language;
  document.querySelectorAll("[data-i18n]").forEach(el=>el.textContent=t(el.dataset.i18n));
  document.querySelectorAll("[data-i18n-title]").forEach(el=>el.title=t(el.dataset.i18nTitle));
  if(state.address) $("#addressText").textContent=state.address;
  render();
}
function createDeviceId() {
  if(globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  if(globalThis.crypto?.getRandomValues) {
    const bytes=new Uint8Array(16); globalThis.crypto.getRandomValues(bytes);
    bytes[6]=(bytes[6]&15)|64; bytes[8]=(bytes[8]&63)|128;
    const hex=[...bytes].map(value=>value.toString(16).padStart(2,"0")).join("");
    return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
  }
  return `device-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}
function defaultName() {
  const mobile=/Android|iPhone|iPad/i.test(navigator.userAgent);
  return `${t(mobile?"mobileDevice":"computer")} ${Math.floor(100+Math.random()*900)}`;
}
const state={
  id:localStorage.ftlId||(localStorage.ftlId=createDeviceId()),
  name:localStorage.ftlName||(localStorage.ftlName=defaultName()),
  target:null,devices:[],transfers:[],address:""
};

function esc(value) { const element=document.createElement("div");element.textContent=value;return element.innerHTML; }
function size(bytes) { if(bytes<1024)return bytes+" B";if(bytes<1048576)return(bytes/1024).toFixed(1)+" KB";if(bytes<1073741824)return(bytes/1048576).toFixed(1)+" MB";return(bytes/1073741824).toFixed(2)+" GB"; }
function toast(message) { const element=$("#toast");element.textContent=message;element.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>element.classList.remove("show"),2600); }
async function copyText(text) {
  if(navigator.clipboard?.writeText&&globalThis.isSecureContext) { await navigator.clipboard.writeText(text);return true; }
  const input=document.createElement("textarea");input.value=text;input.setAttribute("readonly","");input.style.cssText="position:fixed;left:-9999px;top:0;opacity:0";
  document.body.appendChild(input);input.focus();input.select();input.setSelectionRange(0,input.value.length);
  let copied=false;try{copied=document.execCommand("copy")}catch{}input.remove();return copied;
}
function localizedError(message) {
  if(!message)return t("requestFailed");
  if(/网络|network/i.test(message))return t("networkError");
  return message;
}
async function api(url,options) {
  const response=await fetch(url,{...options,headers:{...options?.headers,"X-FTL-Language":language}});
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(localizedError(data.error));
  return data;
}
async function heartbeat() {
  await api("/api/heartbeat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:state.id,name:state.name})});
}
async function refresh() {
  try {
    await heartbeat();
    const [devices,transfers]=await Promise.all([api(`/api/devices?self=${encodeURIComponent(state.id)}`),api(`/api/transfers?device=${encodeURIComponent(state.id)}`)]);
    state.devices=devices;state.transfers=transfers.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
    if(state.target&&!devices.some(device=>device.id===state.target.id))state.target=null;
    render();
  }catch(error){toast(error.message)}
}
async function loadInfo() {
  try{const info=await api("/api/info");state.address=info.addresses[0]||location.origin}
  catch{state.address=location.origin}
  $("#addressText").textContent=state.address;
}
function render() {
  if(!state)return;
  $("#myName").textContent=state.name;
  $("#devices").innerHTML=state.devices.map(device=>`<button class="device ${state.target?.id===device.id?"selected":""}" data-device="${device.id}"><span class="device-icon">${/手机|移动|mobile|iPhone|モバイル/i.test(device.name)?"▯":"▭"}</span><strong>${esc(device.name)}</strong><small>${t("onlineSelect")}</small></button>`).join("");
  $("#emptyDevices").hidden=state.devices.length>0;
  $("#targetLabel").textContent=state.target?t("sendTo",{name:state.target.name}):t("noDeviceSelected");
  $("#transferCount").textContent=t("items",{count:state.transfers.length});
  $("#emptyTransfers").hidden=state.transfers.length>0;
  $("#transferList").innerHTML=state.transfers.map(transferHTML).join("");
}
function transferHTML(transfer) {
  const incoming=transfer.to===state.id,pending=transfer.status==="pending";
  const labels={pending:incoming?t("waitingYou"):t("waitingThem"),accepted:incoming?t("readyDownload"):t("receiving"),completed:t("completed"),rejected:t("rejected")};
  let action=`<span class="badge ${transfer.status==="completed"?"ok":transfer.status==="rejected"?"no":""}">${labels[transfer.status]||transfer.status}</span>`;
  if(incoming&&pending)action=`<div class="actions"><button data-reject="${transfer.id}">${t("reject")}</button><button class="accept" data-accept="${transfer.id}">${t("accept")}</button></div>`;
  if(incoming&&transfer.status==="accepted")action=`<div class="actions"><button class="accept" data-download="${transfer.id}">${t("download")}</button></div>`;
  const peer=incoming?t("from",{name:esc(transfer.fromName)}):t("to",{name:esc(state.devices.find(device=>device.id===transfer.to)?.name||t("otherDevice"))});
  return `<div class="transfer-item"><span class="file-icon">↗</span><div class="transfer-info"><strong>${esc(transfer.name)}</strong><small>${peer} · ${size(transfer.size)}</small></div>${action}</div>`;
}
async function sendFiles(files) {
  if(!state.target)return toast(t("chooseReceiver"));
  for(const file of files) {
    const row=document.createElement("div");row.className="queue-item";row.innerHTML=`<span>${esc(file.name)}</span><progress max="100" value="0"></progress>`;$("#queue").append(row);
    try {
      await uploadFile(file,state.target.id,progress=>row.querySelector("progress").value=progress);
      row.querySelector("span").textContent=`✓ ${file.name}`;toast(t("sent",{name:file.name}));
    }catch(error){row.querySelector("span").textContent=t("sendFailed",{name:file.name});toast(error.message)}
    setTimeout(()=>row.remove(),2500);
  }
  await refresh();
}
function uploadFile(file,to,onProgress) {
  return new Promise((resolve,reject)=>{
    const form=new FormData();form.append("from",state.id);form.append("to",to);form.append("file",file);
    const xhr=new XMLHttpRequest();xhr.open("POST","/api/transfers");xhr.setRequestHeader("X-FTL-Language",language);xhr.upload.onprogress=event=>event.lengthComputable&&onProgress(event.loaded/event.total*100);
    xhr.onload=()=>xhr.status<300?resolve():reject(new Error(localizedError(JSON.parse(xhr.responseText||"{}").error)));
    xhr.onerror=()=>reject(new Error(t("networkError")));xhr.send(form);
  });
}

$("#languageSelect").onchange=event=>{language=event.target.value;localStorage.ftlLanguage=language;applyLanguage()};
$("#devices").onclick=event=>{const button=event.target.closest("[data-device]");if(!button)return;state.target=state.devices.find(device=>device.id===button.dataset.device);render()};
$("#renameBtn").onclick=()=>{const name=prompt(t("renamePrompt"),state.name);if(name?.trim()){state.name=name.trim().slice(0,40);localStorage.ftlName=state.name;refresh()}};
$("#addressBtn").onclick=async()=>{try{if(await copyText(state.address))toast(t("addressCopied"));else prompt(t("manualCopy"),state.address)}catch{prompt(t("manualCopy"),state.address)}};
$("#fileInput").onchange=event=>{sendFiles([...event.target.files]);event.target.value=""};
for(const eventName of ["dragenter","dragover"])$("#dropzone").addEventListener(eventName,event=>{event.preventDefault();$("#dropzone").classList.add("drag")});
for(const eventName of ["dragleave","drop"])$("#dropzone").addEventListener(eventName,event=>{event.preventDefault();$("#dropzone").classList.remove("drag")});
$("#dropzone").addEventListener("drop",event=>sendFiles([...event.dataTransfer.files]));
$("#transferList").onclick=async event=>{
  const id=event.target.dataset.accept||event.target.dataset.reject||event.target.dataset.download;if(!id)return;
  try {
    if(event.target.dataset.accept)await api(`/api/transfers/${id}/accept?device=${state.id}`,{method:"POST"});
    if(event.target.dataset.reject)await api(`/api/transfers/${id}/reject?device=${state.id}`,{method:"POST"});
    if(event.target.dataset.download){const link=document.createElement("a");link.href=`/api/transfers/${id}/download?device=${state.id}`;link.click();setTimeout(()=>api(`/api/transfers/${id}/complete?device=${state.id}`,{method:"POST"}).then(refresh),1200)}
    await refresh();
  }catch(error){toast(error.message)}
};

applyLanguage();loadInfo();refresh();setInterval(refresh,4000);
