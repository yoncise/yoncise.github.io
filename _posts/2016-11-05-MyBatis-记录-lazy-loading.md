---
layout: post
title: MyBatis 记录 (二): lazy loading
---

*基于 v3.4.1*

为了映射对象中复杂的关联对象, 我们在 ResultMap 中可以配置 association 和 collection.
这两者的实现方式可以通过 1. 再请求一次 `select` (Nested Select)
2. 通过 `join` 将所有的属性读取出来 (Nested Results). 
但有时候我们并不会使用到对象中所有的属性, 所以这些额外的从数据库拉来的数据就浪费了.
对于通过 `select` 实现的方式我们可以使用懒加载来提升效率.

## 配置

### lazyLoadingEnabled

默认为 `false`, 也就是不使用懒加载. 所以如果 association 和 collection 使用了 `select`,
那么 MyBatis 会一次性执行所有的查询. 如果 accociation 和 collection 中的 `fetchType`
指定为 `lazy`, 那么即使 `lazyLoadingEnabled` 为 false, MyBatis 也会使用懒加载.

Java 配置中 `@One` 和 `@Many` 的 `fetchType` 支持三个值: `LAZY`, `EAGER`, `DEFAULT`,
其中 `DEFAULT` 的意思是跟随全局设置即 `lazyLoadingEnabled`.

### aggressiveLazyLoading

默认为 `true`, 也就是说当你开启了懒加载之后, 只要调用返回的对象中的 *任何一个方法*,
那么 MyBatis 就会加载所有的懒加载的属性, 即执行你配置的 `select` 语句.

### lazyLoadTriggerMethods

默认值为 `equals,clone,hashCode,toString`, 当你调用这几个方法时, MyBatis 会加载所有懒加载的属性.

### proxyFactory

默认为 `JAVASSIST` (MyBatis 3.3 or above). 懒加载是通过字节码增强实现的, 3.3 以前是通过 cglib 实现的,
3.3 之后包括 3.3 是使用 javassist 实现的. 

## 源码分析

前面提到了懒加载是通过字节码增强实现的, 所以 MyBatis 会动态代理你的类, 
然后根据调用的方法名来判断是否需要加载属性.

相关类的实现有两个, 分别对应 javassist 和 cglib 的版本:

- javassist: `org.apache.ibatis.executor.loader.javassist.JavassistProxyFactory`
- cglib: `org.apache.ibatis.executor.loader.cglib.CglibProxyFactory`

两个类在方法拦截时的处理逻辑是一样的, 我们挑其中一个来看 (javassist 的):

```java
@Override
public Object invoke(Object enhanced, Method method, Method methodProxy, Object[] args) throws Throwable {
  final String methodName = method.getName();
  try {
    synchronized (lazyLoader) {
      if (WRITE_REPLACE_METHOD.equals(methodName)) { // 这段不懂是处理什么情况的, 没细看
        Object original = null;
        if (constructorArgTypes.isEmpty()) {
          original = objectFactory.create(type);
        } else {
          original = objectFactory.create(type, constructorArgTypes, constructorArgs);
        }
        PropertyCopier.copyBeanProperties(type, enhanced, original);
        if (lazyLoader.size() > 0) {
          return new JavassistSerialStateHolder(original, lazyLoader.getProperties(), objectFactory, constructorArgTypes, constructorArgs);
        } else {
          return original;
        }
      } else { // 这段是重点
        if (lazyLoader.size() > 0 && !FINALIZE_METHOD.equals(methodName)) {
          if (aggressive || lazyLoadTriggerMethods.contains(methodName)) { 
            // 如果开启了 aggressive 或者调用的是 lazyLoadTriggerMethods 中设置的方法, 则加载所有属性
            lazyLoader.loadAll();
          } else if (PropertyNamer.isProperty(methodName)) { // 判断方法是否是以 get, set, is 开头
            final String property = PropertyNamer.methodToProperty(methodName); // 方法名转换成属性名
            if (lazyLoader.hasLoader(property)) {
              lazyLoader.load(property); // 加载
            }
          }
        }
      }
    }
    return methodProxy.invoke(enhanced, args);
  } catch (Throwable t) {
    throw ExceptionUtil.unwrapThrowable(t);
  }
}
```

## 注意事项

### aggressiveLazyLoading

项目中开启了懒加载后, 准备测试下是否真的启用了懒加载, 于是打印日志看下对应的属性在调用相应的方法前是否是 null.
结果发现属性每次都被加载了, 以为 MyBatis 能拦截属性的直接访问或者生成代理类的时候会分析相应字节码,
如果发现字节码中有属性的访问就在访问改方法时加载属性, 查了下 cglib 和 javassist 文档感觉并没有相应的功能啊.

最后发现原来是因为 `aggressiveLazyLoading` 默认是开启的, 因为我访问了对象的其他方法所以属性被加载了.

### IDEA

千万不要用下断点的方式查看对应的属性有没有被加载, *可能* 是因为 IDEA 在 debug 的时候会调用 `lazyLoadTriggerMethods`
中的方法的, 所以导致属性被加载.

### Jackson

MyBatis 生成的代理类会多出一个 `handler` 的属性, 从而导致 Jackson 序列化失败, 
可以通过在类上添加注解来忽略该属性:

``` java
@JsonIgnoreProperties({"handler"})
public class MyDO {
}
```

> [Configuration](http://www.mybatis.org/mybatis-3/configuration.html)
>
> [Mapper XML Files](http://www.mybatis.org/mybatis-3/sqlmap-xml.html)
>
> [Java API](http://www.mybatis.org/mybatis-3/java-api.html)
