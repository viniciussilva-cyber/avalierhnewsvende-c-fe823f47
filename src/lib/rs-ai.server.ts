/** Server-only helper to talk to the Lovable AI Gateway (chat completions). */

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3.7-flash";

export class AiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function chat(system: string, user: string): Promise<string> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new AiError("A IA não está configurada neste projeto.", 401);

  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    if (res.status === 429) {
      throw new AiError("Muitas solicitações à IA agora. Aguarde alguns segundos e tente de novo.", 429);
    }
    if (res.status === 402) {
      throw new AiError("Os créditos de IA do workspace acabaram. Adicione créditos para continuar.", 402);
    }
    if (res.status === 403) {
      throw new AiError("O uso de IA está bloqueado nas configurações do workspace.", 403);
    }
    console.error("[AI] gateway error", res.status, body);
    throw new AiError("A IA não conseguiu responder agora. Tente novamente.", res.status);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content?.trim() ?? "";
  if (!text) throw new AiError("A IA devolveu uma resposta vazia. Tente novamente.", 502);
  return text;
}
