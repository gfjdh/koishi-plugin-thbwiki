import { Context, Logger } from 'koishi'
import { getAliasesByKeyword } from './database'
import { games } from './games'
import { characters } from './characters'
import { spellcards } from './spellcards'
import { music } from './music'

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // 转义正则表达式中的特殊字符
}

const logger = new Logger('thbwiki');

export const allData = {
  game: games,
  character: characters,
  spellcard: spellcards,
  music: music
}

export async function search(ctx: Context, keyword: string) {
  logger.info(`Searching for keyword: ${keyword}`);
  const keywords = keyword.trim().split(' ');
  const results: { type: string, item: any, match: string }[] = [];
  const regexes = keywords.map(keyword => new RegExp(escapeRegExp(keyword), 'i'));

  for (const game of games) {
    if (regexes.every(regex => regex.test(game.name) || regex.test(game.id))) {
      results.push({ type: 'game', item: game, match: game.name });
    }
  }
  for (const char of characters) {
    if (regexes.every(regex => regex.test(char.name) || regex.test(char.id) || char.alias.some(a => regex.test(a)))) {
      results.push({ type: 'character', item: char, match: char.name });
    }
  }

  const aliases = await getAliasesByKeyword(ctx, keywords.join(' '));
  for (const alias of aliases) {
    const list = allData[alias.targetType];
    const item = list.find(i => i.id === alias.targetId);
    if (item) {
      if (!results.find(r => r.item.id === item.id && r.type === alias.targetType)) {
        results.push({ type: alias.targetType, item: item, match: `${alias.alias} -> ${item.name || item.name}` });
      }
    }
  }
  
  for (const card of spellcards) {
    if (regexes.every(regex => regex.test(card.name) || regex.test(card.id) || regex.test(card.owner) || regex.test(card.game))) {
      results.push({ type: 'spellcard', item: card, match: card.name });
    }
  }
  for (const m of music) {
    if (regexes.every(regex => regex.test(m.name) || regex.test(m.id) || regex.test(m.game) || regex.test(m.description))) {
      results.push({ type: 'music', item: m, match: m.name });
    }
  }

  if (results.length === 0) {
    for (const char of characters) {
      if (regexes.every(regex => regex.test(char.introduction) || regex.test(char.abilities) || regex.test(char.relationships)|| regex.test(char.appearance)|| regex.test(char.lifestyle))) {
        results.push({ type: 'character', item: char, match: char.name });
    }
  }
  }

  return results;
}

export function renderGame(game: any) {
  return `游戏：${game.name}\nID: ${game.id}\n发售日期：${game.releaseDate}\n简介：${game.description}`
}

export function renderCharacter(char: any) {
  return `角色：${char.name}\n原名: ${char.id}\n别名：${char.alias.join(', ')}\n\n可以使用 角色简介、角色生活、角色能力、角色外貌、角色人际、符卡列表 查看详细信息。\n例如：“角色简介 ${char.name}”`
}

export function renderSpellCard(card: any) {
  return `符卡：${card.name}\n原名: ${card.id}\n使用者：${card.owner}\n难度：${card.difficulty}\n出处：${card.game}`
}

export function renderMusic(m: any) {
  return `音乐：${m.name}\n原名: ${m.id}\n出处：${m.game}\n描述：${m.description}`
}

export function renderItem(type: string, item: any) {
  switch (type) {
    case 'game': return renderGame(item)
    case 'character': return renderCharacter(item)
    case 'spellcard': return renderSpellCard(item)
    case 'music': return renderMusic(item)
    default: return '未知类型'
  }
}
