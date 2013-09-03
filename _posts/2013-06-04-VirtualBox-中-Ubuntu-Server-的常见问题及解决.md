---
layout: post
title: VirtualBox 中 Ubuntu Server 的常见问题及解决
category: Tech
modified: 2013-07-28
---
## 安装 Guest Additions

如果虚拟机中安装的是 XP 的话, 只要在菜单中选择安装增强包, 然后打开我的电脑, 双击光驱就可以弹出安装对话框了.
但是在 Ubuntu Server 中则要稍微复杂些, 首先同样是在 Devices 中选择 Install Guest Additions, 与 XP 不同的是, 这里你需要手动挂载光驱.

    sudo mount /dev/cdrom /cdrom

挂载成功之后进入 /cdrom 文件夹并执行 VBoxLinuxAdditions.run 脚本.

    cd /cdrom
    sudo ./VBoxLinuxAdditions.run

至此增强包安装完成. 之后你就可以进行共享文件夹的设置了, 设置完成后, 共享文件夹位于 /media 目录下, 以 sf_ 开头.

但是你可能会发现你无法切换到你的共享文件夹中, 原因是当前用户不在 vboxsf 这个组中. 使用下面的命令将当前用户加到 vboxsf 组中.

    sudo usermod -G vboxsf -a ACCOUNT

> [VirtualBox Shared Folders with Ubuntu Server Guest](http://ipggi.wordpress.com/2010/03/11/virtualbox-shared-folders-with-ubuntu-server-guest/)
> 
> [Fix shared folder Ubuntu Guest & Host Virtualbox permission denied](http://cisight.com/fix-shared-folder-ubuntu-guest-host-virtualbox-permission-denied/)

## 长时间没有操作后屏幕黑屏

解决方法是在 grub 中添加 consoleblank=0 的启动参数.

    sudo vim /etc/default/grub

找到 GRUB_CMDLINE_LINUX_DEFAULT="", 在双引号中添加 consoleblank=0, 修改完成后是 GRUB_CMDLINE_LINUX_DEFAULT="consoleblank=0".

最后更新下 grub 并重启

    sudo update-grub
    sudo reboot

> [How do I disable the blank console “screensaver” on Ubuntu Server?](http://askubuntu.com/questions/138918/how-do-i-disable-the-blank-console-screensaver-on-ubuntu-server)

## 添加 Host-only Adapter

首先在 VirtualBox 主界面中打开 File - Preferences.

在 Network 界面中添加一个 host-only network. 这样当你选择 Host-only Adapter 时就不会报错了.

完成这些后, 你会发现主机还是无法访问 Ubuntu. ifconfig 显示的是 eth1 网络接口没有启动. 需要我们手动配置下.

    sudo vim /etc/network/interfaces
    # 添加下面的内容
    auto eth1
    iface eth1 inet dhcp
    
    # 启动接口
    sudo ifup eth1
