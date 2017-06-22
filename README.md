# 介绍

[![npm version](https://badge.fury.io/js/thinkkoa.svg)](https://badge.fury.io/js/thinkkoa)
[![Build Status](https://travis-ci.org/thinkkoa/thinkkoa.svg?branch=master)](https://travis-ci.org/thinkkoa/thinkkoa)
[![dependencies Status](https://david-dm.org/thinkkoa/thinkkoa/status.svg)](https://david-dm.org/thinkkoa/thinkkoa)

A lightweight, scalable web framework, based on koa.

ThinkKoa 轻量级高性能敏捷开发Node.js框架,支持ES6/7全新特性,支持Koa、Express中间件。

ThinkKoa是对Koa2进行了薄封装。既扩展了Koa的功能,能够迅速的进行Web开发;又保持了原有的API和风格。

# 特性

* 使用 ES6/7 全新特性来开发项目
* 基于Koa2微内核架构,扩展性好,高性能
* 支持多种项目结构和多种项目环境
* 兼容Koa以及Express中间件
* 开发模式下代码自动更新,自动重启 Node 服务
* 支持切面编程,支持 __before，_berore_xxx, _after_xxx 等多种魔术方法
* Web开发常用功能如缓存、session等均已封装为中间件,可在项目中灵活引用



# 快速开始

## 全局安装thinkkoa_cli

```sh
npm install -g thinkkoa_cli
```

## 创建项目


#### 在合适的位置执行命令

```sh
think new project_name
```

#### 进入这个目录

```sh
cd project_name
```

## 安装依赖

```sh
npm install
```

## 启动服务

```sh
npm start
```

## 开始访问

打开浏览器，访问http://localhost:3000 


# 协议

MIT
