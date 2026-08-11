import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => null);
  if (!body) {
    return new Response(JSON.stringify({ error: 'Payload inválido' }), { status: 400 });
  }

  const { nombre, email, empresa, telefono, mensaje } = body;

  if (!nombre?.trim() || !email?.trim() || !mensaje?.trim()) {
    return new Response(JSON.stringify({ error: 'Nombre, email y mensaje son requeridos' }), { status: 422 });
  }

  if (!import.meta.env.RESEND_API_KEY) {
    console.log('[DEV] Formulario recibido (sin RESEND_API_KEY):', { nombre, email, empresa, telefono, mensaje });
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const resend = new Resend(import.meta.env.RESEND_API_KEY);

  await resend.emails.send({
    from: 'Prospectum AI Web <web@prospectumai.com>',
    to: 'paisa@prospectumai.com',
    replyTo: email,
    subject: `Contacto prospectum.mx — ${nombre}`,
    text: [
      `Nombre: ${nombre}`,
      `Email: ${email}`,
      `Empresa: ${empresa || '—'}`,
      `WhatsApp: ${telefono || '—'}`,
      '',
      'Mensaje:',
      mensaje,
    ].join('\n'),
  });

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
