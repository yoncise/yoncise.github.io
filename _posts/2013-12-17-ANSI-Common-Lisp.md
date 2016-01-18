---
layout: post
title: ANSI Common Lisp
category: Note
modified: 2013-12-30
---
1. **Evaluation rule**

    > In Lisp, _+_ is a function, and an expression like _(+ 2 3)_ is a function call.
    > When Lisp evaluates a function call, it does so in two steps:
    > 
    > 1. First the arguments are evaluated, from left to right. In this case, each
    > argument evaluates to itself, so the values of the arguments are 2 and
    > 3, respectively.
    > 
    > 2. The values of the arguments are passed to the function named by the
    > operator. In this case, it is the _+_ function, which returns 5.

    Lisp 不会 evaluate 一个 list 的第一个元素 (operator),
    然后根据返回的值来进行函数调用.

    所以下面这段代码是非法的:

        (setq lst '(+))
        ((car lst) 2 3)

2. **function** _(Special Operator)_

        (function name)

    > Returns the function whose name is _name_, which can be either **a symbol, a list
    > of the form _(setf f)_ , or a lambda expression**. If _f_ is a built-in operator, it is
    > implementation-dependent whether or not there is a function called _(setf f)_ .

    因为 _function_ 是一个 Special Operator 所以 _name_ 不会被 evaluate.
    _#'_ (sharp-quote) 是它的缩写, 就像 _'_ (quote) 是 _quote_ 的缩写一样.

3. **apply** _(Function)_

        (apply function &rest args)

    > Calls _function_ on _args_, of which there must be at least one. The last arg must
    > be a list. The arguments to the function consist of each _arg_ up to the last, plus
    > each element of the last; that is, the argument list is composed as if by _list*_.
    > **The _function_ can also be a symbol**, in which case its global function definition
    > is used.

    _apply_ 的第一个参数不一定是一个 function object,
    也可以是一个 symbol, 所以下面这两个表达式都是正确的:
        
        (apply #'+ 2 3)
        (apply '+ 2 3)

    _funcall_ 也可以传一个 function object 或者是一个 symbol.

4. **let** _(Special Operator)_

        (let ({symbol | {(symbol [value])}*)
             declaration* expression*)

    > Evaluates its body with each _symbol_ bound to the value of the corresponding
    > _value_ expression, or _nil_ if no _value_ is given.

    _let_ 第一个参数是一个 list, 里面的元素可以是 symbol, 
    也可以是形如 _(symbol [value])_ 的 list.

5. **case** _(Macro)_

        (case object (key expression*)*
                     [({t | otherwise} expression*)])

    > Evaluates _object_, then looks at the remaining clauses in order; if the _object_ is
    > eql to or a member of the _key_ (not evaluated) of some clause, or the clause
    > begins with _t_ or _otherwise_, then evaluates the following _expressions_ and
    > returns the value(s) of the last. Returns _nil_ if no _key_ matches, or the matching
    > _key_ has no _expressions_. The symbols _t_ and _otherwise_ may not appear as
    > _keys_, but you can get the same effect by using _(t)_ and _(otherwise)_.

    如果 _key_ 是 _nil_, 那么这个 clause 里的 _expressions_ 永远都不会被执行,
    即使你的 _object_ 的值是 _nil_. 类似于 _(t)_ 和 _(otherwise)_,
    我们可以用 _(nil)_ 来消除二义性.

    这里的二义是指, 如果 _key_ 是 _nil_, _t_ 和 _otherwise_ 
    中的一个的时候, 那么究竟是表示它的特殊含义,
    还是表示 _object_ 的值等于它的时候就执行后面的 _expressions_ 呢?

    下面这个例子可以很好的说明问题:

        (case nil
            (nil nil)
            (t t)

        (case nil
            ((nil) nil)
            (t t))

    第一个表达式的值是 _t_, 而第二个表达式的值是 _nil_.

6. **Vertical bar**

    > There is a special syntax for referring to symbols whose names contain
    > whitespace or other things that might otherwise be significant to the reader.
    > Any sequence of characters between vertical bars is treated as a symbol.

        > (list '|Lisp 1.5| '|| '|abc| '|ABC|)
        (|Lisp 1.5| || |abc| ABC)

    > Remember that the vertical bars are a special syntax for denoting symbols.
    > They are not part of the symbol's name:

        > (symbol-name '|a b c|)
        "a b c"

    > (If you want to use a vertical bar in the name of a symbol,
    > you can do it by putting a backslash before the bar.)
