---
title: Objective-C 中 Nullability 的使用
date: 2018-11-25 22:23:19
tags: [Objective-C, iOS, Nullability]
categories: 
- 学习笔记
copyright: true
comments: true
---
本文主要记录在学习 Objective-C 的过程中关于 Nullability 的问题。
<!--more-->

## 背景

我们都知道 Swift 和 Objective-C 可以同时存在于同一个 project 中，但想让他们俩兄弟同时幸福快乐和谐的生活在同一个项目中并不是一件容易的事。 Swift 小老弟最大的优势就是 Type Safety, 而 Objective-C 老大哥最大的“问题”就是可以有满屏的 nil。 在 Swift 中如果你想在不初始化一个变量的情况使用这个变量，你必须要提前告知 Xcode 这个变量是 optional 的， 但是 Objective-C 就没有这样的要求。 那么怎么解决这个问题呢，苹果最后引入了 Nullability 来给 Objective-C 加入一些安全保障。


## 举例

在 Objective-C 中有以下代码：

{% codeblock lang:objc %}
// Objective-C
@interface User: NSObject

@property (copy, nonatomic) NSString *username;
@property (copy, nonatomic) NSString *password;

- (BOOL)loginWithUsername:(NSString *)username
                 password:(NSString *)password;
@end
{% endcodeblock %}

但是如果这段代码是存在与两种语言混合的项目中，这段代码 import 进如 Swift 之后就成了一下这样：

{% codeblock lang:swift %}
// Swift
class User: NSObject {
    var username: String!
    var password: String!

    func login(withUsername username: String!,
                            password: String!) -> Bool
}
{% endcodeblock %}

我们看到了满屏的惊叹号，这对于有强迫症的同学简直是一种煎熬，为什么会这样呢？
因为 Swift 是 Type Safe 的语言，除非你提前申明这个变量是 optional，否则他不会让你随便给变量赋值 nil。

但是，如果在 Objective-C 中引入了 Nullability， 这个问题就会大大改善，比如下边的例子：

{% codeblock lang:objc %}
// Objective-C
@interface User: NSObject

@property (nonnull, copy, nonatomic) NSString *username;
@property (nullable, copy, nonatomic) NSString *password;

- (BOOL)loginWithUsername:(nonnull NSString *)username
                 password:(nonnull NSString *)password;
@end
{% endcodeblock %}

在 Swift 中，接口就会变成以下的情况：

{% codeblock lang:swift %}
// Swift
class User: NSObject {
    var username: String
    var password: String？

    func login(withUsername username: String,
                            password: String) -> Bool
}
{% endcodeblock %}

但是，虽然这样解决的 Swift 和 Objective-C 之间搭桥的问题，Objective-C 本身并没有发生改变，他还是该吃吃，该喝喝，runtime 的行为模式和以前没啥区别，毕竟嘛，那什么改不了那啥。但是经过这样的改变，compiler 会站出来在我们用错 API 的时候提出警告。


## 四种 Nullability 标记

|   Pointers   |   Properties   |    |
| :---: | :---: | :---: |
| _Null_unspecified | null_unspecified |  默认值，在搭桥到 Swift 后会成为 unwrapped optional |
| _Nonnull | nonnull |  在搭桥到 Swift 后变成正常变量声明  |
| _Nullable | nullable | 在搭桥到 Swift 后变成 optional  |
| N/A |   null_resettable   |  这种变量在读的时候不会是 nil， 但是可以重置为nil  |


## 结语

这算是我第一篇正儿八经的博客了，也算是学习笔记性质的记录博客，所以内容不一定是完全正确的，所以还希望各位大佬不吝赐教，大家一起学习。

{% note info %}

相关链接：

[Tree House: Nullability Annotations in Objective-C](https://teamtreehouse.com/library/nullability-annotations-in-objectivec)

{% endnote %}


