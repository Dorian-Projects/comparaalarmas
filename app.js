const $ = (s, c=document) => c.querySelector(s);

document.addEventListener('DOMContentLoaded', () => {
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const modal = document.getElementById('wizardModal');
  const closeBtn = document.getElementById('closeWizard');
  const form = document.getElementById('wizardForm');
  const errorMsg = document.getElementById('errorMsg');
  const loading = document.getElementById('loadingOverlay');

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

  // pequeña validación antes de enviar, y spinner
  form.addEventListener('submit', e => {
    const nombre   = form.querySelector('#fnombre');
    const telefono = form.querySelector('#ftelefono');
    const ciudad   = form.querySelector('#fciudad');
    const honey    = form.querySelector('input[name="correo"]');
    const submitBtn = form.querySelector('button[type="submit"]');

    if (!nombre.value.trim() || !telefono.value.trim() || !ciudad.value.trim()){
      e.preventDefault();
      if (errorMsg) errorMsg.textContent = '⚠️ Rellena nombre, teléfono y tu zona.';
      return;
    }
    if (!telefono.checkValidity()){
      e.preventDefault();
      if (errorMsg) errorMsg.textContent = '⚠️ Revisa el teléfono.';
      return;
    }
    if (honey && honey.value.trim() !== ""){
      e.preventDefault();
      if (errorMsg) errorMsg.textContent = '⚠️ Error de validación.';
      return;
    }

    // Si todo OK:
    if (errorMsg) errorMsg.textContent = '';
    if(submitBtn){
      submitBtn.disabled = true;
      submitBtn.textContent = 'Buscando mejor oferta...';
    }
    showLoading();
    // No hacemos preventDefault aquí → el form se enviará a lead.php
    // y luego lead.php redirige a gracias.html
  });

  // acceso directo con hash #comparativa
  if (location.hash === '#comparativa') {
    const btn = document.getElementById('openWizardHero') || document.getElementById('openWizardNav');
    if (btn) btn.click();
  }
});
