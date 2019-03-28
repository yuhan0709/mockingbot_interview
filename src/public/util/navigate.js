/**
 * Navigate对象
 * 添加了自动添加ROOT_PATH的功能
 * 当to属性以 ~ 开头时，~ 将被替换为 ROOT_PATH
 */
class Navigate {
  ROOT_PATH = '/'
  history = null
  setRoot = (path) => {
    this.ROOT_PATH = path;
  }
  setHistory = (history) => {
    this.history = history;
  }
  go = (to, replace = false, appRouter = true) => {
    if (!this.history) throw new Error('Navigate: history对象未初始化');
    if (!to) throw new Error('Navigate.go: 至少需要一个参数');
    let toPath = to;
    if (this.ROOT_PATH && to.startsWith('~')) {
      // （相当于想对路径替换绝对路径，而且将所有‘/\’统一为‘/
      toPath = toPath.replace('~', this.ROOT_PATH).replace(/\/\//g, '/');
    }
    if (appRouter && this.history) {
      if (replace) {
        // 替换
        this.history.replace(toPath);
      } else {
        this.history.push(toPath);
      }
    } else {
      if (replace) {
        location.replace(toPath);
      } else {
        location.assign(toPath);
      }
    }
  }
  to = (to, appRouter = true) => {
    this.go(to, false, appRouter);
  }
  replace = (to, appRouter = true) => {
    this.go(to, true, appRouter);
  }
}

export default new Navigate();