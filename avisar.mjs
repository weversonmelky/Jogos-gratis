import fs from "node:fs";

const API = "https://www.gamerpower.com/api/giveaways?platform=pc&type=game";
const HOOK = process.env.GOLIVE_WEBHOOK;
const ARQ = "enviados.json";

const enviados = fs.existsSync(ARQ)
  ? JSON.parse(fs.readFileSync(ARQ, "utf8"))
  : [];

const res = await fetch(API, { headers: { "User-Agent": "Mozilla/5.0" } });
const jogos = await res.json();

if (!Array.isArray(jogos)) {
  console.log("Nenhum jogo grátis agora:", jogos);
  process.exit(0);
}

for (const j of jogos.slice(0, 5)) {
  if (enviados.includes(j.id)) continue;

  const r = await fetch(HOOK, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: `🎮 Jogo grátis: ${j.title}`,
      embeds: [{
        title: `🎮 ${j.title}`,
        url: j.open_giveaway_url,
        description: `Valor: ${j.worth}\nAté: ${j.end_date}`,
        image: { url: j.image },
      }],
    }),
  });

  console.log(j.title, "->", r.status, await r.text());

  if (r.ok) {
    enviados.push(j.id);
  } else {
    process.exitCode = 1;
  }
}

fs.writeFileSync(ARQ, JSON.stringify(enviados.slice(-200)));
