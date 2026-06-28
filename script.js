const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const state = { sound: true, visited: new Set(), avatarHits: 0, keys: [] };
const messages = ["正在唤醒面试官...", "准备茶水点心...", "整理简历...", "正在拼命包装自己...", "深呼吸，要开始了...", "调整面试微笑..."];
const titles = { education: "▰ 学习经历", work: "▣ 实习副本", skills: "⚒ 技能树", qa: "? 面试抽卡与提问箱", contact: "✉ 联系我" };

/* === Blind-box card deck =====================================
 * 4 fixed cards + N user-spawned cards.
 * fixed cards: themed answers; card 03 is hidden-egg with random reply.
 * user cards: stored in localStorage, also POSTed to my inbox via formsubmit. */
const FIXED_CARDS = [
  { id: "fixed-01", question: "做过最「牛」的一个需求是什么？" },
  { id: "fixed-02", question: "遇到过最困难的一件事是什么？" },
  { id: "fixed-03", question: "你如何规划你过去的实习路径？" },
  { id: "fixed-04", question: "为什么你的大部分实习时间都比较短？", hidden: true }
];

const USER_CARDS_KEY = "xirui-user-cards";
function loadUserCards() {
  try { return JSON.parse(localStorage.getItem(USER_CARDS_KEY) || "[]"); }
  catch { return []; }
}
function saveUserCards(cards) {
  localStorage.setItem(USER_CARDS_KEY, JSON.stringify(cards));
}

function cardHTML(card, index, isUser) {
  const total = FIXED_CARDS.length + (isUser ? loadUserCards().length : 0);
  const numText = String(index + 1).padStart(2, "0");
  const isEgg = card.hidden;
  const cls = ["qa-card"];
  if (isUser) cls.push("user-card");
  if (isEgg) cls.push("hidden-egg");
  const newTag = isUser && card.fresh ? '<span class="card-new">NEW</span>' : "";
  const delBtn = isUser ? '<button class="card-delete" data-delete="' + card.id + '" title="删除这张卡" aria-label="删除这张卡">×</button>' : "";
  const mark = isEgg ? "?" : (isUser ? "+" : "♦");
  const tag = isEgg ? "??? HIDDEN ???" : (isUser ? "VISITOR Q" : "QUESTION");
  return `<button class="${cls.join(" ")}" data-card-id="${card.id}">
    ${newTag}${delBtn}
    <span class="card-mark">${mark}</span>
    <span class="card-no">${numText}</span>
    <span class="card-tag">${tag}</span>
  </button>`;
}

function renderDeck() {
  const grid = $("#qaGrid");
  if (!grid) return;
  const userCards = loadUserCards();
  const fixedHTML = FIXED_CARDS.map((c, i) => cardHTML(c, i, false)).join("");
  const userHTML = userCards.map((c, i) => cardHTML(c, FIXED_CARDS.length + i, true)).join("");
  grid.innerHTML = fixedHTML + userHTML;
}

function findCard(id) {
  const fixed = FIXED_CARDS.find(c => c.id === id);
  if (fixed) return { card: fixed, isUser: false };
  const user = loadUserCards().find(c => c.id === id);
  if (user) return { card: user, isUser: true };
  return null;
}

function revealCard(cardEl) {
  const id = cardEl.dataset.cardId;
  const found = findCard(id);
  if (!found) return;
  const { card, isUser } = found;
  $$(".qa-card").forEach(el => el.classList.remove("active"));
  cardEl.classList.add("read", "active");

  const answer = $("#qaAnswer");
  const tag = isUser
    ? `<b>访客提问 · ${card.submittedAt ? new Date(card.submittedAt).toLocaleDateString("zh-CN") : ""}</b>`
    : (card.hidden ? '<b>??? HIDDEN QUESTION ???</b>' : '<b>面试问题</b>');
  answer.innerHTML = `${tag}<p class="qa-question">${escapeHTML(card.question)}</p>`;

  // clear NEW badge once revealed
  if (isUser && card.fresh) {
    const cards = loadUserCards();
    const target = cards.find(c => c.id === id);
    if (target) { target.fresh = false; saveUserCards(cards); }
    cardEl.querySelector(".card-new")?.remove();
  }
}

function deleteUserCard(id) {
  const cards = loadUserCards().filter(c => c.id !== id);
  saveUserCards(cards);
  renderDeck();
  $("#qaAnswer").innerHTML = '<span class="qa-empty">▽ 卡片已撤回</span>';
  toast("卡片已撤回，卡组又安静了一秒 🌙");
}

function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}

function spawnNewCard(question, contact) {
  const id = "user-" + Date.now() + "-" + Math.floor(Math.random() * 1e6);
  const cards = loadUserCards();
  cards.push({
    id,
    question: question.trim(),
    contact: (contact || "").trim(),
    submittedAt: new Date().toISOString(),
    fresh: true
  });
  saveUserCards(cards);
  renderDeck();
  // animate the just-spawned card
  requestAnimationFrame(() => {
    const newEl = $(`[data-card-id="${id}"]`);
    if (newEl) {
      newEl.classList.add("spawn");
      newEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  });
  return id;
}

/* ============================================================ */

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
      <span class="badge-icon">荷</span>
      <span class="badge-copy"><b>荷兰留学工作室</b><small>联合创始人</small></span>
      <i>FOUNDER</i>
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
  if (id === "qa") renderDeck();
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
$("#treasure").addEventListener("click",()=>{toast("✦ 你发现了隐藏宝箱！里面藏着小左的联系方式 ✉",5000);openModal("contact")});

// Card click → reveal; delete-button click → remove user card
document.addEventListener("click",e=>{
  const delBtn = e.target.closest("[data-delete]");
  if (delBtn) {
    e.stopPropagation();
    const id = delBtn.dataset.delete;
    if (confirm("确认撤回这张卡片吗？（仅从你的浏览器本地移除，不会撤回已发出的邮件）")) {
      deleteUserCard(id);
    }
    return;
  }
  const card = e.target.closest(".qa-card");
  if (!card) return;
  revealCard(card);
});

// Question form → spawn a new card + send to inbox via formsubmit
document.addEventListener("submit",async e=>{
  if(e.target.id!=="questionForm")return;
  e.preventDefault();
  const form=e.target, status=$("#questionStatus"), button=$("button[type='submit']",form);
  const entry=Object.fromEntries(new FormData(form).entries());
  const question = (entry.message || "").trim();
  if (!question) return;

  // 1) Always spawn locally first — this is the "self-evolution" the user sees.
  const newId = spawnNewCard(question, entry.contact);
  $(".question-box")?.classList.add("celebrate");
  setTimeout(() => $(".question-box")?.classList.remove("celebrate"), 600);
  toast("🎴 你的问题已加入卡组！", 4000);

  // 2) Best-effort forward to my inbox so I can author a reply later.
  button.disabled=true; status.textContent="🎴 已生成新卡 · 同步到希蕊邮箱中...";
  try{
    const response=await fetch(form.action,{method:"POST",body:new FormData(form),headers:{Accept:"application/json"}});
    if(!response.ok)throw new Error("send failed");
    form.reset(); status.textContent="✓ 新卡已就位，问题也送达邮箱了。";
  }catch(error){
    form.reset();
    status.textContent="✓ 新卡已加入卡组（邮件转发暂时失败，但卡片已在你的浏览器本地保存）。";
  }finally{button.disabled=false}
});

setInterval(()=>{$("#timeDisplay").textContent=new Date().toLocaleTimeString("zh-CN",{hour12:false})},1000);
setTimeout(()=>{if(!$("#game").classList.contains("hidden"))toast("您看了这么久，要不直接联系我？")},300000);
renderInternships(); visitor();
