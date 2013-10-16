---
layout: post
title: C - initializer element is not constant
category: tech
---
写代码的时候, 写出了类似下面的一段代码:

    int foo() {
        return 0;
    }

    int bar = foo();

编译的时候, gcc 报错:

    error: initializer element is not constant

在 The C Programming Language 有这么一段话:

> For external and static variables, the initializer must be a constant expression; the initialization is done once, conceptionally before the program begins execution.

先解释下几个名词:

- **External Variables**

    定义在函数外面的变量.

- **Static Variables**

    被 static 关键字修饰的变量, 这个变量可以是 External Variables 也可以是 Internal Variables (定义在函数里面的变量).

- **Constant Expression**

    简单来说就是在编译期间就能计算出值的表达式, 比如说, 常量的数学表达式 (1 + 1), 
External 和 Static 的变量的取地址操作, 函数指针的赋值操作:

        int foo() {
            return 0;
        }

        int (*bar)() = foo;

    具体的关于 Constant Expression 的定义可以参照 C99.

那么, 为什么 External 和 Static 的变量的初始化值要能在编译期间就确定呢?

因为编译完成后, External 和 Static 的变量是位于可执行文件的 data segment 中的, 
这部分将和 code segment 一起载入到内存中, 所以他们的初始化值是在运行前就要确定的.
