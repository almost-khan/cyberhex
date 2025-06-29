---
title: CreateML - 开启革命的星星之火
copyright: true
comments: true
date: 2020-11-24 20:56:24
tags: [iOS, Machine Learning]
categories:
- 会议报告
---
本文主要是苹果线上活动 - 基于 CreateML 的物体识别的观后感和一点想法。
<!--more-->

## 背景

Core ML 在 2017 年的横空出世开启了苹果机器学习的元年。但苹果貌似并没有准备在这条路上停下脚步，隔了仅仅一年，苹果就推出了 Create ML，之后苹果还在不断地给 Core ML 和 Create ML 添加新的功能，甚至在 XCode 11 之后将 Create ML 独立成为一个单独的 App。由此可见，苹果并不是拍拍脑袋或者搞搞 KPI（他们应该没有，只是为了押韵），他们是认真在考虑把 Machine Learning 移植到移动端，并且不断地在尝试去降低 Machine Learning 的门槛，让越来越多的开发正更方便的使用 Machine Learning 给自己的应用增砖添瓦。

## 什么是 Create ML

关于 CreateML 网上有太多的介绍和教程，我只做一下简单的介绍，因为我再怎么努力也没办法比前人讲的更好更清楚，既然这样，那就站在巨人的肩膀上，大概讲一下我的认识。

苹果在 2016 年收购了 Turi Create，然后在此基础上发展出了 Create ML（虽然在 WWDC 中没有明说，但是大家都心知肚明）。在 Create ML 之前如果你想在 iOS 中使用 Core ML 的 Model（mlmodel 格式的文件）的话，只能在 TensorFlow，Pytorch 等流行的框架中先进行模型训练，然后通过 Core ML 中的 converter 把这些模型转换成 mlmodel 的格式。这其实是有一定门槛的，首先你得对 TensorFlow，Pytorch 有一定的了解，也要会使用 Python 语言（虽然不是很难），最重要的是你得对机器学习有比较多的了解，才能把自己的想法转化成模型。

但 Create ML 的出现，打破了这个壁垒。Create ML 中现在有很多机器学习的类型，包括：Image，Video，Motion，Sound，Text 和 Table，囊括了很多我们平时会遇到的场景，我们通过其中预设的 Template 再加上几行代码（如果你用 GUI 工具甚至一行代码都不用写），通过对收集的数据进行训练，在你的 Mac 上就可以得到一个 well-trained 模型。这其中除了一些对数据集有一些需要注意的点 - 比如数据集要尽量均衡，要有不同的背景、不同的角度，要有噪音等等，你不需要对内部的神经网络之类的有很多的了解。剩下需要你做的基本就是一些拖拽，设置参数，泡杯卡布奇诺等待 Mac 帮你 Training 之类的操作。

关于 Create ML 具体要怎么操作，你可以看 Raywenerlich 的这篇教程 [Create ML Tutorial: Getting Started](https://www.raywenderlich.com/5653-create-ml-tutorial-getting-started#toc-anchor-020)，或者如果你更喜欢看中文版，可以看故胤道长的这篇博客 [WWDC 2018：初探 Create ML](http://www.cocoachina.com/articles/26420)，都是非常好的参考资料，比我写的不知道高到哪里去了。

## Transfer Learning

Transfer Learning（迁移学习）就是把已学训练好的模型参数迁移到新的模型来帮助新模型训练。苹果在 Create ML 也用到了 Transfer Learning ，这样可以大幅缩短 Training 的时间，Model 的体积和数据量。当然你也可以选择 Full Network 的方式来进行，但是按照苹果的说法是 Full Network 和 Transfer Learning 可以达到几乎一致的结果，所以从成本的角度来考虑完全没有必要使用 Full Network 的方式（当时这是在完全相信苹果的前提下）。

Full Network 和 Transfer Training 的区别就是：Full Network 是从头开始训练一个模型，而 Transfer Training 形象的来说就是苹果给你一个半成品模型（Backbone），这个模型已经被苹果用大量的数据调教过了，然后你再用这个半成品进行二次训练，从而节省更多的成本。

## 这次活动都讲了什么

这次会议是关于物体识别的，这个主要是用了 Create ML 中 Image 类型下的 Object Detection Template。

更详细的记录可以看我同事温和的[笔记](https://www.notion.so/Create-ML-84d28aa842064be7b74eb3bde136bd93)。

## Create ML 的优势

### 灵活性

在 Swift 中，新手能很快上手用 Swift 编写 iOS App，甚至他们都不需要了解泛型，函数式等比较高阶一点的用法；但对于有多年 Swift 经验的老同志来说，如果想用到更 Fancy 的功能，Swift 也能满足你的需求。Create ML 继承了苹果一贯的思想 - 对没有任何机器学习的新手来说非常友好，但同时对那些想“搞事情”的老玩家也提供了一些底层的 API 来进行一些他们想要的操作。

### 高效率

由于 Transfer Learning 的原因，Training 所需要的时间数据集和都不多，这节省了很多等待和收集数据的时间。而且对于 iOS 开发者来说，都不需要新学一门语言就可以直接上手，这也节约了很多学习和开发成本。

## Create ML 能为我们带来什么

还记得在上研究生时为了训练马里奥让他轻松过关，训练了一晚上这货还是傻乎乎的往大乌龟上撞。虽然这大概率是我模型建的太渣，但也从一个侧面体现出来了一个问题，就是传统的 Training 太耗费时间了，不懂得“点到为止”。作为一个学生，这个带来的结果最多是错过 deadline，你跟教授死缠烂打一下，他说不定就睁一只眼闭一只眼过去了（我可没有这么做过啊）。但是放在生产中，这代价就不会只有错过 deadline 这么简单了，这会影响产品的上线和迭代，从而影响市场占有率。在产品的早期，产品的完成度比完美度更有说服力，所以选择 Create ML 这样的工具，以较低的成本先占领市场，然后再慢慢完善产品的迭代也是一种不错的选择。

同时，对于没有专门的 AI Team 的小企业或者是个人开发者，Create ML 也为他们提供了绝佳的武器。他们可以实现一些比较轻量的与机器学习相关的功能，比如情感分析，搜索辅助，图片识别等，这将对他们应用的体验有很大提升，并且也不需要很高的成本。

## Create ML 仍有要“好好反思”的余地

苹果这些年在机器学习投入了很多，但毕竟作为一个“后来者”，还有一些问题需要解决。

### 仍然不够成熟

和隔壁使用 Python 生态的机器学习圈相比，苹果和 Swift 仍然有挺长的路要走。虽然 Create ML 包含了 Image，Video，Motion，Sound，Text 和 Table 的类别，但是其中暂时也是只有一些特定的 Template 可以使用，还是略显单薄。

### 无法在云端训练

虽然在 Mac 上就能进行 Training 听起来非常美好，但是缺乏在云端训练的功能还是一个比较值得注意的问题。如果想让更多的用户转移到 Create ML 这个平台势必要考虑这个问题。但如果 Create ML 的定位就是轻量级别的 Training 的话，这可能也算不上一个问题。

## 结语

从苹果这些年的一系列动作可以看出他们对于机器学习的生态有很大的野望，和谷歌等大公司的明争暗斗也让人看得眼花缭乱。谷歌也在积极推进 Swift for TensorFlow，从侧面也能看出谷歌对他这个对手的尊重。在我们凡人围观这场“神仙打架”的过程中也能看出来 Create ML 的出现更像一场即将或正在发生的革命 - 曾经机器学习的大部分资源都掌握在少数“AI精英”的手中，Create ML 的出现有助于打破现有的 “机器学习垄断”，让更多的开发者能有一个像样的交通工具加入这个赛道，虽然比不上别人的兰博基尼，但是也算有了代步的工具。随着更多人的加入，全民机器学习的时代可能会比我们想象的更早到来，到时候作为非机器学习的开发者也将有机会把自己的想法转化成真正的产品，AI 相关的应用将犹如雨后春笋般的出现。

## 鸣谢

感谢公司的这次机会以及苹果员工精彩的演讲和耐心的咨询。最后打个广告：落叶的一生就是为了归根吗？曾经的我也相信宿命论 - 程序员就是要 996 的，疫情是要被裁员的，出游是要自掏腰包的，五一是只有三天假的 ... 仿佛死神与巴格达商人在萨拉马的相会，一切都是那么无力。直到我加入了猿辅导，我的世界观崩塌了：原来程序员也不一定非要 996，疫情期间会有更多的项目和机会，出游是公司掏钱，五一有九天假！从来没见过如此“不讲武德”的公司，说好的武林要以和为贵呢？你这样其他公司怎么活！那你还在等什么，加入我们，我的邮箱是 goupy@fenbi.com，内推我是认真的，你值得拥有更好的。

{% note info %}

相关链接：
[笔记 - 基于 Create ML 的物体识别](https://www.notion.so/Create-ML-84d28aa842064be7b74eb3bde136bd93)
[Apple machine learning in 2020: What’s new?](https://machinethink.net/blog/new-in-apple-machine-learning-2020/)
[Create ML Tutorial: Getting Started](https://www.raywenderlich.com/5653-create-ml-tutorial-getting-started#toc-anchor-020)
[WWDC 2018：初探 Create ML](http://www.cocoachina.com/articles/26420)
[什么是迁移学习 (Transfer Learning)？这个领域历史发展前景如何？](https://www.zhihu.com/question/41979241)
[CreateML: Start Your Adventure in Machine Learning with Swift](https://www.netguru.com/codestories/createml-start-your-adventure-in-machine-learning-with-swift)
[Introducing Create ML](https://hongchaozhang.github.io/blog/2018/06/15/introducing-create-ml/)
[Sound Classification on iOS Using Core ML 3 and Create ML](https://heartbeat.fritz.ai/sound-classification-using-core-ml-3-and-create-ml-fc73ca20aff5)
[Why Apple’s Create ML matters to your enterprise](https://www.computerworld.com/article/3293446/why-apple-s-create-ml-matters-to-your-enterprise.html)

{% endnote %}








