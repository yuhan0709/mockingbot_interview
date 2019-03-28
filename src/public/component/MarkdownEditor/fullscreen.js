// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/LICENSE

(function(mod) {
  if (typeof exports == 'object' && typeof module == 'object') // CommonJS
    mod(require('codemirror'));
})(function(CodeMirror) {
  'use strict';

  CodeMirror.defineOption('fullScreen', false, function(cm, val, old) {
    if (old == CodeMirror.Init) old = false;
    if (!old == !val) return;
    if (val) setFullscreen(cm);
    else setNormal(cm);
  });

  function setFullscreen(cm) {
    var wrap = document.querySelector('.markdown-editor-container');
    var preview = document.querySelector('.markdown-editor-container .te-preview');
    preview.style.background = 'white';
    // console.dir(wrap);
    cm.state.fullScreenRestore = { scrollTop: window.pageYOffset, scrollLeft: window.pageXOffset,
      width: wrap.style.width, height: wrap.style.height };
    wrap.style.width = '';
    wrap.style.height = 'auto';
    wrap.className += ' CodeMirror-fullscreen';
    document.documentElement.style.overflow = 'hidden';
    cm.refresh();
  }

  function setNormal(cm) {
    var wrap = document.querySelector('.markdown-editor-container');
    var preview = document.querySelector('.markdown-editor-container .te-preview');
    preview.style.background = '';

    wrap.className = wrap.className.replace(/\s*CodeMirror-fullscreen\b/, '');
    document.documentElement.style.overflow = '';
    var info = cm.state.fullScreenRestore;
    wrap.style.width = info.width; wrap.style.height = info.height;
    window.scrollTo(info.scrollLeft, info.scrollTop);
    cm.refresh();
  }
});