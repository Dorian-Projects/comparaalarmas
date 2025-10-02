const $ = (s, c=document) => c.querySelector(s);
const $$ = (s, c=document) => Array.from(c.querySelectorAll(s));

document.addEventListener('DOMContentLoaded', () => {
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const modal = document.getElementById('wizardModal');
  const closeBtn = document.getElementById('closeWizard');
  const form = document.getElementById('wizardForm');
  const allSteps = $$('.step', form);
  const stepIndexEl = document.getElementById('stepIndex');
  const stepSubEl = document.getElementById('stepSub');
  const progressBar = document.getElementById('progressBar');
  const errorMsg = document.getElementById('errorMsg');

  let current = 0;
  let flow = null;  // 'home' | 'business'
  let steps = [];

  // ===== Loading overlay
  const loading = document.getElementById('loadingOverlay');
  let loadingTimer = null;
  function showLoading(){
    if(!loading) return;
    loading.classList.add('active');
    document.body.classList.add('no-scroll');
  }
  function hideLoading(){
    if(!loading) return;
    loading.classList.remove('active');
    document.body.classList.remove('no-scroll');
  }
  function isFinalStep(stepEl){
    return !!(stepEl && stepEl.querySelector('.final-fields'));
  }

  function pickFlowFromAnswer(){
    const choice = form.querySelector('input[name="proteger"]:checked');
    flow = (choice && choice.value === 'Negocio') ? 'business' : 'home';
  }
  function getActiveSteps(){
    return allSteps.filter(s => (s.dataset.flow === flow) || (s.dataset.flow === 'any'));
  }

  function openModal(){
    modal.setAttribute('aria-hidden','false');
    flow = null; current = 0;
    steps = getActiveSteps(); // solo 'any' hasta elegir flujo
    updateUI();
  }
  function closeModal(){ modal.setAttribute('aria-hidden','true'); }
  closeBtn.addEventListener('click', closeModal);
  window.addEventListener('click', e=>{ if(e.target===modal) closeModal(); });
  window.addEventListener('keydown', e=>{ if(e.key==='Escape') closeModal(); });

  // Abrir wizard (sin overlay aquí)
  ['openWizardHero','openWizardNav'].forEach(id=>{
    const btn = document.getElementById(id);
    btn?.addEventListener('click', e => {
      e.preventDefault();
      try{
        fbq('track','Lead',{ content_name: id === 'openWizardHero'
          ? 'Solicitud de comparativa - Botón central'
          : 'Solicitud de comparativa - Menú superior'
        });
      }catch{}
      openModal();
    });
  });

  // Avanzar pasos
  form.querySelectorAll('.next').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      if(!validateStep(current)){
        showError('⚠️ Selecciona una opción para continuar.');
        return;
      }

      if (current === 0) { // primera pregunta: fija el flujo
        pickFlowFromAnswer();
        steps = getActiveSteps();
        current = 0;
      }

      const stepEl = steps[current];
      stepEl.classList.add('step--leaving');

      // salto condicional (alarma instalada NO → saltar compañía)
      let jump = 1;
      const checked = stepEl.querySelector('input[type="radio"]:checked');
      const skipValue = stepEl.dataset.skipValue;
      const skipCount = parseInt(stepEl.dataset.skipCount || '1', 10);
      if (checked && skipValue && checked.value === skipValue) {
        jump = 1 + skipCount;
      }

      // Calculamos a dónde vamos
      const nextIndex = Math.min(current + jump, steps.length - 1);
      const nextStepEl = steps[nextIndex];

      // Tras la animación corta de salida, decidimos si mostramos overlay
      setTimeout(()=>{
        stepEl.classList.remove('step--leaving');

        if (isFinalStep(nextStepEl)) {
          // Mostrar overlay antes del formulario final
          showLoading();
          clearTimeout(loadingTimer);
          loadingTimer = setTimeout(()=>{
            current = nextIndex;
            updateUI();
            hideLoading();
          }, 1400);
        } else {
          // Avance normal
          current = nextIndex;
          updateUI();
        }
      }, 200); // coincide con animación .step--leaving
    });
  });

  // Envío final
  form.addEventListener('submit', e=>{
    if(!validateStep(current)){
      e.preventDefault(); showError('Completa todos los campos obligatorios.');
      return;
    }
    const submitBtn = $('button[type="submit"]', steps[current]);
    if(submitBtn){ submitBtn.disabled = true; submitBtn.textContent = 'Enviando…'; }
    clearError();
    // Formspree gestiona envío y redirección
  });

  function updateUI(){
    allSteps.forEach(s=>{
      const allowed = (s.dataset.flow === 'any') || (s.dataset.flow === flow);
      s.style.display = allowed ? '' : 'none';
      s.classList.remove('step--active');
    });
    steps.forEach((s,i)=> s.classList.toggle('step--active', i===current));

    stepIndexEl.textContent = (current+1).toString();
    stepSubEl.textContent = steps[current].dataset.title || '';
    progressBar.style.width = `${Math.max(8, ((current+1)/steps.length)*100)}%`;

    clearError();
    const first = steps[current].querySelector('input');
    if(first) first.focus({preventScroll:true});
  }

  function validateStep(i){
    const step = steps[i];
    const required = $$('input[required]', step);
    if(!required.length) return true;

    // radios: al menos uno por grupo
    const groups = {};
    required.forEach(inp => { if(inp.type==='radio'){ (groups[inp.name] ||= []).push(inp); } });
    for(const g of Object.values(groups)){ if(!g.some(r=>r.checked)) return false; }

    // inputs texto/email/tel
    for(const inp of required){
      if(inp.type!=='radio'){
        if(!inp.value.trim()) return false;
        if(!inp.checkValidity()) return false;
      }
    }
    return true;
  }

  function showError(msg){ errorMsg.textContent = msg; }
  function clearError(){ errorMsg.textContent = ''; }

  /* ========= FIX iOS/Safari: tocar la tarjeta marca el radio ========= */
  $$('.opt, .opt-card').forEach(lbl => {
    lbl.addEventListener('click', (e) => {
      const inp = lbl.querySelector('input[type="radio"]');
      if (inp) {
        inp.checked = true;
        const ev = new Event('change', { bubbles: true });
        inp.dispatchEvent(ev);
      }
    }, true);
  });

  // Contacto oculto → revelar
  const revealBtn = document.querySelector('.reveal-contact');
  const revealedBox = document.getElementById('contactRevealed');
  if (revealBtn && revealedBox) {
    revealBtn.addEventListener('click', () => {
      const tel = revealBtn.dataset.tel || '';
      const user = revealBtn.dataset.emailUser || '';
      const dom = revealBtn.dataset.emailDomain || '';
      const email = `${user}@${dom}`;
      revealedBox.innerHTML = `
        📞 <a href="tel:${tel.replace(/\s/g,'')}">${formateaTel(tel)}</a>
        

      `;
      revealedBox.hidden = false;
      revealBtn.remove();
    });
  }
  function formateaTel(t){
    return t.replace('+34','').trim().replace(/(\d{3})(\d{3})(\d{3,})/, '$1 $2 $3');
  }
});

// Abrir wizard si viene con hash #comparativa
document.addEventListener('DOMContentLoaded', () => {
  if (location.hash === '#comparativa') {
    const btn = document.getElementById('openWizardHero') || document.getElementById('openWizardNav');
    if (btn) btn.click(); // reutiliza la logica existente
  }
});

