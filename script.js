const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const state = { sound: true, visited: new Set(), avatarHits: 0, keys: [] };
const messages = ["正在唤醒面试官...", "准备茶水点心...", "整理简历...", "正在拼命包装自己...", "深呼吸，要开始了...", "调整面试微笑..."];
const titles = { education: "▰ 学习经历", work: "▣ 实习副本", skills: "⚒ 技能树", qa: "? 面试抽卡与提问箱", contact: "✉ 联系我" };
const qaAnswers = [
  "<b>你最有成就感的一件事？</b><br>把模糊需求拆成可验证的产品方案，并让数据、用户体验与业务目标真正对齐。",
  "<b>你遇到过最大的挑战？</b><br>在陌生行业和复杂协作中快速建立判断框架，再把不确定性转化为可以推进的下一步。",
  "<b>为什么是你？</b><br>跨学科背景、五段产品实习与 AI 产品实践，让我既能看懂数据，也愿意深入真实场景。",
  ["隐藏技能：可以在经济、金融与 AI 之间快速搭桥。","最近在思考：AI 产品的好体验，应该让技术感消失。","三个国家求学，解锁了适应新环境的高级技能。","Free Talk 彩蛋已触发：聊聊你最近最喜欢的产品吧。"][Math.floor(Math.random()*4)]
];

function blocks(value) {
  return `<div class="block-bar">${Array.from({length:10},(_,i)=>`<i class="${i < Math.round(value/10) ? "on" : ""}"></i>`).join("")}</div>`;
}
function renderInternships() {
  const internships = [
    ["AI", "腾讯 ima", "AI 产品"],
    ["盾", "蚂蚁国际", "AI 风控策略"],
    ["搜", "bilibili", "搜索策略"],
    ["增", "京东", "增长产品运营"],
    ["商", "得物", "商家产品"]
  ];
  $("#internshipQuests").innerHTML = internships.map(([icon, company, role], index) => `
    <div class="achievement-badge badge-${index + 1}">
      <span class="badge-icon">${icon}</span>
      <span class="badge-copy"><b>${company}</b><small>${role}</small></span>
      <i>CLEAR</i>
    </div>
  `).join("") + `
    <div class="achievement-badge achievement-total">
      <span class="badge-icon">★</span>
      <span class="badge-copy"><b>ALL CLEAR</b><small>五段副本已解锁</small></span>
    </div>`;
}
function visitor() {
  let count = Number(localStorage.getItem("xirui-visits") || 36) + 1;
  localStorage.setItem("xirui-visits", count);
  $("#landingVisitor").textContent = `YOU ARE VISITOR #${String(count).padStart(3,"0")}`;
  $("#visitorDisplay").textContent = `VISITOR #${String(count).padStart(3,"0")}`;
}
function toast(text, duration=3500) {
  const el = $("#toast"); el.textContent = text; el.classList.add("show");
  clearTimeout(toast.timer); toast.timer = setTimeout(()=>el.classList.remove("show"), duration);
}
function contextualGreeting() {
  const now = new Date(), hour = now.getHours(), day = now.getDay();
  if (hour < 5) toast("你也熬夜呀，要不要看看我做的项目？",5000);
  else if (day === 0 || day === 6) toast("周末还在看简历？您辛苦了！");
  else if (hour >= 18) toast("下班了还在看？要不咱聊聊？");
}
function startGame() {
  $("#landing").classList.add("hidden"); $("#loading").classList.remove("hidden");
  $("#loadMessage").textContent = messages[Math.floor(Math.random()*messages.length)];
  let progress=0;
  const timer=setInterval(()=>{
    progress += progress < 70 ? 7 + Math.random()*8 : 2 + Math.random()*4;
    progress=Math.min(100,progress); $("#loadBar").style.width=`${progress}%`; $("#loadPercent").textContent=`${Math.floor(progress)}%`;
    if(progress===100){clearInterval(timer);setTimeout(()=>{$("#loading").classList.add("hidden");$("#game").classList.remove("hidden");contextualGreeting();},350)}
  },150);
}
function fillSkillBars(root) {
  $$("[data-skills]",root).forEach(el=>{
    el.innerHTML=el.dataset.skills.split(",").map(item=>{const [name,value]=item.split(":");return `<div class="stat-row"><div class="stat-label"><span>${name}</span><b>${value}%</b></div>${blocks(+value)}</div>`}).join("");
  });
}
function openModal(id) {
  state.visited.add(id); $(`[data-modal="${id}"]`).classList.add("visited"); $("#exploredCount").textContent=`${state.visited.size}/5`;
  $("#modalTitle").textContent=titles[id]; const content=$("#modalContent"); content.innerHTML=""; content.append($("#"+id).content.cloneNode(true)); fillSkillBars(content);
  $("#modal").classList.toggle("qa-modal", id === "qa");
  $("#modal").classList.remove("hidden");
}
function closeModal(){ $("#modal").classList.add("hidden"); $("#modal").classList.remove("qa-modal"); }

$("#startBtn").addEventListener("click",startGame);
document.addEventListener("keydown",e=>{
  if(!$("#landing").classList.contains("hidden") && ["Enter"," "].includes(e.key)) startGame();
  if(e.key==="Escape") closeModal();
  const key=e.key.length===1?e.key.toLowerCase():e.key;
  state.keys.push(key); state.keys=state.keys.slice(-10);
  const code=["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
  if(code.every((v,i)=>state.keys[i]===v)){document.body.style.filter="grayscale(1)";toast("你居然知道这个秘籍？隐藏自述已解锁：我喜欢把复杂问题拆成能行动的下一步。",6500)}
});
$$(".map-node").forEach(node=>node.addEventListener("click",()=>openModal(node.dataset.modal)));
$("#closeModal").addEventListener("click",closeModal);
$("#modal").addEventListener("click",e=>{if(e.target.id==="modal")closeModal()});
$("#soundBtn").addEventListener("click",()=>{state.sound=!state.sound;$("#soundBtn").textContent=`SFX: ${state.sound?"ON":"OFF"}`;toast(state.sound?"音效开关已打开（等待添加 BGM 文件）":"音效已关闭")});
$("#avatar").addEventListener("click",()=>{
  state.avatarHits++; if(state.avatarHits>=5){state.avatarHits=0;$("#avatar").classList.add("gotcha");toast("别戳了别戳了 (>﹏<)");setTimeout(()=>$("#avatar").classList.remove("gotcha"),1500)}
});
$("#treasure").addEventListener("click",()=>{toast("找到我的真实简历啦！但 PDF 还没有放进网站。[TODO: 添加简历文件]",5000);openModal("contact")});
document.addEventListener("click",e=>{
  const card=e.target.closest(".qa-card"); if(!card)return;
  $$(".qa-card").forEach(item=>item.classList.remove("read"));
  card.classList.add("read"); $("#qaAnswer").innerHTML=qaAnswers[+card.dataset.card];
});
document.addEventListener("submit",async e=>{
  if(e.target.id!=="questionForm")return;
  e.preventDefault();
  const form=e.target, status=$("#questionStatus"), button=$("button[type='submit']",form);
  const entry=Object.fromEntries(new FormData(form).entries());
  const saved=JSON.parse(localStorage.getItem("xirui-question-backup")||"[]");
  saved.push({...entry,submittedAt:new Date().toISOString()});
  localStorage.setItem("xirui-question-backup",JSON.stringify(saved.slice(-20)));
  button.disabled=true; status.textContent="正在投递...";
  try{
    const response=await fetch(form.action,{method:"POST",body:new FormData(form),headers:{Accept:"application/json"}});
    if(!response.ok)throw new Error("send failed");
    form.reset(); status.textContent="投递成功，感谢你的问题。"; toast("问题已送达我的收件箱，谢谢！");
  }catch(error){
    status.textContent="网络发送暂时失败，内容已在此浏览器备份。";
    toast("发送暂时失败，但问题已在本地备份。",5000);
  }finally{button.disabled=false}
});
setInterval(()=>{$("#timeDisplay").textContent=new Date().toLocaleTimeString("zh-CN",{hour12:false})},1000);
setTimeout(()=>{if(!$("#game").classList.contains("hidden"))toast("您看了这么久，要不直接联系我？")},300000);
renderInternships(); visitor();
