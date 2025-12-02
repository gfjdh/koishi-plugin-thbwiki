# thbwiki 插件

## 简介

`thbwiki` 是一个基于 Koishi 框架的插件，用于搜索和查询东方 Project 相关的信息。它提供了多种命令，支持搜索游戏、角色、符卡、音乐等内容，并支持别名管理功能。
全部数据来源于[东方百科](https://thbwiki.cc/)。

## 安装

确保您已安装 Koishi，并在项目中安装了 `thbwiki` 插件。

```bash
npm install thbwiki
```

## 配置

插件无需额外配置即可使用

## 功能

### 搜索功能

- **搜索东方 Project 相关信息**
  ```
  thbwiki/th-search <keyword>
  ```
  别名：`thb`, `东方百科`

- **搜索游戏**
  ```
  thbwiki/th-game <keyword>
  ```
  别名：`东方官作`

- **搜索角色基本信息**
  ```
  thbwiki/th-char <keyword>
  ```
  别名：`东方角色`

- **查看角色简介**
  ```
  thbwiki/th-intro <keyword>
  ```
  别名：`角色简介`

- **查看角色生活状况**
  ```
  thbwiki/th-life <keyword>
  ```
  别名：`角色生活`

- **查看角色能力**
  ```
  thbwiki/th-ability <keyword>
  ```
  别名：`角色能力`

- **查看角色外貌**
  ```
  thbwiki/th-appear <keyword>
  ```
  别名：`角色外貌`

- **查看角色人际关系**
  ```
  thbwiki/th-rel <keyword>
  ```
  别名：`角色人际`

- **搜索符卡**
  ```
  thbwiki/th-spell <keyword>
  ```
  别名：`符卡信息`

- **搜索音乐**
  ```
  thbwiki/th-music <keyword>
  ```
  别名：`东方音乐`

- **随机获取信息**
  ```
  thbwiki/th-rand <type>
  ```
  别名：`随机thb`

  支持的类型：`game`, `character`, `spellcard`, `music`

### 别名管理

- **添加别名**
  ```
  thbwiki/th-alias-add <target> <alias>
  ```
  别名：`添加thb别名`

- **删除别名**
  ```
  thbwiki/th-alias-remove <alias>
  ```
  别名：`删除thb别名`
