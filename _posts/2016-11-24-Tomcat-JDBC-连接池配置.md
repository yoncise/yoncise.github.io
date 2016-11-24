---
layout: post
title: Tomcat JDBC 连接池配置
---

## isPoolSweeperEnabled

PoolSweeper 会定时检查连接池中的连接, 然后根据你的配置来处理连接.
比如关闭连接时间过长的连接, 废弃长时间没有归还的连接等等.

PoolSweeper 的开启并不是一个单独的属性决定的, 而是多个属性共同决定的.
我们可以看下 `PoolProperties` 类的 `isPoolSweeperEnabled` 方法:

``` java
public boolean isPoolSweeperEnabled() {
    boolean timer = getTimeBetweenEvictionRunsMillis()>0;
    boolean result = timer && (isRemoveAbandoned() && getRemoveAbandonedTimeout()>0);
    result = result || (timer && getSuspectTimeout()>0);
    result = result || (timer && isTestWhileIdle() && getValidationQuery()!=null);
    result = result || (timer && getMinEvictableIdleTimeMillis()>0);
    return result;
}
```

首先 `timer` 必须为 `true`, PoolSweeper 才会开启. (为什么不把 `timer` 在返回的时候和 `result` and 一下?)

所以你必须配置 `timeBetweenEvictionRunsMillis` 这个属性, 即 PoolSweeper 多久运行一次.

| 属性 | 默认值 | 单位 | 含义 |
| - | - | - | - |
| timeBetweenEvictionRunsMillis | 5000 | 毫秒 | PoolSweeper 多久运行一次 |

光 `timer` 为 `true`, 还是不够的, PoolSweeper 每次运行的时候还需要有事情做.
PoolSweeper 运行时主要检查两个方面, 1). 是否有连接泄露 2). 是否需要关闭闲置的连接

## Leak

所谓的连接泄露就是说, 程序从连接池中获取连接之后, 没有将连接归还. 可能是因为忘记了,
也可能是因为异常而未正常归还. 通过配置相应的属性, 可以让 PoolSweeper 检查是否有连接泄露.

| 属性 | 默认值 | 单位 | 含义 |
| - | - | - | - |
| logAbandoned | false | - | 是否打印相关日志 |
| suspectTimeout | 0 | 秒 | 当连接超过该时间没有归还, 则认为可能泄露. 如果 `logAbandoned` 开启, 会输出相应日志 |
| removeAbandonedTimeout | 60 | 秒 | 当连接超过该时间没有归还, 则认为泄露. |
| removeAbandoned | false | - | 是否关闭泄露的连接 |

## Idle

之所以使用连接池比较高效, 就是因为不需要频繁的建立连接. 连接在连接池中有有种状态 1). busy 2). idle.
busy 说明该连接正在使用, idle 说明该连接闲置. 维持连接是需要消耗资源的,
所以对于不需要的连接应该被关闭掉以节省资源.

| 属性 | 默认值 | 单位 | 含义 |
| - | - | - | - |
| testWhileIdle | false | - | 是否检查 idle 的连接的有效性 |
| validationInterval | 3000 | 毫秒 | 在该时间内被验证过的连接不会被重复验证 |
| validationQuery | null | - | 执行该语句检查连接的有效性, 通常为比较简单的语句, 比如 `SELECT 1` |
| minEvictableIdleTimeMillis | 60000 | 毫秒 | 连接闲置超过该时间则被认为可以关闭 |
| minIdle | 10 | - | 当闲置连接数量超过该值, PoolSweeper 会关闭可关闭的连接, 但不会让闲置连接数量低于该值 |
| maxIdle | 100 | - | 当 PoolSweeper 未开启时, 闲置连接数不会超过该值. PoolSweeper 开启时, 闲置连接数可以超过该值 |
| maxActive | 100 | - | 连接池最多维持的连接数量 |

容易理错的是 `minIdle` 和 `maxIdle`. `minIdle` 不是说连接池中必须有这么多的闲置连接,
连接池的闲置连接是可能低于这个值的, 比如连接都处于 busy 状态或者连接失效被关闭. `minIdle` 是指,
当闲置连接数量大于这个值时, PoolSweeper 在运行时会关闭所有可被关闭的连接
(闲置时间超过 `minEvictableIdleTimeMillis`), 直到 闲置连接数等于 `minIdle` 或者 没有可关闭的闲置连接.

`maxIdle` 要分为 PoolSweeper 开启和未开启两个情况讨论. 未开启时, 当用户归还连接,
如果此时闲置连接数量已经等于 `maxIdle` 了, 那么该连接会被关闭而不是放到连接池里. 开启时,
闲置的连接数量是可能大于 `maxIdle` 的 (但所有连接数是不会超过 `maxActive` 的).
这么做主要是出于性能考虑, 因为程序的使用是有高峰和低峰的, 高峰时这些多出来的闲置连接是很有可能被再次,
从而提高了性能. 之所以 PoolSweeper 开启时才会有这种行为, 是因为, 如果 PoolSweeper 没有开启的话,
这些多出来的连接是没有人去关闭的!

## 其他

| 属性 | 默认值 | 单位 | 含义 |
| - | - | - | - |
| maxAge | 0 | 毫秒 | 连接归还时, 如果该连接已经连接超过该时间则会被关闭 |
| initialSize | 10 | - | 连接池初始创建的连接数量 |
| initSQL | null | - | 连接创建时执行的初始化语句 (例如 `SET NAMES 'utf8mb4', time_zone = '+0:00';`), 只执行一次 |
| testOnBorrow | false | - | 从连接池获取连接时是否验证连接的有效性. (可设置 `validationInterval`, 防止频繁验证) |
