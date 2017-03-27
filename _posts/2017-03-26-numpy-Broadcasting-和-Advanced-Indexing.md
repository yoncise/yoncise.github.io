---
layout: post
title: numpy Broadcasting 和 Advanced Indexing
---

## Broadcasting

> Broadcasting allows **universal functions** to deal in a meaningful way with inputs
> that **do not have exactly the same shape**.

Universal functions 简单理解就是 elementwise 的函数.

Broadcasting 就两条规则:

1. 如果两个数组的 ndim 不一样, 那么就向 ndim 小的数组的 shape
**prepend** `1`, 直到两个数组的 ndim 一样.

    比如: 数组 `a` 和 `b` 的 shape 分别为 `(3, 4)` 和 `(4)`,
    那么, 根据规则, 会将 `b` 的 shape 变成 `(1, 4)` (注意是 prepend, 所以不是变成 `(4, 1)`)

2. 如果两个数组在某个维度的 size 不一致且其中一个数组的 size 为 `1`, 那么就将 size 为 `1`
的数组沿着这个维度复制, 直到 size 和另一个数组一致.

    比如:  数组 `a` 和 `b` 的 shape 分别为 `(3, 4)` 和 `(1, 4)`

        >>> b
        array([[0, 1, 2, 3]])

    那么 numpy 会将 `b` 当做:
        
        array([[ 0.,  1.,  2.,  3.],
               [ 0.,  1.,  2.,  3.],
               [ 0.,  1.,  2.,  3.]])


## Advanced Indexing

所谓 Advanced Indexing 就是, `a[obj]` 中的 `obj` 属于下面三种情况:

1. 不是 tuple
2. 是 ndarray (值为 Integer 或 Boolean)
3. 是一个 tuple 但其中的值至少有一个是 sequence 或 ndarray (值为 Integer 或 Boolean)

Advanced Indexing 分为两种情况: 1). Integer 的数组 2). Boolean 的数组.

### Integer

数组 `a` 接受 `a[idx0, idx1, idx2, ...]` 形式的 indexing, 其中 `idx0`, `idx1`...
的 shape 要一致 (或者可以经过 Broadcasting 后一致) 且 `idx` 的数量要小于等于 `a.ndim`.

假如 `idx0 = np.array([2, 1])`, `idx1 = np.array([2])`.

那么 `a[idx0, idx1]` 的结果为:

1. 将 `idx0` 和 `idx1` "合并" (经过 Broadcasting 后两个数组的 shape 将会"一致",
将相应位置的元素合并):

        [(2, 2), (1, 2)]

2. 最终结果为:

        [a[2, 2], a[1, 2]]

### Integer 数组和 slicing 结合

当 index 里出现 slicing (`start:end:step`) 对象和 Integer 数组混合使用的情况时, 结果会变得比较复杂.

我们可以从最终结果的 shape 来理解这一情况. 当 slicing 和 Integer 数组混合使用时, 有两种情况:

1. slicing 位于Integer 数组之间. 比如: `a[[0, 2], :, 1]` (这里的 `1` 相当于 `[1]`, 因为现在讨论的是 Advanced Indexing)

2. Integer 数组之间没有 slicing. 比如: `a[..., [0, 1], [1, 2], :]`

在第一种情况下, 我们假设多个 Integer 数组经过 Broadcasting 后的 shape 为 `shapeA`, slicing 组成的 shape
为 `shapeB`, 那么最终的 shape 为 `(shapeA, shapeB)`, Integer 数组最终的 shape 被提到了最前面. 比如:

    >>> a = np.arange(24).reshape(3, 2, 4)
    >>> a[[0, 1, 2], :, 1].shape
    (3, 2)

第二种情况, Integer 数组最终的 shape 会在原来的位置. 比如:

    >>> a = np.arange(81).reshape(3, 3, 3, 3)
    >>> a[:, [[0, 1], [0, 1]], [0, 2] , :].shape
    (3, 2, 2, 3)

下面看一个比较复杂的例子:

    >>> a = np.arange(243).reshape(3, 3, 3, 3, 3)
    >>> a[:, [[0, 1], [0, 1]], [0, 2] , :, [0, 1]].shape
    (2, 2, 3, 3)

知道了 shape 之后, indexing 的结果就比较好得出了, 根据 shape, 看对应的是哪个维度在变化就好了.

### Boolean

Boolean 数组的 indexing 分为两种情况:

1. 数组 `a` 接受 `a[idx]` 形式的 indexing, 其中 `idx.ndim = a.ndim` (不是 shape).

    `a[idx]` 的结果为 ndim 为 `1` 的数组, 内容由 `a` 中 `idx` 在相同位置值为 `True` 的数据组成 
    (如果 `a` 中存在找不到对应 `idx` 中的值, 则视为 `False`. 如果 `idx` 中存在找不到对应 `a` 中的值, 则报错).

2. 数组 `a` 接受 `a[idx0, idx1, ...]` 形式的 indexing, 其中 `idx0`, `idx1`...
的 ndim 为 `1`. 那么 `a[idx0, idx1, ...]` 等价于 `a[np.arange(idx0.size)[idx0], np.arange(idx1.size)[idx1], ...]`

    也就是说使用多个 Boolean 数组 indexing 时, Boolean 数组会先转化成 `np.arange(<Boolean 数组>.size)[<Boolean 数组>]`
    的 Integer 数组.

    比如:

        >>> a = np.arange(12).reshape(3, 4)
        >>> idx0 = np.array([True, False])
        >>> idx1 = np.array([False, True, True])
        >>> a[idx0, idx1]
        array([1, 2])

    那么 `a[idx0, idx1]` 等价于 `a[np.array([0]), np.array([1, 2])]` (这里会先 Broadcasting).

ps. indexing 时尽量使用 ndarray 而不是 python 自带的 list, 因为 `a[idx0, idx1, ...]`
等价于 `a[[idx0, idx1, ...]]` 而不等价于 `a[np.array([idx0, idx1, ...])`. 

> [Broadcasting rules](https://docs.scipy.org/doc/numpy-dev/user/quickstart.html#broadcasting-rules)
>
> [Fancy indexing and index tricks](https://docs.scipy.org/doc/numpy-dev/user/quickstart.html#fancy-indexing-and-index-tricks)
>
> [Advanced Indexing](https://docs.scipy.org/doc/numpy/reference/arrays.indexing.html#advanced-indexing)
