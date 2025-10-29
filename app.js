const $ = (s, c=document) => c.querySelector(s);

document.addEventListener('DOMContentLoaded', () => {
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const modal = document.getElementById('wizardModal');
  const closeBtn = document.getElementById('closeWizard');
  const form = document.getElementById('wizardForm');
  const errorMsg = document.getElementById('errorMsg');
  const loading = document.getElementById('loadingOverlay');
  const submitBtn = document.getElementById('submitBtn');


  const FORM_ENDPOINT = "https://formspree.io/f/movkjlgp";

  function openModal(){
    modal.setAttribute('aria-hidden','false');
    if (errorMsg) errorMsg.textContent = '';
  }
  function closeModal(){
    modal.setAttribute('aria-hidden','true');
  }

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

  // abrir modal desde botones
  ['openWizardHero','openWizardNav'].forEach(id=>{
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener('click', e => {
      e.preventDefault();
      try{
        fbq('track','Lead',{
          content_name: id === 'openWizardHero'
            ? 'Solicitud de comparativa - Botón central'
            : 'Solicitud de comparativa - Menú superior'
        });
      }catch{}
      openModal();
    });
  });

  // cerrar modal
  closeBtn.addEventListener('click', closeModal);
  window.addEventListener('click', e=>{ if(e.target===modal) closeModal(); });
  window.addEventListener('keydown', e=>{ if(e.key==='Escape') closeModal(); });

  // envío personalizado (bloqueamos submit normal)
  form.addEventListener('submit', async e => {
    e.preventDefault(); // <-- MUY IMPORTANTE: ahora SÍ lo bloqueamos siempre

    const nombre      = form.querySelector('#fnombre');
    const telefono    = form.querySelector('#ftelefono');
    const ciudad      = form.querySelector('#fciudad');
    const cp          = form.querySelector('#fcpostal');
    const honeypotBot = form.querySelector('input[name="_gotcha"]');

    // validar campos obligatorios
    if(
      !nombre.value.trim() ||
      !telefono.value.trim() ||
      !ciudad.value.trim() ||
      !cp.value.trim()
    ){
      if (errorMsg) errorMsg.textContent = '⚠️ Rellena todos los campos obligatorios.';
      return;
    }

    // validar teléfono
    if(!telefono.checkValidity()){
      if (errorMsg) errorMsg.textContent = '⚠️ Revisa el teléfono.';
      return;
    }

    // validar CP
    if(!cp.checkValidity()){
      if (errorMsg) errorMsg.textContent = '⚠️ Código postal no válido.';
      return;
    }

    // anti bot
    if(honeypotBot && honeypotBot.value.trim() !== ""){
      if (errorMsg) errorMsg.textContent = '⚠️ Error de validación.';
      return;
    }

    // todo ok → UI de envío
    if (errorMsg) errorMsg.textContent = '';
    if (submitBtn){
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando...';
    }
    showLoading();

    // construimos payload para Formspree
    const payload = {
      nombre: nombre.value.trim(),
      telefono: telefono.value.trim(),
      ciudad: ciudad.value.trim(),
      codigo_postal: cp.value.trim()
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
        // éxito → redirigimos nosotros a tu página gracias
        window.location.href = "https://comparaalarmas.es/gracias.html";
        return;
      } else {
        // fallo en Formspree
        hideLoading();
        if (submitBtn){
          submitBtn.disabled = false;
          submitBtn.textContent = 'Enviar solicitud';
        }
        if (errorMsg) errorMsg.textContent = '⚠️ Error enviando el formulario. Llámanos al 617 525 827.';
      }

    } catch (err) {
      // error de red / conexión
      hideLoading();
      if (submitBtn){
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar solicitud';
      }
      if (errorMsg) errorMsg.textContent = '⚠️ No se ha podido enviar. Llámanos al 617 525 827.';
    }
  });

  // acceso directo con #comparativa
  if (location.hash === '#comparativa') {
    const btn = document.getElementById('openWizardHero') || document.getElementById('openWizardNav');
    if (btn) btn.click();
  }
});
