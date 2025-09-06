// ==== HealCare App JS ====

// Basic data for doctors (including veterinary)
const doctors = [
  {name:'Dr. Elora Williams', dept:'Cardiology', rating:4.9},
  {name:'Dr. Michel Smith', dept:'Oncology', rating:5.0},
  {name:'Dr. Rehana Bilkis', dept:'Gynecology', rating:4.8},
  {name:'Dr. Ethan Williams', dept:'Orthopedics', rating:4.7},
  {name:'Dr. Jacob Lee', dept:'Pediatrics', rating:4.6},
  {name:'Dr. Naomi Brown', dept:'Dermatology', rating:4.7},
  {name:'Dr. Omar Nasser', dept:'General Medicine', rating:4.5},
  // Vets
  {name:'Dr. Ava Patel', dept:'Veterinary', rating:4.8},
  {name:'Dr. Lucas Kim', dept:'Veterinary', rating:4.7}
];

const vetDoctors = doctors.filter(d=>d.dept==='Veterinary');

// DOM helpers
const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

// Init
window.addEventListener('DOMContentLoaded', () => {
  // Year
  $('#year').textContent = new Date().getFullYear();

  // Nav hamburger
  $('#hamburger').addEventListener('click', ()=>{
    const nav = $('#navlinks');
    nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
  });

  // Doctors Grid
  const grid = $('#doctorGrid');
  grid.innerHTML = doctors.map(d => `
    <div class="card pop">
      <div style="height:140px;background:#e2e8f0;border-radius:12px;margin-bottom:12px;display:flex;align-items:center;justify-content:center;font-size:46px">🩺</div>
      <strong>${d.name}</strong>
      <div class="muted">${d.dept}</div>
      <div>⭐ ${d.rating.toFixed(1)} / 5.0</div>
      <button class="btn small" data-book="${d.name}">Book</button>
    </div>
  `).join('');

  // Doctor select
  const sel = $('#doctorSelect');
  sel.innerHTML = doctors.map(d=> `<option>${d.name}</option>`).join('');

  // Vet list
  $('#vetList').innerHTML = vetDoctors.map(v => `<li>🐾 <strong>${v.name}</strong> — ⭐ ${v.rating.toFixed(1)}</li>`).join('');

  // Book buttons
  grid.addEventListener('click', (e)=>{
    const name = e.target.getAttribute('data-book');
    if(name){
      $('#doctorSelect').value = name;
      location.hash = '#appointment';
      speak(`Booking form opened for ${name}`);
    }
  });

  // Quick actions
  $$('.tile[data-open]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      location.hash = btn.dataset.open;
    });
  });

  // Appointment form
  const apptKey = 'healcare_appointments';
  const list = $('#apptList');
  const renderAppts = () => {
    const appts = JSON.parse(localStorage.getItem(apptKey) || '[]');
    list.innerHTML = appts.map(a => `<li>${a.date} ${a.time} — <strong>${a.doctor}</strong> (${a.department})</li>`).join('') || '<li class="muted">No appointments yet.</li>';
  };
  renderAppts();

  $('#appointmentForm').addEventListener('submit', (e)=>{
    e.preventDefault();
    const fd = new FormData(e.target);
    const appt = Object.fromEntries(fd.entries());
    const appts = JSON.parse(localStorage.getItem(apptKey) || '[]');
    appts.push(appt);
    localStorage.setItem(apptKey, JSON.stringify(appts));
    renderAppts();
    e.target.reset();
    speak('Your appointment has been reserved.');
    alert('Appointment reserved!');
  });

  // Symptom Checker
  const symptomMap = {
    Head: ['Headache','Fever','Sore throat','Runny nose'],
    Chest:['Cough','Chest pain','Shortness of breath','Palpitations'],
    Abdomen:['Nausea','Vomiting','Diarrhea','Stomach pain'],
    Legs:['Cramps','Swelling','Pain while walking','Numbness'],
    Arms:['Rash','Pain','Numbness','Weakness']
  };
  const adviceMap = {
    Head:'Hydrate, rest, and consider over‑the‑counter pain relief. Seek care if severe or persistent.',
    Chest:'If chest pain is severe or with breathlessness, seek emergency care immediately.',
    Abdomen:'Avoid heavy meals and hydrate. Seek care if pain is severe or persistent.',
    Legs:'Elevate and rest. If swelling or redness with pain, consult a doctor.',
    Arms:'Consider ice/rest. If rash spreads or fever develops, consult a doctor.'
  };
  $$('.human .area').forEach(area => {
    area.addEventListener('click', () => {
      const label = area.dataset.area;
      $('#areaName').textContent = label;
      const chips = symptomMap[label].map(s => `<button class="pill pop" data-sym="${s}">${s}</button>`).join('');
      $('#symptomOptions').innerHTML = chips;
      $('#adviceText').textContent = adviceMap[label];
    });
  });

  // Nearby hospitals - OpenStreetMap centered to geo
  $('#locateBtn').addEventListener('click', () => {
    if(!navigator.geolocation) return alert('Geolocation not supported');
    navigator.geolocation.getCurrentPosition(pos => {
      const {latitude:lat, longitude:lon} = pos.coords;
      // Simple bbox around user's location
      const d = 0.02;
      const bbox = [lon-d, lat-d, lon+d, lat+d].join('%2C');
      const marker = `${lat}%2C${lon}`;
      const url = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${marker}`;
      $('#osmFrame').src = url;
    }, err => alert('Unable to get location: ' + err.message), {enableHighAccuracy:true, timeout:10000});
  });

  // Reviews
  const reviewKey = 'healcare_reviews';
  const reviewsDiv = $('#reviewsList');
  const avgEl = $('#avgRating');
  function renderReviews(){
    const items = JSON.parse(localStorage.getItem(reviewKey) || '[]');
    reviewsDiv.innerHTML = items.map(r => `<div class="review"><strong>${r.hospital}</strong> — ⭐ ${r.rating}<br><span class="muted">${r.text}</span></div>`).join('') || '<div class="muted">No reviews yet.</div>';
    if(items.length){
      const avg = (items.reduce((a,b)=>a+Number(b.rating),0)/items.length).toFixed(2);
      avgEl.textContent = `${avg} / 5.00 (${items.length})`;
    }else{
      avgEl.textContent = '—';
    }
  }
  renderReviews();
  $('#reviewForm').addEventListener('submit', (e)=>{
    e.preventDefault();
    const fd = new FormData(e.target);
    const item = Object.fromEntries(fd.entries());
    const arr = JSON.parse(localStorage.getItem(reviewKey) || '[]');
    arr.unshift(item);
    localStorage.setItem(reviewKey, JSON.stringify(arr));
    e.target.reset();
    renderReviews();
    speak('Thanks for your review.');
  });

  // Medicine Delivery / Cart
  const cartKey = 'healcare_cart';
  function renderCart(){
    const cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
    $('#cartList').innerHTML = cart.map((c,i) => `<li>${c.qty} × <strong>${c.medicine}</strong> — ${c.address} <button data-rm="${i}" class="btn small ghost">Remove</button></li>`).join('') || '<li class="muted">Cart is empty.</li>';
  }
  renderCart();

  $('#deliveryForm').addEventListener('submit',(e)=>{
    e.preventDefault();
    const fd = new FormData(e.target);
    const item = Object.fromEntries(fd.entries());
    const cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
    cart.push(item);
    localStorage.setItem(cartKey, JSON.stringify(cart));
    renderCart();
    e.target.reset();
  });

  $('#cartList').addEventListener('click',(e)=>{
    const i = e.target.getAttribute('data-rm');
    if(i!==null){
      const cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
      cart.splice(Number(i),1);
      localStorage.setItem(cartKey, JSON.stringify(cart));
      renderCart();
    }
  });

  $$('.pill[data-med]').forEach(p => p.addEventListener('click', ()=>{
    const med = p.dataset.med;
    $('#deliveryForm').medicine.value = med;
  }));

  $('#checkoutBtn').addEventListener('click', ()=>{
    const cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
    if(!cart.length) return alert('Cart is empty.');
    $('#checkoutMsg').textContent = 'Order placed (demo). A pharmacy partner will contact you shortly.';
    speak('Your medicine order has been placed.');
    localStorage.removeItem(cartKey);
    renderCart();
  });

  // Medical history
  const historyKey = 'healcare_history';
  const renderHistory = () => {
    $('#historyOut').textContent = localStorage.getItem(historyKey) || 'No records saved on this device.';
  };
  renderHistory();
  $('#historyForm').addEventListener('submit', (e)=>{
    e.preventDefault();
    const fd = new FormData(e.target);
    const obj = Object.fromEntries(fd.entries());
    localStorage.setItem(historyKey, JSON.stringify(obj, null, 2));
    renderHistory();
  });

  // Voice assistant (Web Speech API)
  let recognition = null;
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window){
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SR();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = true;
    recognition.onresult = (ev)=>{
      const text = ev.results[ev.results.length-1][0].transcript.toLowerCase();
      $('#voiceStatus').textContent = 'Heard: ' + text;
      handleVoice(text);
    };
    recognition.onstart = ()=> $('#voiceStatus').textContent = 'Listening…';
    recognition.onend = ()=> $('#voiceStatus').textContent = 'Stopped';
  } else {
    $('#voiceStatus').textContent = 'Voice recognition not supported in this browser.';
  }

  $('#startVoice').addEventListener('click', ()=> recognition && recognition.start());
  $('#stopVoice').addEventListener('click', ()=> recognition && recognition.stop());
  $('#openAppointmentTop').addEventListener('click', ()=> location.hash = '#appointment');
  $('#openAppointmentHero').addEventListener('click', ()=> location.hash = '#appointment');

  // Chatbot
  const chat = $('#chatbot');
  $('#openChat').addEventListener('click', ()=> chat.style.display = 'flex');
  $('#closeChat').addEventListener('click', ()=> chat.style.display = 'none');
  const chatBody = $('#chatBody'), chatInput = $('#chatInput');
  function addMsg(text, who='bot'){
    const div = document.createElement('div');
    div.className = 'msg ' + (who==='user'?'user':'bot');
    div.innerHTML = `<div class="bubble">${text}</div>`;
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;
  }
  addMsg('Hi! I am HealCare Assistant. How can I help you today?');

  $('#sendChat').addEventListener('click', sendChat);
  chatInput.addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); sendChat(); } });
  function sendChat(){
    const text = chatInput.value.trim();
    if(!text) return;
    addMsg(text, 'user');
    chatInput.value = '';
    const reply = botReply(text);
    addMsg(reply, 'bot');
    speak(reply);
  }

}); // DOMContentLoaded end

// Voice commands handler
function handleVoice(text){
  if(text.includes('book')) location.hash = '#appointment';
  else if(text.includes('chat')) { document.querySelector('#chatbot').style.display='flex'; }
  else if(text.includes('hospital')) location.hash = '#hospitals';
  else if(text.includes('symptom')) location.hash = '#symptoms';
  else if(text.includes('read my appointments')) {
    const appts = JSON.parse(localStorage.getItem('healcare_appointments')||'[]');
    if(!appts.length) speak('You have no appointments yet.'); else speak('You have ' + appts.length + ' appointments saved.');
  } else speak('Sorry, I did not catch that.');
}

// Text-to-Speech
function speak(text){
  if(!('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 1.02;
  speechSynthesis.speak(u);
}

// Simple rule-based chatbot
function botReply(q){
  const s = q.toLowerCase();
  if(s.includes('timing') || s.includes('open')) return 'HealCare is available 24/7 online. Clinic visits depend on doctor schedule after booking.';
  if(s.includes('book')) return 'To book, go to the Appointments section, select a department and doctor, then choose date and time.';
  if(s.includes('price') || s.includes('cost') || s.includes('fee')) return 'Online consultation fees typically range from $10–$30 in this demo.';
  if(s.includes('medicine')) return 'Use the Medicine Delivery section to add items to your cart and checkout (demo).';
  if(s.includes('vet') || s.includes('pet')) return 'We have veterinary doctors available. See the Vet Doctors list in Medicine Delivery section.';
  if(s.includes('emergency')) return 'If this is an emergency, call your local emergency number immediately.';
  if(s.includes('symptom') || s.includes('sick') || s.includes('pain')) return 'Try the Symptom Checker for quick advice, or book an appointment for a professional evaluation.';
  return 'I can help with booking, medicine delivery, nearby hospitals, veterinary care, and symptom guidance. What would you like to do?';
}
