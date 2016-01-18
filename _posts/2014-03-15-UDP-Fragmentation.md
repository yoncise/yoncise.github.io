---
layout: post
title: UDP Fragmentation
category: Tech
---
我们知道, UDP 是不可靠的, 
比如你无法知道数据包是否发送成功, 你也无法知道数据包到达的先后顺序.

那么问题就来了, 当使用 sendto 时,
协议能否保证传给 sendto 的数据被打包成一个 UDP 数据包呢?
还是像 TCP 一样, 根据 <acronym title="Maximum Segment Size">MSS</acronym> 对数据进行分割后再打包?
直觉上来说应该是有保证的, 否则的话, UDP 真心鸡肋啊!

最终在 UNIX Network Programming Vol 1 中找到了答案.

> ![UDP](/images/20140315.png "UDP")
> 
> This time, we show the socket send buffer as a dashed box because **it doesn't really
> exist**. A UDP socket has a send buffer size (which we can change with the SO_SNDBUF
> socket option, Section 7.5), but **this is simply an upper limit on the maximum-sized
> UDP datagram that can be written to the socket.** If an application writes a datagram
> larger than the socket send buffer size, EMSGSIZE is returned. 
