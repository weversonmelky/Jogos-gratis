import fs from "node:fs";

const API = "https://www.gamerpower.com/api/giveaways?platform=pc&type=game";
const HOOK = process.env.GOLIVE_WEBHOOK;
const ARQ = "enviados.json";

const FRASES = [
  "Mais um tesouro de graça? Já é meu.",
  "Nenhuma masmorra me segurou. Um preço também não vai.",
  "Eu pego o loot, vocês pegam o jogo. Justo.",
  "Isso aqui é de graça. Só um tolo deixaria passar.",
  "O rei dos saqueadores avisa: resgata antes que acabe.",
];

const enviados = fs.existsSync(ARQ)
  ? JSON.parse(fs.readFileSync(ARQ, "utf8"))
  : [];

const res = await fetch(API, { headers: { "User-Agent": "Mozilla/5.0" } });
const jogos = await res.json();

if (!Array.isArray(jogos)) {
  console.log("Nenhum jogo grátis agora:", jogos);
  process.exit(0);
}

let cambio = null;
try {
  const c = await fetch("https://economia.awesomeapi.com.br/json/last/USD-BRL");
  cambio = parseFloat((await c.json()).USDBRL.bid);
} catch (e) {
  console.log("Câmbio indisponível:", e.message);
}

function valorEmReais(worth) {
  const usd = parseFloat(String(worth).replace(/[^0-9.]/g, ""));
  if (!cambio || isNaN(usd)) return String(worth);
  return (usd * cambio).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

for (const j of jogos.slice(0, 5)) {
  if (enviados.includes(j.id)) continue;

  const frase = FRASES[Math.floor(Math.random() * FRASES.length)];

  const r = await fetch(HOOK, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "Seo Joo-Heon",
      content: frase,
      embeds: [{
        title: `🎮 ${j.title}`,
        url: j.open_giveaway_url,
        color: 0x7c3aed,
                description: `Valor: ${valorEmReais(j.worth)}\nAté: ${j.end_date}`,
        fields: [
          { name: "Categoria", value: String(j.type), inline: true },
          { name: "Plataformas", value: String(j.platforms), inline: true },
        ],
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
