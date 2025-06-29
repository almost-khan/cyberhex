---
title: ARTS 打卡 01
date: 2020-06-14 17:41:11
tags: 
categories:
- ARTS
copyright: true
comments: true
visible: hide
---
本文主要是公司内部 ARTS 活动打卡记录
<!--more-->

## Algorithm

N 皇后问题（LeetCode 51 困难）

这个题目也算是 DFS 算法中经典的经典，所以这道题目的结构也是遵循递归的几大步骤（recursion terminator，current level logic，drill down，reverse state if needed），只不过这道题目需要多考虑的是怎么剪枝，也就是如果提前发现本次递归是一个无效的递归就提前终止。我的做法是用了三个 set 来记录当前的位置是否有效，我看讨论区还有一种用位运算来处理的，看起来很 fancy，但是没有仔细去研究，有时间需要好好看一下。

DFS 一直感觉有一点烧脑，尤其是如果做人肉递归的情况下，以后要养成避免人肉递归的习惯。

## Review

最近一直在看 Raywenderlich 的 RxSwift 的书，已经看到了第 24 章（总共 25 章 fighting！），感觉收获很大，好好反思了之前对于 RxSwift 的用法，觉得有很多不合理的地方，而且也有了一些在工作上该如何使用的思考，顺便思考了之前项目中的架构的不足，由于最近开始折腾单测的问题才发现之前有很多不合理的地方，在之后的重构中要更加注意。

## Tips

本来以为这周的 tips 可能要鸽了，但是在打卡前的最后几个小时发现了一个看起来很有意思的小技巧，让我这个强迫症眼前一亮。
在 MVVM 中因为每一个 ViewController 都会有一个 ViewModel，所以之前我在创建 ViewController 的时候有两种方法，一种是用 Initializer Injection，也就是把 ViewModel 作为 ViewController的 Init 方法的参数，另一种就是把 ViewModel 设为一个 Optional 的 internal 的变量，在初始化 ViewController 之后把 ViewModel 赋值进去。但感觉这两种方法都有一点不符合我的习惯，第一种需要加一个没用的 required 的 initializer，第二种需要在初始化之后赋值（有可能会忘）。今天发现一种使用工厂方法来创建 ViewController 的套路，如下：
{% codeblock lang:swift %}
class ViewController: UIViewController {
	private let viewModel: ViewModel
	static func create(withViewModel viewModel: ViewModel) -> ViewController {
		let vc = ViewController()
		vc.viewModel = viewModel
		return vc
	}
}
{% endcodeblock %}

## Share

[都是 Apple 惹的祸 - Coordinator Pattern 的前世今生](https://cyberhex.me/2020/04/26/coodinator-pattern/)