---
layout: post
title: Python Formal Parameter and Argument
category: notes
---
首先, 我们定义一个函数:

    def f(name = 2, *arguments, **keywords):
        print name
        print arguments
        print keywords

## 三种 Argument (实参)

1. **Default Argument**

    f(), 传入了一个 Default Argument, name 的值为定义函数 f 时指定的 2.

2. **Positional Argument**

    f(4), 传入一个 Positional Argument, name 的值为 4.

3. **Keyword Argument**

    f(name = 24), 传入一个 Keyword Argument, name 的值为 24.

    同一个 Argument 只能被赋值一次:

        f(4, name = 24)
    
    这条语句非法, 因为 name 被赋值了两次, 第一次是 Positional Argument, 第二次是 Keyword Argument.

    Keyword Argument 必须接在 Positional Argument 的后面, 下面一条语句非法:

        f(name = 24, 4)

## 三种 Formal Parameter (形参)

1. **形如 name**

    最普通的形参, 不解释.

2. **形如 *arguments**

    这种类型的形参就像个收容所, 收容那些没有匹配成功的 Positonal Argument, 
    其值为没匹配成功的 Positional Argument 组成的 Tuple.

        f(4, 5, 6, k = 7)

    4 与 name 相匹配, k = 7 是 Keyword Argument, 所以最终的值为 (5, 6).
    
    一个函数定义中只能有一个这样的形参, 且无法用 Default Argument 来赋值, 下面两个函数都是非法的:

        def foo(*args1, *args2):
            pass

        def bar(*args = (2, 4)):
            pass

    那么我们可不可以通过 Keyword Argument 来传参呢, 例如:

        f(arguments = (2, 4))

    上面这条语句并不会报错, 但是你会发现 arguments 的值仍然为 (), 空的 Tuple, 为什么会这样呢? 
    这和下面一种 Parameter 有关.

3. **形如 \**keywords**

    这种 Parameter 和上面一种差不多, 只不过它收容的是所有未匹配成功的 Keyword Argument, 
    其值为没匹配成功的 Keyword Argument 组成的 Dictionary.

        f(name = 24, m = 2, d = 4)

    name = 24 与 name 相匹配, 所以 keywords 的值为 {'m': 2, 'd': 4}
    
    同样的, 一个函数中也只能有一个这样的形参, 我们也无法通过 Default Argument 为其赋值.
    还记得 f(arguments = (2, 4)) 这条语句么? arguments 之所以为空 Tuple, 是因为 arguments 被 keywords 给"强制收容"了, 
    keywords 的值为 {'arguments': (2, 4)}. 那么 f(keywords = {'m': 2, 'd': 4}) 呢? 自己试试看吧.
