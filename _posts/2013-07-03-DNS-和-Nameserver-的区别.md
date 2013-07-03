---
layout: post
category: network
title: DNS 和 Nameserver 的区别
---
## 名词解释

- **DNS**  
DNS 的全称是 Domain Name *System*, 很多人会误以为是 Domain Name *Server*.
DNS 是一个系统, 负责将域名与 IP 地址相对应起来.

- **Nameserver**  
负责实现 DNS 这套系统的服务器, 有时候也叫做 DNS server, 这也是为什么许多人会将 nameserver 同 DNS 搞混起来的原因.

- **Zone**  
假如有一个域名 bob.sales.example.com, 那么 com 是一个顶级域名(<acronym title="Top Level Doamin">TLD</acronym>), 
example 是 com 的一个子域名(Sub-domain), sales 是 example 的子域名, bob 则是一个主机名(Hostname). 一个域名至少有一个子域名.
除了主机名, 一个域名的其它部分都可以叫做 Zone. 

## Nameserver 类型

Nameserver 主要有四种类型:

1. **Master**  
保存域名的解析信息, 并负责响应其它 Nameserver 查询域名信息的请求.

2. **Slave**  
同 Master 的作用, 作为备用. 区别在于它的解析信息是从 Master 中获取的.

3. **Caching-only**  
不保存有真正的域名的解析信息, 负责响应用户的域名解析的请求, 如果用户请求的数据不存在, 则会向其它 Nameserver 发出查询请求.
查询成功后, 则会将这条记录保存一段时间(<acronym title="Time To Live">TTL</acronym>), 以供之后的查询用.
Google 的 nameserver(8.8.8.8) 就是这种类型.

4. **Forwarding**  
将解析请求转发给一串指定的 nameservers, 如果这其中没有一个能解析成功, 那么这次请求就算失败.

*ps. 一台 nameserver 可能是这个域名的 Master, 同时, 也可能是另一个域名的 Slave.*

## 如何搭建一个 nameserver

搭建一个 nameserver, 可以安装 BIND(Berkeley Internet Name Daemon) 这个软件. 安装之后可以将服务器配置成上述几种类型的 nameserver,
并可以向服务器中添加相关的解析数据. 具体的关于 Bind 的安装与配置请参考其它资料.

## 两个例子

1. 当你在域名注册商那里注册了一个域名 example.com, 你在域名注册商那里修改 nameserver, 
比如修改成 ns1.example.com, ns2.example.com, 其实就相当于在负责 com 解析的那台 nameserver 上修改你的 example.com 的解析信息.
你在 ns1.example.com, ns2.example.com 里添加的比如 A 记录, CNAME 记录, 就是具体关于 example.com 这个域名的解析信息.

2. 假入你电脑里配置的 Caching-only nameserver 是 8.8.8.8, 当你请求访问比如 yoncise.com 这个域名, 
你的电脑就会向 8.8.8.8 发出域名解析请求, 假如 8.8.8.8 发现自己的数据库里没有相关的解析请求, 
就会向 root nameserver 发出请求, root nameserver 发现它也没有 yoncise.com 的解析信息, 
但是它知道负责解析 com 域名的 nameserver 的地址, 于是将这个地址返回, 
这时候 Caching-only nameserver(8.8.8.8) 向返回的 nameserver 即 com 的 nameserver 发出 yoncise.com 解析请求, 
可惜的是, com 的 nameserver 这里也没有 yoncise.com 的解析信息, 但是它知道谁那里具体保存有 yoncise.com 的解析信息, 
于是将这个 nameserver (在域名注册商那里设置的地址) 返回, 同样的, 8.8.8.8 继续向这个 nameserver 发送请求, 
最终获得了 yoncise.com 的域名解析信息并将数据返回给你.

## 参考

> [Introduction to DNS](http://www.centos.org/docs/5/html/5.2/Deployment_Guide/s1-bind-introduction.html)
