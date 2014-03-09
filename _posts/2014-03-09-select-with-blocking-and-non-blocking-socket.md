---
layout: post
title: select with blocking and non-blocking socket
category: Tech
---
select 作用在 blocking 和 non-blocking socket 上的效果是一样.
blocking 和 non-blocking socket 的区别主要体现在 recv, send, accept, 
connect 等这些函数上. 比如对于阻塞型的套接字, 
recv 只在接收到至少一个字节的时候才返回.

那么是不是用 select 的时候就无所谓使用哪一种套接字呢? 
Linux [select](http://man7.org/linux/man-pages/man2/select.2.html) man page 
上有这么一段话:

> Under Linux, select() may report a socket file descriptor as "ready
> for reading", while nevertheless a subsequent read blocks.  This
> could for example happen when data has arrived but upon examination
> has wrong checksum and is discarded.  There may be other
> circumstances in which a file descriptor is spuriously reported as
> ready.  Thus it may be safer to use O_NONBLOCK on sockets that should
> not block.

所以说, 在使用 select 的时候还是尽量使用 non-blocking socket 吧!
