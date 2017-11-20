[![ThinkKoa](http://thinkkoa.org/img/logo.png)](http://thinkkoa.org/)

# 介绍

[![npm version](https://badge.fury.io/js/thinkkoa.svg)](https://badge.fury.io/js/thinkkoa)
[![Build Status](https://travis-ci.org/thinkkoa/thinkkoa.svg?branch=master)](https://travis-ci.org/thinkkoa/thinkkoa)
[![dependencies Status](https://david-dm.org/thinkkoa/thinkkoa/status.svg)](https://david-dm.org/thinkkoa/thinkkoa)
[![Package Quality](http://npm.packagequality.com/shield/thinkkoa.svg)](http://packagequality.com/#?package=thinkkoa)


A lightweight, scalable for agile development Node.js web framework, based on koa2.

ThinkKoa - 轻量级可扩展的敏捷开发Node.js框架,支持ES6/7全新特性,支持Koa、Express中间件,基于koa2。

### 特性

* 基于koa2

ThinkKoa基于著名的Node.js框架koa2进行了薄封装。扩展了Koa的功能，能够迅速的进行Web开发。

* 支持Koa/Express中间件

通过简单的引入机制，ThinkKoa可以很好的支持Koa中间件(包括Koa1及Koa2)。还提供了useExp()来使用Express的中间件。大大提升了框架的扩展性及开源模块利用率。

* 为敏捷开发而生

ThinkKoa是在ThinkKoa团队3年的Node.js项目开发积累中酝酿诞生的，以提升团队开发效率、助力敏捷开发为目的。框架经过公司多个互联网产品上线、迭代以及大流量大并发的考验。

* 支持多种项目结构和多种项目环境

ThinkKoa默认支持单模块模式，适合简单快速的项目。业务复杂的项目，可以开启多模块支持，功能划分更加清晰。ThinkKoa支持Nginx代理以及pm2部署，适合对稳定性和效率有要求的生产环境。

* 支持灵活的自定义路由

ThinkKoa除默认的单模块模式(controller/action)及多模块模式(module/controller/action）路由规则以外，还支持用户定制路由。
在项目中增加路由文件配置即可灵活的支持Restful等各种自定义路由。


* 拥抱Node.js 8 LTS, 使用 ES6/7 特性来开发项目

使用 `async/await` 等一系列新特性，让Node.js开发变得赏心悦目。

```js
const {controller, helper} = require('thinkkoa');
const user = require('../model/user.js');

//user controller, controller/user.js
module.exports = class extends controller {
    //login action
    async loginAction(){
        //If it is a get request, the login page is displayed directly
        if(this.isGet()){
          return this.render();
        }
        //Obtaining data by post method
        let name = this.post('username');
        if (helper.isEmpty(name)) {
          return this.fail('username is required');
        }
        let userModel = new user(this.app.config('config.model', 'middleware'));
        //Username matches the corresponding entries in the database.
        let result = await userModel.where({name: name, phonenum: {"not": ""}}).find();
        if(!result){
          return this.fail('login fail'); 
        }
        //Written into session
        await this.session('userInfo', result);
        return this.ok('login success'); 
    }
}
```

上面的代码我们使用了 ES6 里的 `class`, `let` 以及 ES7 里的 `async/await` 等特性，虽然查询数据库和写入 `Session` 都是异步操作，但借助 `async/await`，代码都是同步书写的。

# 文档

[中文文档](http://thinkkoa.org/doc/)

# 快速开始

## 全局安装thinkkoa_cli

```sh
npm install -g thinkkoa_cli@2.x
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
