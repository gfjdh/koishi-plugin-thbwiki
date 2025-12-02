import { Context } from 'koishi'
import { getAliasesByKeyword } from './database'
import { games } from './games'
import { characters } from './characters'
import { spellcards } from './spellcards'
import { music } from './music'

export const allData = {
  game: games,
  character: characters,
  spellcard: spellcards,
  music: music
}

export async function search(ctx: Context, keyword: string) {
  const results: { type: string, item: any, match: string }[] = []
  const regex = new RegExp(keyword, 'i')

  for (const game of games) {
    if (regex.test(game.name) || regex.test(game.id)) {
      results.push({ type: 'game', item: game, match: game.name })
    }
  }
  for (const char of characters) {
    if (regex.test(char.name) || regex.test(char.id) || char.alias.some(a => regex.test(a))) {
      results.push({ type: 'character', item: char, match: char.name })
    }
  }
  for (const card of spellcards) {
    if (regex.test(card.name) || regex.test(card.id)) {
      results.push({ type: 'spellcard', item: card, match: card.name })
    }
  }
  for (const m of music) {
    if (regex.test(m.name) || regex.test(m.id)) {
      results.push({ type: 'music', item: m, match: m.name })
    }
  }

  const aliases = await getAliasesByKeyword(ctx, keyword)
  for (const alias of aliases) {
    const list = allData[alias.targetType]
    const item = list.find(i => i.id === alias.targetId)
    if (item) {
      if (!results.find(r => r.item.id === item.id && r.type === alias.targetType)) {
         results.push({ type: alias.targetType, item: item, match: `${alias.alias} -> ${item.name || item.name}` })
      }
    }
  }
  return results
}

export function renderGame(game: any) {
  return `游戏：${game.name}\nID: ${game.id}\n发售日期：${game.releaseDate}\n简介：${game.description}`
}

export function renderCharacter(char: any) {
  return `角色：${char.name}\nID: ${char.id}\n别名：${char.alias.join(', ')}\n\n可以使用 角色简介、角色生活、角色能力、角色外貌、角色人际 查看详细信息。\n例如：“角色简介 ${char.name}”`
}

export function renderSpellCard(card: any) {
  return `符卡：${card.name}\nID: ${card.id}\n使用者：${card.owner}\n出处：${card.game}\n描述：${card.description}`
}

export function renderMusic(m: any) {
  return `音乐：${m.name}\nID: ${m.id}\n出处：${m.game}\n描述：${m.description}`
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
