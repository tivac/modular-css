"use strict";

const STAMP = Symbol("STAMPED SO LEAVE IT BE");

exports.isStamped = (o) => (STAMP in o);

exports.stamp = (o) => Object.defineProperty(o, STAMP, {});
