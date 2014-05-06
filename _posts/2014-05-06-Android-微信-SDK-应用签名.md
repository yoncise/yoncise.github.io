---
layout: post
title: Android - 微信 SDK 应用签名
category: Tech
---
在微信开放平台里创建移动应用的时候, 最重要的就是填写应用签名了. 

签名有很多用处, 比如软件升级的时候, 系统会对签名进行验证, 
如果签名不一致的话就会拒绝升级.

Android 要求所有安装的应用都是被签名过的, 
但是我们开发的时候好像没有对应用进行签名呀!
这是因为在 debug 模式下, 编译的过程中会自动对 APK 进行签名.
签名需要用到 keystore 文件, 可以通过 JDK 自带的 keytool 工具生成.
Android SDK 会默认帮我们创建一个 keystore 文件, 文件名是 debug.keystore.

debug.keystore 在不同的操作系统下的默认地址是:

- Linux, Unix: ~/.android/
- Windows XP: C:\Documents and Settings\<user>\.android\
- Windows 7: C:\Users\<user>\.android\

debug.keystore 的默认属性是:

- Keystore name: "debug.keystore"
- Keystore password: "android"
- Key alias: "androiddebugkey"
- Key password: "android"
- CN: "CN=Android Debug,O=Android,C=US"

更多的关于签名的介绍可以看 Android Developers 上的 
[Signing Your Applications](http://developer.android.com/tools/publishing/app-signing.html) 这篇文章.

下面介绍我们如何获取微信开放平台所要求的应用签名, 
更准确的来说应该是 keystore 的 MD5 fingerprint. 

有三种方式:

1. 使用微信官方提供的签名生成工具,
可以到微信开放平台的 资源中心 - 移动应用开发 - 资源下载 - Android资源下载 里下载.

    [直接下载](https://open.weixin.qq.com/zh_CN/htmledition/res/dev/download/sdk/Gen_Signature_Android.apk)

    但是, 这个工具很奇葩的地方是, 获取到的签名你没法复制, 只能一个个的手输.

2. 打开 eclipse, Window - Preferences - Android - Build, 
MD5 fingerprint 的值就是了, 记得把冒号去掉. 
这个是默认的 debug.keystore 的 MD5 fingerprint, 
如果你要获取你自己的 keystore 的 MD5 fingerprint 需要通过下面一种方法.

3. 根据微信官方提供的 [Signature的生成方法](http://dev.wechat.com/download/signature/signature_method.doc) 文档, 我们可以使用下面的命令来获取应用签名:

        keytool -exportcert -keystore debug.keystore  -storepass android -alias androiddebugkey | md5sum

    如果是你自己的 keystore, 修改命令里对应的部分就可以了. 

Ps. 应用签名在审核通过之后随时可以更改, 且不用再次审核!
