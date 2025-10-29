const $ = (s, c=document) => c.querySelector(s);

document.addEventListener('DOMContentLoaded', () => {
  // Año dinámico en footer
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Elementos que pueden existir o no en cada página
  const modal        = document.getElementById('wizardModal');
  const closeBtn     = document.getElementById('closeWizard');
  const openHeroBtn  = document.getElementById('openWizardHero'); // botón grande / CTA principal
  const openNavBtn   = document.getElementById('openWizardNav');  // botón menú superior
  const loading      = document.getElementById('loadingOverlay');
  const errorMsg     = document.getElementById('errorMsg');

  const FORM_ENDPOINT = "https://formspree.io/f/movkjlgp";

  // Abrir / cerrar modal
  function openModal(){
    if (!modal) return;
    modal.setAttribute('aria-hidden','false');
    if (errorMsg) errorMsg.textContent = '';
  }
  function closeModal(){
    if (!modal) return;
    modal.setAttribute('aria-hidden','true');
  }

  // Overlay loading
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

  // Eventos abrir modal
  if (openHeroBtn) {
    openHeroBtn.addEventListener('click', e => {
      e.preventDefault();
      try{
        fbq('track','Lead',{ content_name:'Solicitud de comparativa - Botón principal' });
      }catch{}
      openModal();
    });
  }
  if (openNavBtn) {
    openNavBtn.addEventListener('click', e => {
      e.preventDefault();
      try{
        fbq('track','Lead',{ content_name:'Solicitud de comparativa - Menú superior' });
      }catch{}
      openModal();
    });
  }

  // Cerrar modal
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }
  window.addEventListener('click', e=>{ if(e.target===modal) closeModal(); });
  window.addEventListener('keydown', e=>{ if(e.key==='Escape') closeModal(); });

  // Abrir modal si visitan con #comparativa en la URL
  if (location.hash === '#comparativa' && (openHeroBtn || openNavBtn)) {
    (openHeroBtn || openNavBtn).click();
  }

  // ====== FORMULARIO (dentro del modal) ======
  const form = document.getElementById('wizardForm');
  if (!form) return; // si en esta página no hay modal/form, paramos

  const submitBtn = document.getElementById('submitBtn');
  const errBox    = document.getElementById('errorMsg');

  form.addEventListener('submit', async e => {
    e.preventDefault(); // no envío nativo

    const nombre      = form.querySelector('#fnombre');
    const telefono    = form.querySelector('#ftelefono');
    const ciudad      = form.querySelector('#fciudad');
    const cp          = form.querySelector('#fcpostal');
    const honeypotBot = form.querySelector('input[name="_gotcha"]');

    // validaciones mínimas
    if(
      !nombre?.value.trim() ||
      !telefono?.value.trim() ||
      !ciudad?.value.trim() ||
      !cp?.value.trim()
    ){
      if (errBox) errBox.textContent = '⚠️ Rellena todos los campos obligatorios.';
      return;
    }

    if(telefono && !telefono.checkValidity()){
      if (errBox) errBox.textContent = '⚠️ Revisa el teléfono.';
      return;
    }

    if(cp && !cp.checkValidity()){
      if (errBox) errBox.textContent = '⚠️ Código postal no válido.';
      return;
    }

    if(honeypotBot && honeypotBot.value.trim() !== ""){
      if (errBox) errBox.textContent = '⚠️ Error de validación.';
      return;
    }

    // estado "enviando"
    if (errBox) errBox.textContent = '';
    if (submitBtn){
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando...';
    }
    showLoading();

    // origen de la landing para que lo veas en el email
    const origenAttr = form.getAttribute('data-origen') || 'home';

    const payload = {
      nombre: nombre.value.trim(),
      telefono: telefono.value.trim(),
      ciudad: ciudad.value.trim(),
      codigo_postal: cp.value.trim(),
      origen_landing: origenAttr
    };

    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        window.location.href = "https://comparaalarmas.es/gracias.html";
        return;
      } else {
        hideLoading();
        if (submitBtn){
          submitBtn.disabled = false;
          submitBtn.textContent = 'Enviar solicitud';
        }
        if (errBox) errBox.textContent = '⚠️ Error enviando. Si prefieres llama ahora al 617 525 827.';
      }

    } catch (err) {
      hideLoading();
      if (submitBtn){
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar solicitud';
      }
      if (errBox) errBox.textContent = '⚠️ No se ha podido enviar. Llámanos al 617 525 827.';
    }
  });
});
