---
layout: post
title: PHP 安装 MySQL extension
---
几乎所有网上都是说, 打开 php.ini, 找到下面这一行

    ;extension=php_mysql.dll

将分号 (;) 去掉, 再找到下面这一行

    extension_dir = "./"

改成

    extension_dir = "./ext"

保存, 然后重启 Apache 就可以了, 但是我这样操作以后, phpinfo() 的输出里始终没有 MySQL 的相关信息.

最后看官方文档才发现, 原来对于 PHP 5.0.x, 5.1.x, 5.2.x, 要想 PHP 支持 MySQL, 还需要 libmysql.dll 这个文件.
正确的安装 MySQL extension 的方法除了上述步骤之外, 还要将 libmysql.dll 所在文件夹添加到环境变量 PATH 中.

*ps. 必须要添加到系统变量中, 而不是 xxx 的用户变量里. 而且添加到系统变量之后必须要重启系统才能生效. 还有种更简单的办法, 
直接将 libmysql.dll 移动到 C:\WINDOWS 文件夹下面, 都不需要重启系统, 直接重启 Apache 就行了.*

> [PHP: MySQL Installation](http://php.net/manual/en/mysql.installation.php)
