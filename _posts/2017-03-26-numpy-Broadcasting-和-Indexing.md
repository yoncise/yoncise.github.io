---
layout: post
title: numpy Broadcasting 和 Indexing
---

## Broadcasting

> Broadcasting allows **universal functions** to deal in a meaningful way with inputs
> that **do not have exactly the same shape**.

universal functions 简单理解就是 elementwise 的函数.

Broadcasting 就两条规则:

1. 如果两个 array 的 ndim 不一样, 那么就向 ndim 小的数组的 shape
**prepend** `1`, 直到两个数组的 ndim 一样.

    比如: 数组 `a` 和 `b` 的 shape 分别为 `(3, 4)` 和 `(4)`,
    那么, 根据规则一, 会将 `b` 的 shape 变成 `(1, 4)` (注意是 prepend, 所以不是变成 `(4, 1)`)

2. 如果两个数组在某个维度的 size 不一致且其中一个数组的 size 为 `1`, 那么就将 size 为 `1`
的数组沿着这个维度复制, 直到 size 和另一个数组一致.

    比如:  数组 `a` 和 `b` 的 shape 分别为 `(3, 4)` 和 `(1, 4)`

        >>> b
        array([[0, 1, 2, 3]])

    那么 numpy 会将 `b` 当做:
        
        array([[ 0.,  1.,  2.,  3.],
               [ 0.,  1.,  2.,  3.],
               [ 0.,  1.,  2.,  3.]])


## Indexing

Indexing 分为两种情况: 1). Integer 的数组 2). Boolean 的数组.

### Integer

数组 `a` 接受 `a[idx0, idx1, idx2, ...]` 形式的 indexing, 其中 `idx0`, `idx1`...
的 shape 要一致 (或者可以经过 Broadcasting 后一致) 且 `idx` 的数量要小于等于 `a.ndim`.

假如 `idx0 = np.array([2, 1])`, `idx1 = np.array([2])`.

那么 `a[idx0, idx1]` 的结果为:

1. 将 `idx0` 和 `idx1` "合并" (经过 Broadcasting 后两个数组的 shape 将会"一致",
将相应位置的元素合并):

        [(2, 2), (1, 2)]

2. 最终结果为:

        [a[2][2], a[1][2]]

### Boolean

Boolean 数组的 indexing 分为两种情况:

1. 数组 `a` 接受 `a[idx]` 形式的 indexing, 其中 `idx.ndim = a.ndim` (不是 shape).

    `a[idx]` 的结果为 ndim 为 `1` 的数组, 内容由 `a` 中 `idx` 在相同位置值为 `True` 的数据组成 
    (如果 `a` 中存在找不到对应 `idx` 中的值, 则视为 `False`. 如果 `idx` 中存在找不到对应 `a` 中的值, 则报错).

2. 数组 `a` 接受 `a[idx0, idx1, ...]` 形式的 indexing, 其中 `idx0`, `idx1`...
的 ndim 为 `1`. 

    `a[idx0, idx1, ...] = a[np.arange(idx0.shape[0])[idx0], np.arange(idx1.shape[0])[idx1], ...]`

    也就是说使用多个 boolean 数组 indexing 时, boolean 数组会先转化成 `np.arange(<boolean 数组>.shpae[0])[<boolean 数组>]`
    的 integer 数组.

    比如:

        a = np.arange(12).reshape(3, 4)
        idx0 = np.array([True, False])
        idx1 = np.array([False, True, True])

    那么 `a[idx0, idx1]` 等价于 `a[np.array([0]), np.array([1, 2])]` (这里会先 Broadcasting).

ps. indexing 时尽量使用 array 而不是 python 自带的 list, 因为 `a[idx0, idx1, ...]`
等价于 `a[[idx0, idx1, ...]]` 而不等价于 `a[np.array([idx0, idx1, ...])`. 

> [Broadcasting rules](https://docs.scipy.org/doc/numpy-dev/user/quickstart.html#broadcasting-rules)
>
> [Fancy indexing and index tricks](https://docs.scipy.org/doc/numpy-dev/user/quickstart.html#fancy-indexing-and-index-tricks)
