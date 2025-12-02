import { Context } from 'koishi'

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

export function extendDatabase(ctx: Context) {
  ctx.model.extend('thAlias', {
    id: 'unsigned',
    targetId: 'string',
    targetType: 'string',
    alias: 'string'
  }, { autoInc: true })
}

export async function getAliasesByKeyword(ctx: Context, keyword: string) {
  return ctx.database.get('thAlias', { alias: { $regex: keyword } })
}

export async function getAliasByTargetAndName(ctx: Context, targetId: string, alias: string) {
  return ctx.database.get('thAlias', { targetId, alias })
}

export async function createAlias(ctx: Context, targetId: string, targetType: string, alias: string) {
  return ctx.database.create('thAlias', { targetId, targetType, alias })
}

export async function getAliasByName(ctx: Context, alias: string) {
  return ctx.database.get('thAlias', { alias })
}

export async function removeAliasByName(ctx: Context, alias: string) {
  return ctx.database.remove('thAlias', { alias })
}
