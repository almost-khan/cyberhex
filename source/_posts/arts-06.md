---
title: ARTS 打卡 06
date: 2020-07-20 00:35:51
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

K 个一组翻转链表（LeetCode 25，困难）

这个题真的是就算知道怎么做也是要写错好几回，我这次的 AC 率是 6，感觉链表的题还是要多练才行。还有 Dummy Node 的技巧也很重要。

## Review

这周看了这篇教程：[Testing Your RxSwift Code](https://www.raywenderlich.com/7408-testing-your-rxswift-code#toc-anchor-005)

### RxTest VS. RxBlocking 
两个在 Rx 的测试中都非常有用，RxBlocking 更加直观，RxTest 更加全面。

RxTest 可以覆盖大部分测试，而且 TestScheduler 模拟的虚拟时间可以大大缩短测试时间，但是写起来比较长也比较麻烦

相比 RxBlocking 写起来非常简单也直观，但使用场景比较局限，其中对我们来说比较致命的一点是 RxBlocking 对于无法停止的序列的测试能力很有限，并不能提供我们需要的能力。而我们直播中大部分序列都是无限序列，所以暂时不考虑 RxBlocking。

还有一点就是，RxBlocking 无法测试时间相关的用例，比如我在 1s的时候收到一个信号，想测试输出是否在 1s的时候输出某个特定值，RxBlocking 只能测试出来收到了这个值，但是不能确定时间戳。RxBlocking 比较适合测试初始值，或者只有一个状态的序列。

RxBlocking 也会 block 住当前线程，所以之前发生过的，测试走到 RxBlocking的语句之后，就会卡死并且无法继续进行测试也是这个引起的（我们使用了 BehaviorRelay 是无限序列）。

所以之后的测试还是需要继续使用 RxTest，以上。

## Tips

这次没发现特别骚的套路，所以先鸽了

## Share

### 什么时候需要写单测

并不是所有的代码都需要你写单测来保证的，总结起来就是“三个不一个要”：

1. 不给自动生成的代码写 Unit Test（比如生成的 getter setter），我们要相信 Xcode（或者其他编辑器），出了问题是天灾，需要我们单独分情况处理，然后给我们自己处理的代码写单测。
2. 不给编译器能发现的问题写 Unit Test，这个不是你需要关心的。
3. 不给第三方库写 Unit Test，所谓疑人不用，用人不疑，你既然辛辛苦苦选择了一个靠谱的第三方库，就要相信他。如果出问题的话处理方式同第一点。
4. 要给自己写的无法用编译器发现问题的代码写 Unit Test，包括自己写的 Class，Method 等。

总结一下，上边的原则看起来挺多，其实就是一句话：上帝的归上帝，凯撒的归凯撒，自己的锅自己背，别人的锅我不管。
