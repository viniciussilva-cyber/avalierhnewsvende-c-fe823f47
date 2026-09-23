import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { leaderEmail, employeeName, profileLabel, reportUrl } = await req.json();

    if (!leaderEmail) {
      return new Response(JSON.stringify({ error: "E-mail do líder não informado." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Cores oficiais dos perfis comportamentais
    const profileColors: Record<string, string> = {
      EXECUTOR: "#16a34a",     // Verde
      COMUNICADOR: "#ea580c",  // Laranja
      PLANEJADOR: "#2563eb",   // Azul
      ANALISTA: "#7c3aed",     // Roxo
    };

    const color = profileColors[profileLabel?.toUpperCase()] || "#ff0068";

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "VENDE-C Profiler <onboarding@resend.dev>", // Altere para relatorios@mail.vende-c.com após a verificação do DNS
        to: [leaderEmail],
        subject: `📊 Novo Relatório Comportamental: ${employeeName}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0a0a0a; margin: 0; padding: 40px 20px; }
                .container { max-width: 580px; margin: 0 auto; background-color: #141414; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5); border: 1px solid #262626; }
                .header { padding: 40px 40px 20px 40px; text-align: left; }
                .logo-text { color: #ffffff; font-size: 26px; font-weight: 900; letter-spacing: -0.5px; margin: 0; }
                .logo-pink { color: #ff0068; }
                .header-subtitle { color: #ffffff; font-size: 14px; font-weight: 600; margin-top: 6px; }
                .header-subtitle span { color: #ff0068; }
                .content { padding: 30px 40px 40px 40px; }
                .greeting { font-size: 18px; font-weight: 700; color: #ffffff; margin-top: 0; margin-bottom: 12px; }
                .text { font-size: 15px; color: #a1a1aa; line-height: 1.6; margin-bottom: 28px; }
                .profile-card { background-color: #1f1f1f; border-radius: 16px; padding: 24px; border: 1px solid #2e2e2e; text-align: center; margin-bottom: 32px; }
                .profile-tag { display: inline-block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; color: #71717a; margin-bottom: 8px; }
                .profile-name { font-size: 28px; font-weight: 900; color: ${color}; margin: 0; letter-spacing: -0.5px; }
                .button-container { text-align: center; margin-bottom: 12px; }
                .btn { display: inline-block; background-color: #ff0068; color: #ffffff !important; font-size: 15px; font-weight: 700; padding: 16px 36px; border-radius: 14px; text-decoration: none; box-shadow: 0 4px 14px rgba(255, 0, 104, 0.4); }
                .footer { background-color: #0f0f0f; padding: 32px 40px; border-top: 1px solid #262626; font-size: 12px; color: #71717a; }
                .social-links { margin-top: 16px; margin-bottom: 16px; }
                .social-btn { display: inline-block; background-color: #ff0068; color: #ffffff; width: 32px; height: 32px; line-height: 32px; text-align: center; border-radius: 8px; text-decoration: none; font-weight: bold; margin-right: 8px; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 class="logo-text">VENDE<span class="logo-pink">-C</span></h1>
                  <p class="header-subtitle">A maior escola de vendas <span>do Brasil</span></p>
                </div>

                <div class="content">
                  <h2 class="greeting">Olá! 👋</h2>
                  <p class="text">
                    O colaborador <strong style="color: #ffffff;">${employeeName}</strong> concluiu o mapeamento do seu perfil comportamental. O relatório detalhado já está disponível para sua análise.
                  </p>

                  <div class="profile-card">
                    <span class="profile-tag">PERFIL PREDOMINANTE MAPEADO</span>
                    <h3 class="profile-name">${profileLabel}</h3>
                  </div>

                  <div class="button-container">
                    <a href="${reportUrl}" class="btn" target="_blank">Acessar Relatório Completo →</a>
                  </div>
                </div>

                <div class="footer">
                  <div class="social-links">
                    <a href="https://youtube.com" class="social-btn" target="_blank">▶</a>
                    <a href="https://instagram.com" class="social-btn" target="_blank">📷</a>
                    <a href="https://linkedin.com" class="social-btn" target="_blank">in</a>
                  </div>
                  <p style="margin: 0; color: #a1a1aa; font-weight: 500;">VENDE-C — Plataforma de Recursos Humanos</p>
                  <p style="margin: 4px 0 0 0; font-size: 11px;">Este é um e-mail automático disparado pelo sistema.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      }),
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
