---
title: A song of TDD and BUG - 主歌
copyright: true
comments: true
date: 2020-07-07 00:27:20
tags: [TDD, iOS]
categories:
- 工作总结
---
TDD 与 BUG 的爱恨情仇（卷二），本系列链表头部请戳 [A song of TDD and BUG - 前奏曲](https://cyberhex.me/2020/06/14/tdd-part-one/)
<!--more-->

## FBI Warning

我知道你在想啥，但是你想多了，我只是想给你一个强烈但不失友善的警告（Friendly But Intense Warning）而已。在了解 TDD 之前你需要知道，TDD 只是一种开发模式，不是圣经也不是行为准则，我们需要辩证的去看待 TDD，可以参照 TDD 并且结合自己的实际情况选择最适合自己的开发模式，毕竟适合自己的才是最好的。这你可能会问了，刚你还说 TDD 又是最耀眼的新星，又是救世主的，现在咋又说人家坏话。我想说的是，你毕竟还是 Too Young，要我不进行一波商业吹嘘，你可能也不愿意往下看啊，流量称王的时代，我不得忽悠你多看几眼啊。

## 什么代码需要写单测

并不是所有的代码都需要你写单测来保证的，总结起来就是“三个不一个要”：

1. 不给自动生成的代码写 Unit Test（比如生成的 getter setter），我们要相信 Xcode（或者其他编辑器），出了问题是天灾，需要我们单独分情况处理，然后给我们自己处理的代码写单测。
2. 不给编译器能发现的问题写 Unit Test，这个不是你需要关心的。
3. 不给第三方库写 Unit Test，所谓疑人不用，用人不疑，你既然辛辛苦苦选择了一个靠谱的第三方库，就要相信他。如果出问题的话处理方式同第一点。
4. 要给自己写的无法用编译器发现问题的代码写 Unit Test，包括自己写的 Class，Method 等。

总结一下，上边的原则看起来挺多，其实就是一句话：上帝的归上帝，凯撒的归凯撒，自己的锅自己背，别人的锅我不管。

##  如何做一只合格的单测

如果单测界也需要面试，那单测的招聘广告一定是下面这样的：

1. 你必须是可失败的，禁止使用如 Assert True 为 True 这样的作弊手段来保证自己的正确性，一经发现，必将诉诸法律手段。
2. 你必须是可重复的，不能在多次的测试中给出不同的结果，否则你就会失去工作。
3. 你必须是有效率的，不能干活磨磨唧唧的，可别忘了，我们这每次测试都需要跑很多单测，如果你处理工作超过 100 ms 就是不合格的。

突然有点心疼单测的工作，但是我们能怎么办呢，人生不如意十有八九，更何况单测呢。

## 单测的命名规则

这里有的小朋友就可能要问了，我写的单测我做主，我就要给他命名成 test1，test10086，testMyLove，你管我。这些小朋友一看就没有经历过社会的毒打，作为一个腿都被打断的过来人，我给你分享一点人生的经验。比如你刚进行了一次重构，突然发现有个名叫 testYouDidntGiveMeAMeaningfulNameAndNowYouSuckIt 的单测出了问题，你根本不知道他具体是代表了哪个地方出问题，你得需要在众单测中先找到这个单测，然后大概看一下测了什么并且心里一直在想给之前写单测的自己扇一大耳光，这会令你浪费很多宝贵的时间。在理解了命名的重要性后，下边我就分享一个比较通用的命名规则：

1. 对于每一个 class 有一个对应的 Unit Test 文件，命名规则为原文件名 + Tests，比如想给 ViewModel 写 Unit Test 就叫 ViewModelTests
2. 测试函数名规则：test + 要被测试的函数名/变量名 +  _ + 状态 + _ + 所期望的结果，比如一个叫 state 的输出在初始化之后是否为 normal，函数名就应该是 testState_whenInit_isNormal
3. 什么是 sut：sut stands for  “System Under Test”，平时我们用 sut 来表示需要被测试的对象，比如在 ViewModelTests 中 sut 就是 ViewModel 的实体，即 sut = ViewModel()

## Given，When，Then

这三个是单元测试的三个基本步骤（如此 skr 的命名方式，相信前辈也是一名单压狂魔吧）：
1. Given 是指初始状态，也就是 sut 的初始状态。
2. When 是指一个发生在 sut 上的事件或者状态变化。
3. Then 是指在状态变化后来测试 sut 的状态与期望的状态是否相同。

## Gearing Up

相信你已经摩拳擦掌，迫不及待的想开始了。但是少侠稍安勿躁，行走江湖没有一件趁手的装备怎么行。这里我就以 iOS 为例来探讨一下单测框架的选择。选择框架需要考虑几个方面的问题：
1. 学习成本：我把这个列在第一位，是因为时间就是金钱，谁也不愿意花费大量时间学习一个晦涩难懂的框架。
2. 易用性：这个就不用我多说了吧，一个好用的框架能让你事半功倍，反之，事半功半半半。
3. 可读性：这个也很重要，因为很多情况下单测只是用来测试代码的，也可以作为了解业务逻辑的一种方法。
4. 附加价值：这个就很笼统了，比如有的框架内置 BDD，有的和其他库 - 比如 Mock 的库（为什么要把 Mock 单独拿出来说，之后你就会明白）- 更加贴合，这些都可以成为框架的附加价值。

接下来我就以 iOS 中的两个常用的框架做一下比较，下边有请本段的双主角 XCTest 和 Quick & Nimble。先交代一下故事的背景，XCTest 是苹果自带的单测框架，而 Quick & Nimble 是基于 XCTest 发展出来的一个框架，具有非常独特的语法和使用方式，但是底层的 Assertion 等和 XCTest 非常相似。

我们先直观的看一下两个框架的测试代码都长什么样：

首先是苹果自带的 XCTest：

{% codeblock lang:swift %}
class WeekDayViewModelTests: XCTestCase {

    var sut: WeekDayViewModel!
    
    override func setUp() {
        super.setUp()
        
        // Load Stub
        let data = loadStub(name: "darksky", extension: "json")
        
        // Initialize JSON Decoder
        let decoder = JSONDecoder()
        
        // Configure JSON Decoder
        decoder.dateDecodingStrategy = .secondsSince1970
        
        // Initialize Dark Sky Response
        let darkSkyResponse = try! decoder.decode(DarkSkyResponse.self, from: data)
        
        // Initialize View Model
        sut = WeekDayViewModel(weatherData: darkSkyResponse.forecast[5])
    }
    
    override func tearDown() {
        super.tearDown()
        sut = nil
    }
    
    func testDay_whenGetData_isExpected() {
        XCTAssertEqual(sut.day, "Sunday")
    }
    
    func testDate_whenGetData_isExpected() {
        XCTAssertEqual(sut.date, "September 2")
    }
    
    func testTemperature_whenGetData_isExpected() {
        XCTAssertEqual(sut.temperature, "12.2 °C - 20.1 °C")
    }
    
    func testWindSpeed_whenGetData_isExpected() {
        XCTAssertEqual(sut.windSpeed, "5 MPH")
    }
    
}
{% endcodeblock %}

接下来是倔强的 Quick & Nimble：

{% codeblock lang:swift %}
class WeekDayViewModelTests: QuickSpec {
    
    override func spec() {
        describe("a WeekDayViewModel") {
            var sut: WeekDayViewModel!
            
            beforeEach {
                let data = self.loadStub(name: "darksky", extension: "json")
                
                // Initialize JSON Decoder
                let decoder = JSONDecoder()
                
                // Configure JSON Decoder
                decoder.dateDecodingStrategy = .secondsSince1970
                
                // Initialize Dark Sky Response
                let darkSkyResponse = try! decoder.decode(DarkSkyResponse.self, from: data)
                
                sut = WeekDayViewModel(weatherData: darkSkyResponse.forecast[5])
            }
           
            afterEach {
                sut = nil
            }
            
            describe("its day") {
                context("when got weather data") {
                    it("is Sunday") {
                        expect(sut.day).to(equal("Sunday"))
                    }
                }
            }
            
            describe("its date") {
                context("when got weather data") {
                    it("it is September 2") {
                        expect(sut.date).to(equal("September 2"))
                    }
                }
            }
            
            describe("its temperature") {
                context("when got weather data") {
                    it("is 12.2 °C - 20.1 °C") {
                        expect(sut.temperature).to(equal("12.2 °C - 20.1 °C"))
                    }
                }
            }
            
            describe("its windSpeed") {
                context("when got weather data") {
                    it("is 5 MPH") {
                        expect(sut.windSpeed).to(equal("5 MPH"))
                    }
                }
            }
        }
    }
}

{% endcodeblock %}

上边分别是两个框架对 WeekDayViewModel 的单元测试，你可以明显感觉到两个库的风格。说不定你可能就只是在库群中对其中某个多看了一眼，然后再也忘不掉它的优雅。但是选一个框架跟结婚一样，不止需要看对眼，还需要考虑很多现实的问题，要不然破裂的时候，就不只是“不和它一起维护代码”了那么简单了，还需要考虑重构，移除依赖，选择一个新的库一起维护代码，都说戏如人生，写代码也何尝不是如此呢。接下来，我就给你用上边的几个原则理性的分析一波，但是不管我分析的结果是什么，决定权都在你手上。可别忘了：人是感性的生物，如果是真爱，去他喵的理性分析。

1. Round 1：学习成本。XCTest 作为苹果的亲儿子，不论文档还是教程都比 Quick & Nimble 这个“孤儿”要多很多，再加上 Quick & Nimble 的使用方式比较特别，需要一点适应的时间，所以第一局 XCTest 胜。
2. Round 2：易用性。其实如果花时间学习了其中任意一种框架的话，用起来的难易程度都差不多（当然这么说的比较主观，但是感觉应该不是有特别大的出入）。这一局算平局。
3. Round 3：可读性。XCTest 中每一个测试都是独立的，如果对于同一个属性有不同的测试，我们需要人工的把它们归在一起，如果稍有不慎，就很容易混乱难找（单测一般都挺长的，尤其是加了Mock 以后）。但是 Quick & Nimble 我们可以天然的把相同属性的测试都归在同一个 describe 下边。所以这一局算 Quick & Nimble 胜。
4. Round 4：附加价值。之前经过一番对比，两边各有胜负，最后又回到了起点，所以这一局算是胜负手。我主要想从对 BDD 的支持的方面来说，用 XCTest 你当然也可以结合 BDD 的思路来写单测，但是这个需要你人工的去维护。这时候 Quick & Nimble 可就突然兴奋起来了，它对于 BDD 可是有天然的亲和力的。BDD 中的核心思想 GWT（也就是之前说过的 Given/When/Then）等价于 Quick & Nimble 中的 descirbe，context，和 it（这几个在后边都会说到）。所以最终的 Winner 属于虽然是“孤儿”但仍能逆风 Carry 的 Quick & Nimble。

最后我还是想重申一下，上边的结论带有很大的主观性，对于不同的人来说结果肯定是有所出入的。但我觉得选择的过程还是可以被借鉴的，如果你有选择困难症的话，甚至可以参考 SWOT 分析法来选择。

## 真正的开始

[Rainstorm](https://github.com/quintessencegpy/Rainstorm) 是一个非常简单直观但是又能 cover 我想说的大部分内容的项目，他是一个单页面的 App，页面上半部分是实时的天气，下边是接下来几天的天气预报，在这里我就不截图了，感兴趣的可以按照 ReadMe 里的一步一步跑一下项目， 如果你是懒人党，就凭空脑补一下 iOS 自带天气 App就行。什么，你不是 iOS 用户？那你就随手百度一下图片。什么，不会百度？不好意思，杠精出门右转，ETC 在左手边。

关于如何创建项目和加入 Unit Test 我就不在这里赘述了，但是我需要提的一点是关于 Podfile。如果你是第一次在 Unit Test 加入 Pod 的话需要注意一下，因为在主项目中你并不会用到 Unit Test 的 Pod，但是在 Unit Test 中你大概率会用到主项目的 Pod，所以需要做一下下边的骚操作：
{% codeblock lang:ruby %}
target 'Rainstorm' do
  # Comment the next line if you don't want to use dynamic frameworks
  use_frameworks!
  pod 'SnapKit'
  # Pods for Rainstorm
  target 'RainstormTests' do
    inherit! :search_paths
    pod 'Quick'
    pod 'Nimble'
  end
end
{% endcodeblock %}

好了，废话说的够多了，我们开始写第一个单测。

## 初识 Quick & Nimble

不知道你有没有注意到，之前在对比 XCTest 和 Quick & Nimble 的示例代码中我用到了很多的 “！”符号，这个是 Swift 中的强解包，说到这里很多了解 Optional 的同学就要嘲讽我了，但我要给自己辩护一下，我这里是故意用强解包的，因为：首先，在单测中不需要进行错误处理；其次，如果在这里发生了 Crash，说明我犯了一个又蠢又挫的错误，需要及时解决。

接下来简单的说一下 Quick & Nimble 的使用，我们先来看一下 Quick 官方文档中给的示例：

{% codeblock lang:swift %}
class TableOfContentsSpec: QuickSpec {
  override func spec() {
    describe("the 'Documentation' directory") {
      it("has everything you need to get started") {
        let sections = Directory("Documentation").sections
        expect(sections).to(contain("Organized Tests with Quick Examples and Example Groups"))
        expect(sections).to(contain("Installing Quick"))
      }

      context("if it doesn't have what you're looking for") {
        it("needs to be updated") {
          let you = You(awesome: true)
          expect{you.submittedAnIssue}.toEventually(beTruthy())
        }
      }
    }
  }
}
{% endcodeblock %}

就像之前说的，Quick & Nimble，有三个层面 descirbe，context，和 it 分别对应 GWT（Given/When/Then）。套在上边的示例中就是：
1. Given “the 'Documentation' directory”
2. When “it doesn't have what you're looking for”
3. Then “it needs to be updated"

除此之外，常用的还有 beforeEach 和 afterEach，这两个名字就很能说明问题， 这两个 block 会在每个单测执行之前和之后执行，跟 XCTest 中的 setUp 和 tearDown 比较类似。博客的主要任务不是说 Quick & Nimble，所以我就偷懒把学习资料放在这，需要的可以放到收藏夹里去吃灰：

1. [Behavior-Driven Testing Tutorial for iOS with Quick & Nimble](https://www.raywenderlich.com/135-behavior-driven-testing-tutorial-for-ios-with-quick-nimble#toc-anchor-010)
2. [Quick Documentation](https://github.com/Quick/Quick/tree/master/Documentation)

## 做单测永远滴神

在单测中，你要有猛虎归山，蛟龙如海，王者混入青铜局的气势，要有那种掌控雷电，呼风唤雨的感觉才对。为什么要这么说呢，你需要对单测的输入，流程，输出有绝对的控制权。但是这个神不是你想做，想做就能做的，你需要两个非常忠实的奴仆 - 抽象层和 Mock。

### 光能使者抽象层

> 单测的一个“副作用”就是揭开你代码的最后一块遮羞布 - 很多问题比如逻辑太分散，耦合度太高等问题都会会暴露无疑。因为这一次面对这些问题的人不再是别人，而是你自己。

人们都说单测是检验代码质量的重要标准，有这种说法的很大原因都是抽象层的功劳，所以它也不愧光能使者，因为有了它你也就有了一把如意神剑（能看懂这个的都是老中二了）。那你肯定想说，吹了半天，总得说出点名堂吧。还记得那句经典名言吗？

> 计算机科学领域的任何问题都可以通过增加一个间接的中间层来解决。

这个中间层放在这里指的就是抽象层。

拿 Rainstorm 来举例，因为我们是需要从网络拿到天气数据，然后才能展示。这时候你可能就会犯嘀咕，这种单测该怎么写？之前不是说了单测需要保证可重复性，我每次从网络拿到的数据又不可靠，怎么保证可重复性？如果你有这些疑问，说明你已经上道了，不愧是你小机灵鬼。其实这个问题答案就是这部分的核心思想，你要做单测永远滴神。既然从网络那边拿到的数据不可靠，我们就自己模拟，这也是马上要说的 Mock。但是模拟一次网络请求也太麻烦了，有没有什么更好的方法？这就可以回归主题 - 抽象层了。如果我们在 ViewModel（我只是以 MVVM 举例，可以是任何 class） 和 Networking 之间加一层抽象这个问题就迎刃而解。在 Rainstorm 中这个抽象层叫 NetworkService，它只是提供接口，所以不管数据是从网络来，还是单测中的 Stub，对于 ViewModel 来说都是透明的。这样一来，不仅解决了单测的问题，你的代码复用性也更高了。比如之后你想换网络层的库，只要接口不变，ViewModel 的代码就不用改。抽象层把路铺好了，接下来怎么操作就要看 Mock 的了。

### 堕落天使 Mock 

其实关于 Mock 还有一个更专业的名字 - Test Double，直译过来就是测试专用替身（有人翻译成置换测试，但是明显我翻译的更接地气哈哈哈）。而且 Mock 只是 Test Double 其中的一种。Test Double 包含 Fake，Mock，Stub。他们之间都有一些区别。由于关系过于错综复杂如同八卦，所以感兴趣的可以去看看这篇博客 [Test Doubles — Fakes, Mocks and Stubs.](https://blog.pragmatists.com/test-doubles-fakes-mocks-and-stubs-1a7491dfa3da)。在之后的博客中我就避开这些如同文字游戏一般的概念，直接简单认为 Mock 就是我们模拟生产环境的对象，Stub 是模拟生产环境的数据（比如从网络拿到的数据或者数据库里的数据）。

就像动漫钢之炼金术师里烧瓶中的小人一样，有时候最危险的人物或者说最终的 Boss 可能就隐藏在你身边，甚至可能是你最忠实的奴仆。在单测中，需要我们随时注意不被反咬一口的就是 Mock。这么说的原因是因为如果稍微不注意，Mock 就有可能变的像裹脚布一样，又臭又长。虽然在 Rainstrom 中没有出现这个问题，但是在一些复杂的项目中，有时候 Mock 一个对象可能需要先创建很多其他的“假”对象。但是有很多好用的 Mock 库可以用，一个比较出名的就是 [Cuckoo](https://github.com/Brightify/Cuckoo) ，有兴趣可以去了解一下。

在 Rainstrom 中我们为了测试专门创建了两个 Mock Class - MockLocationService 和 MockNetworkService。它们分别是遵循 LocationService 和 NetworkService 接口的。由于他们的存在，单测中的 Mock 变得轻松了很多。

## Networking 代码的单测

上一部分有提到 Networking 的测试，现在我们就来仔细说一下 Networking 代码的测试。接下来我就用最简单的方法来尝试给 RootViewModel 写一个单测。思路很简单，就是写一个假的 didFetchWeatherData，然后在回调中做 Assert 就可以了。下边是构想中的代码：

{% codeblock lang:swift %}
class RootViewModelTests: QuickSpec {

    override func spec() {
        describe("a RootViewModel") {
            var sut: RootViewModel!
            var networkService: MockNetworkService!
            var locationService: MockLocationService!
            
            beforeEach {
                // Initialize Mock Network Service
                networkService = MockNetworkService()
                
                // Configure Mock Network Service
                networkService.data = self.loadStub(name: "darksky", extension: "json")
                
                // Initialize Mock Location Service
                locationService = MockLocationService()

                // Initialize Root View Model
                sut = RootViewModel(networkService: networkService, locationService: locationService)
            }
            
            afterEach {
                sut = nil
                networkService = nil
                locationService = nil
            }
            
            describe("refreshing") {
                context("when get weatherData") {
                    it("get expected output") {
                        sut.didFetchWeatherData = { (result) in
                            if case .success(let weatherData) = result {
                                print(weatherData)
                                expect(weatherData.latitude).to(equal(37.8267))
                                expect(weatherData.longitude).to(equal(-122.4233))
                            }
                        }
                        
                        sut.refresh()
                    }
                }
            }
        }
    }
}
{% endcodeblock %}

相信你如果跟着博客一直看，上边的代码应该比较好理解，然后如果跑一下单测会发现我们非常幸运，Test Succeeded 让我们感觉很有成就感。但是随手翻了一下 Console，你会发现事情并不简单。我在上边的代码中藏了一个小小的坑 - print(weatherData)。可我们在 Console 中并没有看到打印，这说明问题很严重，虽然我们测试成功了，然而其实代码根本就没有走到回调中，这是为什么呢？

## 异步测试方法

看到这个标题你应该就大概了解原因了。没错，Xcode 中的 Unit Test 是一个同步的过程，所以我们异步的代码并没有执行。Quick  & Nimble 中有两种 方法可以进行异步测试的方法  waitUntil 和 toEventually。这两个都可以进行异步的测试，具体的用法可以看这个博客 [Nimble: when to use waitUntil or toEventually](https://www.mokacoding.com/blog/waituntil-vs-toeventually/)，在这我就选择 waitUntil。接下来我们就对上边的单测用 waitUntil 进行改写：

{% codeblock lang:swift %}
    describe("refreshing") {
        context("when get weatherData") {
            it("get expected output") { 
                waitUntil { (done) in
                    sut.didFetchWeatherData = { (result) in
                        if case .success(let weatherData) = result {
                            expect(weatherData.latitude).to(equal(37.8267))
                            expect(weatherData.longitude).to(equal(-122.4233))
                            print(weatherData)
                            done()
                        }
                    }
                    
                    sut.refresh()
                }
            }
        }
    }
}
{% endcodeblock %}

这次我们就可以看到，不仅单测成功了，Console 中也打印出来了我们期待已久的 weatherData，是不是非常简单。

## Happy Path vs. Unhappy Path

人生不如意十有八九，代码世界里虽然没有八九那么高，但是一些错误也是没有办法避免的。一些问题比如用户没有网络，无法 GPS 定位等问题都是可预期和可接受的。但不同的是，在代码中我们可以“开天眼”，提前为可能发生的问题部署，等到了发生的时候都可以优雅的处理这些问题。那这些所谓的 “Unhappy Path”是否需要单测呢？答案是何止是需要，那是相当需要。因为这些 Corner Case 的处理体现出了一个产品的下限，下限越高，越不容易翻车。

下边我就以无法获得用户位置为例写一下 Unhappy Path 的测试。

{% codeblock lang:swift %}
	context("when failed to fetch location") {
	    it("get notAuthorizedToRequestLocation error") {
	        locationService.location = nil
	        
	        waitUntil { (done) in
	            sut.didFetchWeatherData = { (result) in
	                if case .failure(let error) = result {
	                    expect(error).to(equal(RootViewModel.WeatherDataError.notAuthorizedToRequestLocation))
	                    done()
	                }
	            }
	            
	            sut.refresh()
	        }
	    }
	}
{% endcodeblock %}

上边的测试中，我们把 locationService（类型是 MockLocationService）中的 location 设为空来模拟无法获取到用户位置。使用上边说到的异步测试的方法就可以测试我们是否能收到 notAuthorizedToRequestLocation 的错误。

## Rx，你个磨人的小妖精

使用过 Rx 的小朋友们一定会有一个这样的感受：开发一时爽，Debug 火葬场。因为虽然使用 Rx 的时候虽然感觉数据流很清晰，但是真的出问题的时候 Debug 真的是要了老命，因为崩溃的堆栈真会让你看的怀疑人生。所以这种时候写单测就非常重要了，因为趁着你在开发的时候对业务逻辑比较了解的时候把问题解决，比之后出问题了再重新看代码要省好多时间和头发。

我也曾经有过用 waitUtil + subscribe 的方式进行过单测，但是效率真的是非常的低，尤其是 Time-Based Operator。想象你起了一个 3 秒间隔的 Timer。你在单测中就真的要等 3 秒来测试。听起来好像不多，但是你想如果有 100 这样的单测，你就需要等 300 秒！真的还不如把代码跑来来自己瞄一眼对不对呢。这也是之前在“如何做一只合格的单测”中提到的 100ms 阈值的原因。

由于 Rx 的特殊的使用方式和开发模式，我们需要一个新的框架来进行对 Rx 的单元测试，在 RxSwift 中就是 RxTest 和 RxBlocking。

### RxTest

听这个名字就可以感觉到这个是 Rx 比较正统的测试方式了，毕竟都叫 RxTest。那它能怎么改变我们的测试方式呢？这就不得不说最大的功臣 TestScheduler。Scheduler 的作用跟 iOS 中线程有一点相似，但又不完全一样，我们平时用到比较多的就是 MainScheduler （RxSwift 中）。有兴趣的可以上百度谷歌一下，有很多的资料解释，我就不在这里多说了。那 TestScheduler 是什么呢，它其实就相当于生产代码中 Scheduler 的替身。但不同的是它在测试环境中使用的是虚拟时间，所以对于测试相当友好，就算我们用了一些 Time-Based Operator 我们也不用在测试中真的等那么长时间。下边我就假设 Rainstorm 中 RootViewModel 有一个输出叫做 isRefreshing，他是一个 PublishSubject，测试它的代码就如下：

{% codeblock lang:swift %}
describe("isRefreshing") {
    context("when failed to fetch location") {
        it("get expected output") { 
		let isRefreshing = scheduler.createObserver(Bool.self)
		sut.isPlaying
			.drive(isPlaying)
			.disposed(by: disposeBag)

		scheduler.createColdObservable([.next(10, ()), .next(20, ()),  .next(30, ())])
       			   .bind(to: sut.applicationEnteredForeground)
       			   .disposed(by: disposeBag)

		scheduler.start()

		expect(isRefreshing.events).to(equal([
	    		.next(10, true),
	    		.next(20, true),
	    		.next(30, true)		
		]))
        }
    }
}
{% endcodeblock %}

从上边的测试我们可以发现，我们甚至可以输入一个序列来看输出是什么，这会让我们的测试非常灵活，唯一的缺点就是太长了。

### RxBlocking

至于 RxBlocking，就有点像把 Rx 这个异步的过程变成同步以方便我们测试，我们也用代码来演示，假设 WeekViewModel 中的 temperature 输出也是一个 PublishSubject，那我们就可以用下边的方法来测试：

{% codeblock lang:swift %}
describe("its temperature") {
    context("when got weather data") {
        it("is 12.2 °C - 20.1 °C") {
            expect(try! sut.temperature.toBlocking().first()).to(equal("12.2 °C - 20.1 °C"))
        }
    }
}
{% endcodeblock %}

你可以回到上边 WeekViewModel 的测试部分（在 Gearing Up 部分)对比一下，基本上差不多，真的是谁用谁知道。但是任何事情都是有代价的，对于 RxBlocking 来说就是他的局限性：

1. RxBlocking 对于无法停止的序列的测试能力很有限，如 BehaviorRelay 这种天生就无法停止的序列就无法用 RxBlocking。
2. RxBlocking 会阻塞当前的线程，这个有可能会引起卡死的现象，从而无法进行接下来的单测。
3. RxBlocking 无法像 RxTest 对特定时间点的事件进行测试，比如上边 RxTest 的测试中，我们可以很明确的知道在 10、20、30 秒的时候收到了 applicationEnteredForeground，并且我们的输出也是在 10、20、30 秒发出的，但是 RxBlocking 就没有这个能力。
4. 在这部分刚开始就说了 RxBlocking 是把异步过程强行变成一个同步的过程，所以一些必须要异步触发的 case （比如用一个序列触发另一个序列的这种情况）我们就没法用 RxBlocking。`

###  如何做选择

> 只有小孩子才做选择，大人全都要。

这是如今被用滥的一句梗。但你猜怎么着，用在这还真用对了。

RxTest 更加全面，可以覆盖大部分测试，而且 TestScheduler 模拟的虚拟时间可以大大缩短测试时间，但是写起来比较长也比较麻烦。相比 RxBlocking 写起来非常简单也直观，但使用场景比较局限。我们何不取长补短，在可以使用 RxBlocking 的时候使用 RxBlocking，而在更复杂的使用场景，尤其是那些需要 timestamp 精准对应的场景使用 RxTest。这样我们就充分利用了两种方式的长处，何乐而不为呢。

##  结语

这一篇主要讲了关于单测的东西，单测作为 TDD 的根基，是学习 TDD 路上必须要掌握的生存技能。不过对于许多人来说只掌握单测其实就足够了，因为 TDD 只是一种开发模式，而单测才是根本。你也可以在掌握了单测后根据自己或团队的 workflow 来定制属于自己的开发模式。如果你对 TDD 比较好奇的话，也可以继续往下看。

[To Be Continued](https://cyberhex.me/2020/07/07/tdd-part-three/)（此处应有专属音乐）

## 相关链接

相关链接：

[Quick Documentation](https://github.com/Quick/Quick/tree/master/Documentation)
[Behavior-Driven Testing Tutorial for iOS with Quick & Nimble](https://www.raywenderlich.com/135-behavior-driven-testing-tutorial-for-ios-with-quick-nimble#toc-anchor-010)
[Test Doubles — Fakes, Mocks and Stubs.](https://blog.pragmatists.com/test-doubles-fakes-mocks-and-stubs-1a7491dfa3da)
[Nimble: when to use waitUntil or toEventually](https://www.mokacoding.com/blog/waituntil-vs-toeventually/)
[Testing with RxBlocking, part 2](http://rx-marin.com/post/rxblocking-part2/)
[Testing Your RxSwift Code](https://www.raywenderlich.com/7408-testing-your-rxswift-code#toc-anchor-005)

