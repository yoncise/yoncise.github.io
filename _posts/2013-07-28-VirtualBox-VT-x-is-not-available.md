---
layout: post
title: VirtualBox VT-x is not available
---
折腾了几天终于在 x201i 上安装好了黑苹果, 驱动什么的基本完美, 已经能满足我日常使用了.

今天安装完 VirtualBox, 运行时竟然提示我 VT-x is not available (VERR_VMX_NO_VMX).

解决方法是:

将 VirtualBox 退出 (重要)

进入 ~/VirtualBox VMs/HOSTNAME 目录, 用 Vim 或者其他文本编辑工具打开 *.vbox 文件, 找到下面这一行:

    <HardwareVirtEx enabled="true"

将其改为:

    <HardwareVirtEx enabled="false"

保存, 重启 VirtualBox 即可.

> [VT-x is not available (VERR_VMX_NO_VMX)](http://goclowner.com/software/vt-x-is-not-available-verr_vmx_no_vmx/)
