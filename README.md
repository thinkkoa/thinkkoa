# 介绍

[![npm version](https://badge.fury.io/js/thinkkoa.svg)](https://badge.fury.io/js/thinkkoa)
[![Build Status](https://travis-ci.org/richenlin/thinkkoa.svg?branch=master)](https://travis-ci.org/richenlin/thinkkoa)
[![Dependency Status](https://david-dm.org/richenlin/thinkkoa.svg)](https://david-dm.org/richenlin/thinkkoa)

A lightweight, scalable web framework, based on koa.

ThinkKoa 是对Koa2进行了薄封装,保持了ThinkNode相似的用法,仅需少许改动即可升级。相对于ThinkNode,它更加轻量级,扩展性和性能也更好。

## middlewares

* [think_cache](https://github.com/richenlin/think_cache) Cache for ThinkKoa, support file, memcache, redis.
* [think_error](https://github.com/richenlin/think_error) Error catch for ThinkKoa.
* [think_logger](https://github.com/richenlin/think_logger) Logger for ThinkKoa.
* [think_model](https://github.com/richenlin/think_model) Model for ThinkKoa, use ThinkORM.
* [think_payload](https://github.com/richenlin/think_payload) Payload parser for ThinkKoa.
* [think_router](https://github.com/richenlin/think_router) Router for ThinkKoa.
* [think_session](https://github.com/richenlin/think_session) Session for ThinkKoa.
* [think_static](https://github.com/richenlin/think_static) Static resource service for ThinkKoa.
* [think_view](https://github.com/richenlin/think_view) View engine for ThinkKoa.

## ext
* [thinkkoa_cli](https://github.com/richenlin/thinkkoa_cli) ThinkKoa command line tool.

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