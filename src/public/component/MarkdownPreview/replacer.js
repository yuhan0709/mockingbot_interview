import * as babel from '../../../../lib/babel.min';
import ReactDOM from 'react-dom';
import React from 'react';
import { LazyLoadComponent } from '@util/lazyLoad';
import { antdComponentNames } from './constant';
import { Timeline,Steps,Card,Collapse,Tabs,Modal } from  'antd';

const G2Chart = LazyLoadComponent(() => import('../G2Chart/index.js'));
const BytedReactXgplayer = LazyLoadComponent(() => import('../Xgplayer/index.js'));
const Antd = { Timeline,Steps,Card,Collapse,Tabs,Modal };
antdComponentNames.forEach(item => {
  const lazyComponent = LazyLoadComponent(() => {
    import(`antd/es/${item.fileName}/style`);
    return import(`antd/es/${item.fileName}/index.js`);
  });
  Antd[item.name] = lazyComponent;
});

function filterXSS() {
  return {
    visitor: {
      Identifier(path) {
        if (path.isIdentifier({ name: 'constructor' })) {
          console.log('小伙子不要搞事情~');
          // Todo：打个日志告诉我们
          path.node.name = 'x';
        }
      }
    }
  };
}

babel.registerPlugin('filterXSS', filterXSS);
const babelTransformOptions = {
  presets: ['stage-3', 'react', 'es2015'],
  plugins: ['filterXSS']
};

function transReactCode(code) {
  const rst = babel.transform(code, babelTransformOptions);

  return rst.code;
}

export default function replacer(str, lang) {
  try {
    if (lang === 'mixin-react') {
      return replacerReact(str);
    }
  } catch (e) {
    console.error(e);
  }
  return str;
}

function replacerReact(code) {
  let wrapperId = 'react' + Math.random().toString(36).substr(2, 10);
  const reactCode = `function T(props) {
                    ${code}
                  }
                  ReactDOM.hydrate(T(),__container)
                  `;

  const rst = transReactCode(reactCode);
  setTimeout(renderReact.bind(null, wrapperId, rst), 0);

  return `<div class="markdown-react" id='${wrapperId}'></div>`;
}

function renderReact(wrapperId, reactCode) {
  // 给父级加样式
  const parentContainers = Array.from(document.querySelectorAll('.lang-mixin-react')).map(e => e.parentNode);
  parentContainers.forEach(p => p.classList.add('mixin-react'));
  // console.dir(parentContainers);

  const __container = document.getElementById(wrapperId);
  if (!__container) {
    return;
  }

  const sandbox = {
    React,
    ReactDOM,
    Antd,
    Wg: {
      BytedReactXgplayer,
      G2Chart
    },
    __container,
  };
  const func = compileCode(reactCode);
  func(sandbox);
}

function compileCode(code) {
  code = 'with (sandbox) {' + code + '}';
  const fn = new Function('sandbox', code);
  return (sandbox) => {
    const proxy = new Proxy(sandbox, {
      has() {
        return true; // 欺骗，告知属性存在
      },
      get(target, key, receiver) {
        // 加固，防止逃逸
        if (key === Symbol.unscopables) {
          return undefined;
        }
        return Reflect.get(target, key, receiver);
      }
    });
    return fn(proxy);
  };
}