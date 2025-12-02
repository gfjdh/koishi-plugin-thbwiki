import { Context, Schema } from 'koishi'
import { extendDatabase, getAliasByTargetAndName, createAlias, getAliasByName, removeAliasByName } from './database'
import { search, renderItem, renderGame, renderCharacter, renderSpellCard, renderMusic, allData } from './utils'

export const name = 'thbwiki'
export const inject = ['database']
export interface Config {}
export const Config: Schema<Config> = Schema.object({})

export * from './database'

export function apply(ctx: Context) {
  extendDatabase(ctx)

  const thIntro = (_: any, keyword: string) => handleCharDetail(keyword, 'introduction', '简介')
  const thLife = (_: any, keyword: string) => handleCharDetail(keyword, 'lifestyle', '生活状况')
  const thAbility = (_: any, keyword: string) => handleCharDetail(keyword, 'abilities', '能力')
  const thAppear = (_: any, keyword: string) => handleCharDetail(keyword, 'appearance', '外貌')
  const thRel = (_: any, keyword: string) => handleCharDetail(keyword, 'relationships', '人际关系')

  ctx.command('thbwiki/th-search <keyword:string>', '搜索东方Project相关信息')
    .alias('thb').alias('东方百科')
    .action(thSearch)

  ctx.command('thbwiki/th-game <keyword:string>', '搜索游戏')
    .alias('东方官作')
    .action(thGame)

  ctx.command('thbwiki/th-char <keyword:string>', '搜索角色基本信息')
    .alias('东方角色')
    .action(thChar)

  ctx.command('thbwiki/th-intro <keyword:string>', '查看角色简介')
    .alias('角色简介')
    .action(thIntro)

  ctx.command('thbwiki/th-life <keyword:string>', '查看角色生活状况')
    .alias('角色生活')
    .action(thLife)

  ctx.command('thbwiki/th-ability <keyword:string>', '查看角色能力')
    .alias('角色能力')
    .action(thAbility)

  ctx.command('thbwiki/th-appear <keyword:string>', '查看角色外貌')
    .alias('角色外貌')
    .action(thAppear)

  ctx.command('thbwiki/th-rel <keyword:string>', '查看角色人际关系')
    .alias('角色人际')
    .action(thRel)

  ctx.command('thbwiki/th-spell <keyword:string>', '搜索符卡')
    .alias('符卡信息')
    .action(thSpell)

  ctx.command('thbwiki/th-music <keyword:string>', '搜索音乐')
    .alias('东方音乐')
    .action(thMusic)

  ctx.command('thbwiki/th-rand <type:string>', '随机获取信息')
    .alias('随机thb')
    .action(thRand)

  ctx.command('thbwiki/th-alias-add <target:string> <alias:string>', '添加别名')
    .alias('添加thb别名')
    .action(thAliasAdd)

  ctx.command('thbwiki/th-alias-remove <alias:string>', '删除别名')
    .alias('删除thb别名')
    .action(thAliasRemove)

  async function thSearch(_: any, keyword: string) {
    if (!keyword) return '请输入搜索关键词'
    const results = await search(ctx, keyword)
    if (results.length === 0) return '未找到相关信息'
    if (results.length === 1) {
      return renderItem(results[0].type, results[0].item)
    }
    return '找到多个结果：\n' + results.map(r => `[${r.type}] ${r.match}`).join('\n')
  }

  async function thGame(_: any, keyword: string) {
    if (!keyword) return '请输入游戏名称'
    const results = (await search(ctx, keyword)).filter(r => r.type === 'game')
    if (results.length === 0) return '未找到游戏'
    if (results.length === 1) return renderGame(results[0].item)
    return '找到多个游戏：\n' + results.map(r => r.match).join('\n')
  }

  async function thChar(_: any, keyword: string) {
    if (!keyword) return '请输入角色名称'
    const results = (await search(ctx, keyword)).filter(r => r.type === 'character')
    if (results.length === 0) return '未找到角色'
    if (results.length === 1) return renderCharacter(results[0].item)
    return '找到多个角色：\n' + results.map(r => r.match).join('\n')
  }

  async function handleCharDetail(keyword: string, field: string, label: string) {
    if (!keyword) return '请输入角色名称'
    const results = (await search(ctx, keyword)).filter(r => r.type === 'character')
    if (results.length === 0) return '未找到角色'
    if (results.length === 1) {
        const char = results[0].item
        return `${char.name} - ${label}：\n${char[field]}`
    }
    return '找到多个角色：\n' + results.map(r => r.match).join('\n')
  }

  async function thSpell(_: any, keyword: string) {
    if (!keyword) return '请输入符卡名称'
    const results = (await search(ctx, keyword)).filter(r => r.type === 'spellcard')
    if (results.length === 0) return '未找到符卡'
    if (results.length === 1) return renderSpellCard(results[0].item)
    return '找到多个符卡：\n' + results.map(r => r.match).join('\n')
  }

  async function thMusic(_: any, keyword: string) {
    if (!keyword) return '请输入音乐名称'
    const results = (await search(ctx, keyword)).filter(r => r.type === 'music')
    if (results.length === 0) return '未找到音乐'
    if (results.length === 1) return renderMusic(results[0].item)
    return '找到多个音乐：\n' + results.map(r => r.match).join('\n')
  }

  async function thRand(_: any, type: string) {
    if (!type || !['game', 'character', 'spellcard', 'music'].includes(type)) {
      return '请输入类型：game, character, spellcard, music'
    }
    const list = allData[type]
    const item = list[Math.floor(Math.random() * list.length)]
    return renderItem(type, item)
  }

  async function thAliasAdd(_: any, target: string, alias: string) {
    if (!target || !alias) return '请输入目标名称和别名'
    const results = await search(ctx, target)
    if (results.length === 0) return '未找到目标'
    if (results.length > 1) return '找到多个目标，请使用更精确的名称'

    const item = results[0].item
    const type = results[0].type

    const existing = await getAliasByTargetAndName(ctx, item.id, alias)
    if (existing.length > 0) return '别名已存在'

    await createAlias(ctx, item.id, type, alias)
    return `已为 ${item.name || item.name} 添加别名 ${alias}`
  }

  async function thAliasRemove(_: any, alias: string) {
    if (!alias) return '请输入别名'
    const existing = await getAliasByName(ctx, alias)
    if (existing.length === 0) return '别名不存在'

    await removeAliasByName(ctx, alias)
    return '别名已删除'
  }
}
