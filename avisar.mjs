import fs from "node:fs";

const API = "https://www.gamerpower.com/api/giveaways?platform=pc&type=game";
const HOOK = process.env.DISCORD_WEBHOOK;
const ARQ = "enviados.json";

const enviados = fs.existsSync(ARQ)
  ? JSON.parse(fs.readFileSync(ARQ, "utf8"))
  : [];

const res = await fetch(API, { headers: { "User-Agent": "Mozilla/5.0" } });
const jogos = await res.json();

for (const j of jogos.slice(0, 5)) {
  if (enviados.includes(j.id)) continue;

  await fetch(HOOK, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      embeds: [{
        title: `🎮 ${j.title}`,
        url: j.open_giveaway_url,
        description: `Valor: ${j.worth}\nAté: ${j.end_date}`,
        image: { url: j.image },
      }],
    }),
  });

  enviados.push(j.id);
}

fs.writeFileSync(ARQ, JSON.stringify(enviados.slice(-200)));
