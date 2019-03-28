# 视频架构平台

## 一、最重要的规定
- 第一条军规：es2015+ 全面`import`，废弃require
- 第二条军规：全面`async/await`，除非包装callback，不得使用promise
- 第三条军规：后端不要写路由，有`require-node`

## 二、推荐规定
- 第一条推荐：不要使用`var`，请使用`const`或`let`
- 第二条推荐：不要使用双等号：`==`，请使用三等号：`===`
- 第三条推荐：错误对象，推荐命名为`err`，且有一个`message`属性表示错误原因。err对象推荐通过new Error生成，即`err=new Error(message)`

## 三、项目开发启动
- npm install
- npm run dev

## 四、webgenerator
### 目标
降低多人多系统开发成本。web项目差异最大的地方在于view层，因此降低成本的关键在于统一modal层架构。并且实现UI组件的最大复用。

### 解决方案
1. 统一化技术栈 `react` + `redux`。
2. 提供统一的后端server服务与打包上线流程，并且通过分支区分业务。
3. 对于B端项目，统一采用antd作为组件库，通过覆盖样式等方法，定制主题。
4. 针对C端项目，编写自己的组件库。

### 目录结构
```
src
┣ app 前端代码
┃ ┣ webgenerator 业务文件夹
┃ ┗ config.js 打包配置
┣ public 公共模块
┗ server 服务端代码
  ┣ api require-node实现前端api
  ┣ apiTest 接口自动测试
  ┣ middleware node server中间件
  ┣ config.js 服务端配置
  ┗ index.js 服务端入口
```

### 打包
统一使用webpack进行打包，最终输出到`/output/resource/`下。另外在打包时，将对所有的css文件和除`app/**/global.less`外的less文件进行css module处理。项目全局样式及覆盖antd的变量，请放到`global.less`下。

### 上线
使用各业务的发布分支，在scm上建立代码仓库，编译发布分支。
tce上线前，确认根目录下的settings.py中的P.S.M变量是否与scm/tce/tlb等平台保持一致。

### 开发注意事项
1. app目录及server目录可以各业务自行定制。
2. 在app/config中可以定义打包的文件及路径。如果定义app的`matchPaths`字段可以实现请求转发到文件功能（可以实现SPA），对于app的`whiteList`字段下的规则则不会转发。
3. 对于public模块的修改，请单独建分支并提交merge request至master分支。
4. 与node端交互应使用`require-node`，即将后端运行的代码存储到`server/api/**`，前端在调用时正常引用即可【最终会被编译为一个请求】。

### 新业务接入流程
1. 以master为基础，新建发布分支，推荐命名为PSM【如：fe.videoarch.fcdn】方便scm选择打包分支。
2. 在`app/`下新增文件目录。
3. 修改`app/config.js`增加新业务的打包文件地址。
4. 参考已有项目，尽可能使用公共组件进行项目初始构建。

```
//config.js
export default {
  app: {
    'webgenerator': {// 该app的Key
      entryHtml: './src/app/webgenerator/index.html', // 入口html
      entryJs: './src/app/webgenerator/index.js', // 入口js
      matchPaths: [/^\/app/], // 触发转发条件
      whiteList: [/^\/static/, /^\/require-node/, /\/index.html$/, /^\/ip/, /^\/login/, /^\/logout/], // 不转发的白名单
      ssrEntry: './src/app/webgenerator/ssr', // 服务端渲染入口
    },
  }
};

```
### 自动化接口测试
参考 src/server/apiTest/test.js以及 http://npm.byted.org/#/detail/byted-easy-api。
1. 编写接口请求代码。
2. 根据该请求返回的参数编写JSON-Schema。
3. 运行easyAPI，就会自动检测每个请求的数据，如果报错就会输出一个错误报告。


### SSR接入
1. 在app/config.js中需要服务端渲染的app下，加入`ssrEntry`字段，引用一个ssr文件。
2. 参考`master-demo`分支下的`./src/app/webgenerator/ssr.js`，编写服务端入口组件与初始化代码。
3. 修改index.js中的`ReactDOM.render`为`ReactDOM.hydrate`。
4. 注意：需要将组件懒加载代码去除。即不可出现`import()`。

### TODO
1. vue模板
2. 线上node端自动化测试。
3. 开发阶段自动测试接口页面。
4. 自动报警功能。
5. 组件库。
