import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const UID = '1504611737';
const API = `https://enka.network/api/zzz/uid/${UID}/`;
const OUT = fileURLToPath(new URL('../res/hoyolab.js', import.meta.url));

const res = await fetch(API, {
  headers: { 'User-Agent': 'beerymaid-site (+https://github.com/Beerymaid)', Accept: 'application/json' }
});
if (!res.ok) {
  throw new Error(`enka.network returned ${res.status}; res/hoyolab.js left unchanged`);
}
const json = await res.json();

const profile = json.PlayerInfo?.SocialDetail?.ProfileDetail;
if (!profile?.Nickname) {
  throw new Error('enka.network returned no profile nickname; res/hoyolab.js left unchanged');
}

const DOCS = 'https://raw.githubusercontent.com/EnkaNetwork/API-docs/master/store/zzz';
const [avatars, medalDict, locs] = await Promise.all(
  ['avatars.json', 'medals.json', 'locs.json'].map((f) => fetch(`${DOCS}/${f}`).then((r) => r.json()))
);

const ICON_OVERRIDES = { 2021: '/ui/zzz/IconInterKnotRole0041.png' };
const iconPath = avatars[profile.AvatarId]?.CircleIcon ?? ICON_OVERRIDES[profile.AvatarId];

const medals = (json.PlayerInfo.SocialDetail.MedalList ?? []).slice(0, 3).map((m) => {
  const meta = medalDict[m.MedalIcon] ?? {};
  return {
    count: m.Value,
    name: locs.ru?.[meta.Name] ?? meta.Name ?? '',
    icon: meta.Icon ? `https://enka.network${meta.Icon}` : null,
    prefixIcon: meta.PrefixIcon ? `https://enka.network${meta.PrefixIcon}` : null
  };
});

const data = {
  updatedAt: new Date().toISOString(),
  profileUrl: `https://enka.network/zzz/${UID}`,
  game: 'Zenless Zone Zero',
  nickname: profile.Nickname,
  uid: UID,
  region: json.region ?? null,
  level: profile.Level ?? null,
  description: json.PlayerInfo.SocialDetail.Desc ?? '',
  avatar: iconPath ? `https://enka.network${iconPath}` : null,
  medals
};

await writeFile(OUT, 'window.HOYOLAB_DATA = ' + JSON.stringify(data, null, 2) + ';\n');
console.log(`Wrote ${OUT}: ${data.nickname}, level ${data.level}`);
