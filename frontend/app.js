let map, markers = [];
const $ = id => document.getElementById(id);
const riskClass = level => level || "Low";

function initMap(){
  if(!window.L){ $("map").innerHTML = '<p style="padding:20px;color:#9ab">Map library unavailable. Reports remain available in the table.</p>'; return; }
  map = L.map('map').setView([12.965,77.62], 11);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors'}).addTo(map);
}
function showToast(message){const t=$("toast");t.textContent=message;t.style.display="block";setTimeout(()=>t.style.display="none",3000)}
async function loadData(){
  const [reportsRes, dashRes] = await Promise.all([fetch('/api/reports'),fetch('/api/dashboard')]);
  const reports = await reportsRes.json(), d = await dashRes.json();
  $("total").textContent=d.total; $("critical").textContent=d.critical; $("high").textContent=d.high; $("open").textContent=d.open;
  renderPriority(reports); renderReports(reports); renderMarkers(reports); renderHeroAreas(reports);
}

/* Populate the hero neighbourhood tags dynamically from live report areas.
   Shows every unique area returned by the API — no hardcoded list. */
function renderHeroAreas(reports){
  const container = $("hero-areas");
  if(!container) return;
  // Extract unique, non-empty area strings, sorted alphabetically
  const areas = [...new Set(
    reports.map(r => (r.area||"").trim()).filter(a => a.length > 0)
  )].sort((a,b) => a.localeCompare(b, "en-IN"));

  if(areas.length === 0){
    container.innerHTML = '<span class="hero-tag" style="opacity:.5">No areas reported yet</span>';
    return;
  }
  container.innerHTML = areas.map(a =>
    `<span class="hero-tag">${escapeHtml(a)}</span>`
  ).join('');
}
function renderPriority(reports){
  $("priority-list").innerHTML = reports.slice(0,4).map(r=>`
    <div class="priority-item"><div class="priority-top"><span>${escapeHtml(r.area)} · ${escapeHtml(r.title)}</span><span class="risk ${riskClass(r.risk_level)}">${r.risk_level} ${r.risk_score}</span></div>
    <p>${escapeHtml(r.priority)}. ${escapeHtml(r.recommended_action)}</p></div>`).join('') || '<p class="map-note">No reports yet.</p>';
}
function renderReports(data){
  if(!data) return fetch('/api/reports').then(r=>r.json()).then(renderReports);
  const filter=$("filter").value;
  const rows=data.filter(r=>filter==="All"||r.risk_level===filter);
  $("reports-body").innerHTML=rows.map(r=>`<tr>
    <td><strong>${escapeHtml(r.title)}</strong><small>${escapeHtml(r.area)} · ${r.id}</small></td>
    <td><span class="risk ${riskClass(r.risk_level)}">${r.risk_level} · ${r.risk_score}/100</span></td>
    <td>${escapeHtml(r.priority)}</td><td>${escapeHtml(r.status)}</td>
    <td><select class="status-select" onchange="updateStatus('${r.id}',this.value)">
      ${["Submitted","Under Review","Inspection Scheduled","In Progress","Resolved","Closed"].map(s=>`<option ${s===r.status?'selected':''}>${s}</option>`).join('')}
    </select></td>
    <td><button class="btn-view" onclick="viewReport('${r.id}')">&#128269; View</button></td></tr>`).join('') || '<tr><td colspan="6">No reports match this filter.</td></tr>';
}
function renderMarkers(reports){
  if(!map) return;
  markers.forEach(m=>m.remove()); markers=[];
  reports.forEach(r=>{
    if(r.latitude==null||r.longitude==null) return;
    const marker=L.marker([r.latitude,r.longitude]).addTo(map);
    marker.bindPopup(`<b>${escapeHtml(r.area)}</b><br>${escapeHtml(r.title)}<br>Risk: ${r.risk_level} (${r.risk_score}/100)`);
    markers.push(marker);
  });
}
async function updateStatus(id,status){
  const res=await fetch(`/api/reports/${id}/status`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status})});
  if(!res.ok){showToast("Could not update status");return}
  showToast("Report status updated");loadData();
}
function openModal(){$("modal").classList.remove("hidden")}
function closeModal(){$("modal").classList.add("hidden");$("report-form").reset()}

/* ── Detail modal ─────────────────────────────────────────────────── */
function openDetailModal(){
  const m=$("detail-modal");
  m.classList.remove("hidden");
  m.addEventListener("click",_detailBackdropClose);
}
function closeDetailModal(){
  const m=$("detail-modal");
  m.classList.add("hidden");
  m.removeEventListener("click",_detailBackdropClose);
}
function _detailBackdropClose(e){if(e.target===$("detail-modal"))closeDetailModal();}

async function viewReport(id){
  openDetailModal();
  $("detail-loading").classList.remove("hidden");
  $("detail-error").classList.add("hidden");
  $("detail-content").classList.add("hidden");
  $("detail-title").textContent="Report details";
  $("detail-eyebrow").textContent="FULL REPORT · "+id;

  try{
    const [repRes, anaRes] = await Promise.all([
      fetch('/api/reports'),
      fetch(`/api/reports/${id}/analysis`)
    ]);
    if(!anaRes.ok) throw new Error("Analysis unavailable ("+anaRes.status+")");
    const allReports = await repRes.json();
    const report = allReports.find(r=>r.id===id);
    if(!report) throw new Error("Report not found in list");
    const analysis = await anaRes.json();

    $("detail-title").textContent = escapeHtml(report.title);
    $("detail-content").innerHTML = buildDetailHtml(report, analysis);
    $("detail-loading").classList.add("hidden");
    $("detail-content").classList.remove("hidden");
  }catch(err){
    $("detail-loading").classList.add("hidden");
    $("detail-error").textContent="Could not load report: "+err.message;
    $("detail-error").classList.remove("hidden");
  }
}

function fmtTs(iso){
  if(!iso) return "—";
  try{return new Date(iso).toLocaleString("en-IN",{timeZone:"Asia/Kolkata",year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})+" IST";}
  catch{return iso;}
}

function buildDetailHtml(r, analysis){
  /* Pull per-agent objects from the workflow */
  const agents = analysis.agents || [];
  const evidenceAgent = agents.find(a=>a.agent==="Evidence Agent") || {};
  const weatherAgent  = agents.find(a=>a.agent==="Weather Agent")  || {};
  const riskAgent     = agents.find(a=>a.agent==="Risk Agent")     || {};
  const actionAgent   = agents.find(a=>a.agent==="Action Agent")   || {};

  /* Contribution bars: sourced from the backend Risk Agent findings strings
     e.g. "Blockage contribution: 30 / 35" to avoid frontend re-rounding divergence. */
  const _parseFinding = (findings, keyword) => {
    const line = (findings||[]).find(f => f.toLowerCase().includes(keyword.toLowerCase()));
    if(!line) return null;                      // finding absent → bar omitted, not shown as 0/0
    const m = line.match(/(\d+)\s*\/\s*(\d+)/);
    return m ? {weighted: parseInt(m[1],10), max: parseInt(m[2],10)} : null;
  };
  const contribs = [
    {label:"Blockage severity",       ..._parseFinding(riskAgent.findings,"Blockage")},
    {label:"Rainfall risk",           ..._parseFinding(riskAgent.findings,"Rainfall")},
    {label:"Site vulnerability",      ..._parseFinding(riskAgent.findings,"Site vulnerability")},
    {label:"Historical waterlogging", ..._parseFinding(riskAgent.findings,"Historical")},
  ].filter(c => c.weighted != null);           // drop any entry where parsing failed

  /* Evidence photo block */
  const photoBlock = r.evidence_filename
    ? `<img class="evidence-photo" src="/uploads/${encodeURIComponent(r.evidence_filename)}" alt="Evidence photo for report ${escapeHtml(r.id)}">`
    : `<div class="evidence-none">No evidence photo uploaded for this report.</div>`;

  /* Agent card builder */
  const agentCard = (a, extra="") => {
    if(!a.agent) return "";
    const findings = (a.findings||[]).map(f=>`<li>${escapeHtml(f)}</li>`).join('');
    return `<div class="agent-card">
      <div class="agent-card-head">
        <span class="agent-card-name">${escapeHtml(a.agent)}</span>
        ${a.status?`<span class="agent-status">${escapeHtml(a.status)}</span>`:""}
      </div>
      ${findings?`<ul class="agent-findings">${findings}</ul>`:""}
      ${extra}
    </div>`;
  };

  /* Risk Agent gets the score display + contribution bars */
  const riskExtra = riskAgent.score!=null ? `
    <div class="detail-score" style="margin-top:10px">
      <span class="detail-score-num">${riskAgent.score}</span>
      <div class="detail-score-meta">
        <span class="risk ${riskClass(riskAgent.level)}">${escapeHtml(riskAgent.level||"")}</span>
        <span style="font-size:11px;color:var(--muted)">${escapeHtml(riskAgent.priority||"")}</span>
      </div>
    </div>
    <div class="contrib-list">
      ${contribs.map(c=>`<div class="contrib-row">
        <label>${escapeHtml(c.label)}</label>
        <div class="contrib-track"><div class="contrib-fill" style="width:${Math.round((c.weighted/c.max)*100)}%"></div></div>
        <span class="contrib-val">${c.weighted}/${c.max}</span>
      </div>`).join('')}
    </div>` : "";

  /* Action Agent gets the recommendation + human tag */
  const actionExtra = actionAgent.recommended_action ? `
    <p class="agent-action">${escapeHtml(actionAgent.recommended_action)}</p>
    ${analysis.human_approval_required
      ? `<span class="human-tag">⚠ Human approval required before any action is taken</span>`
      : ""}` : "";

  /* Weather Agent disclaimer */
  const weatherExtra = weatherAgent.rainfall_score!=null
    ? `<p style="font-size:11px;color:var(--muted);margin-top:6px">Rainfall indicator: <strong style="color:var(--text)">${weatherAgent.rainfall_score}/100</strong> — supplied demo input, not a live weather observation.</p>`
    : "";

  return `
  <div class="detail-section">
    <p class="detail-section-title">Report information</p>
    <div class="detail-grid">
      <div class="detail-field"><label>Report ID</label><span>${escapeHtml(r.id)}</span></div>
      <div class="detail-field"><label>Area / Landmark</label><span>${escapeHtml(r.area)}</span></div>
      <div class="detail-field"><label>Submitted</label><span>${fmtTs(r.created_at)}</span></div>
      <div class="detail-field"><label>Last updated</label><span>${fmtTs(r.updated_at)}</span></div>
      <div class="detail-field"><label>Latitude</label><span>${r.latitude??'—'}</span></div>
      <div class="detail-field"><label>Longitude</label><span>${r.longitude??'—'}</span></div>
      <div class="detail-field"><label>Current status</label><span>${escapeHtml(r.status)}</span></div>
      <div class="detail-field"><label>Priority</label><span>${escapeHtml(r.priority)}</span></div>
    </div>
    <hr class="detail-divider">
    <div class="detail-field" style="margin-top:6px"><label>Description</label><span>${escapeHtml(r.description)}</span></div>
  </div>

  <div class="detail-section">
    <p class="detail-section-title">Risk assessment</p>
    ${agentCard(riskAgent, riskExtra)}
  </div>

  <div class="detail-section">
    <p class="detail-section-title">Agent workflow findings</p>
    <div class="agent-cards">
      ${agentCard(evidenceAgent)}
      ${agentCard(weatherAgent, weatherExtra)}
      ${agentCard(actionAgent, actionExtra)}
    </div>
  </div>

  <div class="detail-section">
    <p class="detail-section-title">Evidence photo</p>
    ${photoBlock}
    <p style="font-size:10px;color:var(--muted);margin-top:8px">Photo is stored as evidence only. This prototype does not automatically classify images.</p>
  </div>`;
}
function escapeHtml(value){return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
$("report-form").addEventListener("submit",async e=>{
  e.preventDefault(); const form=e.currentTarget, data=new FormData(form);
  $("form-message").textContent="Running the triage workflow…";
  try{
    const res=await fetch('/api/reports',{method:'POST',body:data});
    const result=await res.json();
    if(!res.ok) throw new Error(result.detail||"Submission failed");
    $("form-message").textContent=`Report ${result.id} submitted. Risk: ${result.risk.level} (${result.risk.score}/100). Human review is required.`;
    await loadData(); showToast("Report analysed and submitted");
    setTimeout(closeModal,1800);
  }catch(err){$("form-message").textContent=err.message}
});
initMap();loadData().catch(()=>showToast("Could not load dashboard. Check the API server."));
