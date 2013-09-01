---
layout: post
title: JavaScript Function Scope and Closures
category: notes
---
重看了 "JavaScript: The Definitive Guide" 中的 Section 8.8: Function Scope and Closures, 略记录几点.

## Scope

书中有这么一段话:

> Functions in JavaScript are lexically rather than dynamically scoped. 
> This means that they run in the scope in which they are defined, not the scope from which they are executed.

一开始我对 define 产生了误解, 比如下面这段代码:

    function foo() {
        function bar() {
        }
    }

我本来对 define 的理解是, foo() 被 define 的时候, bar() 也被 define 了. 而事实是, 当 foo() 被调用的时候, 
bar() 才被 define.

## Closure

为什么要叫 Closure? 我印象中, 闭包应该是数学上的概念, 比如 Wiki 上对 Closure 的定义是:

> A set has closure under an operation if performance of that operation on members of the set always produces a member of the same set.

再来看 "JavaScript: The Definitive Guide" 中对 Closure 的定义:

> JavaScript functions are a combination of code to be executed and the scope in which to execute them. 
> This combination of code and scope is known as a closure in the computer science literature.

数学上对 Closure 的定义中有两个关键字: set 和 operation, 
正好对应 JavsScript 对 Closure 的定义中的 scope 和 code. Code 对 scope 里的变量进行操作, 
操作后的变量仍然是属于 scope 的. JavaScript 中 Closure 这个名字真的是取得再合适不过了!
