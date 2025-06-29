---
title: A song of TDD and BUG - 变奏曲
copyright: true
comments: true
date: 2020-07-07 00:47:32
tags: [TDD, iOS]
categories:
- 工作总结
---
TDD 与 BUG 的爱恨情仇（卷四），本系列链表头部请戳 [A song of TDD and BUG - 前奏曲](https://cyberhex.me/2020/06/14/tdd-part-one/)
<!--more-->

## All About Change


## 劝分不劝和

## Dependency Map

## 历史代码 TDD 改造需要注意的问题

### Start Small

### Choose Your BattleField

记得写单测并不是你的目的，减少 Bug 才是，所以我们需要把有限的精力放在收益最大的单侧上。我推荐两种选择写单测优先级的方案：
	
1. 利用时间局部性：就像 LRU 的思想一下，在最近一段时间修改过的逻辑很有可能在未来一段时间内也需要修改，所以选择用单侧保证这部分逻辑有助于之后的迭代和重构。
2. “从”新开始：主意是从新，不是重新，也就是暂时考虑放弃之前的逻辑，对新业务使用 TDD 的开发模式来开发。这种比较适合没有时间对老代码进行重构和改造的情况，先对新的业务进行单测，等到业务稳定以后再考虑之前的历史包袱。