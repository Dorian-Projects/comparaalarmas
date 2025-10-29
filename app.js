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

  // validación antes de enviar a Formspree
  form.addEventListener('submit', e => {
    const nombre      = form.querySelector('#fnombre');
    const telefono    = form.querySelector('#ftelefono');
    const ciudad      = form.querySelector('#fciudad');
    const cp          = form.querySelector('#fcpostal');
    const honeypotBot = form.querySelector('input[name="_gotcha"]'); // anti-bot invisible

    // validar campos obligatorios
    if(
      !nombre.value.trim() ||
      !telefono.value.trim() ||
      !ciudad.value.trim() ||
      !cp.value.trim()
    ){
      e.preventDefault();
      if (errorMsg) errorMsg.textContent = '⚠️ Rellena todos los campos obligatorios.';
      return;
    }

    // validar teléfono con el pattern del input
    if(!telefono.checkValidity()){
      e.preventDefault();
      if (errorMsg) errorMsg.textContent = '⚠️ Revisa el teléfono.';
      return;
    }

    // validar código postal simple (5 números)
    if(!cp.checkValidity()){
      e.preventDefault();
      if (errorMsg) errorMsg.textContent = '⚠️ Código postal no válido.';
      return;
    }

    // anti bots
    if(honeypotBot && honeypotBot.value.trim() !== ""){
      e.preventDefault();
      if (errorMsg) errorMsg.textContent = '⚠️ Error de validación.';
      return;
    }

    // si todo bien:
    if (errorMsg) errorMsg.textContent = '';
    if (submitBtn){
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando...';
    }
    showLoading();
    //aquí no hacemos e.preventDefault()
    // dejamos que el navegador haga el POST normal a Formspree.
  });

  // acceso directo con #comparativa (abre el modal si llegas con hash)
  if (location.hash === '#comparativa') {
    const btn = document.getElementById('openWizardHero') || document.getElementById('openWizardNav');
    if (btn) btn.click();
  }
});
