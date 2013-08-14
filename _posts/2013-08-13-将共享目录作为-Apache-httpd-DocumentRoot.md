---
layout: post
title: 将共享目录作为 Apache httpd DocumentRoot
category: notes
---
VirtualBox 中安装了 Windows XP, 并配置了共享目录. 最近想用虚拟机搭建 Apache + PHP + MySQL 服务器, 
并且我希望将 Apache 中默认的 htdocs 目录修改为我的共享目录, 这样我就可以在本机里编程, 仅仅将虚拟机作为服务器.

假如我虚拟机中共享目录的地址为 E:\htdocs, 我本以为只要将 Apache 的配置文件 httpd.conf 中的 DocumentRoot 的值修改为 
E:\htdocs, 并找到下面这行代码:

    #
    # This should be changed to whatever you set DocumentRoot to.
    #
    <Directory xxx>

将其中的 xxx 修改为 E:\htdocs 就可以了, 但是这样修改之后 Apache 就启动不了了, 
提示我 Requested operation has failed.

最后发现原来是要使用共享目录的网络地址才行, 比如我对应的地址是 //VBOXSVR/Downloads/htdocs, 
只要用这个网络地址替换刚才的 E:\htdocs 就可以正常启动 Apache 了.

ps. **在 httpd.conf 中, 地址分隔符是用的 /, 而不是 \.** 我一开始使用 \\VBOXSVR\Downloads\htdocs, Apache 一样启动不了.
所以说, 就算 DocumentRoot 可以用 E:\htdocs 这样的地址来指向共享目录, 也应该修改成 E:/htdocs 才行.
