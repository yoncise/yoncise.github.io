---
layout: post
title: Python Method Resoluton Order
---
面向对象语言中, 为了找到一个方法的定义, 搜索继承图的顺序叫做 MRO (Method Resolution Order), 
对于只支持单继承的语言, MRO 没什么好说的. 但对于支持多继承的语言, 比如 Python, MRO 就有搞头了.

在 Python 的发展过程中至少有三种 MRO 的算法: Classic, Python 2.2 new-style, Pyhon 2.3 new-style (a.k.a C3).

## Classic

这是最简单的 MRO 算法了, 以子类为起点对继承图进行自左向右的深度优先遍历就行了.

比如下面这个例子:

    class A:                        A
        pass                       / \
                                  /   \
    class B(A):                  B     C
        pass                      \   /
                                   \ /
    class C(A):                     D
        pass

    class D(B, C):
        pass

用 Classic 算法得到的顺序是 [D, B, A, C, A], 没错, A 出现了两次.

## Python 2.2 new-style

Python 2.2 中 new-style class 的 MRO 算法有两个版本, 一种是在 [PEP 253](http://www.python.org/dev/peps/pep-0253/) 中定义的, 
另一种是 Python 2.2 中实际使用的. 所谓的 new-style class, 简单来说, 就是继承了 object 的类.

### Documented

PEP 253 中的算法也很简单, 就是先对继承图做 Classic 算法得到可能有重复元素的 MRO, 然后将重复元素去掉, 
仅保留最后一次出现的元素, 这样得到的就是最终的 MRO.

我们将上面一个例子修改下以使用 new-style class:

    A = object
    class A:                        A (object)
        pass                       / \
                                  /   \
    class B(A):                  B     C
        pass                      \   /
                                   \ /
    class C(A):                     D
        pass

    class D(B, C):
        pass

按照 PEP 253 的描述, 先用 Classic 算法得到 MRO, [D, B, A, C, A], 
将重复元素去掉, 仅保留最后一次出现的元素, 这里我们去掉第一次出现的 A, 得到最终的 MRO, [D, B, C, A].

### Implemented

按照 Guido van Rossum 的说法, 之所以 PEP 253 中的算法和实际中的算法不一样是因为, 
他觉得实际中的算法描述起来比较繁琐, 并且他觉得两种算法没多大区别. 后来 Guido 自己也承认当时想法太天真了. 
让我们用下面这个例子来说明两种算法之间的区别:

    O = object
    class A(O):
        pass
    class B(O):
        pass
    class X(A,B):
        pass
    class Y(B,A):
        pass

继承图大概是这样的:

     -----------
    |           |
    |    O      |
    |  /   \    |
     - A    B  /
       |  / | /
       | /  |/
       X    Y
       \   /
         Z

你用 PEP 253 中的算法得到的 MRO 应该是这样的, [Z, X, Y, B, A, O]

但在 Python 2.2 中你会得到的是 [Z, X, Y, A, B, O] (可以用 Z.\__mro__ 来得到)

网络上基本找不到与 Python 2.2 中实际采用的 MRO 算法相关的结果, 虽然 Guido 说这个算法是来源于 "Putting Metaclasses to Work" 这本书, 
但我们是在研究实际中使用的算法, 还是看 Python 2.2 的源代码吧. 关于 new-style class 的 MRO 的算法在 Object/typeobject.c 中, 
主要和下面这两个函数有关:

    static int
    conservative_merge(PyObject *left, PyObject *right)
    {
            int left_size;
            int right_size;
            int i, j, r, ok;
            PyObject *temp, *rr;

            assert(PyList_Check(left));
            assert(PyList_Check(right));

      again:
            left_size = PyList_GET_SIZE(left);
            right_size = PyList_GET_SIZE(right);
            for (i = 0; i < left_size; i++) {
                    for (j = 0; j < right_size; j++) {
                            if (PyList_GET_ITEM(left, i) ==
                                PyList_GET_ITEM(right, j)) {
                                    /* found a merge point */
                                    temp = PyList_New(0);
                                    if (temp == NULL)
                                            return -1;
                                    for (r = 0; r < j; r++) {
                                            rr = PyList_GET_ITEM(right, r);
                                            ok = PySequence_Contains(left, rr);
                                            if (ok < 0) {
                                                    Py_DECREF(temp);
                                                    return -1;
                                            }
                                            if (!ok) {
                                                    ok = PyList_Append(temp, rr);
                                                    if (ok < 0) {
                                                            Py_DECREF(temp);
                                                            return -1;
                                                    }
                                            }
                                    }
                                    ok = PyList_SetSlice(left, i, i, temp);
                                    Py_DECREF(temp);
                                    if (ok < 0)
                                            return -1;
                                    ok = PyList_SetSlice(right, 0, j+1, NULL);
                                    if (ok < 0)
                                            return -1;
                                    goto again;
                            }
                    }
            }
            return PyList_SetSlice(left, left_size, left_size, right);
    }

    static PyObject *
    mro_implementation(PyTypeObject *type)
    {
            int i, n, ok;
            PyObject *bases, *result;

            bases = type->tp_bases;
            n = PyTuple_GET_SIZE(bases);
            result = Py_BuildValue("[O]", (PyObject *)type);
            if (result == NULL)
                    return NULL;
            for (i = 0; i < n; i++) {
                    PyObject *base = PyTuple_GET_ITEM(bases, i);
                    PyObject *parentMRO;
                    if (PyType_Check(base))
                            parentMRO = PySequence_List(
                                    ((PyTypeObject*)base)->tp_mro);
                    else
                            parentMRO = classic_mro(base);
                    if (parentMRO == NULL) {
                            Py_DECREF(result);
                            return NULL;
                    }
                    if (serious_order_disagreements(result, parentMRO)) {
                            Py_DECREF(result);
                            return NULL;
                    }
                    ok = conservative_merge(result, parentMRO);
                    Py_DECREF(parentMRO);
                    if (ok < 0) {
                            Py_DECREF(result);
                            return NULL;
                    }
            }
            return result;
    }

C 代码看起来比较繁琐, 用 Python 来描述大概就是这样的:

    def conservative_merge(left, right):
        for i in range(0, len(left)):
            for j in range(0, len(right):

                if left[i] == right[j]:
                    temp = []
                    for r in range(0, j):
                        rr = right[r]
                        if rr not in left:
                            temp.append(rr)
                    left[i:i] = temp
                    right[0:j+1] = []
                    return conservative_merge(left, right)

        return left[len(left):len(left)] = right
   
    def mro_implementation(cls):
        bases = cls.bases
        result = [cls]

        for i in range(0, len(bases)):
            base = bases[i]
            parentMRO = base.mro
            conservative_merge(result, parentMRO)

        return result

关于上面的 Python 代码有如下说明:

1. 假设 MRO 使用 List 来表示
2. 假设每个 Class object 有两个属性 bases 和 mro, 分别表示这个类直接继承的类的列表和这个类的 MRO.

你可以试着用这个算法计算下面这个例子里 Z 的 MRO:

    class A(object):
        pass
    class B(object):
        pass
    class C(object):
        pass
    class D(object):
        pass
    class E(object):
        pass
    class K1(A,B,C):
        pass
    class K2(D,B,E):
        pass
    class K3(D,A):
        pass
    class Z(K1,K2,K3):
        pass

Python 2.2 给出的 MRO 是 [Z, K1, K3, A, K2, D, B, C, E, O]

## Python 2.3 new-style

自从 Python 2.3 之后, Python new-style class 的 MRO 算法使用 C3 算法, 这里就不叙述了, 网上资料挺多的, 
比如[这里](http://www.python.org/download/releases/2.3/mro/).

## References

[The Python 2.3 Method Resolution Order](http://www.python.org/download/releases/2.3/mro/)

[Unifying types and classes in Python 2.2](http://www.python.org/download/releases/2.2/descrintro/)

[PEP 253 -- Subtyping Built-in Types](http://www.python.org/dev/peps/pep-0253/)

[[Python-Dev] perplexed by mro](http://mail.python.org/pipermail/python-dev/2002-October/029035.html)

[The History of Python: Method Resolution Order](http://python-history.blogspot.de/2010/06/method-resolution-order.html)
