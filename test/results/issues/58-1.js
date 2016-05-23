(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
require('./test/specimens/issues/58/issue.css');
},{"./test/specimens/issues/58/issue.css":2}],2:[function(require,module,exports){
module.exports = {
    "issue1": "mc8fe42003_other1 mc0c6149b1_issue1",
    "issue2": "mc8fe42003_other1 mc0c6149b1_issue1 mc8fe42003_other3 mc0c6149b1_issue2"
};
},{"./test/specimens/issues/58/other.css":3}],3:[function(require,module,exports){
module.exports = {
    "other1": "mc8fe42003_other1",
    "other2": "mc8fe42003_other2",
    "other3": "mc8fe42003_other3"
};
},{}]},{},[1]);
