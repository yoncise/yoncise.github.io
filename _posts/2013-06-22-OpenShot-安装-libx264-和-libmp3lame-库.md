---
layout: post
category: ubuntu
title: OpenShot 安装 libx264 和 libmp3lame 库
---

统计大作业需要录制演示视频, 使用 [Camstudio](http://camstudio.org) 录制的视频有些多余的部分需要剪掉, Ubuntu 下也没什么好的剪辑工具, 下了个 OpenShot 试了下, 功能是简陋了点, 不过还算能用. 就是导出视频的时候提示我没有 libx264 和 libmp3lame 库.

大概搜了下, 安装 libavformat-extra-52 即可.

    sudo apt-get install libavformat-extra-52

> [Trouble Installing Codecs libx264 AND libmp3lame](http://askubuntu.com/questions/26142/trouble-installing-codecs-libx264-and-libmp3lame)
