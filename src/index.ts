import { Context, Logger, Schema } from 'koishi'
import { extendDatabase, getAliasByTargetAndName, createAlias, getAliasByName, removeAliasByName } from './database'
import { search, renderItem, renderGame, renderCharacter, renderSpellCard, renderMusic, allData } from './utils'
import { randomInt } from 'crypto'

export const name = 'thbwiki'
export const inject = ['database']
export interface Config {}
export const Config: Schema<Config> = Schema.object({})

const logger = new Logger('thbwiki');
const wikiURL = '\n\n内容来源：https://thbwiki.cc/';

export * from './database'

export function apply(ctx: Context) {
  extendDatabase(ctx)

  const thIntro = (keyword: string) => handleCharDetail(keyword, 'introduction', '简介')
  const thLife = (keyword: string) => handleCharDetail(keyword, 'lifestyle', '生活状况')
  const thAbility = (keyword: string) => handleCharDetail(keyword, 'abilities', '能力')
  const thAppear = (keyword: string) => handleCharDetail(keyword, 'appearance', '外貌')
  const thRel = (keyword: string) => handleCharDetail(keyword, 'relationships', '人际关系')

  ctx.command('thbwiki/th-search [...args]', '搜索东方Project相关信息，支持多关键词')
    .alias('thb').alias('东方百科')
    .action(({ session }, ...args) => thSearch(args.join(' ')))

  ctx.command('thbwiki/th-game [...args]', '搜索游戏')
    .alias('东方官作')
    .action(({ session }, ...args) => thGame(args.join(' ')))

  ctx.command('thbwiki/th-char [...args]', '搜索角色基本信息')
    .alias('东方角色')
    .action(({ session }, ...args) => thChar(args.join(' ')))
  ctx.command('thbwiki/th-intro [...args]', '查看角色简介')
    .alias('角色简介')
    .action(({ session }, ...args) => thIntro(args.join(' ')))

  ctx.command('thbwiki/th-life [...args]', '查看角色生活状况')
    .alias('角色生活')
    .action(({ session }, ...args) => thLife(args.join(' ')))
  ctx.command('thbwiki/th-ability [...args]', '查看角色能力')
    .alias('角色能力')
    .action(({ session }, ...args) => thAbility(args.join(' ')))

  ctx.command('thbwiki/th-appear [...args]', '查看角色外貌')
    .alias('角色外貌')
    .action(({ session }, ...args) => thAppear(args.join(' ')))
  ctx.command('thbwiki/th-rel [...args]', '查看角色人际关系')
    .alias('角色人际')
    .action(({ session }, ...args) => thRel(args.join(' ')))

  ctx.command('thbwiki/th-char-spell [...args]', '查看角色或作品符卡列表')
    .alias('符卡列表')
    .action(({ session }, ...args) => handleSpellCardsList(args.join(' ')))

  ctx.command('thbwiki/th-spell [...args]', '搜索符卡')
    .alias('符卡')
    .action(({ session }, ...args) => thSpell(args.join(' ')))

  ctx.command('thbwiki/th-music [...args]', '搜索音乐')
    .alias('东方音乐')
    .action(({ session }, ...args) => thMusic(args.join(' ')))

  ctx.command('thbwiki/th-musicList [...args]', '查看角色或作品音乐列表')
    .alias('音乐列表')
    .action(async ({ session }, ...args) => thMusicList(args.join(' ')))

  ctx.command('thbwiki/th-rand <type:string>', '随机获取信息')
    .alias('随机thb')
    .action(({ session }, ...args) => thRand(args.join(' ')))

  ctx.command('thbwiki/th-alias-add <target:string> <alias:string>', '为角色添加别名')
    .alias('添加thb别名')
    .action(thAliasAdd)

  ctx.command('thbwiki/th-alias-remove <alias:string>', '删除别名')
    .alias('删除thb别名')
    .action(thAliasRemove)

  async function thSearch(keyword: string) {
    if (!keyword) return '请输入搜索关键词'
    const results = await search(ctx, keyword)
    if (results.length === 0) return '未找到相关信息'
    const firstResult = results[0]
    const moreResults = results.length > 1 ? '\n\n还有更多结果，请尝试更具体的关键词。' : ''
    return renderItem(firstResult.type, firstResult.item) + moreResults + wikiURL
  }

  async function thGame(keyword: string) {
    if (!keyword) return '请输入游戏名称'
    const results = (await search(ctx, keyword)).filter(r => r.type === 'game')
    if (results.length === 0) return '未找到游戏'
    const firstResult = results[0]
    const moreResults = results.length > 1 ? '\n\n还有更多结果，请尝试更具体的关键词。' : ''
    return renderGame(firstResult.item) + moreResults + wikiURL
  }

  async function thChar(keyword: string) {
    if (!keyword) return '请输入角色名称'
    const results = (await search(ctx, keyword)).filter(r => r.type === 'character')
    if (results.length === 0) return '未找到角色'
    const firstResult = results[0]
    const moreResults = results.length > 1 ? '\n\n还有更多结果，请尝试更具体的关键词。' : ''
    return renderCharacter(firstResult.item) + moreResults + wikiURL
  }

  async function handleCharDetail(keyword: string, field: string, label: string) {
    if (!keyword) return '请输入角色名称'
    const results = (await search(ctx, keyword)).filter(r => r.type === 'character')
    if (results.length === 0) return '未找到角色'
    const firstResult = results[0]
    const moreResults = results.length > 1 ? '\n\n还有更多结果，请尝试更具体的关键词。' : ''
    const char = firstResult.item
    return `${char.name} - ${label}：\n${char[field]}` + moreResults + wikiURL
  }

  async function thSpell(keyword: string) {
    if (!keyword) return '请输入符卡名称'
    const results = (await search(ctx, keyword)).filter(r => r.type === 'spellcard')
    if (results.length === 0) return '未找到符卡'
    const firstResult = results[0]
    const moreResults = results.length > 1 ? '\n\n还有更多结果，请尝试更具体的关键词。' : ''
    return renderSpellCard(firstResult.item) + moreResults + wikiURL
  }

  async function thMusic(keyword: string) {
    if (!keyword) return '请输入音乐名称'
    const results = (await search(ctx, keyword)).filter(r => r.type === 'music')
    if (results.length === 0) return '未找到音乐'
    const firstResult = results[0]
    const moreResults = results.length > 1 ? '\n\n还有更多结果，请尝试更具体的关键词。' : ''
    return renderMusic(firstResult.item) + moreResults + wikiURL
  }

  async function thMusicList(keyword: string) {
    if (!keyword) return '请输入角色或作品名称'
    const results = (await search(ctx, keyword)).filter(r => r.type === 'music');
    if (results.length === 0) return '未找到角色或作品'
    return `${keyword} 的音乐：\n` + results.map(m => `原名：${m.item.id}\n译名：${m.item.name}\n出处：${m.item.game}\n描述：${m.item.description}`).join('\n\n') + wikiURL;
  }

  async function thRand(type: string) {
    if (!type || !['game', 'character', 'spellcard', 'music'].includes(type)) {
      type = ['spellcard', 'music'][randomInt(1, 2)]
    }
    const list = allData[type]
    const item = list[Math.floor(Math.random() * list.length)]
    return renderItem(type, item) + wikiURL
  }

  async function thAliasAdd(_: any, target: string, alias: string) {
    if (!target || !alias) return '请输入角色名称和别名'
    const results = (await search(ctx, target)).filter(r => r.type === 'character')
    if (results.length === 0) return '未找到角色'
    if (results.length > 1) return '找到多个角色，请使用更精确的名称'

    const item = results[0].item
    const type = results[0].type

    const existing = await getAliasByTargetAndName(ctx, item.id, alias)
    if (existing.length > 0) return '别名已存在'

    await createAlias(ctx, item.id, type, alias)
    return `已为 ${item.name} 添加别名 ${alias}`
  }

  async function thAliasRemove(_: any, alias: string) {
    if (!alias) return '请输入别名'
    const existing = await getAliasByName(ctx, alias)
    if (existing.length === 0) return '别名不存在'

    await removeAliasByName(ctx, alias)
    return '别名已删除'
  }

  async function handleSpellCardsList(keyword: string) {
    if (!keyword) return '请输入角色或作品名称'
    const results = (await search(ctx, keyword)).filter(r => r.type === 'spellcard');
    if (results.length === 0) return '未找到角色或作品'
    return `${keyword} 的符卡：\n` + results.map(card => `原名：${card.item.id}\n译名：${card.item.name}\n难度：${card.item.difficulty}\n出处：${card.item.game}`).join('\n\n') + wikiURL;
  }
}
