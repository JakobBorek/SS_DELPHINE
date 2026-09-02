import nodemailer from 'nodemailer';

/* ============================================================
   SS DELPHINE — ENQUIRY HANDLER
   A Vercel function. The only server-side code on the site.

   The whole flow: a visitor fills the form, this receives it,
   and one email lands in the SS Delphine inbox. Nothing is
   stored, nothing is sent to the visitor, and reply-to carries
   their address so a reply in Gmail reaches them directly.
   ============================================================ */

/* Where enquiries land. The owner reads this inbox. */
const TO = process.env.ENQUIRY_TO || 'ssdelphineyacht@gmail.com';

/* Who they come from. Brevo verifies a single address rather than a whole
   domain, so this is the address that owns the sending account, not the
   yacht's. It is only ever seen in the owner's inbox: the visitor is never
   emailed. Set ENQUIRY_FROM to the address verified with the provider. */
const FROM_ADDRESS = process.env.ENQUIRY_FROM || '';
const FROM_NAME = 'SS Delphine Enquiries';

const SITE = process.env.SITE_ORIGIN || 'https://ss-delphine.vercel.app';

/* Six colours, matching css/tokens.css. Email clients have no
   custom properties, so the values are repeated here by necessity. */
const NAVY_DEEP = '#0A1628';
const NAVY = '#12213A';
const CREAM = '#F2EDE3';
const CREAM_MUTED = '#A8B0BE';
const GOLD = '#C7A24C';

const LIMITS = { name: 120, email: 200, telephone: 60, dates: 120, interest: 40, message: 4000 };

const INTERESTS = {
  'private-charter': 'Private charter',
  'quayside-event': 'Quayside event',
  other: 'Other enquiry'
};

const escape = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

/* A header injection guard. A newline in the reply-to address would let a
   sender append headers of their own. */
const singleLine = (value) => String(value ?? '').replace(/[\r\n]+/g, ' ').trim();

const looksLikeEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

/* ---------- The email ----------
   Tables and inline styles, because Gmail strips <style> blocks and
   Outlook renders with Word. This is not how the site is built; it is
   how email has to be built. */
const render = (data, meta) => {
  const row = (label, value) => value
    ? `<tr>
         <td style="padding:0 0 4px;font:400 11px/1.5 'Courier New',Courier,monospace;letter-spacing:0.16em;text-transform:uppercase;color:${CREAM_MUTED};">${escape(label)}</td>
       </tr>
       <tr>
         <td style="padding:0 0 22px;font:400 16px/1.5 Helvetica,Arial,sans-serif;color:${CREAM};">${escape(value).replace(/\n/g, '<br>')}</td>
       </tr>`
    : '';

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Charter enquiry</title></head>
<body style="margin:0;padding:0;background:${NAVY_DEEP};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${NAVY_DEEP};">
  <tr><td align="center" style="padding:32px 16px;">

    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%;border:1px solid ${GOLD};background:${NAVY};">

      <tr><td style="padding:36px 40px 0;">
        <p style="margin:0 0 10px;font:400 11px/1.5 'Courier New',Courier,monospace;letter-spacing:0.16em;text-transform:uppercase;color:${GOLD};">Charter enquiry</p>
        <h1 style="margin:0;font:600 30px/1.15 Helvetica,Arial,sans-serif;letter-spacing:-0.02em;color:${CREAM};">${escape(data.name)}</h1>
      </td></tr>

      <tr><td style="padding:26px 40px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr><td style="border-top:1px solid ${GOLD};font-size:0;line-height:0;">&nbsp;</td></tr>
        </table>
      </td></tr>

      <tr><td style="padding:26px 40px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          ${row('Email', data.email)}
          ${row('Telephone', data.telephone)}
          ${row('Preferred dates', data.dates)}
          ${row('Interest', INTERESTS[data.interest] || data.interest)}
          ${row('Message', data.message)}
        </table>
      </td></tr>

      <tr><td style="padding:6px 40px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr><td style="border-top:1px solid ${GOLD};font-size:0;line-height:0;">&nbsp;</td></tr>
        </table>
      </td></tr>

      <tr><td align="center" style="padding:30px 40px 34px;">
        <img src="${SITE}/assets/logo/ss-delphine-lockup-email.png" width="150" height="93"
             alt="SS Delphine" style="display:block;border:0;width:150px;height:auto;">
        <p style="margin:18px 0 0;font:400 11px/1.6 'Courier New',Courier,monospace;letter-spacing:0.16em;text-transform:uppercase;color:${CREAM_MUTED};">
          Reply to this message to answer ${escape(data.name)} directly
        </p>
      </td></tr>

    </table>

    <p style="margin:18px 0 0;font:400 11px/1.6 'Courier New',Courier,monospace;letter-spacing:0.12em;color:${CREAM_MUTED};">
      Sent from the enquiry form &middot; ${escape(meta.at)}
    </p>

  </td></tr>
</table>
</body></html>`;
};

const plain = (data, meta) => [
  `CHARTER ENQUIRY`,
  ``,
  `Name       ${data.name}`,
  `Email      ${data.email}`,
  data.telephone ? `Telephone  ${data.telephone}` : null,
  data.dates ? `Dates      ${data.dates}` : null,
  `Interest   ${INTERESTS[data.interest] || data.interest}`,
  ``,
  `Message`,
  data.message,
  ``,
  `Reply to this message to answer ${data.name} directly.`,
  `Sent from the enquiry form on ${meta.at}.`
].filter((line) => line !== null).join('\n');

/* ---------- Providers ----------
   Brevo verifies a single sender address, so it can send to the yacht's inbox
   without anyone owning that inbox doing anything, and without DNS. Resend
   needs a verified domain before it will send to an arbitrary recipient, so it
   is the better choice later, once ssdelphineyacht.com is set up. Whichever
   key is present is the one used. */
const pickProvider = () => {
  /* Gmail over SMTP. No third-party account, no company details to invent:
     the sending address is a Gmail the developer already owns, authorised with
     an app password rather than the account password. Google caps this at
     roughly 500 messages a day, which is far beyond what a charter site sends.
     Port 465 is implicit TLS, so there is no STARTTLS upgrade to negotiate. */
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    return {
      name: 'Gmail',
      send: async (m) => {
        const post = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: process.env.GMAIL_USER,
            /* Google prints app passwords in groups of four; the spaces are
               presentational and must not be sent. */
            pass: process.env.GMAIL_APP_PASSWORD.replace(/\s+/g, '')
          }
        });
        await post.sendMail({
          from: { name: FROM_NAME, address: process.env.GMAIL_USER },
          to: TO,
          replyTo: { name: m.replyToName, address: m.replyTo },
          subject: m.subject,
          html: m.html,
          text: m.text
        });
        /* nodemailer throws on failure, so reaching here is success. The
           shape matches the fetch-based providers below. */
        return { ok: true };
      }
    };
  }

  if (process.env.BREVO_API_KEY) {
    return {
      name: 'Brevo',
      send: (m) => fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json',
          accept: 'application/json'
        },
        body: JSON.stringify({
          sender: { email: FROM_ADDRESS, name: FROM_NAME },
          to: [{ email: TO }],
          replyTo: { email: m.replyTo, name: m.replyToName },
          subject: m.subject,
          htmlContent: m.html,
          textContent: m.text
        })
      })
    };
  }

  if (process.env.RESEND_API_KEY) {
    return {
      name: 'Resend',
      send: (m) => fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: `${FROM_NAME} <${FROM_ADDRESS || 'onboarding@resend.dev'}>`,
          to: [TO],
          reply_to: m.replyTo,
          subject: m.subject,
          html: m.html,
          text: m.text
        })
      })
    };
  }

  return null;
};

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const provider = pickProvider();
  if (!provider) {
    console.error('No mail provider is configured (GMAIL_USER + GMAIL_APP_PASSWORD, BREVO_API_KEY, or RESEND_API_KEY)');
    return response.status(503).json({ error: 'The enquiry form is not configured yet.' });
  }

  let body = request.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = null; }
  }
  if (!body || typeof body !== 'object') {
    return response.status(400).json({ error: 'Please check the form and try again.' });
  }

  /* A field no person can see and no person fills in. Bots fill everything. */
  if (String(body.company || '').trim()) {
    return response.status(200).json({ ok: true });
  }

  const data = {};
  for (const [field, limit] of Object.entries(LIMITS)) {
    data[field] = String(body[field] ?? '').trim().slice(0, limit);
  }

  if (!data.name || !data.email || !data.message) {
    return response.status(400).json({ error: 'Please complete the required fields.' });
  }
  if (!looksLikeEmail(data.email)) {
    return response.status(400).json({ error: 'That email address does not look right.' });
  }

  const meta = {
    at: new Date().toLocaleString('en-GB', {
      timeZone: 'Europe/Monaco', dateStyle: 'full', timeStyle: 'short'
    })
  };

  const message = {
    replyTo: singleLine(data.email),
    replyToName: singleLine(data.name),
    subject: `Charter enquiry: ${singleLine(data.name)}`,
    html: render(data, meta),
    text: plain(data, meta)
  };

  try {
    const sent = await provider.send(message);
    if (!sent.ok) {
      console.error(`${provider.name} rejected the message`, sent.status, await sent.text());
      return response.status(502).json({ error: 'The message could not be sent. Please email us directly.' });
    }
  } catch (error) {
    console.error(`${provider.name} request failed`, error);
    return response.status(502).json({ error: 'The message could not be sent. Please email us directly.' });
  }

  return response.status(200).json({ ok: true });
}
