---
layout: post
title: Java - Heap Dump, Thread Dump and Core Dump
---

Dump 就是对程序运行时内存上的信息进行转储, 让我们可以查看程序当时的运行情况.
Dump 对于调优和排错是非常有用的工具.

### Heap Dump

Java 运行时对象分配在堆内存上, Heap dump 就是对堆内存进行转储.

#### 生成

Heap dump 的生成有两种方式:

1) 运行 Java 程序时添加 `-XX:+HeapDumpOnOutOfMemoryError` 选项,
这样当程序发生 Out of Memory 错误时就会自动生成一份 Heap dump.

2) 使用 `jmap` 工具生成. 首先我们用 `jps` 找到程序的 pid (严谨点说其实是 lvmid), 然后运行:

``` bash
jmap -dump:live,format=b,file=heap.bin <pid>
```

#### 分析

可以使用 Java 自带的 `jhat` 工具来分析 Heap dump:

``` bash
jhat <heap dump file>
```

等待一会, 就会提示

```
Started HTTP server on port 7000
Server is ready.
```

这时候浏览器中访问 `127.0.0.1:7000` 就可以了.

但是, `jhat` 在分析较大的 Heap dump 时效率比较差, 
所以推荐使用 eclipse 提供的 [Memory Analyzer (MAT)](http://www.eclipse.org/mat/) 来分析.

### Thread Dump

Thread dump 转储的是线程相关的内存数据 (例如该线程的调用栈).
Thread dump 有时候也被成为 javacore, 不过好像 javacore 是 IBM 虚拟机才有的.

#### 生成

可以使用自带的 `jstack` 生成 Thread dump:

`jstack <pid> >> thread.dump`

#### 分析

Thread dump 就是个文本文件格式, 直接打开查看就可以了.

Intellij IDEA 提供 Stacktrace 的分析, 我们可以用它来分析 Thread dump, 
这样可以方便的知道某个线程运行到哪里.

打开 `Intellij IDEAD -> Analyze -> Anaylyze Stacktrace...`, 
把 Thread dump 的内容复制粘贴进去, 确认即可.

### Core Dump

上面提到的 Heap dump 和 Thread dump 都是和 Java 直接相关的,
Core dump 则是操作系统提供的, 所有程序在意外退出时, 操作系统都可以生成 Core dump.

Core dump 包含了程序运行时的所有内存信息,
所以我们可以使用 Core dump 同时分析堆内存和运行时栈.

#### 生成

默认操作系统是不生成 Core dump 的, 我们需要先打开:

``` bash
# 如果你用的是 bash
ulimit -c unlimited

# 如果你像我一样用的是 zsh
limit coredumpsize unlimited
```

ulimit/limit 是设置 dump 的大小的, 默认为 0 也就是不 dump.
我们可以使用下面的命令来查看当前设置的大小:

``` bash
# 如果你用的是 bash
ulimit -c

# 如果你像我一样用的是 zsh
limit coredumpsize
```

确认打开后, 我们可以使用 `kill -ABRT <pid>` 来生成 Core dump.
不过需要注意的是, 使用这种方法只有在当前 Terminal 下运行的 Java 程序才能生成 Core dump.
也就是说, 你必须在打开了 Core dump 的 Terminal 下运行 Java 程序, 
这样 `kill -ABRT <pid>` 才会生成 Core dump. 
如果你 Java 程序运行在一个没有打开 Core dump 的 Terminal 下,
那么即使你的 `kill -ABRT <pid>` 运行在打开了 Core dump 的 Terminal 下,
这时候 Core dump 也是不会生成的.

我们也可以使用 `gcore` 来生成生成 Core dump. 使用这个方法就无所谓你有没有使用
ulimit/limit 打开 Core dump 了.

`sudo gcore <pid>`

Mac 下 Core dump 生成在 `/cores/` 文件夹下.

#### 分析

我们可以使用 `gdb` 来分析 Core dump 文件.

Java 自带的 `jstack` 和 `jmap` 也可以用来分析 Core dump:

``` bash 
jstack <executable> <core dump file>
jmap <executable> <core dump file>
```

这里的 `<executable>` 指的是你运行 Java 程序时使用的 `java`, 一般可以用 `$JAVA_HOME/bin/java` 代替.
如果你制定的 `java` 和你运行用的 `java` 不是同一个版本, 就会抛出 `sun.jvm.hotspot.debugger.UnmappedAddressException`.

另外你使用的 `jstack` 和 `jamp` 也需要是相应的版本, 否则会提示 `Can't attach to the core file`.
