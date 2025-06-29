---
title: ARTS 打卡 09
date: 2020-12-01 21:38:19
tags:
categories:
- ARTS
copyright: true
comments: true
visible: hide
---
## Algorithm

排序链表圈（Leetcode 148，中等）

{% codeblock lang:python %}

class Solution:
    def sortList(self, head: ListNode) -> ListNode:
        if not head or not head.next:
            return head
        mid = self.find_mid(head)
        right = self.sortList(mid.next)
        mid.next = None
        left = self.sortList(head)

        return self.merge(left, right)
        
    def merge(self, left, right):
        dummy = ListNode(0)
        tail = dummy
        while left and right:
            if left.val <= right.val:
                tail.next = left
                left = left.next
            else:
                tail.next = right
                right = right.next
            tail = tail.next
        if left:
            tail.next = left
        if right:
            tail.next = right
        return dummy.next

    def find_mid(self, head):
        slow, fast = head, head.next
        while fast and fast.next:
            fast = fast.next.next
            slow = slow.next
        return slow

{% endcodeblock %}

## Review

[Use model deployment and security with Core ML](https://developer.apple.com/videos/play/wwdc2020/10152/)

通过 WWDC 这个讲座了解到了 MLModel 可以通过 AppleCloud 的方式进行更新和维护，还可以有不同的 ModelCollection 针对不同种类的用户，如果使用这种方式的话并不会增加包体积，而且还有了官方支持的方法可以进行 A/B Test。之后在一些需要实时机器学习的场景（比如视频，音频等）就可以引入 MLModel 而不是用云端处理的方式，这样会有更好的用户体验。

## Tips
	
这两周没想起来啥 Tips，鸽了。

## Share

[CreateML - 开启革命的星星之火](https://cyberhex.me/2020/11/24/create-ml-introduction/)