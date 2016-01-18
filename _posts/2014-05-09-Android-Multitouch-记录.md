---
layout: post
title: Android - Multitouch 记录
category: Tech
---
今天看 Android Developer 上的 [Handling Multi-Touch Gestures](http://developer.android.com/training/gestures/multi.html)
这篇文章, 感觉有几个地方写的不是很好, 费了好大劲才理解.
把几个不是太好理解的点记录下.

## Index vs ID

> **Index**: A MotionEvent effectively stores information about each pointer in an array. The index of a pointer is its position within this array. Most of the MotionEvent methods you use to interact with pointers take the pointer index as a parameter, not the pointer ID.
> 
> **ID**: Each pointer also has an ID mapping that stays persistent across touch events to allow tracking an individual pointer across the entire gesture.

这里需要注意的就是对于每一个 Pointer (也就是你的手指), Index 是会变化的.
比如说你食指先触摸屏幕, 然后中指, 无名指也依次触摸屏幕, 
那么这三个手指的 Index 分别是 0, 1, 2. 这时候如果你将食指抬起,
中指, 无名指的 Index 就会分别变成 0, 1. 食指 (换小拇指也行...)
再次触摸屏幕, 食指 (或者是小拇指...), 中指,
无名指的 Index 就又分别变成了 0, 1, 2. 一开始我以为会变成 2, 0, 1 的,
本来想看下源码里的实现, 然后发现代码里调用的是 native 的方法, 只好算了,
大概和数据结构有关吧.

对于 ID 来说, 只要你的手指不离开屏幕, 对应的 ID 就不会变化.

## Touch events

> When multiple pointers touch the screen at the same time, the system generates the following touch events:
> 
> ACTION_DOWN—For the first pointer that touches the screen. This starts the gesture. The pointer data for this pointer is always at index 0 in the MotionEvent.
>
> ACTION_POINTER_DOWN—For extra pointers that enter the screen beyond the first. The pointer data for this pointer is at the index returned by getActionIndex().
>
> ACTION_MOVE—A change has happened during a press gesture.
>
> ACTION_POINTER_UP—Sent when a non-primary pointer goes up.
>
> ACTION_UP—Sent when the last pointer leaves the screen.

1. ACTION_MOVE
    
    当你多个手指在屏幕上移动的时候,
    只有 Index 为 0 的那个 Pointer 会触发 ACTION_MOVE 的事件.

2. ACTION_POINTER_UP

    文档里说, 当 non-primary 的 Pointer 离开时会触发该事件,
    那么什么叫 non-primary? 我一开始认为非第一个触摸的手指就是 non-primary 的,
    后来看到 Android 官方博客里的 [Making Sense of Multitouch](http://android-developers.blogspot.com/2010/06/making-sense-of-multitouch.html)
    这篇文章, 里面写到:

    > If there is already a pointer on the screen and a new one goes down, you will receive ACTION_POINTER_DOWN instead of ACTION_DOWN. If a pointer goes up but there is still at least one touching the screen, you will receive ACTION_POINTER_UP instead of ACTION_UP.

    所以对于 ACTION_POINTER_UP 来说, 一个 Pointer 只要不是最后一个离开屏幕的,
    那么它就是 non-primary 的.

## getX(), getY()

> getX()
>
> *getX(int) for the first pointer index (may be an arbitrary pointer identifier).*
>
> getY()
>
> *getY(int) for the first pointer index (may be an arbitrary pointer identifier).*

直接调用 getX(), getY() 得到的竟然不是触发该事件的 Pointer 的坐标,
还非要获取 Index 之后再去调用 getX(int pointerIndex) 和 getY(int pointerIndex)
来获取当前的 Pointer 的坐标.
