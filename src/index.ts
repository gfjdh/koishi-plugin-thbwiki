import { Context, Schema } from 'koishi'
import { games } from './games'
import { characters } from './characters'
import { spellcards } from './spellcards'
import { music } from './music'

export const name = 'thbwiki'

export const inject = ['database']

export interface Config {}

export const Config: Schema<Config> = Schema.object({})

export interface ThAlias {
  id: number
  targetId: string
  targetType: string
  alias: string
}

declare module 'koishi' {
  interface Tables {
    thAlias: ThAlias
  }
}

export function apply(ctx: Context) {
  ctx.model.extend('thAlias', {
    id: 'unsigned',
    targetId: 'string',
    targetType: 'string',
    alias: 'string'
  }, { autoInc: true })

  const allData = {
    game: games,
    character: characters,
    spellcard: spellcards,
    music: music
  }

  async function search(keyword: string) {
    const results: { type: string, item: any, match: string }[] = []
    const regex = new RegExp(keyword, 'i')

    // Search in static data
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

    // Search in aliases
    const aliases = await ctx.database.get('thAlias', { alias: { $regex: keyword } })
    for (const alias of aliases) {
      const list = allData[alias.targetType]
      const item = list.find(i => i.id === alias.targetId)
      if (item) {
        // Avoid duplicates if already found
        if (!results.find(r => r.item.id === item.id && r.type === alias.targetType)) {
           results.push({ type: alias.targetType, item: item, match: `${alias.alias} -> ${item.name || item.name}` })
        }
      }
    }

    return results
  }

  function renderGame(game: any) {
    return `游戏：${game.name}\nID: ${game.id}\n发售日期：${game.releaseDate}\n简介：${game.description}`
  }

  function renderCharacter(char: any) {
    return `角色：${char.name}\nID: ${char.id}\n别名：${char.alias.join(', ')}\n\n可以使用 th-intro, th-life, th-ability, th-appear, th-rel 查看详细信息。`
  }

  function renderSpellCard(card: any) {
    return `符卡：${card.name}\nID: ${card.id}\n使用者：${card.owner}\n出处：${card.game}\n描述：${card.description}`
  }

  function renderMusic(m: any) {
    return `音乐：${m.name}\nID: ${m.id}\n出处：${m.game}\n描述：${m.description}`
  }

  function renderItem(type: string, item: any) {
    switch (type) {
      case 'game': return renderGame(item)
      case 'character': return renderCharacter(item)
      case 'spellcard': return renderSpellCard(item)
      case 'music': return renderMusic(item)
      default: return '未知类型'
    }
  }

  async function handleCharDetail(keyword: string, field: string, label: string) {
    if (!keyword) return '请输入角色名称'
    const results = (await search(keyword)).filter(r => r.type === 'character')
    if (results.length === 0) return '未找到角色'
    if (results.length === 1) {
        const char = results[0].item
        return `${char.name} - ${label}：\n${char[field]}`
    }
    return '找到多个角色：\n' + results.map(r => r.match).join('\n')
  }

  ctx.command('th-search <keyword:string>', '搜索东方Project相关信息')
    .alias('th')
    .action(async (_, keyword) => {
      if (!keyword) return '请输入搜索关键词'
      const results = await search(keyword)
      if (results.length === 0) return '未找到相关信息'
      if (results.length === 1) {
        return renderItem(results[0].type, results[0].item)
      }
      return '找到多个结果：\n' + results.map(r => `[${r.type}] ${r.match}`).join('\n')
    })

  ctx.command('th-game <keyword:string>', '搜索游戏')
    .action(async (_, keyword) => {
      if (!keyword) return '请输入游戏名称'
      const results = (await search(keyword)).filter(r => r.type === 'game')
      if (results.length === 0) return '未找到游戏'
      if (results.length === 1) return renderGame(results[0].item)
      return '找到多个游戏：\n' + results.map(r => r.match).join('\n')
    })

  ctx.command('th-char <keyword:string>', '搜索角色基本信息')
    .action(async (_, keyword) => {
      if (!keyword) return '请输入角色名称'
      const results = (await search(keyword)).filter(r => r.type === 'character')
      if (results.length === 0) return '未找到角色'
      if (results.length === 1) return renderCharacter(results[0].item)
      return '找到多个角色：\n' + results.map(r => r.match).join('\n')
    })

  ctx.command('th-intro <keyword:string>', '查看角色简介')
    .action((_, keyword) => handleCharDetail(keyword, 'introduction', '简介'))

  ctx.command('th-life <keyword:string>', '查看角色生活状况')
    .action((_, keyword) => handleCharDetail(keyword, 'lifestyle', '生活状况'))

  ctx.command('th-ability <keyword:string>', '查看角色能力')
    .action((_, keyword) => handleCharDetail(keyword, 'abilities', '能力'))

  ctx.command('th-appear <keyword:string>', '查看角色外貌')
    .action((_, keyword) => handleCharDetail(keyword, 'appearance', '外貌'))

  ctx.command('th-rel <keyword:string>', '查看角色人际关系')
    .action((_, keyword) => handleCharDetail(keyword, 'relationships', '人际关系'))

  ctx.command('th-spell <keyword:string>', '搜索符卡')
    .action(async (_, keyword) => {
      if (!keyword) return '请输入符卡名称'
      const results = (await search(keyword)).filter(r => r.type === 'spellcard')
      if (results.length === 0) return '未找到符卡'
      if (results.length === 1) return renderSpellCard(results[0].item)
      return '找到多个符卡：\n' + results.map(r => r.match).join('\n')
    })

  ctx.command('th-music <keyword:string>', '搜索音乐')
    .action(async (_, keyword) => {
      if (!keyword) return '请输入音乐名称'
      const results = (await search(keyword)).filter(r => r.type === 'music')
      if (results.length === 0) return '未找到音乐'
      if (results.length === 1) return renderMusic(results[0].item)
      return '找到多个音乐：\n' + results.map(r => r.match).join('\n')
    })

  ctx.command('th-rand <type:string>', '随机获取信息')
    .action(async (_, type) => {
      if (!type || !['game', 'character', 'spellcard', 'music'].includes(type)) {
        return '请输入类型：game, character, spellcard, music'
      }
      const list = allData[type]
      const item = list[Math.floor(Math.random() * list.length)]
      return renderItem(type, item)
    })

  ctx.command('th-alias-add <target:string> <alias:string>', '添加别名')
    .action(async (_, target, alias) => {
      if (!target || !alias) return '请输入目标名称和别名'
      const results = await search(target)
      if (results.length === 0) return '未找到目标'
      if (results.length > 1) return '找到多个目标，请使用更精确的名称'

      const item = results[0].item
      const type = results[0].type

      const existing = await ctx.database.get('thAlias', { targetId: item.id, alias })
      if (existing.length > 0) return '别名已存在'

      await ctx.database.create('thAlias', {
        targetId: item.id,
        targetType: type,
        alias
      })
      return `已为 ${item.name || item.name} 添加别名 ${alias}`
    })

  ctx.command('th-alias-remove <alias:string>', '删除别名')
    .action(async (_, alias) => {
      if (!alias) return '请输入别名'
      const existing = await ctx.database.get('thAlias', { alias })
      if (existing.length === 0) return '别名不存在'

      await ctx.database.remove('thAlias', { alias })
      return '别名已删除'
    })
}
