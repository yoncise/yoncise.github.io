---
layout: post
title: ANSI Common Lisp
category: Note
---
1. **evaluation rule**

    > In Lisp, + is a function, and an expression like (+ 2 3) is a function call.
    > When Lisp evaluates a function call, it does so in two steps:
    > 
    > 1. First the arguments are evaluated, from left to right. In this case, each
    > argument evaluates to itself, so the values of the arguments are 2 and
    > 3, respectively.
    > 
    > 2. The values of the arguments are passed to the function named by the
    > operator. In this case, it is the + function, which returns 5.

    对于一个表达式, 第一个元素必须是一个 Symbol 或者是一个 lambda 表达式.
    其中, Symbol 要么是一个 Function 要么是一个 Macro 要么是一个 Special Operator.
    Lisp 不会 evaluate 一个表达式的第一个元素然后根据返回的值来进行函数调用.

    所以下面这段代码是非法的:

        (setq lst '(+))
        ((car lst) 2 3)

2. **(function name)** _Special Operator_

    > Returns the function whose name is name, which can be either **a symbol, a list
    > of the form (setf /) , or a lambda expression**. If / is a built-in operator, it is
    > implementation-dependent whether or not there is a function called (setf /) .

    因为 function 是一个 Special Operator 所以 name 不会被 evaluate.
    #' (sharp-quote) 是它的缩写, 就像 ' (quote) 是 quote 的缩写一样.

3. **(apply function ftrest args)** _Function_

    > Calls function on args, of which there must be at least one. The last org must
    > be a list. The arguments to the function consist of each org up to the last, plus
    > each element of the last; that is, the argument list is composed as if by list*.
    > **The function can also be a symbol**, in which case its global function definition
    > is used.

    apply 的第一个参数不一定是一个 function object,
    也可以是一个 Symbol, 所以下面这两个表达式都是正确的:
        
        (apply #'+ 2 3)
        (apply '+ 2 3)
