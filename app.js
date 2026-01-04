// ================= GAME VARIABLES =================
let balance = 10000;
let points = 0;
let day = 1;
let badges = [];
let totalSaved = 0;
let totalInvested = 0;

let dailyActions = { save:false, spend:false, buyStock:false, sellStock:false };

// ===== MINI BUSINESS STOCKS =====
let companies = [
  { name: "Alpha", price: 1000, owned: 0 },
  { name: "Bravo", price: 1200, owned: 0 },
  { name: "Charlie", price: 800, owned: 0 },
  { name: "Delta", price: 1500, owned: 0 },
  { name: "Echo", price: 500, owned: 0 }
];

// ===== SCENARIOS (30 original) =====
let scenarios = [
  { text:"You received Tsh 2000 as a gift.", choices:[
    { text:"SAVE", bal:2000 },
    { text:"SPEND", bal:-500 }
  ]},
  { text:"You want to buy a new phone worth Tsh 3000.", choices:[
    { text:"SAVE", bal:0 },
    { text:"SPEND", bal:-3000 }
  ]},
  { text:"A friend asks to borrow Tsh 1000.", choices:[
    { text:"SAVE", bal:0 },
    { text:"SPEND", bal:-100 }
  ]},
  // continue all 30 scenarios in same structure
];

// ================== UI ELEMENTS =================
const balanceEl = document.getElementById("balance");
const pointsEl = document.getElementById("points");
const dayEl = document.getElementById("day");
const scenarioTextEl = document.getElementById("scenario-text");
const choicesDiv = document.getElementById("choices");
const businessStatsEl = document.getElementById("business-stats");
const stockButtonsEl = document.getElementById("stock-buttons");
const badgesEl = document.getElementById("badges");

const buyPopup = document.getElementById("buy-popup");
const buyOptions = document.getElementById("buy-options");
const sellPopup = document.getElementById("sell-popup");
const sellOptions = document.getElementById("sell-options");

// ================= INITIALIZATION =================
updateUI();
generateScenario();
renderMiniBusiness();

// ================= SCENARIOS LOGIC =================
function generateScenario() {
  const currentScenario = scenarios[day-1];
  scenarioTextEl.textContent = currentScenario.text;

  choicesDiv.innerHTML = "";
  currentScenario.choices.forEach(choice=>{
    const btn = document.createElement('button');
    btn.className = "choice-btn btn";
    btn.textContent = choice.text;
    btn.classList.add(choice.text === "SAVE" ? "save" : "spend");

    // Disable button if already done today
    if(dailyActions[choice.text.toLowerCase()]) btn.disabled = true;

    btn.onclick = () => selectChoice(choice);
    choicesDiv.appendChild(btn);
  });
}

function selectChoice(choice){
  const type = choice.text==="SAVE"?"save":"spend";

  if(dailyActions[type]){
    return alert("You already did this action today!");
  }

  // Update balance & points
  balance += choice.bal;
  points += 10;
  if(type==="save") totalSaved++;

  // Disable opposite button visually
  const buttons = document.querySelectorAll(".choice-btn");
  buttons.forEach(btn=>{
    if(btn.textContent!==choice.text){
      btn.disabled=true;
    }
  });

  dailyActions[type]=true;

  updateUI();
  checkBadges();
  checkGameOver();
}

// ================= MINI BUSINESS =================
function renderMiniBusiness() {
  // Show total units and investment value
  const totalUnits = companies.reduce((sum,c)=>sum+c.owned,0);
  const totalInvest = companies.reduce((sum,c)=>sum+c.owned*c.price,0);

  businessStatsEl.innerHTML = `
    <div><p>Total Units</p><h3>${totalUnits}</h3></div>
    <div><p>Total Investment</p><h3>Tsh ${totalInvest}</h3></div>
  `;

  stockButtonsEl.innerHTML = "";

  const buyBtn = document.createElement("button");
  buyBtn.className="btn buy-btn";
  buyBtn.textContent="Buy Stock";
  buyBtn.onclick=()=>openBuyPopup();
  stockButtonsEl.appendChild(buyBtn);

  const sellBtn = document.createElement("button");
  sellBtn.className="btn sell-btn";
  sellBtn.textContent="Sell Stock";
  sellBtn.onclick=()=>openSellPopup();
  stockButtonsEl.appendChild(sellBtn);
}

// ===== BUY POPUP =====
function openBuyPopup(){
  buyOptions.innerHTML="";
  companies.forEach((c,i)=>{
    buyOptions.innerHTML += `
      <div class="stock-row">${c.name} @ ${c.price} Tsh 
        <input type="number" min="0" value="0" id="buy-${i}"> units
      </div>`;
  });
  buyPopup.classList.remove("hidden");
}

function confirmBuy(){
  companies.forEach((c,i)=>{
    const units = parseInt(document.getElementById(`buy-${i}`).value)||0;
    const cost = units*c.price;
    if(cost>balance) return alert(`Not enough balance for ${c.name}`);
    balance -= cost;
    c.owned += units;
  });
  dailyActions.buyStock=true;
  document.getElementById("coin-sound").play();
  closeBuyPopup();
  renderMiniBusiness();
  updateUI();
}

function closeBuyPopup(){ buyPopup.classList.add("hidden"); }

// ===== SELL POPUP =====
function openSellPopup(){
  sellOptions.innerHTML="";
  companies.forEach((c,i)=>{
    if(c.owned>0){
      sellOptions.innerHTML += `
        <div class="stock-row">${c.name} @ ${c.price} Tsh, Owned: ${c.owned} 
          <input type="number" min="0" max="${c.owned}" value="0" id="sell-${i}"> units
        </div>`;
    }
  });
  sellPopup.classList.remove("hidden");
}

function confirmSell(){
  companies.forEach((c,i)=>{
    const input = document.getElementById(`sell-${i}`);
    if(!input) return;
    const units = parseInt(input.value)||0;
    if(units>c.owned) return alert(`Not enough ${c.name} units`);
    c.owned -= units;
    balance += units*c.price;
  });
  dailyActions.sellStock=true;
  document.getElementById("coin-sound").play();
  closeSellPopup();
  renderMiniBusiness();
  updateUI();
}

function closeSellPopup(){ sellPopup.classList.add("hidden"); }

// ================== BADGES =================
function checkBadges(){
  if(!badges.includes("Saver") && totalSaved>=5){
    badges.push("Saver");
    document.getElementById("badge-sound").play();
    alert("🏅 Badge Earned: Saver");
  }
  badgesEl.textContent = badges.length? badges.join(","):"None";
}

// ================== UI & GAME =================
function updateUI(){
  balanceEl.textContent = balance;
  pointsEl.textContent = points;
  dayEl.textContent = `${day} / 30`;
}

function checkGameOver(){
  if(balance<=0){
    alert("Game Over! Balance reached 0.");
    resetGame();
  }
}

function nextDay(){
  day++;
  dailyActions={ save:false, spend:false, buyStock:false, sellStock:false };
  updateUI();
  generateScenario();
  renderMiniBusiness();
  if(day>30){
    endGame();
  }
}

function endGame(){
  alert(`Game Complete!
Start Balance: Tsh 10,000
End Balance: Tsh ${balance}
Badges: ${badges.join(",") || "None"}`);
  resetGame();
}

function resetGame(){
  balance=10000; points=0; day=1;
  badges=[]; totalSaved=0; totalInvested=0;
  companies.forEach(c=>c.owned=0);
  dailyActions={ save:false, spend:false, buyStock:false, sellStock:false };
  updateUI();
  renderMiniBusiness();
  generateScenario();
}

// ================= GUIDE OVERLAY =================
const guideOverlay = document.getElementById("guide-overlay");
const startBtn = document.getElementById("start-btn");

startBtn.addEventListener("click", ()=>{
  guideOverlay.style.display = "none";
  updateUI();
  generateScenario();
  renderMiniBusiness();
});
