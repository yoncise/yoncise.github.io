---
layout: post
title: MySQL datetime 时区问题
---

我觉得直接把 `datetime` 当成字符串会更好理些, 因为它就是一个日期时间的字符串, *没有时区信息*.

比如 `2016-11-16 23:00` 这个日期时间表示的含义完全取决于你所在地的时区.
如果你在中国, 它就是中国时间, 你在美国, 它就是美国时间.

为什么不用 `timestamp` 呢? 因为 `timestamp` 只能表示到 `2038-01-19 03:14:07` UTC (万一软件能活到那时候呢).

## MySQL 端

数据中一般我们会增加字段来表示数据的元信息, 比如创建时间和修改时间. 对于这种字段,
我们一般会设置 `DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` 属性.

前面提到, `datetime` 是没有时区的, 所以 MySQL 的 `CURRENT_TIMESTAMP` 转换成 `datetime`
时是基于 MySQL 的时区的.

有时候我们不方便修改 MySQL 服务器, 可以在连接 MySQL 后执行: `SET time_zone = "+0:00"`
来修改当前数据库连接的时区信息. 你也可以使用 `SET time_zone = "UTC"` 来设置,
不过不能确保所有 MySQL 能识别这个时区信息 (腾讯云的数据库就不行).

## Java 端

我在项目中使用 `java.sql.Timestamp` 来映射 MySQL 中的 `datetime`. 不过需要注意的是, 
JDBC 在转换 `Timestamp` 到 `datetime` 时, 是根据 `Timestamp` 的时区来的 (`Timestamp`
继承 `Date`).

因为我希望项目和数据库中的日期时间相关的都使用 UTC 时区, 所以我直接把 Java
默认的时区改成 UTC 了:

``` java
TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
```

## 总结

`datetime` 就是个日期时间的字符串, *没有时区信息*.

> [The DATE, DATETIME, and TIMESTAMP Types](https://dev.mysql.com/doc/refman/5.5/en/datetime.html)
