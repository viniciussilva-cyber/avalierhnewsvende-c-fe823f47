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

    // Cores específicas para cada perfil comportamental
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
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 40px 20px; }
                .container { max-width: 580px; margin: 0 auto; background-color: #0f172a; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3); border: 1px solid #1e293b; }
                .header { background-color: #ff0068; padding: 32px 40px; text-align: center; }
                .header-title { color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; margin: 0; }
                .header-subtitle { color: rgba(255, 255, 255, 0.85); font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600; margin-bottom: 6px; }
                .content { padding: 40px; }
                .greeting { font-size: 18px; font-weight: 700; color: #ffffff; margin-top: 0; margin-bottom: 12px; }
                .text { font-size: 15px; color: #94a3b8; line-height: 1.6; margin-bottom: 28px; }
                .profile-card { background-color: #1e293b; border-radius: 16px; padding: 24px; border: 1px solid #334155; text-align: center; margin-bottom: 32px; }
                .profile-tag { display: inline-block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; color: #94a3b8; margin-bottom: 8px; }
                .profile-name { font-size: 26px; font-weight: 900; color: ${color}; margin: 0; letter-spacing: -0.5px; }
                .button-container { text-align: center; margin-bottom: 12px; }
                .btn { display: inline-block; background-color: #ff0068; color: #ffffff !important; font-size: 15px; font-weight: 700; padding: 16px 36px; border-radius: 14px; text-decoration: none; box-shadow: 0 4px 14px rgba(255, 0, 104, 0.4); }
                .footer { background-color: #020617; padding: 24px 40px; text-align: center; border-top: 1px solid #1e293b; font-size: 12px; color: #64748b; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <div class="header-subtitle">PLATAFORMA DE RECURSOS HUMANOS</div>
                  <h1 class="header-title">VENDE-C Profiler</h1>
                </div>

                <div class="content">
                  <h2 class="greeting">Olá! 👋</h2>
                  <p class="text">
                    O colaborador <strong style="color: #ffffff;">${employeeName}</strong> concluiu o mapeamento do seu perfil comportamental. O relatório detalhado já está disponível para sua análise.
                  </p>

                  <div class="profile-card">
                    <span class="profile-tag">Perfil Predominante Mapeado</span>
                    <h3 class="profile-name">${profileLabel}</h3>
                  </div>

                  <div class="button-container">
                    <a href="${reportUrl}" class="btn" target="_blank">Acessar Relatório Completo →</a>
                  </div>
                </div>

                <div class="footer">
                  <p style="margin: 0; font-weight: 600; color: #94a3b8;">VENDE-C — A maior escola de vendas do Brasil</p>
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
