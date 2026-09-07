---
title: 优化图片
date: 2026-03-25 12:00:00
tags: [Swift, iOS, Design Pattern]
categories: 
- 翻译
---

> 作者：Jordan Morgan，[原文链接](https://www.swiftjectivec.com/optimizing-images/)，原文日期：2018-12-11
译者：AlmostKhan；

人们常说你手里的相机就是最好的那个。如果俗语能说明一些问题的话，那么毫无疑问，iPhone 完全就是这个星球上最重要的相机。而且整个行业也证明了这件事。

出去度假了？不给你的 Instagram 上传几张照片顺便在手机里存几张备用的都不太可能。

又出了个大新闻？翻翻微博查看有关这个事件的图片就可以实时掌握有哪些渠道在播报这件事。

例子数不胜数。

但是尽管图片无处不在，想用一种既能保持高性能又不消耗很多内存的方式来展示这些图片还真得多费点劲。只要了解了 UIKit 中发生了什么，并且理解了它如何处理图片，我们就可以节省一大笔内存同时还能免去想砸键盘的冲动。


## 讲一点理论

先出一个脑筋急转弯：下面这张我女儿非常潮的照片有 266KB，猜一下它在 iOS 应用中需要占多少内存？

![Photo of dauther](https://www.swiftjectivec.com/assets/images/baylor.jpg)

剧透警告：不是 266k，也不是 2.66M，而是 14M。

怎么会这样？

iOS 在得出内存使用的时候基于的是图片的维度，而图片真正的大小跟内存没有几毛钱关系。这张图片的维度是 1718 像素宽，2048像素高。假设每个像素占用四个字节内存：

{% codeblock lang:swift %}
    1718 * 2048 * 4 / 1024 / 1024 = 大约 13.42 MB
{% endcodeblock %}

假设你有一个包含一堆用户的 table view，每一行都在左上角用如今最流行的圆形来展示他们的头像。如果你觉得这没什么，因为这些图片已经用 ImageOptim 或者相似的东西压缩过了，那你就大错特错了。假设每个图片是 256x256 的话，这样还是会占掉不少的内存。

## 渲染管线

通过上边的例子，我们可以得出：了解渲染图片的机制也非常重要。当你载入一个图片，会有下边三个步骤：

1.载入：iOS 把压缩后的图片（在我们的例子中 266KB）放入内存中。这一步中并没有什么需要特别注意的。
2.解码：接下来，iOS 把图片转化为 GPU 可以理解和读取的形式。这一步中图片已经不是压缩状态了，现在就到了我们上边说的 14MB。
3.渲染：就像步骤名所说的一样，图片数据已经能够以任意形式被渲染到屏幕上，就算只是一个 60*60 那么小的 image view。

解码过程算一个比较重要的阶段。在这个过程中 iOS 会创建一个缓存区（准确的来说是一个图片缓存区），它是图片在内存中的表现形式。这就很好的解释了为啥这个缓冲区的大小本质上是和图片的面积而非文件大小挂钩的。从而也清楚的描绘了在计算图片的内存消耗时为什么图片的维度这么重要。

对于 UIImage 来说，当我们塞给他的不论是从网络请求或者是其他途径里得到的图片数据，它都会把这些数据缓存解析为数据中所要求的任何压缩形式（比如 PNG 或者 JPG）。但是，这些数据其实还是会继续存在，因为渲染不是一个只会进行一次的操作，所以 UIImage 会把图片缓存保存下来，确保它只被解析一次。

现在我们发散一下思维：一个可以适用于任何 iOS 应用的完整缓存区就是它的帧缓存区。当你的应用要出现在屏幕上时，帧缓存区把它真正的显示出来，因为缓存区里有需要被显示出来内容的渲染结果。任何 iOS 设备的显示硬件都可以利用这些像素信息把这些像素展现在屏幕上。

在这种情况下，时长就会影响结果。想得到 60 帧每秒的行云流水般的滑动，帧缓存区就需要让 UIKit 渲染应用的窗口，并且需要当子视图的信息有变化时（比如给 image view 添加图片），所有子视图都加到窗口上边。如果这一步完成的太慢的话，就会丢帧。

> 你觉得六十分之一秒已经很短了？想象一下，有 Pro Motion 技术的设备会把这个数字提到一百二十分之一秒。

## 尺寸很重要

我们可以很容易的对这个过程和过程中的内存使用进行可视化。就用之前我女儿的那张照片，我创建了一个很简单的应用，里边有一个 image view 来展示这张照片：

{% codeblock lang:swift %}
    let url = NSURL(fileURLWithPath: filePath)
    let fileImage = UIImage(contentsOfFile: filePath)

    // Image view
    let imageView = UIImageView(image: fileImage)
    imageView.translatesAutoresizingMaskIntoConstraints = false
    imageView.contentMode = .scaleAspectFit
    imageView.widthAnchor.constraint(equalToConstant: 300).isActive = true
    imageView.heightAnchor.constraint(equalToConstant: 400).isActive = true

    view.addSubview(imageView)
    imageView.centerXAnchor.constraint(equalTo: view.centerXAnchor).isActive = true
    imageView.centerYAnchor.constraint(equalTo: view.centerYAnchor).isActive = true
{% endcodeblock %}

> 在实际工作中不要使用强行解包，这个例子比较简单，所以才小用一下。

我们会得到如下结果：

![Photo of dauther](https://www.swiftjectivec.com/assets/images/baylorPhone.jpg)

迅速去 LLDB 上瞄一眼就可以发现，就算我们用一个更小的 image view 来展示这张图，它的维度还是原来那样：

{% codeblock lang:swift %}
    <UIImage: 0x600003d41a40>, {1718, 2048}
{% endcodeblock %}

注意哟，这里可是用点来表示的。也就是说，如果我在用一个 3x 或者是 2x 的设备，有可能还会得到一个是这个倍数的数字。接下来我们转战去 vmmap，看我们能不能确认这张图用了 14MB 的内存：

{% codeblock lang:swift %}
    vmmap --summary baylor.memgraph
{% endcodeblock %}

下边几项数据比较亮眼：

{% codeblock lang:swift %}
    Physical footprint:         69.5M
    Physical footprint (peak):  69.7M
{% endcodeblock %}

现在有将近 70M 的内存使用，也给了我们一个重构代码的基准。如果我们集中再看看我们图片的内存消耗：

{% codeblock lang:swift %}
    vmmap --summary baylor.memgraph | grep "Image IO"

    Image IO  13.4M   13.4M   13.4M    0K  0K  0K   0K  2 
{% endcodeblock %}

啊嘞嘞，内存里有大约 14MB 的脏内存。这跟我们当时估算的图片的大小一样。为了充实论点，下边我给出了一张截图可以清晰的看出每一行的消耗，因为这是使用 grep 查到的。

![Snapshot of grepin](https://www.swiftjectivec.com/assets/images/vmmap.jpg)

所以很明显，现在我们在一个 300 x 400 的 image view 上使用了原图所占的内存大小。图片的大小很重要，但是这不是唯一影响内存消耗的因素。

## 色域

你所请求使用的一部分内存是由另一个重要因素色域所决定的。在上边的例子中，我们做了一个在大部分 iPhone 中并不成立的假设，就是图片使用的是 sRGB 格式。一个像素点有4个字节是因为给了红、蓝、绿和透明度各一个字节。

如果你用一个支持非常广色域的手机（不如 iPhone 8P 或者 iPhone X）来拍照，你很有可能会使用双倍的内存。当然，倒过来也是对的。Metal 可以使用 Alpha 8 的格式，这种格式就跟它名字所暗示的那样，只用一个维度（透明度）。

这里边有好多需要考虑和操作的东西。这就是为什么我们要用 [UIGraphicsImageRender](https://www.swiftjectivec.com/uigraphicsimagerenderer/) 而不是用 UIGraphicsBeginImageContextWithOptions，后者总是会使用 sRGB，也就是说在你想用[更广的色域](https://instagram-engineering.com/bringing-wide-color-to-instagram-5a5481802d7d)的时候无法使用它们，或者在你想选择较小色域的时候没法节省内存。在 iOS 12 以后，UIGraphicsImageRender 会帮你选择最合适的那一个。

这里再提一嘴，免得过会再忘了，很多我们截的图片其实并不是拍摄类型，而仅仅是简单的绘图操作。并不是说想重提我前一阵写过的东西，但是以防你之前没看过：

{% codeblock lang:swift %}
    let circleSize = CGSize(width: 60, height: 60)

    UIGraphicsBeginImageContextWithOptions(circleSize, true, 0)

    // 画个圈圈
    let ctx = UIGraphicsGetCurrentContext()!
    UIColor.red.setFill()
    ctx.setFillColor(UIColor.red.cgColor)
    ctx.addEllipse(in: CGRect(x: 0, y: 0, width: circleSize.width, height: circleSize.height))
    ctx.drawPath(using: .fill)

    let circleImage = UIGraphicsGetImageFromCurrentImageContext()
    UIGraphicsEndImageContext()
{% endcodeblock %}

 上边这个圆形图像使用的是每个像素 4 个字节的格式。如果使用 UIGraphicsImageRender 的话，它会自动帮你选择最合适的格式来渲染，这样你在全部选用每像素 1 个字节的格式的情况下最多能节省 75% 的内存。

{% codeblock lang:swift %}
    let circleSize = CGSize(width: 60, height: 60)
    let renderer = UIGraphicsImageRenderer(bounds: CGRect(x: 0, y: 0, width: circleSize.width, height: circleSize.height))

    let circleImage = renderer.image{ ctx in
        UIColor.red.setFill()
        ctx.cgContext.setFillColor(UIColor.red.cgColor)
        ctx.cgContext.addEllipse(in: CGRect(x: 0, y: 0, width: circleSize.width, height: circleSize.height))
        ctx.cgContext.drawPath(using: .fill)
    }
{% endcodeblock %} 

## 缩放 VS. 降采样

先把刚才那个简单的绘图的例子放在一边，其实大部分与图片相关会影响内存使用的问题都源自于那些现实生活中人们摄影的照片。包括用 portraits 和 landscape 拍出来的照片和一些其他的照片。

这也证明了为什么一些程序猿们会觉得用 UIImageView 进行图片缩放就够使了。但是 UIImageView 的问题一般不是因为上边所罗列出来的原因，而且根据苹果大神 Kyle Howarth 的说法，它性能不好是因为内部坐标的转换。

在这种情况下，UIImage 会影响效率的一个主要原因是它会按照我们之前在渲染管线中讨论过的那样把原始图片压缩进内存中。而在理想情况下，我们需要想个办法来减少图片缓存区的大小。

庆幸的是，只用被缩放后图片所消耗的内存来调整图片大小是有可能的，这也是为什么好多人会以为这个是在缩放图片时的默认行为。然而实际情况并不是这样。

我们现在尝试换成底层的 API 来进行缩放：

{% codeblock lang:swift %}
    let imageSource = CGImageSourceCreateWithURL(url, nil)!
    let options: [NSString:Any] = [kCGImageSourceThumbnailMaxPixelSize:400,
                                kCGImageSourceCreateThumbnailFromImageAlways:true]

    if let scaledImage = CGImageSourceCreateThumbnailAtIndex(imageSource, 0, options as CFDictionary) {
        let imageView = UIImageView(image: UIImage(cgImage: scaledImage))
        
        imageView.translatesAutoresizingMaskIntoConstraints = false
        imageView.contentMode = .scaleAspectFit
        imageView.widthAnchor.constraint(equalToConstant: 300).isActive = true
        imageView.heightAnchor.constraint(equalToConstant: 400).isActive = true
        
        view.addSubview(imageView)
        imageView.centerXAnchor.constraint(equalTo: view.centerXAnchor).isActive = true
        imageView.centerYAnchor.constraint(equalTo: view.centerYAnchor).isActive = true
    }
{% endcodeblock %} 

我们会得到和以前一样的结果。但是这次，我们用的是听起来就有逼格的 CGImageSourceCreateThumbnailAtIndex() 而不是简单得把图片丢给 image view 来处理。又一次，我们这次优化是否有效的真相就藏在 vmmap 中（为了简便就做了四舍五入）：

{% codeblock lang:swift %}
vmmap -summary baylorOptimized.memgraph

Physical footprint:         56.3M
Physical footprint (peak):  56.7M
{% endcodeblock %} 

我们已经能看到省了不少内存。如果和之前的 69.5MB 相比，56.3MB 足足少了 13.2MB。这是一笔很大的节省，几乎相当于整张图片的消耗。

接下来，有很多选择能让你在不同的情况下去做尝试。在 WWDC 18的会议 219 “图像和图形的最好实践”中，苹果公司的工程师 Kyle Sluder 给我们展示了一个非常有趣的方法 - 使用 kCGImageSourceShouldCacheImmediately 标识位来控制解析过程：

{% codeblock lang:swift %}
    func downsampleImage(at URL:NSURL, maxSize:Float) -> UIImage
    {
        let sourceOptions = [kCGImageSourceShouldCache:false] as CFDictionary
        let source = CGImageSourceCreateWithURL(URL as CFURL, sourceOptions)!
        let downsampleOptions = [kCGImageSourceCreateThumbnailFromImageAlways:true,
                                kCGImageSourceThumbnailMaxPixelSize:maxSize
                                kCGImageSourceShouldCacheImmediately:true,
                                kCGImageSourceCreateThumbnailWithTransform:true,
                                ] as CFDictionary
        
        let downsampledImage = CGImageSourceCreateThumbnailAtIndex(source, 0, downsampleOptions)!
        
        return UIImage(cgImage: downsampledImage)
    }
{% endcodeblock %} 

在上边的函数中，Core Graphics 会在你想要缩略图的特定时刻才会进行解析。 注意要像我们之前的那两个例子中一样加入 kCGImageSourceCreateThumbnailMaxPixelSize 的变量，因为如果你不加的话，你得到的缩略图会和原图一样大。文档中这样说：

> “如果不指定像素大小上限的话，缩略图就会跟原图一样大，你肯定不想看到这样的结果”

所以发生了什么？简单的说，就是我们通过在缩放阶段使用缩略图从而创建了一个比以前小很多的解析图片缓存区。现在回头想想我们的渲染管线，第一步（载入）中我们丢给 UIImage 一个只包含我们要展示的图片的图片缓存区，而不是传入相当于整个图片维度的缓存区让它去解析。

如果你想用一秒钟来读完这篇文章的话就记住一句话。有机会的话一定要用降采样而不是使用 UIImage 的缩放来处理图片。

## 彩蛋时间

我个人喜欢把上边的方法和 iOS 11 以后引入的 [prefetch API](https://developer.apple.com/documentation/uikit/uitableviewdatasourceprefetching?language=swift) 放在一起用。要记住，因为我们要在 table view 或者 collection view 显示 cell 之前解析图片，所以我们很容易不知不觉的就引入 CPU 峰值。

因为 iOS 非常擅长在有稳定电量需求的情况下管理电量使用，但是在这种情况下电量需求是断断续续的，所以是时候让我们自己写的队列来展示真正的技术了。这样做也会把解析过程放在背景线程中，一石二鸟啊。

捂上你的双眼，别被下边我的小项目里的 OC 的代码亮瞎了：

{% codeblock lang:objc %}
// 使用你自己写的队列而不是 global async 可以避免线程崩溃
- (void)tableView:(UITableView *)tableView prefetchRowsAtIndexPaths:(NSArray<NSIndexPath *> *)indexPaths
{
    if (self.downsampledImage != nil || 
        self.listItem.mediaAssetData == nil) return;
    
    NSIndexPath *mediaIndexPath = [NSIndexPath indexPathForRow:0
                                                     inSection:SECTION_MEDIA];
    if ([indexPaths containsObject:mediaIndexPath])
    {
        CGFloat scale = tableView.traitCollection.displayScale;
        CGFloat maxPixelSize = (tableView.width - SSSpacingJumboMargin) * scale;
        
        dispatch_async(self.downsampleQueue, ^{
            // Downsample
            self.downsampledImage = [UIImage downsampledImageFromData:self.listItem.mediaAssetData
                               scale:scale
                        maxPixelSize:maxPixelSize];
            
            dispatch_async(dispatch_get_main_queue(), ^ {
                self.listItem.downsampledMediaImage = self.downsampledImage;
            });
        });
    }
}
{% endcodeblock %}

>  在有很多图片 asset 的情况下，记得一定要使用 Asset Catalog，因为它早已经帮你管理好了缓存区的大小（还有很多其他的东西）。

如果想在成为内存和图片的一等公民这个话题中得到更多的启发，记得一定要看 WWDC 18 中这些有含金量的会议：

· [深入了解 iOS 内存](https://developer.apple.com/videos/play/wwdc2018/416/?time=1074)
· [图像和图形的最佳实践](https://developer.apple.com/videos/play/wwdc2018/219/)

## 小结

你不知道的就是不知道。要知道作为码农，你走上的的是一个每天需要跑 10000 公里才能赶得上潮流的不归路。换句话说就是，有成千上万的你没接触过的 API，框架，模式或者优化方式。

这也适用在图片处理上。大部分时候你都会用一堆漂亮的像素点来初始化 UIImageView 就哦了。我理解，摩尔定律嘛，反正这些手机都有几个 G 的内存。况且，我们就用了那种不到 100k 内存的电脑就把人给送上了月球了。

但是俗话说得好，常在河边走哪有不湿鞋。不要让内存垃圾成为系统给你罚款的理由，因为现在随便一张自拍都得要一个 G 的内存。但愿这些知识和套路能减少你看崩溃日志的次数。

请听下回分解✌️。