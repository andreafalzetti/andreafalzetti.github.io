// Pagine interne: i tasti si premono e il liquido oscilla; il pulsante copia l'email.
(() => {
  'use strict';
  document.querySelectorAll('.cap').forEach(cap => {
    const host = cap.closest('a') || cap;
    host.addEventListener('pointerdown', () => {
      cap.classList.remove('slosh'); void cap.getBoundingClientRect(); cap.classList.add('slosh');
    });
  });
  const copy = document.getElementById('copy'), mail = document.getElementById('mail');
  if (!copy || !mail) return;
  copy.addEventListener('click', () => {
    const done = txt => { copy.textContent = txt; setTimeout(() => { copy.textContent = 'Copy'; }, 1800); };
    const select = () => { const r = document.createRange(); r.selectNodeContents(mail); const s = getSelection(); s.removeAllRanges(); s.addRange(r); done('Selected'); };
    try { navigator.clipboard.writeText(mail.textContent.trim()).then(() => done('Copied'), select); } catch (e) { select(); }
  });
})();
