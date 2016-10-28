---
layout: post
title: Cookie 中的 Path
---

### 问题

最近在将 PlayTask 的服务器用 Spring 重写. 这两天准备将实现了的登录和退出登录的功能先上线.
由于涉及到两套系统并且两套系统用的 Session 的框架不一样, 所以这其中会有 Session 的同步的问题, 
即 Spring 版本中登录之后需要设置 Python 版本中服务器的 Session 的值.

开始想了一个方案是用户登录之后, Spring 服务器去请求 Python 的服务器来设置下 Session,
然后返回的 Header 添加 `Set-Cookie` 字段来同步 Session. 但是上线之后发现用户第一次登录总是会出现同步失败的情况.
一开始以为是 Python 的 Session 没有持久化, 最后发现是 Cookie 没有设置成功. 为什么呢?

### Path 作用

Cookie 中有一个字段是 Path, 这个 Path 有什么用呢? 客户端 (比如浏览器), 在请求服务器的时候, 
只会将 Path 和当前请求的的链接匹配的 Cookie 添加到请求的 Header 中, 即 Path 是用来限制 Cookie 的作用域的.

#### Path 设置的优先级

如果当前客户端中有一个 Cookie 的 Path 已经设置成了 `/`, 那么即使服务器返回的响应中的 Header 中有 `Set-Cookie`,
并且将 Path 设置成 `/<sub>`, Cookie 的 Path 字段也不会更新, 因为 `/` 是 `/<sub>` 的父目录. 反之会更新成父目录.

### Servlet 中 Cookie Path 的设置

默认 Cookie 的 Path 是 **程序在容器中的地址** (包括 Context Path). 可以通过如下代码更改 Path:

{% highlight java %}

HttpServletResponse response;
Cookie cookie = new Cookie("name", "value");
cookie.setPath("/");
response.addCookie(cookie);

{% endhighlight %}

### 总结

这 Bug 困扰了两天, 今天终于查出来了. 匆匆忙忙的记录下.
