---
title: ARTS 打卡 07
date: 2020-07-26 22:47:16
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

课程表II（LeetCode 210，中等）

这道题算是拓扑排序的经典了（刷了好几遍了，这周好多事偷个懒）。当然底层的算法还是万年不变的 BFS，算是比较好理解，唯一需要的注意的就是入度的定义，这个是这道题除了 BFS 之外的关键。

## Review

这周看的东西都写在了分享的博客里，主要想说一下这周同事关于 OpenGL 的分享。之前由于苹果对于 OpenGL 有比较好的封装，所以很少接触到它，但是听了分享以后才发现自己对于许多苹果底层的东西知之甚少，比如 OpenGL，比如 Metal。听闻说 Metal 还是 CoreML 的基础（亏我还翻译过关于 CoreML 的文章，惭愧啊），之后在做完单测和 Flutter 分享以后要多花花时间看看这些底层的东西（包括 CoreAnimation 也是云里雾里的）。

## Tips

每次最头疼的就是 Tips 了，但是今天发现一个挺有用的小技巧。之前在 Swift 中使用 Selector 总感觉很山寨，还要写个 #selector，奇奇怪怪的，但是有一种很优雅的解决方式就是在当前文件中写一个 private 的 extension，如下：
{% codeblock lang:swift %}
private extension Selector {
	static let didTapButton = #selector(ViewController.handleButtonTapped)
}
{% endcodeblock %}

然后使用的时候就可以这样：

{% codeblock lang:swift %}
button.addTarget(self, action: .didTapButton, for: .touchUpInside)
{% endcodeblock %}

真的看起来舒服很多！
## Share

[A song of TDD and BUG - 前奏曲](https://cyberhex.me/2020/06/14/tdd-part-one/)