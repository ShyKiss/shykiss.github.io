
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const USER = 'beerymaid';
const PROFILE = `https://steamcommunity.com/id/${USER}`;
const OUT = fileURLToPath(new URL('../res/steam.js', import.meta.url));

const xml = await (await fetch(`${PROFILE}/?xml=1`)).text();
const html = await (await fetch(PROFILE)).text();

function tag(name, src) {
  const m = src.match(new RegExp(`<${name}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${name}>`));
  return m ? m[1].trim() : null;
}

const mostPlayed = [...xml.matchAll(/<mostPlayedGame>([\s\S]*?)<\/mostPlayedGame>/g)]
  .slice(0, 3)
  .map(([, block]) => ({
    name: tag('gameName', block),
    hoursLast2Weeks: Number(tag('hoursPlayed', block)) || 0,
    hoursTotal: Number((tag('hoursOnRecord', block) || '0').replace(/,/g, '')) || 0
  }));

const data = {
  updatedAt: new Date().toISOString(),
  name: tag('steamID', xml),
  profileUrl: PROFILE,
  avatar: tag('avatarFull', xml),
  onlineState: tag('onlineState', xml),
  statusMessage: tag('stateMessage', xml),
  level: html.match(/friendPlayerLevelNum">(\d+)/)?.[1] ?? null,
  games: html.match(/(\d[\d,]*)\s*games/)?.[1] ?? null,
  hoursLast2Weeks: Number(tag('hoursPlayed2Wk', xml)) || 0,
  mostPlayed
};

if (!data.name || !data.avatar) {
  throw new Error('Steam profile did not return expected fields; res/steam.js left unchanged');
}

await writeFile(OUT, 'window.STEAM_DATA = ' + JSON.stringify(data, null, 2) + ';\n');
console.log(`Wrote ${OUT}: ${data.name}, level ${data.level}, ${data.games} games`);
