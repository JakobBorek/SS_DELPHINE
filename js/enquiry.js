/* ============================================================
   SS DELPHINE — ENQUIRY FORM
   Progressive enhancement. Without JavaScript the form is a plain
   POST to /api/enquiry and the browser navigates; with it, the
   send happens in place and the card answers where it stands.
   ============================================================ */
(() => {
  'use strict';

  const form = document.querySelector('[data-enquiry]');
  if (!form) return;

  const status = form.querySelector('[data-enquiry-status]');
  const button = form.querySelector('button[type="submit"]');
  const original = button ? button.textContent : '';

  const say = (message, state) => {
    if (!status) return;
    status.textContent = message;
    status.dataset.state = state;
  };

  form.addEventListener('submit', async (event) => {
    if (!form.reportValidity()) return;
    event.preventDefault();

    const payload = {};
    for (const [field, value] of new window.FormData(form).entries()) {
      payload[field] = value;
    }

    if (button) { button.disabled = true; button.textContent = 'Sending'; }
    say('', '');

    try {
      const answer = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await answer.json().catch(() => ({}));

      if (answer.ok && result.ok) {
        /* The form is replaced rather than reset: a cleared form invites a
           second send, and there is nothing more for the reader to do. */
        form.querySelector('fieldset')?.remove();
        say('Thank you. Your enquiry has reached us and we will reply to the address you gave.', 'sent');
        return;
      }
      say(result.error || 'The message could not be sent. Please email us directly.', 'failed');
    } catch {
      say('The message could not be sent. Please check your connection, or email us directly.', 'failed');
    }

    if (button) { button.disabled = false; button.textContent = original; }
  });
})();
