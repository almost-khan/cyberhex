---
title: ARTS 打卡 04
date: 2020-07-05 23:36:17
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

前缀树问题（LeetCode 208 中等）

这个问题也相当于一个比较基础的问题了，它是一些其他题目（比如 Word ladder II 之类的）题目的前置题目，这个题目如果你是想刷算法的话属于必背题目，核心点是在每次插入一个单词的时候更新树的结构，这样的话在下次查找的时候就可以判断是否有这个单词或者是否有以某个单词开头的单词。

一个比较重要的点就是前缀树和哈希表之间的对比，他们俩在很多时候可以互相替代，前缀树花费的空间更少一些但是单次查询花费的时间更多一点。

## Review



## Tips

前一阵做单元测试的时候发现一个问题，就是如果想把 UIImage 作为 ViewModel 的输出的时候会有一个问题就是不知道怎么样单测这个 UIImage 的输出，最后无奈只能让 ViewModel 输出 UIImage 的名字，然后在 ViewController 中来进行 UIImage 的初始化。但是昨天看关于单测的东西的时候发现一个很好用的技巧，下次在做单测的时候可以尝试使用了：

{% codeblock lang:swift %}
	
func testImage() {
	let viewModelImage = viewModel.image
	let viewModelImageDataReference = viewModelImage.pngData()!
	let stubImageDataReference = UIImage(named: "test").pngData()!
	XCAssertEqual(viewModelImageDataReference, stubImageDataReference)
	XCAssertEqual(viewModelImage.size.width, desiredWidth)
	XCAssertEqual(viewModelImage.size.height, desiredHeight)
}

{% endcodeblock %}

## Share

[尤尼泰斯特 2020 - 回忆篇](https://almostkhan.me/2020/07/05/unit-test-short-story-01/)