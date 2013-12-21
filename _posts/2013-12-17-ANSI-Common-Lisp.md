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

    Lisp 不会 evaluate 一个 list 的第一个元素 (operator),
    然后根据返回的值来进行函数调用.

    所以下面这段代码是非法的:

        (setq lst '(+))
        ((car lst) 2 3)

2. **(function name)** _Special Operator_

    > Returns the function whose name is name, which can be either **a symbol, a list
    > of the form (setf /) , or a lambda expression**. If / is a built-in operator, it is
    > implementation-dependent whether or not there is a function called (setf /) .

    因为 _function_ 是一个 Special Operator 所以 name 不会被 evaluate.
    #' (sharp-quote) 是它的缩写, 就像 ' (quote) 是 _quote_ 的缩写一样.

3. **(apply function &rest args)** _Function_

    > Calls function on args, of which there must be at least one. The last arg must
    > be a list. The arguments to the function consist of each arg up to the last, plus
    > each element of the last; that is, the argument list is composed as if by list*.
    > **The function can also be a symbol**, in which case its global function definition
    > is used.

    _apply_ 的第一个参数不一定是一个 function object,
    也可以是一个 symbol, 所以下面这两个表达式都是正确的:
        
        (apply #'+ 2 3)
        (apply '+ 2 3)

    _funcall_ 也可以传一个 function object 或者是一个 symbol.

4. **(let ({symbol | {(symbol [value])}*)** _Special Operator_

    **     declaration* expression*)**

    > Evaluates its body with each symbol bound to the value of the corresponding
    > value expression, or nil if no value is given.

    _let_ 第一个参数是一个 list, 里面的元素可以是 symbol, 
    也可以是形如 _(symbol [value])_ 的 list.

5. **(case object (key expression*)\*** _Macro_

    **             [({t | otherwise} expression*)])**
    > Evaluates object, then looks at the remaining clauses in order; if the object is
    > eql to or a member of the key (not evaluated) of some clause, or the clause
    > begins with t or otherwise, then evaluates the following expressions and
    > returns the value(s) of the last. Returns nil if no key matches, or the matching
    > key has no expressions. The symbols t and otherwise may not appear as
    > keys, but you can get the same effect by using (t) and (otherwise).

    如果 key 是 _nil_, 那么这个 clause 里的 expressions 永远都不会被执行,
    即使你的 object 的值是 _nil_. 类似于 _(t)_ 和 _(otherwise)_,
    我们可以用 _(nil)_ 来消除二义性.

    这里的二义是指, 如果 key 是 _nil_, _t_ 和 _otherwise_ 
    中的一个的时候, 那么究竟是表示它的特殊含义,
    还是表示 object 的值等于它的时候就执行后面的 expressions 呢?

    下面这个例子可以很好的说明问题:

        (case nil
            (nil nil)
            (t t)

        (case nil
            ((nil) nil)
            (t t))

    第一个表达式的值是 _t_, 而第二个表达式的值是 _nil_.
