---
layout: post
title: Mac 编译 OpenJDK 7
---

因为 OpenJDK 7 发布已经很多年了, 所以想要在现在系统环境下编译成功还是有很多坑需要填的.

### 环境准备

1. OpenJDK 7 源码

    编译首先需要的肯定是源码啦, 1) 可以使用 Mercurial 从 
    `http://hg.openjdk.java.net/jdk7u/jdk7u/`
    clone

    2) 也可以从 [http://jdk.java.net/java-se-ri/7](http://jdk.java.net/java-se-ri/7)
    下载压缩包. 这种方法通常获取到的并不是最新版本, 我下载到的是 7u75 的版本.

2. Xcode

    直接从 AppStore 上下载安装. 安装成功后运行下面的命令来安装 Command Line Tools:

    ``` bash
    xcode-select --install
    ```

    Xcode 从 5 开始不再自带 gcc/g++ 了, 我们手动链接下:

    ``` bash
    sudo ln -s /usr/bin/llvm-gcc /Applications/Xcode.app/Contents/Developer/usr/bin/llvm-gcc
    sudo ln -s /usr/bin/llvm-g++ /Applications/Xcode.app/Contents/Developer/usr/bin/llvm-g++
    ```

3. Ant <= 1.9.x

    Ant 从 1.10 开始不再支持 Java 8 之前的版本, 我们这里是编译 OpenJDK 7,
    所以只能使用 1.9.x 或之前的版本.

4. CUPS

    去[官网](https://www.cups.org)下载解压缩即可.

5. XQuartz

    编译需要 FreeType, 直接下载 [XQuartz](https://www.xquartz.org) 安装即可.

6. BootJDK

    编译需要 JDK 环境 (鸡生蛋, 蛋生鸡的既视感, 编译第一个版本的 JDK 肯定是不需要 BootJDK 的),
    去 [Java SE 7 Archive Downloads](http://www.oracle.com/technetwork/java/javase/downloads/java-archive-downloads-javase7-521261.html)
    下载安装即可, 需要注意的是不要选版本号大于你源码的版本号的版本, 我选择的是 7u10 的.

7. 环境变量

    ``` bash
    # 让 make 找到 Ant
    export ANT_HOME=<Ant 解压缩后的文件夹>
    # CUPS
    export ALT_CUPS_HEADERS_PATH=<CUPS 解压缩后的文件夹>
    # 设置 BootJDK
    export ALT_BOOTDIR=`/usr/libexec/java_home -v 1.7`
    # 取消 JAVA_HOME 和 CLASSPATH 变量
    unset JAVA_HOME
    unset CLASSPATH
    ```

完成以上步骤之后, 运行 `make sanity` 应该就能看到 `Sanity check passed.` 字样了,
不过如果你这时候运行 `make` 编译肯定会报错的, 下面请继续阅读 "填坑指南".

### 填坑指南

1. ```
error: equality comparison with extraneous
error: '&&' within '||'
```

    这是因为编译器语法校验太严格了, 添加环境变量 `export COMPILER_WARNINGS_FATAL=false` 即可.

2. ```
clang: error: unknown argument: '-fpch-deps'
```

    这是因为新的编译器已经不再支持这个选项了, 打开 `hotspot/make/bsd/makefiles/gcc.make`,
    找到 `DEPFLAGS = -fpch-deps -MMD -MP -MF $(DEP_DIR)/$(@:%=%.d)` 这一行,
    删掉其中的 `-fpch-deps` 即可.

3. ```
error: friend declaration specifying a default argument must be a definition
    inline friend relocInfo prefix_relocInfo(int datalen = 0);
error: friend declaration specifying a default argument must be the only declaration
    inline relocInfo prefix_relocInfo(int datalen) {
error: 'RAW_BITS' is a protected member of 'relocInfo'
    return relocInfo(relocInfo::data_prefix_tag, relocInfo::RAW_BITS, relocInfo::datalen_tag | datalen);
error: calling a protected constructor of class 'relocInfo'
    return relocInfo(relocInfo::data_prefix_tag, relocInfo::RAW_BITS, relocInfo::datalen_tag | datalen);
```

    这个错误报的不是很明显, 因为 error 隐藏在一堆 warning 中, 需要往上翻页很久才能看到,
    所以如果看到 make 输出 `488 warnings and 4 errors generated.` 那么基本上就是这个错误了.

    这个错误也是编译器版本太新导致的, 原先的 C++ 的一些语法已经不再支持了.

    打开 `hotspot/src/share/vm/code/relocInfo.hpp`

    找到 `inline friend relocInfo prefix_relocInfo(int datalen = 0);` 这一行,
    改成 `inline friend relocInfo prefix_relocInfo(int datalen);`.

    找到 `inline relocInfo prefix_relocInfo(int datalen) {` 这一行,
    改成 `inline relocInfo prefix_relocInfo(int datalen = 0) {`.

    最后保存即可.

4. ```
java.lang.NullPointerException
	at java.util.Hashtable.put(Hashtable.java:542)
	at java.lang.System.initProperties(Native Method)
	at java.lang.System.initializeSystemClass(System.java:1115)
```

    设置环境变量 `export LANG=C` 即可

5. ```
Error: time is more than 10 years from present: 1136059200000
java.lang.RuntimeException: time is more than 10 years from present: 1136059200000
	at build.tools.generatecurrencydata.GenerateCurrencyData.makeSpecialCaseEntry(GenerateCurrencyData.java:285)
	at build.tools.generatecurrencydata.GenerateCurrencyData.buildMainAndSpecialCaseTables(GenerateCurrencyData.java:225)
	at build.tools.generatecurrencydata.GenerateCurrencyData.main(GenerateCurrencyData.java:154)
```

    如果你是使用 Mercurial clone 的最新代码就不会遇到这个问题, 我下载的 7u75 存在这个问题.

    打开 `jdk/src/share/classes/java/util/CurrencyData.properties`,
    搜索 `200`, 把所有的年份改成距今不超过 10 年的年份即可.

6. ```
error: JavaNativeFoundation/JavaNativeFoundation.h: No such file or directory
```

    这个问题应该是 BootJDK 有问题导致的, 我系统原先就装有 7u65, 
    把该版本作为 BootJDK 编译后报这个错误,
    重新下载了 7u10 安装, 然后修改 `ALT_BOOTDIR` 到对应的版本就解决了.

填完上面的这些坑, 应该就能编译成功了. 
编译好之后运行 `./build/macosx-x86_64/bin/java -version` 如果输出类似下面的信息就说明编译成功了:

```
openjdk version "1.7.0-internal"
OpenJDK Runtime Environment (build 1.7.0-internal-yoncise_2017_05_21_16_54-b00)
OpenJDK 64-Bit Server VM (build 24.75-b04, mixed mode)
```

### 仅编译 HotSpot

大部分情况下我们关心的是 jvm 的运行情况, 所以只需要编译 HotSpot, 这样可以节省下很多编译时间.

首先切换到 `hotspot/make` 目录下. 按照之前说的把环境变量设置好.

修改 `bsd/makefiles/buildtree.make` 中的 `env.sh` rule. 将:

```
env.sh: $(BUILDTREE_MAKE)
	@echo Creating $@ ...
	$(QUIETLY) ( \
	$(BUILDTREE_COMMENT); \
	[ -n "$$JAVA_HOME" ] && { echo ": \$${JAVA_HOME:=$${JAVA_HOME}}"; }; \
	{ \
	echo "CLASSPATH=$${CLASSPATH:+$$CLASSPATH:}.:\$${JAVA_HOME}/jre/lib/rt.jar:\$${JAVA_HOME}/jre/lib/i18n.jar"; \
	} | sed s:$${JAVA_HOME:--------}:\$${JAVA_HOME}:g; \
	echo "HOTSPOT_BUILD_USER=\"$${LOGNAME:-$$USER} in `basename $(GAMMADIR)`\""; \
	echo "export JAVA_HOME CLASSPATH HOTSPOT_BUILD_USER"; \
	) > $@
```

修改成:

```
env.sh: $(BUILDTREE_MAKE)
	@echo Creating $@ ...
	$(QUIETLY) ( \
	$(BUILDTREE_COMMENT); \
	[ -n "$$JAVA_HOME" ] && { echo "JAVA_HOME=$${JAVA_HOME}"; }; \
	{ \
	echo "CLASSPATH=$${CLASSPATH:+$$CLASSPATH:}.:\$${JAVA_HOME}/jre/lib/rt.jar:\$${JAVA_HOME}/jre/lib/i18n.jar"; \
	} | sed s:$${JAVA_HOME:--------}:\$${JAVA_HOME}:g; \
	echo "HOTSPOT_BUILD_USER=\"$${LOGNAME:-$$USER} in `basename $(GAMMADIR)`\""; \
	echo "LD_LIBRARY_PATH=."; \
	echo "LANG=C"; \
	echo "export JAVA_HOME CLASSPATH HOTSPOT_BUILD_USER LD_LIBRARY_PATH LANG"; \
	) > $@
```

然后运行 `make` 编译. 建议第一次编译把输出重定向到 `/dev/null`, 编译会加快不少.

编译成功后, 切换到 `./build/bsd/bsd_amd64_compiler2/product` 目录, 运行:

```
# 设置环境变量
. ./env.sh
# 运行 test_gamma 需要设置环境变量 LANG=C, 不然会报 NPE
./test_gamma
```

正常输出不报错就说明编译好了. 该目录下的 `./gamma` 就是 HotSpot 的启动程序.

### 版本号

JDK 从 1.5 开始, 官方就不再使用类似 `JDK 1.5` 的名称了, 
只有在开发版本号 (Developer Version, `java -version` 的输出)
中继续沿用 1.5, 1.6 和 1.7 的命名方式, 
公开版本号 (Product Version) 则使用 JDK 5, JDK 6 和 JDK 7 的命名方式.

有时候下载 JDK 看到 7u75, 8u45 的版本号, 这里的 u 表示的是 `update`.


> [Re: JDK7 build on mac os fails: JavaNativeFoundation.h: No such file](https://www.mail-archive.com/build-dev@openjdk.java.net/msg07338.html)
>
> [Compilation failure related to Time [Error: time is more than	10,years from present: 1136059200000]](http://mail.openjdk.java.net/pipermail/jdk7u-dev/2016-June/010560.html)
>
> [第一章 Mac os下编译openJDK 7](http://blog.csdn.net/j754379117/article/details/53695426)
>
> [Mac编译OpenJDK 7](http://www.txazo.com/jvm/openjdk-compile.html)
>
> [Mac下编译openJDK](http://menzhongxin.com/2017/04/27/MAC下编译openJDK/)
