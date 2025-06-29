---
title: iOS 中的并发性问题
date: 2018-11-27 13:39:41
tags: [Swift, iOS, Concurrency]
categories: 
- 学习笔记
copyright: true
comments: true
---
本文主要记录在学习 iOS 的过程中关于并发性的问题。
<!--more-->

## 前言

之前在开发过程中曾经遇到过挺多次并发的问题，比如在自己写 networking 代码的时候会遇到一些（对！我是自己手写 networking code， 老板禁止使用 Alamofire， 所以我就自己写了一个很小的库，以后有机会跟大家分享），但都是比较皮毛的东西，感觉自己并没有深入理解并发行的问题，现在下定决心好好研究一下并发性，毕竟面试会考挺多而且以后也会碰到很多。


## 背景

现在很多事情都是多线的，电脑是多核的，手机是双卡双待的，你看我，我可以一边写博客，一边玩LOL(呃，不知道为什么就抄袭了爱情公寓的台词，不过好像有点讽刺)。其实我是想说，由于现在手机是多核的，意味着同一时间手机可以同时处理多个问题，于是很多现代操作系统比如 iOS 和 OS10 就利用利用了这个特点而使用多线程。在这里我就想提出一个千古难题，进程和线程的区别是啥，说实话，到今天之前我对这两个概念还是比较模糊。进程的定义是正在执行程序的一个实体，线程定义是程序的执行路径。简而言之,在 iOS 系统中，进程可以理解为就是一个 App, 而线程是程序执行流的最小单元，一个进程至少有一个线程。其实我的理解也还没到完全的地步，大家可以参考[我所理解的 iOS 并发编程](https://juejin.im/post/5b1cf4fa6fb9a01e4b062771)和[进程和线程的区别](https://www.cnblogs.com/lmule/archive/2010/08/18/1802774.html)。并发性有很多可以研究的问题，下面我想主要说一下 GCD 和 Operation Queue。


## Main Queue vs. Background Queue

在 iOS 中有两个重要的概念，Main Queue 和 Background Queue，这两个东西有什么用呢？ 试想一下，如果你每次打开抖音都会先白屏三秒钟才出现图片，那你还会这么没日没夜的刷它吗？ 如果出现这种情况，最有可能的情况只有两种：

1. iPhone XS 在向你招手，扔掉手中的老手机，下一站，黑市交易所。
2. 本来应该在 Background Queue 运行的 networking 奇瑞跑到了 Main Queue 的快车道上蹩住了你的校长牌阿斯顿 UI。

一般情况下, 第二种情况发生的概率比较大。那么要怎么办呢？当然是利用你尊贵的身份改变交通规则，让开奇瑞的全部都去慢车道开，如果进入快车道，可以直接没收作案工具。这在现实生活中可能显得有点扯淡(?)。但是在 iOS 中不失为一种非常有效率的解决办法。 让运行较慢的 networking code 进入 Background Queue 运行，等到运行完成了再通知系统更新 UI。 这样就能大大提高用户体验，让用户刷抖音到天亮不是梦。

## Grand Central Dispatch(GCD)

先讲一点点历史， GCD 为什么要叫 Grand Central Dispatch 而不是 Large Central Dispatch 或者 Big Central Dispatch ? 这是由于在纽约有一个非常著名的地铁站叫 Grand Central Terminal，这个地方差不多是曼哈顿中一个地标型站点，后来程序员们在设计 GCD 的时候觉得在管理不同的线程的时候和 Grand Central Terminal 有异曲同工之妙，然后就堂而皇之的抄袭(程序猿的事能算抄吗）了这个名字。如果你是一个 iOS 开发员并且有幸去纽约玩的话一定要去膜拜一下这个有意义的站点。

GCD 作为苹果推荐的管理多线程的方式，肯定是有他的优势的，首先它的运行速度极快（每个 block 的运行速度是纳秒级别的）; 其次, GCD 的调用接口非常简单，只需要在最后的 closure 中写入要执行的代码就可以调用了，代码结构清晰，要做什么也显得一目了然，所以在网络请求和图片的异步加载中经常能看到它的身影。

GCD 中有两个核心的概念： 任务和队列

> 任务

GCD 中的任务就是加入到 closure 中的那一段代码，任务按照执行方式分为两种：

1. 同步执行的任务会阻塞当前线程，等待 closure 中的代码执行完成后当前线程才会继续。
2. 异步执行的任务不会阻塞当前线程，当前线程会继续执行。

> 队列

GCD 中队列指的是任务的等待队列，也就是在任务进入线程执行前排队的地方。队列遵循先进先出（FIFO）的原则，队列也分为两种：

1. 串行队列无法开启新的线程，所以线程中的任务会在当前线程一个一个执行，也就是说前一个任务执行完了下一个任务才会开始执行。这个就像在奶茶店门口买奶茶一样，只有上一个顾客买完了，下一个才可以买。
2. 并行队列有开启新线程的能力，所以线程中的任务无需等待上一个任务完成就可以进入其他线程执行（但整个队列还是遵循先进先出的原则，只不过队列分发的特别快，看起来像一起执行）。这个就像在银行排队办理业务，因为有好多窗口，所以下一个人没必要等上一个人办理完业务才开始办理（除非窗口已全部被占用）。

### 队列的创建

在实际应用中，我们碰到的有三种常用队列：主队列，全局队列和自创队列。

首先我们先看自创队列：
{% codeblock lang:swift %}
// Swift
let backgroundQueue = DispatchQueue(label: "com.cyberhex.concurrent.queue", attributes: .concurrent)
{% endcodeblock %}

上边就是创建队列的过程，DispatchQueue 的构造函数需要好多个参数，但是除了 label 其他的都是可选参数（如下），一般来说创建的队列都是并行队列。

{% codeblock lang:swift %}
// DispathQueue 的定义
public convenience init(label: String, qos: DispatchQoS = default, attributes: DispatchQueue.Attributes = default, autoreleaseFrequency: DispatchQueue.AutoreleaseFrequency = default, target: DispatchQueue? = default)
{% endcodeblock %}

另外两个是可以直接调用无需创建，分别是主队列（Main Queue）和全局队列（Global Queue)。

其中主队列是串行队列，主要用于处理 UI 相关的任务，其他耗时的任务如网络请求或者下载图片需要另开线程进行处理，给 UI 大爷让路。

说到这个我想扯一个不是特别相关的，前一阵面试某条被问到了一个关于主队列的问题，具体是：为什么 UI 不能在主线程之外的线程运行，为什么系统会报错。说实话，我还真是没有了解过，面试完了以后查了资料才明白。

简单来说就是 UIKit 不是线程安全的，所以如果在其他线程更新 UI 会引起整个应用 UI 的混乱，具体为什么 UIKit 不是线程安全的等其他问题，大家可以看[这篇博客](https://blog.csdn.net/qq_36557133/article/details/86531816)

回到正题，全剧队列是一个并行的队列，你可以把需要并行处理的任务交给它来处理。主队列和全局队列的获取如下：

{% codeblock lang:swift %}
// DispathQueue 的定义
let mainQueue = DispatchQueue.main
let globalQueue = DispatchQueue.global()
{% endcodeblock %}

GCD 就暂时先说到这里，我知道还有很多其他的东西比如信号量（Semaphore）和 DispatchWorkItem，这些以后有机会了再总结。


## Operation 和 Operation Queue

Operation 是对于 GCD 的一个封装，相比于轻量级的 GCD，Operation 是完全面向对象的，它提供了多个接口可以实现暂停、继续、终止、优先顺序、依赖等复杂操作，比 GCD 更加灵活。在运行速度方面不如 GCD，是处于毫秒级别。

Operation 和 Operation Queue 对应与 GCD 的任务和队列，所以与之相对应的，它也有同步异步，串行并行之分，只不过表现形式不同。




## Bonus 

最后奉上我只在在某大厂笔试碰到的两道与GCD 和 Operation Queue 相关的题目。

1. 请写出下面代码执行顺序以及每次执行前等待了多长时间？并解释下原因？

{% codeblock lang:swift %}
// DispathQueue 的定义
DispatchQueue.main.async {
            DispatchQueue.main.async {
                sleep(2)
                print("1"+"\(Thread.current)")
            }
            print("2" + "\(Thread.current)")
            DispatchQueue.main.async {
                print("3" + "\(Thread.current)")
            }
}
sleep(1)
{% endcodeblock %}

2. 如果把上面的DispatchQueue.main.async都改成DispatchQueue.global().async是怎么输出呢？并解释下原因？

3. 如果下面这种情况请输出print输出顺序？并解释原因，如果maxConcurrentOperationCount = 1结果会是什么样子？

{% codeblock lang:swift %}
// DispathQueue 的定义
let queue = OperationQueue()
        queue.maxConcurrentOperationCount = 2
        queue.addOperation {
            queue.addOperation {
                sleep(2)
                print("1"+"\(Thread.current)")
            }
            print("2"+"\(Thread.current)")
            queue.addOperation {
                print("3"+"\(Thread.current)")
            }
}
sleep(2)
{% endcodeblock %}

答案我会在下一篇博客中揭晓。


## 相关链接

[Tree House: Concurrency in iOS](https://teamtreehouse.com/library/concurrency-in-iOS)
[Linus Torvalds 的邮件](http://lkml.iu.edu/hypermail/linux/kernel/9608/0191.html)
[进程和线程的区别](https://www.cnblogs.com/lmule/archive/2010/08/18/1802774.html)
[我所理解的 iOS 并发编程](https://juejin.im/post/5b1cf4fa6fb9a01e4b062771)
[The GCD Handbook](http://khanlou.com/2016/04/the-GCD-handbook/)
[OBJC Concurrent Programming](https://www.objc.io/issues/2-concurrency/)
[iOS 多线程：『GCD』详尽总结](https://www.jianshu.com/p/2d57c72016c6)