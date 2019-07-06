---
title: 你不知道的 View Controller Containment
tags: [Swift, iOS, Design Pattern]
categories: 
- 学习笔记
- iOS
copyright: true
comments: true
visible: hide
---
本文主要记录在工作过程中如何利用 View Controller Containment 来重构 UI
<!--more-->

## 前言

不知道你有没有经历过这样的情况，一个页面中有很多的 View，但各个 View 之间有明显的层级关系，这个时候一种可行的做法是把一系列相关联的 View 归到一个父亲 View 中。 但这种做法会有有一些其他的问题， 比如会让 View Controller 或者 View Model 比较大， 甚至有时候不得不把逻辑写在 View 里边。那么有没有一个既可以解决问题， 又不会引入更多棘手的问题的方法吗？ 问得好！ 如果你心里真的这个问题，那说明你一定是在质疑我写这篇分享的初衷。 不过别担心，看到最后我保证你一定会有所收获的。

## 背景

铺垫了这么多，你可能会想: View Controller Containment 到底是什么个玩意，从来没听说过，确定会有人用这个吗？ 但是接下来我会打消你的疑虑，因为苹果自己就在设计 UINavigationController 和 UITabBarController 利用了这种模式。在UINavigationController 和 UITabBarController 中你都可以塞入自定义的控制器， 只不过他们控制这些控制器的形式不同（一个是堆叠，一个是平行）。

那么 View Controller Containment 到底是什么呢？ 其实非常简单，就是把一个控制器当作容器，只不过这个控制器比较特别一点，它不止能控制 View， 还可以控制在它里边的控制器。 这种模式中，父控制器只需要来管理和安排子控制器 View 的布局和大小，而子控制器负责它自己内部各个 View 的布局和大小。

## 优点

听起来如此简单的改变，能给我们带来什么呢？这就需要讨论一下 View Controller Containment 的优点。

### 可复用性

利用 View Controller Containment 一个很大的优点就是可复用性，比如上边提到的苹果自带 SDK 中的 UINavigationController 和 UITabBarController 都有极大的可复用性，基本上在每个项目中都会用到。在项目中我们有时候也会碰到一些情况会有需要复用 Root View Controller 的情况。比如我在最近的一个项目中，会碰到有在同一个页面有三个区块，并且在项目不同的地方会对它们做相同的布局甚至动画。所以这种情况下抽出来一个可复用的 Root View Controller 就会极大的提高工作效率。

### 逻辑分离

对于一些比较复杂的页面，分出来不同的控制器，让子控制器来控制各自的逻辑，这样会让整个 UI 的结构更加清晰，每一个控制器的职责更加明确，会有更强的拓展性，以后如果想加入新的功能或者动画，我们只需要加入新的控制器，最多再加几个回调和代理，并不需要对原来的 UI 结构有很大的改动。

## 举例

拿我现在做的一个直播页边来举例，里边有比较明显的三个区块，一个课件区，一个视频区，一个是讨论区。每个区块上边还有一些相关的 View。 所以我觉得可以用 View Controller Containment 来实现。 用一个 MasterViewController 来管理这三个区域。 这三个区域也是不同的子控制器。

{% codeblock lang:swift %}

import UIKit

class VideoViewController: UIViewController {}

class KeynoteViewController: UIViewController {}

class ChatViewController: UIViewController {}

final class MasterViewControlller: UIViewController {
    
    private lazy var videoViewController: VideoViewController = {
        return VideoViewController()
    }()

    private lazy var keynoteViewController: KeynoteViewController = {
        return KeynoteViewController()
    }()

    private lazy var chatViewController: ChatViewController = {
        return ChatViewController()
    }()

    override func viewDidLoad() {
        super.viewDidLoad()
    }

    // MARK: - Add Child View Controllers

    private func setupInterface() {
        
        addChild(videoViewController)
        addChild(keynoteViewController)
        addChild(chatViewController)

        view.addSubViews([
            videoViewController.view,
            keynoteViewController,
            chatViewController
        ])

        // 这里进行对子控制器的 View 的布局

        videoViewController.didMove(toParent: self)
        keynoteViewController.didMove(toParent: self)
        chatViewController.didMove(toParent: self)

    }

    // MARK: - Remove Child View Controller

    private func remove(asChild viewController: UIViewController) {
        // Notify Child View Controller
        viewController.willMove(toParent: nil)

        // Remove Child View From Superview
        viewController.view.removeFromSuperview()

        // Notify Child View Controller
        viewController.removeFromParentViewController()
    }

}
{% endcodeblock %}

这里需要注意的点是在做布局之前要使用 addChild(:) 方法，这样会触发子控制器的 willMove(toParent:) 方法，并且在布局完后要使用 didMove(toParent:) 方法。在移除 Child View Controller 的时候也需要重复相似的步骤，在移除 View 之前要使用 willMove(toParent:)， 在移除 View 之后使用 removeFromParentViewController() 方法。这样的做的好处是可以把子控制器的生命周期纳入父控制器的控制范围：在父控制器加入或者移除子控制器的时候能够触发子控制器的 viewWillAppear 和 viewWillDisappear 的方法。

## 结论

View Controller Containment 是一种非常实用的重构 UI 的设计模式，我在接触了这种模式后就开始欲罢不能（谁用谁知道）。这种模式不仅能增加代码的复用性和可拓展性，还可以将逻辑进行分离从而增加代码的可读性。所以把它加入你的 skill set 中会给你以后的工作和学习带来很大的益处。


{% note info %}

相关链接：

[Managing View Controllers With Container View Controllers](https://cocoacasts.com/managing-view-controllers-with-container-view-controllers)

{% endnote %}