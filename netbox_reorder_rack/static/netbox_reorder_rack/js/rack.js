(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // node_modules/gridstack/dist/utils.js
  var require_utils = __commonJS({
    "node_modules/gridstack/dist/utils.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.Utils = exports.obsoleteAttr = exports.obsoleteOptsDel = exports.obsoleteOpts = exports.obsolete = void 0;
      function obsolete(self, f, oldName, newName, rev) {
        let wrapper = (...args) => {
          console.warn("gridstack.js: Function `" + oldName + "` is deprecated in " + rev + " and has been replaced with `" + newName + "`. It will be **removed** in a future release");
          return f.apply(self, args);
        };
        wrapper.prototype = f.prototype;
        return wrapper;
      }
      exports.obsolete = obsolete;
      function obsoleteOpts(opts, oldName, newName, rev) {
        if (opts[oldName] !== void 0) {
          opts[newName] = opts[oldName];
          console.warn("gridstack.js: Option `" + oldName + "` is deprecated in " + rev + " and has been replaced with `" + newName + "`. It will be **removed** in a future release");
        }
      }
      exports.obsoleteOpts = obsoleteOpts;
      function obsoleteOptsDel(opts, oldName, rev, info) {
        if (opts[oldName] !== void 0) {
          console.warn("gridstack.js: Option `" + oldName + "` is deprecated in " + rev + info);
        }
      }
      exports.obsoleteOptsDel = obsoleteOptsDel;
      function obsoleteAttr(el, oldName, newName, rev) {
        let oldAttr = el.getAttribute(oldName);
        if (oldAttr !== null) {
          el.setAttribute(newName, oldAttr);
          console.warn("gridstack.js: attribute `" + oldName + "`=" + oldAttr + " is deprecated on this object in " + rev + " and has been replaced with `" + newName + "`. It will be **removed** in a future release");
        }
      }
      exports.obsoleteAttr = obsoleteAttr;
      var Utils = class _Utils {
        /** convert a potential selector into actual list of html elements */
        static getElements(els) {
          if (typeof els === "string") {
            let list = document.querySelectorAll(els);
            if (!list.length && els[0] !== "." && els[0] !== "#") {
              list = document.querySelectorAll("." + els);
              if (!list.length) {
                list = document.querySelectorAll("#" + els);
              }
            }
            return Array.from(list);
          }
          return [els];
        }
        /** convert a potential selector into actual single element */
        static getElement(els) {
          if (typeof els === "string") {
            if (!els.length)
              return null;
            if (els[0] === "#") {
              return document.getElementById(els.substring(1));
            }
            if (els[0] === "." || els[0] === "[") {
              return document.querySelector(els);
            }
            if (!isNaN(+els[0])) {
              return document.getElementById(els);
            }
            let el = document.querySelector(els);
            if (!el) {
              el = document.getElementById(els);
            }
            if (!el) {
              el = document.querySelector("." + els);
            }
            return el;
          }
          return els;
        }
        /** returns true if a and b overlap */
        static isIntercepted(a, b) {
          return !(a.y >= b.y + b.h || a.y + a.h <= b.y || a.x + a.w <= b.x || a.x >= b.x + b.w);
        }
        /** returns true if a and b touch edges or corners */
        static isTouching(a, b) {
          return _Utils.isIntercepted(a, { x: b.x - 0.5, y: b.y - 0.5, w: b.w + 1, h: b.h + 1 });
        }
        /** returns the area a and b overlap */
        static areaIntercept(a, b) {
          let x0 = a.x > b.x ? a.x : b.x;
          let x1 = a.x + a.w < b.x + b.w ? a.x + a.w : b.x + b.w;
          if (x1 <= x0)
            return 0;
          let y0 = a.y > b.y ? a.y : b.y;
          let y1 = a.y + a.h < b.y + b.h ? a.y + a.h : b.y + b.h;
          if (y1 <= y0)
            return 0;
          return (x1 - x0) * (y1 - y0);
        }
        /** returns the area */
        static area(a) {
          return a.w * a.h;
        }
        /**
         * Sorts array of nodes
         * @param nodes array to sort
         * @param dir 1 for asc, -1 for desc (optional)
         * @param width width of the grid. If undefined the width will be calculated automatically (optional).
         **/
        static sort(nodes, dir, column) {
          column = column || nodes.reduce((col, n) => Math.max(n.x + n.w, col), 0) || 12;
          if (dir === -1)
            return nodes.sort((a, b) => b.x + b.y * column - (a.x + a.y * column));
          else
            return nodes.sort((b, a) => b.x + b.y * column - (a.x + a.y * column));
        }
        /**
         * creates a style sheet with style id under given parent
         * @param id will set the 'gs-style-id' attribute to that id
         * @param parent to insert the stylesheet as first child,
         * if none supplied it will be appended to the document head instead.
         */
        static createStylesheet(id, parent, options2) {
          let style = document.createElement("style");
          const nonce = options2 === null || options2 === void 0 ? void 0 : options2.nonce;
          if (nonce)
            style.nonce = nonce;
          style.setAttribute("type", "text/css");
          style.setAttribute("gs-style-id", id);
          if (style.styleSheet) {
            style.styleSheet.cssText = "";
          } else {
            style.appendChild(document.createTextNode(""));
          }
          if (!parent) {
            parent = document.getElementsByTagName("head")[0];
            parent.appendChild(style);
          } else {
            parent.insertBefore(style, parent.firstChild);
          }
          return style.sheet;
        }
        /** removed the given stylesheet id */
        static removeStylesheet(id) {
          let el = document.querySelector("STYLE[gs-style-id=" + id + "]");
          if (el && el.parentNode)
            el.remove();
        }
        /** inserts a CSS rule */
        static addCSSRule(sheet, selector, rules) {
          if (typeof sheet.addRule === "function") {
            sheet.addRule(selector, rules);
          } else if (typeof sheet.insertRule === "function") {
            sheet.insertRule(`${selector}{${rules}}`);
          }
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        static toBool(v) {
          if (typeof v === "boolean") {
            return v;
          }
          if (typeof v === "string") {
            v = v.toLowerCase();
            return !(v === "" || v === "no" || v === "false" || v === "0");
          }
          return Boolean(v);
        }
        static toNumber(value) {
          return value === null || value.length === 0 ? void 0 : Number(value);
        }
        static parseHeight(val) {
          let h;
          let unit = "px";
          if (typeof val === "string") {
            let match = val.match(/^(-[0-9]+\.[0-9]+|[0-9]*\.[0-9]+|-[0-9]+|[0-9]+)(px|em|rem|vh|vw|%)?$/);
            if (!match) {
              throw new Error("Invalid height");
            }
            unit = match[2] || "px";
            h = parseFloat(match[1]);
          } else {
            h = val;
          }
          return { h, unit };
        }
        /** copies unset fields in target to use the given default sources values */
        // eslint-disable-next-line
        static defaults(target, ...sources) {
          sources.forEach((source) => {
            for (const key in source) {
              if (!source.hasOwnProperty(key))
                return;
              if (target[key] === null || target[key] === void 0) {
                target[key] = source[key];
              } else if (typeof source[key] === "object" && typeof target[key] === "object") {
                this.defaults(target[key], source[key]);
              }
            }
          });
          return target;
        }
        /** given 2 objects return true if they have the same values. Checks for Object {} having same fields and values (just 1 level down) */
        static same(a, b) {
          if (typeof a !== "object")
            return a == b;
          if (typeof a !== typeof b)
            return false;
          if (Object.keys(a).length !== Object.keys(b).length)
            return false;
          for (const key in a) {
            if (a[key] !== b[key])
              return false;
          }
          return true;
        }
        /** copies over b size & position (GridStackPosition), and optionally min/max as well */
        static copyPos(a, b, doMinMax = false) {
          a.x = b.x;
          a.y = b.y;
          a.w = b.w;
          a.h = b.h;
          if (doMinMax) {
            if (b.minW)
              a.minW = b.minW;
            if (b.minH)
              a.minH = b.minH;
            if (b.maxW)
              a.maxW = b.maxW;
            if (b.maxH)
              a.maxH = b.maxH;
          }
          return a;
        }
        /** true if a and b has same size & position */
        static samePos(a, b) {
          return a && b && a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h;
        }
        /** removes field from the first object if same as the second objects (like diffing) and internal '_' for saving */
        static removeInternalAndSame(a, b) {
          if (typeof a !== "object" || typeof b !== "object")
            return;
          for (let key in a) {
            let val = a[key];
            if (key[0] === "_" || val === b[key]) {
              delete a[key];
            } else if (val && typeof val === "object" && b[key] !== void 0) {
              for (let i in val) {
                if (val[i] === b[key][i] || i[0] === "_") {
                  delete val[i];
                }
              }
              if (!Object.keys(val).length) {
                delete a[key];
              }
            }
          }
        }
        /** removes internal fields '_' and default values for saving */
        static removeInternalForSave(n, removeEl = true) {
          for (let key in n) {
            if (key[0] === "_" || n[key] === null || n[key] === void 0)
              delete n[key];
          }
          delete n.grid;
          if (removeEl)
            delete n.el;
          if (!n.autoPosition)
            delete n.autoPosition;
          if (!n.noResize)
            delete n.noResize;
          if (!n.noMove)
            delete n.noMove;
          if (!n.locked)
            delete n.locked;
          if (n.w === 1 || n.w === n.minW)
            delete n.w;
          if (n.h === 1 || n.h === n.minH)
            delete n.h;
        }
        /** return the closest parent (or itself) matching the given class */
        static closestUpByClass(el, name) {
          while (el) {
            if (el.classList.contains(name))
              return el;
            el = el.parentElement;
          }
          return null;
        }
        /** delay calling the given function for given delay, preventing new calls from happening while waiting */
        static throttle(func, delay) {
          let isWaiting = false;
          return (...args) => {
            if (!isWaiting) {
              isWaiting = true;
              setTimeout(() => {
                func(...args);
                isWaiting = false;
              }, delay);
            }
          };
        }
        static removePositioningStyles(el) {
          let style = el.style;
          if (style.position) {
            style.removeProperty("position");
          }
          if (style.left) {
            style.removeProperty("left");
          }
          if (style.top) {
            style.removeProperty("top");
          }
          if (style.width) {
            style.removeProperty("width");
          }
          if (style.height) {
            style.removeProperty("height");
          }
        }
        /** @internal returns the passed element if scrollable, else the closest parent that will, up to the entire document scrolling element */
        static getScrollElement(el) {
          if (!el)
            return document.scrollingElement || document.documentElement;
          const style = getComputedStyle(el);
          const overflowRegex = /(auto|scroll)/;
          if (overflowRegex.test(style.overflow + style.overflowY)) {
            return el;
          } else {
            return this.getScrollElement(el.parentElement);
          }
        }
        /** @internal */
        static updateScrollPosition(el, position, distance) {
          let rect = el.getBoundingClientRect();
          let innerHeightOrClientHeight = window.innerHeight || document.documentElement.clientHeight;
          if (rect.top < 0 || rect.bottom > innerHeightOrClientHeight) {
            let offsetDiffDown = rect.bottom - innerHeightOrClientHeight;
            let offsetDiffUp = rect.top;
            let scrollEl = this.getScrollElement(el);
            if (scrollEl !== null) {
              let prevScroll = scrollEl.scrollTop;
              if (rect.top < 0 && distance < 0) {
                if (el.offsetHeight > innerHeightOrClientHeight) {
                  scrollEl.scrollTop += distance;
                } else {
                  scrollEl.scrollTop += Math.abs(offsetDiffUp) > Math.abs(distance) ? distance : offsetDiffUp;
                }
              } else if (distance > 0) {
                if (el.offsetHeight > innerHeightOrClientHeight) {
                  scrollEl.scrollTop += distance;
                } else {
                  scrollEl.scrollTop += offsetDiffDown > distance ? distance : offsetDiffDown;
                }
              }
              position.top += scrollEl.scrollTop - prevScroll;
            }
          }
        }
        /**
         * @internal Function used to scroll the page.
         *
         * @param event `MouseEvent` that triggers the resize
         * @param el `HTMLElement` that's being resized
         * @param distance Distance from the V edges to start scrolling
         */
        static updateScrollResize(event, el, distance) {
          const scrollEl = this.getScrollElement(el);
          const height = scrollEl.clientHeight;
          const offsetTop = scrollEl === this.getScrollElement() ? 0 : scrollEl.getBoundingClientRect().top;
          const pointerPosY = event.clientY - offsetTop;
          const top = pointerPosY < distance;
          const bottom = pointerPosY > height - distance;
          if (top) {
            scrollEl.scrollBy({ behavior: "smooth", top: pointerPosY - distance });
          } else if (bottom) {
            scrollEl.scrollBy({ behavior: "smooth", top: distance - (height - pointerPosY) });
          }
        }
        /** single level clone, returning a new object with same top fields. This will share sub objects and arrays */
        static clone(obj) {
          if (obj === null || obj === void 0 || typeof obj !== "object") {
            return obj;
          }
          if (obj instanceof Array) {
            return [...obj];
          }
          return Object.assign({}, obj);
        }
        /**
         * Recursive clone version that returns a full copy, checking for nested objects and arrays ONLY.
         * Note: this will use as-is any key starting with double __ (and not copy inside) some lib have circular dependencies.
         */
        static cloneDeep(obj) {
          const skipFields = ["parentGrid", "el", "grid", "subGrid", "engine"];
          const ret = _Utils.clone(obj);
          for (const key in ret) {
            if (ret.hasOwnProperty(key) && typeof ret[key] === "object" && key.substring(0, 2) !== "__" && !skipFields.find((k) => k === key)) {
              ret[key] = _Utils.cloneDeep(obj[key]);
            }
          }
          return ret;
        }
        /** deep clone the given HTML node, removing teh unique id field */
        static cloneNode(el) {
          const node = el.cloneNode(true);
          node.removeAttribute("id");
          return node;
        }
        static appendTo(el, parent) {
          let parentNode;
          if (typeof parent === "string") {
            parentNode = document.querySelector(parent);
          } else {
            parentNode = parent;
          }
          if (parentNode) {
            parentNode.appendChild(el);
          }
        }
        // public static setPositionRelative(el: HTMLElement): void {
        //   if (!(/^(?:r|a|f)/).test(window.getComputedStyle(el).position)) {
        //     el.style.position = "relative";
        //   }
        // }
        static addElStyles(el, styles) {
          if (styles instanceof Object) {
            for (const s in styles) {
              if (styles.hasOwnProperty(s)) {
                if (Array.isArray(styles[s])) {
                  styles[s].forEach((val) => {
                    el.style[s] = val;
                  });
                } else {
                  el.style[s] = styles[s];
                }
              }
            }
          }
        }
        static initEvent(e, info) {
          const evt = { type: info.type };
          const obj = {
            button: 0,
            which: 0,
            buttons: 1,
            bubbles: true,
            cancelable: true,
            target: info.target ? info.target : e.target
          };
          if (e.dataTransfer) {
            evt["dataTransfer"] = e.dataTransfer;
          }
          ["altKey", "ctrlKey", "metaKey", "shiftKey"].forEach((p) => evt[p] = e[p]);
          ["pageX", "pageY", "clientX", "clientY", "screenX", "screenY"].forEach((p) => evt[p] = e[p]);
          return Object.assign(Object.assign({}, evt), obj);
        }
        /** copies the MouseEvent properties and sends it as another event to the given target */
        static simulateMouseEvent(e, simulatedType, target) {
          const simulatedEvent = document.createEvent("MouseEvents");
          simulatedEvent.initMouseEvent(
            simulatedType,
            // type
            true,
            // bubbles
            true,
            // cancelable
            window,
            // view
            1,
            // detail
            e.screenX,
            // screenX
            e.screenY,
            // screenY
            e.clientX,
            // clientX
            e.clientY,
            // clientY
            e.ctrlKey,
            // ctrlKey
            e.altKey,
            // altKey
            e.shiftKey,
            // shiftKey
            e.metaKey,
            // metaKey
            0,
            // button
            e.target
            // relatedTarget
          );
          (target || e.target).dispatchEvent(simulatedEvent);
        }
      };
      exports.Utils = Utils;
    }
  });

  // node_modules/gridstack/dist/gridstack-engine.js
  var require_gridstack_engine = __commonJS({
    "node_modules/gridstack/dist/gridstack-engine.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.GridStackEngine = void 0;
      var utils_1 = require_utils();
      var GridStackEngine = class _GridStackEngine {
        constructor(opts = {}) {
          this.addedNodes = [];
          this.removedNodes = [];
          this.column = opts.column || 12;
          this.maxRow = opts.maxRow;
          this._float = opts.float;
          this.nodes = opts.nodes || [];
          this.onChange = opts.onChange;
        }
        batchUpdate(flag = true) {
          if (!!this.batchMode === flag)
            return this;
          this.batchMode = flag;
          if (flag) {
            this._prevFloat = this._float;
            this._float = true;
            this.saveInitial();
          } else {
            this._float = this._prevFloat;
            delete this._prevFloat;
            this._packNodes()._notify();
          }
          return this;
        }
        // use entire row for hitting area (will use bottom reverse sorted first) if we not actively moving DOWN and didn't already skip
        _useEntireRowArea(node, nn) {
          return (!this.float || this.batchMode && !this._prevFloat) && !this._hasLocked && (!node._moving || node._skipDown || nn.y <= node.y);
        }
        /** @internal fix collision on given 'node', going to given new location 'nn', with optional 'collide' node already found.
         * return true if we moved. */
        _fixCollisions(node, nn = node, collide, opt = {}) {
          this.sortNodes(-1);
          collide = collide || this.collide(node, nn);
          if (!collide)
            return false;
          if (node._moving && !opt.nested && !this.float) {
            if (this.swap(node, collide))
              return true;
          }
          let area = nn;
          if (this._useEntireRowArea(node, nn)) {
            area = { x: 0, w: this.column, y: nn.y, h: nn.h };
            collide = this.collide(node, area, opt.skip);
          }
          let didMove = false;
          let newOpt = { nested: true, pack: false };
          while (collide = collide || this.collide(node, area, opt.skip)) {
            let moved;
            if (collide.locked || node._moving && !node._skipDown && nn.y > node.y && !this.float && // can take space we had, or before where we're going
            (!this.collide(collide, Object.assign(Object.assign({}, collide), { y: node.y }), node) || !this.collide(collide, Object.assign(Object.assign({}, collide), { y: nn.y - collide.h }), node))) {
              node._skipDown = node._skipDown || nn.y > node.y;
              moved = this.moveNode(node, Object.assign(Object.assign(Object.assign({}, nn), { y: collide.y + collide.h }), newOpt));
              if (collide.locked && moved) {
                utils_1.Utils.copyPos(nn, node);
              } else if (!collide.locked && moved && opt.pack) {
                this._packNodes();
                nn.y = collide.y + collide.h;
                utils_1.Utils.copyPos(node, nn);
              }
              didMove = didMove || moved;
            } else {
              moved = this.moveNode(collide, Object.assign(Object.assign(Object.assign({}, collide), { y: nn.y + nn.h, skip: node }), newOpt));
            }
            if (!moved) {
              return didMove;
            }
            collide = void 0;
          }
          return didMove;
        }
        /** return the nodes that intercept the given node. Optionally a different area can be used, as well as a second node to skip */
        collide(skip, area = skip, skip2) {
          return this.nodes.find((n) => n !== skip && n !== skip2 && utils_1.Utils.isIntercepted(n, area));
        }
        collideAll(skip, area = skip, skip2) {
          return this.nodes.filter((n) => n !== skip && n !== skip2 && utils_1.Utils.isIntercepted(n, area));
        }
        /** does a pixel coverage collision based on where we started, returning the node that has the most coverage that is >50% mid line */
        directionCollideCoverage(node, o, collides) {
          if (!o.rect || !node._rect)
            return;
          let r0 = node._rect;
          let r = Object.assign({}, o.rect);
          if (r.y > r0.y) {
            r.h += r.y - r0.y;
            r.y = r0.y;
          } else {
            r.h += r0.y - r.y;
          }
          if (r.x > r0.x) {
            r.w += r.x - r0.x;
            r.x = r0.x;
          } else {
            r.w += r0.x - r.x;
          }
          let collide;
          collides.forEach((n) => {
            if (n.locked || !n._rect)
              return;
            let r2 = n._rect;
            let yOver = Number.MAX_VALUE, xOver = Number.MAX_VALUE, overMax = 0.5;
            if (r0.y < r2.y) {
              yOver = (r.y + r.h - r2.y) / r2.h;
            } else if (r0.y + r0.h > r2.y + r2.h) {
              yOver = (r2.y + r2.h - r.y) / r2.h;
            }
            if (r0.x < r2.x) {
              xOver = (r.x + r.w - r2.x) / r2.w;
            } else if (r0.x + r0.w > r2.x + r2.w) {
              xOver = (r2.x + r2.w - r.x) / r2.w;
            }
            let over = Math.min(xOver, yOver);
            if (over > overMax) {
              overMax = over;
              collide = n;
            }
          });
          o.collide = collide;
          return collide;
        }
        /** does a pixel coverage returning the node that has the most coverage by area */
        /*
        protected collideCoverage(r: GridStackPosition, collides: GridStackNode[]): {collide: GridStackNode, over: number} {
          let collide: GridStackNode;
          let overMax = 0;
          collides.forEach(n => {
            if (n.locked || !n._rect) return;
            let over = Utils.areaIntercept(r, n._rect);
            if (over > overMax) {
              overMax = over;
              collide = n;
            }
          });
          return {collide, over: overMax};
        }
        */
        /** called to cache the nodes pixel rectangles used for collision detection during drag */
        cacheRects(w, h, top, right, bottom, left) {
          this.nodes.forEach((n) => n._rect = {
            y: n.y * h + top,
            x: n.x * w + left,
            w: n.w * w - left - right,
            h: n.h * h - top - bottom
          });
          return this;
        }
        /** called to possibly swap between 2 nodes (same size or column, not locked, touching), returning true if successful */
        swap(a, b) {
          if (!b || b.locked || !a || a.locked)
            return false;
          function _doSwap() {
            let x = b.x, y = b.y;
            b.x = a.x;
            b.y = a.y;
            if (a.h != b.h) {
              a.x = x;
              a.y = b.y + b.h;
            } else if (a.w != b.w) {
              a.x = b.x + b.w;
              a.y = y;
            } else {
              a.x = x;
              a.y = y;
            }
            a._dirty = b._dirty = true;
            return true;
          }
          let touching;
          if (a.w === b.w && a.h === b.h && (a.x === b.x || a.y === b.y) && (touching = utils_1.Utils.isTouching(a, b)))
            return _doSwap();
          if (touching === false)
            return;
          if (a.w === b.w && a.x === b.x && (touching || (touching = utils_1.Utils.isTouching(a, b)))) {
            if (b.y < a.y) {
              let t = a;
              a = b;
              b = t;
            }
            return _doSwap();
          }
          if (touching === false)
            return;
          if (a.h === b.h && a.y === b.y && (touching || (touching = utils_1.Utils.isTouching(a, b)))) {
            if (b.x < a.x) {
              let t = a;
              a = b;
              b = t;
            }
            return _doSwap();
          }
          return false;
        }
        isAreaEmpty(x, y, w, h) {
          let nn = { x: x || 0, y: y || 0, w: w || 1, h: h || 1 };
          return !this.collide(nn);
        }
        /** re-layout grid items to reclaim any empty space */
        compact() {
          if (this.nodes.length === 0)
            return this;
          this.batchUpdate().sortNodes();
          let copyNodes = this.nodes;
          this.nodes = [];
          copyNodes.forEach((node) => {
            if (!node.locked) {
              node.autoPosition = true;
            }
            this.addNode(node, false);
            node._dirty = true;
          });
          return this.batchUpdate(false);
        }
        /** enable/disable floating widgets (default: `false`) See [example](http://gridstackjs.com/demo/float.html) */
        set float(val) {
          if (this._float === val)
            return;
          this._float = val || false;
          if (!val) {
            this._packNodes()._notify();
          }
        }
        /** float getter method */
        get float() {
          return this._float || false;
        }
        /** sort the nodes array from first to last, or reverse. Called during collision/placement to force an order */
        sortNodes(dir) {
          this.nodes = utils_1.Utils.sort(this.nodes, dir, this.column);
          return this;
        }
        /** @internal called to top gravity pack the items back OR revert back to original Y positions when floating */
        _packNodes() {
          if (this.batchMode) {
            return this;
          }
          this.sortNodes();
          if (this.float) {
            this.nodes.forEach((n) => {
              if (n._updating || n._orig === void 0 || n.y === n._orig.y)
                return;
              let newY = n.y;
              while (newY > n._orig.y) {
                --newY;
                let collide = this.collide(n, { x: n.x, y: newY, w: n.w, h: n.h });
                if (!collide) {
                  n._dirty = true;
                  n.y = newY;
                }
              }
            });
          } else {
            this.nodes.forEach((n, i) => {
              if (n.locked)
                return;
              while (n.y > 0) {
                let newY = i === 0 ? 0 : n.y - 1;
                let canBeMoved = i === 0 || !this.collide(n, { x: n.x, y: newY, w: n.w, h: n.h });
                if (!canBeMoved)
                  break;
                n._dirty = n.y !== newY;
                n.y = newY;
              }
            });
          }
          return this;
        }
        /**
         * given a random node, makes sure it's coordinates/values are valid in the current grid
         * @param node to adjust
         * @param resizing if out of bound, resize down or move into the grid to fit ?
         */
        prepareNode(node, resizing) {
          node = node || {};
          node._id = node._id || _GridStackEngine._idSeq++;
          if (node.x === void 0 || node.y === void 0 || node.x === null || node.y === null) {
            node.autoPosition = true;
          }
          let defaults = { x: 0, y: 0, w: 1, h: 1 };
          utils_1.Utils.defaults(node, defaults);
          if (!node.autoPosition) {
            delete node.autoPosition;
          }
          if (!node.noResize) {
            delete node.noResize;
          }
          if (!node.noMove) {
            delete node.noMove;
          }
          if (typeof node.x == "string") {
            node.x = Number(node.x);
          }
          if (typeof node.y == "string") {
            node.y = Number(node.y);
          }
          if (typeof node.w == "string") {
            node.w = Number(node.w);
          }
          if (typeof node.h == "string") {
            node.h = Number(node.h);
          }
          if (isNaN(node.x)) {
            node.x = defaults.x;
            node.autoPosition = true;
          }
          if (isNaN(node.y)) {
            node.y = defaults.y;
            node.autoPosition = true;
          }
          if (isNaN(node.w)) {
            node.w = defaults.w;
          }
          if (isNaN(node.h)) {
            node.h = defaults.h;
          }
          return this.nodeBoundFix(node, resizing);
        }
        /** part2 of preparing a node to fit inside our grid - checks for x,y,w from grid dimensions */
        nodeBoundFix(node, resizing) {
          let before = node._orig || utils_1.Utils.copyPos({}, node);
          if (node.maxW) {
            node.w = Math.min(node.w, node.maxW);
          }
          if (node.maxH) {
            node.h = Math.min(node.h, node.maxH);
          }
          if (node.minW && node.minW <= this.column) {
            node.w = Math.max(node.w, node.minW);
          }
          if (node.minH) {
            node.h = Math.max(node.h, node.minH);
          }
          const saveOrig = this.column === 1 || node.x + node.w > this.column;
          if (saveOrig && this.column < 12 && !this._inColumnResize && node._id && this.findCacheLayout(node, 12) === -1) {
            let copy = Object.assign({}, node);
            if (copy.autoPosition) {
              delete copy.x;
              delete copy.y;
            } else
              copy.x = Math.min(11, copy.x);
            copy.w = Math.min(12, copy.w);
            this.cacheOneLayout(copy, 12);
          }
          if (node.w > this.column) {
            node.w = this.column;
          } else if (node.w < 1) {
            node.w = 1;
          }
          if (this.maxRow && node.h > this.maxRow) {
            node.h = this.maxRow;
          } else if (node.h < 1) {
            node.h = 1;
          }
          if (node.x < 0) {
            node.x = 0;
          }
          if (node.y < 0) {
            node.y = 0;
          }
          if (node.x + node.w > this.column) {
            if (resizing) {
              node.w = this.column - node.x;
            } else {
              node.x = this.column - node.w;
            }
          }
          if (this.maxRow && node.y + node.h > this.maxRow) {
            if (resizing) {
              node.h = this.maxRow - node.y;
            } else {
              node.y = this.maxRow - node.h;
            }
          }
          if (!utils_1.Utils.samePos(node, before)) {
            node._dirty = true;
          }
          return node;
        }
        /** returns a list of modified nodes from their original values */
        getDirtyNodes(verify) {
          if (verify) {
            return this.nodes.filter((n) => n._dirty && !utils_1.Utils.samePos(n, n._orig));
          }
          return this.nodes.filter((n) => n._dirty);
        }
        /** @internal call this to call onChange callback with dirty nodes so DOM can be updated */
        _notify(removedNodes) {
          if (this.batchMode || !this.onChange)
            return this;
          let dirtyNodes = (removedNodes || []).concat(this.getDirtyNodes());
          this.onChange(dirtyNodes);
          return this;
        }
        /** @internal remove dirty and last tried info */
        cleanNodes() {
          if (this.batchMode)
            return this;
          this.nodes.forEach((n) => {
            delete n._dirty;
            delete n._lastTried;
          });
          return this;
        }
        /** @internal called to save initial position/size to track real dirty state.
         * Note: should be called right after we call change event (so next API is can detect changes)
         * as well as right before we start move/resize/enter (so we can restore items to prev values) */
        saveInitial() {
          this.nodes.forEach((n) => {
            n._orig = utils_1.Utils.copyPos({}, n);
            delete n._dirty;
          });
          this._hasLocked = this.nodes.some((n) => n.locked);
          return this;
        }
        /** @internal restore all the nodes back to initial values (called when we leave) */
        restoreInitial() {
          this.nodes.forEach((n) => {
            if (utils_1.Utils.samePos(n, n._orig))
              return;
            utils_1.Utils.copyPos(n, n._orig);
            n._dirty = true;
          });
          this._notify();
          return this;
        }
        /** find the first available empty spot for the given node width/height, updating the x,y attributes. return true if found.
         * optionally you can pass your own existing node list and column count, otherwise defaults to that engine data.
         */
        findEmptyPosition(node, nodeList = this.nodes, column = this.column) {
          nodeList = utils_1.Utils.sort(nodeList, -1, column);
          let found = false;
          for (let i = 0; !found; ++i) {
            let x = i % column;
            let y = Math.floor(i / column);
            if (x + node.w > column) {
              continue;
            }
            let box = { x, y, w: node.w, h: node.h };
            if (!nodeList.find((n) => utils_1.Utils.isIntercepted(box, n))) {
              node.x = x;
              node.y = y;
              delete node.autoPosition;
              found = true;
            }
          }
          return found;
        }
        /** call to add the given node to our list, fixing collision and re-packing */
        addNode(node, triggerAddEvent = false) {
          let dup = this.nodes.find((n) => n._id === node._id);
          if (dup)
            return dup;
          node = this._inColumnResize ? this.nodeBoundFix(node) : this.prepareNode(node);
          delete node._temporaryRemoved;
          delete node._removeDOM;
          if (node.autoPosition && this.findEmptyPosition(node)) {
            delete node.autoPosition;
          }
          this.nodes.push(node);
          if (triggerAddEvent) {
            this.addedNodes.push(node);
          }
          this._fixCollisions(node);
          if (!this.batchMode) {
            this._packNodes()._notify();
          }
          return node;
        }
        removeNode(node, removeDOM = true, triggerEvent = false) {
          if (!this.nodes.find((n) => n === node)) {
            return this;
          }
          if (triggerEvent) {
            this.removedNodes.push(node);
          }
          if (removeDOM)
            node._removeDOM = true;
          this.nodes = this.nodes.filter((n) => n !== node);
          return this._packNodes()._notify([node]);
        }
        removeAll(removeDOM = true) {
          delete this._layouts;
          if (this.nodes.length === 0)
            return this;
          removeDOM && this.nodes.forEach((n) => n._removeDOM = true);
          this.removedNodes = this.nodes;
          this.nodes = [];
          return this._notify(this.removedNodes);
        }
        /** checks if item can be moved (layout constrain) vs moveNode(), returning true if was able to move.
         * In more complicated cases (maxRow) it will attempt at moving the item and fixing
         * others in a clone first, then apply those changes if still within specs. */
        moveNodeCheck(node, o) {
          if (!this.changedPosConstrain(node, o))
            return false;
          o.pack = true;
          if (!this.maxRow) {
            return this.moveNode(node, o);
          }
          let clonedNode;
          let clone = new _GridStackEngine({
            column: this.column,
            float: this.float,
            nodes: this.nodes.map((n) => {
              if (n === node) {
                clonedNode = Object.assign({}, n);
                return clonedNode;
              }
              return Object.assign({}, n);
            })
          });
          if (!clonedNode)
            return false;
          let canMove = clone.moveNode(clonedNode, o) && clone.getRow() <= this.maxRow;
          if (!canMove && !o.resizing && o.collide) {
            let collide = o.collide.el.gridstackNode;
            if (this.swap(node, collide)) {
              this._notify();
              return true;
            }
          }
          if (!canMove)
            return false;
          clone.nodes.filter((n) => n._dirty).forEach((c) => {
            let n = this.nodes.find((a) => a._id === c._id);
            if (!n)
              return;
            utils_1.Utils.copyPos(n, c);
            n._dirty = true;
          });
          this._notify();
          return true;
        }
        /** return true if can fit in grid height constrain only (always true if no maxRow) */
        willItFit(node) {
          delete node._willFitPos;
          if (!this.maxRow)
            return true;
          let clone = new _GridStackEngine({
            column: this.column,
            float: this.float,
            nodes: this.nodes.map((n2) => {
              return Object.assign({}, n2);
            })
          });
          let n = Object.assign({}, node);
          this.cleanupNode(n);
          delete n.el;
          delete n._id;
          delete n.content;
          delete n.grid;
          clone.addNode(n);
          if (clone.getRow() <= this.maxRow) {
            node._willFitPos = utils_1.Utils.copyPos({}, n);
            return true;
          }
          return false;
        }
        /** true if x,y or w,h are different after clamping to min/max */
        changedPosConstrain(node, p) {
          p.w = p.w || node.w;
          p.h = p.h || node.h;
          if (node.x !== p.x || node.y !== p.y)
            return true;
          if (node.maxW) {
            p.w = Math.min(p.w, node.maxW);
          }
          if (node.maxH) {
            p.h = Math.min(p.h, node.maxH);
          }
          if (node.minW) {
            p.w = Math.max(p.w, node.minW);
          }
          if (node.minH) {
            p.h = Math.max(p.h, node.minH);
          }
          return node.w !== p.w || node.h !== p.h;
        }
        /** return true if the passed in node was actually moved (checks for no-op and locked) */
        moveNode(node, o) {
          var _a, _b;
          if (!node || /*node.locked ||*/
          !o)
            return false;
          let wasUndefinedPack;
          if (o.pack === void 0) {
            wasUndefinedPack = o.pack = true;
          }
          if (typeof o.x !== "number") {
            o.x = node.x;
          }
          if (typeof o.y !== "number") {
            o.y = node.y;
          }
          if (typeof o.w !== "number") {
            o.w = node.w;
          }
          if (typeof o.h !== "number") {
            o.h = node.h;
          }
          let resizing = node.w !== o.w || node.h !== o.h;
          let nn = utils_1.Utils.copyPos({}, node, true);
          utils_1.Utils.copyPos(nn, o);
          nn = this.nodeBoundFix(nn, resizing);
          utils_1.Utils.copyPos(o, nn);
          if (utils_1.Utils.samePos(node, o))
            return false;
          let prevPos = utils_1.Utils.copyPos({}, node);
          let collides = this.collideAll(node, nn, o.skip);
          let needToMove = true;
          if (collides.length) {
            let activeDrag = node._moving && !o.nested;
            let collide = activeDrag ? this.directionCollideCoverage(node, o, collides) : collides[0];
            if (activeDrag && collide && ((_b = (_a = node.grid) === null || _a === void 0 ? void 0 : _a.opts) === null || _b === void 0 ? void 0 : _b.subGridDynamic) && !node.grid._isTemp) {
              let over = utils_1.Utils.areaIntercept(o.rect, collide._rect);
              let a1 = utils_1.Utils.area(o.rect);
              let a2 = utils_1.Utils.area(collide._rect);
              let perc = over / (a1 < a2 ? a1 : a2);
              if (perc > 0.8) {
                collide.grid.makeSubGrid(collide.el, void 0, node);
                collide = void 0;
              }
            }
            if (collide) {
              needToMove = !this._fixCollisions(node, nn, collide, o);
            } else {
              needToMove = false;
              if (wasUndefinedPack)
                delete o.pack;
            }
          }
          if (needToMove) {
            node._dirty = true;
            utils_1.Utils.copyPos(node, nn);
          }
          if (o.pack) {
            this._packNodes()._notify();
          }
          return !utils_1.Utils.samePos(node, prevPos);
        }
        getRow() {
          return this.nodes.reduce((row, n) => Math.max(row, n.y + n.h), 0);
        }
        beginUpdate(node) {
          if (!node._updating) {
            node._updating = true;
            delete node._skipDown;
            if (!this.batchMode)
              this.saveInitial();
          }
          return this;
        }
        endUpdate() {
          let n = this.nodes.find((n2) => n2._updating);
          if (n) {
            delete n._updating;
            delete n._skipDown;
          }
          return this;
        }
        /** saves a copy of the largest column layout (eg 12 even when rendering oneColumnMode) so we don't loose orig layout,
         * returning a list of widgets for serialization */
        save(saveElement = true) {
          var _a;
          let len = (_a = this._layouts) === null || _a === void 0 ? void 0 : _a.length;
          let layout = len && this.column !== len - 1 ? this._layouts[len - 1] : null;
          let list = [];
          this.sortNodes();
          this.nodes.forEach((n) => {
            let wl = layout === null || layout === void 0 ? void 0 : layout.find((l) => l._id === n._id);
            let w = Object.assign({}, n);
            if (wl) {
              w.x = wl.x;
              w.y = wl.y;
              w.w = wl.w;
            }
            utils_1.Utils.removeInternalForSave(w, !saveElement);
            list.push(w);
          });
          return list;
        }
        /** @internal called whenever a node is added or moved - updates the cached layouts */
        layoutsNodesChange(nodes) {
          if (!this._layouts || this._inColumnResize)
            return this;
          this._layouts.forEach((layout, column) => {
            if (!layout || column === this.column)
              return this;
            if (column < this.column) {
              this._layouts[column] = void 0;
            } else {
              let ratio = column / this.column;
              nodes.forEach((node) => {
                if (!node._orig)
                  return;
                let n = layout.find((l) => l._id === node._id);
                if (!n)
                  return;
                if (node.y !== node._orig.y) {
                  n.y += node.y - node._orig.y;
                }
                if (node.x !== node._orig.x) {
                  n.x = Math.round(node.x * ratio);
                }
                if (node.w !== node._orig.w) {
                  n.w = Math.round(node.w * ratio);
                }
              });
            }
          });
          return this;
        }
        /**
         * @internal Called to scale the widget width & position up/down based on the column change.
         * Note we store previous layouts (especially original ones) to make it possible to go
         * from say 12 -> 1 -> 12 and get back to where we were.
         *
         * @param prevColumn previous number of columns
         * @param column  new column number
         * @param nodes different sorted list (ex: DOM order) instead of current list
         * @param layout specify the type of re-layout that will happen (position, size, etc...).
         * Note: items will never be outside of the current column boundaries. default (moveScale). Ignored for 1 column
         */
        updateNodeWidths(prevColumn, column, nodes, layout = "moveScale") {
          var _a;
          if (!this.nodes.length || !column || prevColumn === column)
            return this;
          this.cacheLayout(this.nodes, prevColumn);
          this.batchUpdate();
          let newNodes = [];
          let domOrder = false;
          if (column === 1 && (nodes === null || nodes === void 0 ? void 0 : nodes.length)) {
            domOrder = true;
            let top = 0;
            nodes.forEach((n) => {
              n.x = 0;
              n.w = 1;
              n.y = Math.max(n.y, top);
              top = n.y + n.h;
            });
            newNodes = nodes;
            nodes = [];
          } else {
            nodes = utils_1.Utils.sort(this.nodes, -1, prevColumn);
          }
          let cacheNodes = [];
          if (column > prevColumn) {
            cacheNodes = this._layouts[column] || [];
            let lastIndex = this._layouts.length - 1;
            if (!cacheNodes.length && prevColumn !== lastIndex && ((_a = this._layouts[lastIndex]) === null || _a === void 0 ? void 0 : _a.length)) {
              prevColumn = lastIndex;
              this._layouts[lastIndex].forEach((cacheNode) => {
                let n = nodes.find((n2) => n2._id === cacheNode._id);
                if (n) {
                  n.x = cacheNode.x;
                  n.y = cacheNode.y;
                  n.w = cacheNode.w;
                }
              });
            }
          }
          cacheNodes.forEach((cacheNode) => {
            let j = nodes.findIndex((n) => n._id === cacheNode._id);
            if (j !== -1) {
              if (cacheNode.autoPosition || isNaN(cacheNode.x) || isNaN(cacheNode.y)) {
                this.findEmptyPosition(cacheNode, newNodes);
              }
              if (!cacheNode.autoPosition) {
                nodes[j].x = cacheNode.x;
                nodes[j].y = cacheNode.y;
                nodes[j].w = cacheNode.w;
                newNodes.push(nodes[j]);
              }
              nodes.splice(j, 1);
            }
          });
          if (nodes.length) {
            if (typeof layout === "function") {
              layout(column, prevColumn, newNodes, nodes);
            } else if (!domOrder) {
              let ratio = column / prevColumn;
              let move = layout === "move" || layout === "moveScale";
              let scale = layout === "scale" || layout === "moveScale";
              nodes.forEach((node) => {
                node.x = column === 1 ? 0 : move ? Math.round(node.x * ratio) : Math.min(node.x, column - 1);
                node.w = column === 1 || prevColumn === 1 ? 1 : scale ? Math.round(node.w * ratio) || 1 : Math.min(node.w, column);
                newNodes.push(node);
              });
              nodes = [];
            }
          }
          if (!domOrder)
            newNodes = utils_1.Utils.sort(newNodes, -1, column);
          this._inColumnResize = true;
          this.nodes = [];
          newNodes.forEach((node) => {
            this.addNode(node, false);
            delete node._orig;
          });
          this.batchUpdate(false);
          delete this._inColumnResize;
          return this;
        }
        /**
         * call to cache the given layout internally to the given location so we can restore back when column changes size
         * @param nodes list of nodes
         * @param column corresponding column index to save it under
         * @param clear if true, will force other caches to be removed (default false)
         */
        cacheLayout(nodes, column, clear = false) {
          let copy = [];
          nodes.forEach((n, i) => {
            n._id = n._id || _GridStackEngine._idSeq++;
            copy[i] = { x: n.x, y: n.y, w: n.w, _id: n._id };
          });
          this._layouts = clear ? [] : this._layouts || [];
          this._layouts[column] = copy;
          return this;
        }
        /**
         * call to cache the given node layout internally to the given location so we can restore back when column changes size
         * @param node single node to cache
         * @param column corresponding column index to save it under
         */
        cacheOneLayout(n, column) {
          n._id = n._id || _GridStackEngine._idSeq++;
          let l = { x: n.x, y: n.y, w: n.w, _id: n._id };
          if (n.autoPosition) {
            delete l.x;
            delete l.y;
            l.autoPosition = true;
          }
          this._layouts = this._layouts || [];
          this._layouts[column] = this._layouts[column] || [];
          let index = this.findCacheLayout(n, column);
          if (index === -1)
            this._layouts[column].push(l);
          else
            this._layouts[column][index] = l;
          return this;
        }
        findCacheLayout(n, column) {
          var _a, _b, _c;
          return (_c = (_b = (_a = this._layouts) === null || _a === void 0 ? void 0 : _a[column]) === null || _b === void 0 ? void 0 : _b.findIndex((l) => l._id === n._id)) !== null && _c !== void 0 ? _c : -1;
        }
        /** called to remove all internal values but the _id */
        cleanupNode(node) {
          for (let prop in node) {
            if (prop[0] === "_" && prop !== "_id")
              delete node[prop];
          }
          return this;
        }
      };
      exports.GridStackEngine = GridStackEngine;
      GridStackEngine._idSeq = 1;
    }
  });

  // node_modules/gridstack/dist/types.js
  var require_types = __commonJS({
    "node_modules/gridstack/dist/types.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.dragInDefaultOptions = exports.gridDefaults = void 0;
      exports.gridDefaults = {
        alwaysShowResizeHandle: "mobile",
        animate: true,
        auto: true,
        cellHeight: "auto",
        cellHeightThrottle: 100,
        cellHeightUnit: "px",
        column: 12,
        draggable: { handle: ".grid-stack-item-content", appendTo: "body", scroll: true },
        handle: ".grid-stack-item-content",
        itemClass: "grid-stack-item",
        margin: 10,
        marginUnit: "px",
        maxRow: 0,
        minRow: 0,
        oneColumnSize: 768,
        placeholderClass: "grid-stack-placeholder",
        placeholderText: "",
        removableOptions: { accept: ".grid-stack-item" },
        resizable: { handles: "se" },
        rtl: "auto"
      };
      exports.dragInDefaultOptions = {
        handle: ".grid-stack-item-content",
        appendTo: "body"
      };
    }
  });

  // node_modules/gridstack/dist/dd-manager.js
  var require_dd_manager = __commonJS({
    "node_modules/gridstack/dist/dd-manager.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.DDManager = void 0;
      var DDManager = class {
      };
      exports.DDManager = DDManager;
    }
  });

  // node_modules/gridstack/dist/dd-touch.js
  var require_dd_touch = __commonJS({
    "node_modules/gridstack/dist/dd-touch.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.pointerleave = exports.pointerenter = exports.pointerdown = exports.touchend = exports.touchmove = exports.touchstart = exports.isTouch = void 0;
      var dd_manager_1 = require_dd_manager();
      exports.isTouch = typeof window !== "undefined" && typeof document !== "undefined" && ("ontouchstart" in document || "ontouchstart" in window || window.DocumentTouch && document instanceof window.DocumentTouch || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0);
      var DDTouch = class {
      };
      function simulateMouseEvent(e, simulatedType) {
        if (e.touches.length > 1)
          return;
        if (e.cancelable)
          e.preventDefault();
        const touch = e.changedTouches[0], simulatedEvent = document.createEvent("MouseEvents");
        simulatedEvent.initMouseEvent(
          simulatedType,
          // type
          true,
          // bubbles
          true,
          // cancelable
          window,
          // view
          1,
          // detail
          touch.screenX,
          // screenX
          touch.screenY,
          // screenY
          touch.clientX,
          // clientX
          touch.clientY,
          // clientY
          false,
          // ctrlKey
          false,
          // altKey
          false,
          // shiftKey
          false,
          // metaKey
          0,
          // button
          null
          // relatedTarget
        );
        e.target.dispatchEvent(simulatedEvent);
      }
      function simulatePointerMouseEvent(e, simulatedType) {
        if (e.cancelable)
          e.preventDefault();
        const simulatedEvent = document.createEvent("MouseEvents");
        simulatedEvent.initMouseEvent(
          simulatedType,
          // type
          true,
          // bubbles
          true,
          // cancelable
          window,
          // view
          1,
          // detail
          e.screenX,
          // screenX
          e.screenY,
          // screenY
          e.clientX,
          // clientX
          e.clientY,
          // clientY
          false,
          // ctrlKey
          false,
          // altKey
          false,
          // shiftKey
          false,
          // metaKey
          0,
          // button
          null
          // relatedTarget
        );
        e.target.dispatchEvent(simulatedEvent);
      }
      function touchstart(e) {
        if (DDTouch.touchHandled)
          return;
        DDTouch.touchHandled = true;
        simulateMouseEvent(e, "mousedown");
      }
      exports.touchstart = touchstart;
      function touchmove(e) {
        if (!DDTouch.touchHandled)
          return;
        simulateMouseEvent(e, "mousemove");
      }
      exports.touchmove = touchmove;
      function touchend(e) {
        if (!DDTouch.touchHandled)
          return;
        if (DDTouch.pointerLeaveTimeout) {
          window.clearTimeout(DDTouch.pointerLeaveTimeout);
          delete DDTouch.pointerLeaveTimeout;
        }
        const wasDragging = !!dd_manager_1.DDManager.dragElement;
        simulateMouseEvent(e, "mouseup");
        if (!wasDragging) {
          simulateMouseEvent(e, "click");
        }
        DDTouch.touchHandled = false;
      }
      exports.touchend = touchend;
      function pointerdown(e) {
        e.target.releasePointerCapture(e.pointerId);
      }
      exports.pointerdown = pointerdown;
      function pointerenter(e) {
        if (!dd_manager_1.DDManager.dragElement) {
          return;
        }
        simulatePointerMouseEvent(e, "mouseenter");
      }
      exports.pointerenter = pointerenter;
      function pointerleave(e) {
        if (!dd_manager_1.DDManager.dragElement) {
          return;
        }
        DDTouch.pointerLeaveTimeout = window.setTimeout(() => {
          delete DDTouch.pointerLeaveTimeout;
          simulatePointerMouseEvent(e, "mouseleave");
        }, 10);
      }
      exports.pointerleave = pointerleave;
    }
  });

  // node_modules/gridstack/dist/dd-resizable-handle.js
  var require_dd_resizable_handle = __commonJS({
    "node_modules/gridstack/dist/dd-resizable-handle.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.DDResizableHandle = void 0;
      var dd_touch_1 = require_dd_touch();
      var DDResizableHandle = class _DDResizableHandle {
        constructor(host, direction, option) {
          this.moving = false;
          this.host = host;
          this.dir = direction;
          this.option = option;
          this._mouseDown = this._mouseDown.bind(this);
          this._mouseMove = this._mouseMove.bind(this);
          this._mouseUp = this._mouseUp.bind(this);
          this._init();
        }
        /** @internal */
        _init() {
          const el = document.createElement("div");
          el.classList.add("ui-resizable-handle");
          el.classList.add(`${_DDResizableHandle.prefix}${this.dir}`);
          el.style.zIndex = "100";
          el.style.userSelect = "none";
          this.el = el;
          this.host.appendChild(this.el);
          this.el.addEventListener("mousedown", this._mouseDown);
          if (dd_touch_1.isTouch) {
            this.el.addEventListener("touchstart", dd_touch_1.touchstart);
            this.el.addEventListener("pointerdown", dd_touch_1.pointerdown);
          }
          return this;
        }
        /** call this when resize handle needs to be removed and cleaned up */
        destroy() {
          if (this.moving)
            this._mouseUp(this.mouseDownEvent);
          this.el.removeEventListener("mousedown", this._mouseDown);
          if (dd_touch_1.isTouch) {
            this.el.removeEventListener("touchstart", dd_touch_1.touchstart);
            this.el.removeEventListener("pointerdown", dd_touch_1.pointerdown);
          }
          this.host.removeChild(this.el);
          delete this.el;
          delete this.host;
          return this;
        }
        /** @internal called on mouse down on us: capture move on the entire document (mouse might not stay on us) until we release the mouse */
        _mouseDown(e) {
          this.mouseDownEvent = e;
          document.addEventListener("mousemove", this._mouseMove, true);
          document.addEventListener("mouseup", this._mouseUp, true);
          if (dd_touch_1.isTouch) {
            this.el.addEventListener("touchmove", dd_touch_1.touchmove);
            this.el.addEventListener("touchend", dd_touch_1.touchend);
          }
          e.stopPropagation();
          e.preventDefault();
        }
        /** @internal */
        _mouseMove(e) {
          let s = this.mouseDownEvent;
          if (this.moving) {
            this._triggerEvent("move", e);
          } else if (Math.abs(e.x - s.x) + Math.abs(e.y - s.y) > 2) {
            this.moving = true;
            this._triggerEvent("start", this.mouseDownEvent);
            this._triggerEvent("move", e);
          }
          e.stopPropagation();
          e.preventDefault();
        }
        /** @internal */
        _mouseUp(e) {
          if (this.moving) {
            this._triggerEvent("stop", e);
          }
          document.removeEventListener("mousemove", this._mouseMove, true);
          document.removeEventListener("mouseup", this._mouseUp, true);
          if (dd_touch_1.isTouch) {
            this.el.removeEventListener("touchmove", dd_touch_1.touchmove);
            this.el.removeEventListener("touchend", dd_touch_1.touchend);
          }
          delete this.moving;
          delete this.mouseDownEvent;
          e.stopPropagation();
          e.preventDefault();
        }
        /** @internal */
        _triggerEvent(name, event) {
          if (this.option[name])
            this.option[name](event);
          return this;
        }
      };
      exports.DDResizableHandle = DDResizableHandle;
      DDResizableHandle.prefix = "ui-resizable-";
    }
  });

  // node_modules/gridstack/dist/dd-base-impl.js
  var require_dd_base_impl = __commonJS({
    "node_modules/gridstack/dist/dd-base-impl.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.DDBaseImplement = void 0;
      var DDBaseImplement = class {
        constructor() {
          this._eventRegister = {};
        }
        /** returns the enable state, but you have to call enable()/disable() to change (as other things need to happen) */
        get disabled() {
          return this._disabled;
        }
        on(event, callback) {
          this._eventRegister[event] = callback;
        }
        off(event) {
          delete this._eventRegister[event];
        }
        enable() {
          this._disabled = false;
        }
        disable() {
          this._disabled = true;
        }
        destroy() {
          delete this._eventRegister;
        }
        triggerEvent(eventName, event) {
          if (!this.disabled && this._eventRegister && this._eventRegister[eventName])
            return this._eventRegister[eventName](event);
        }
      };
      exports.DDBaseImplement = DDBaseImplement;
    }
  });

  // node_modules/gridstack/dist/dd-resizable.js
  var require_dd_resizable = __commonJS({
    "node_modules/gridstack/dist/dd-resizable.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.DDResizable = void 0;
      var dd_resizable_handle_1 = require_dd_resizable_handle();
      var dd_base_impl_1 = require_dd_base_impl();
      var utils_1 = require_utils();
      var dd_manager_1 = require_dd_manager();
      var DDResizable = class _DDResizable extends dd_base_impl_1.DDBaseImplement {
        constructor(el, opts = {}) {
          super();
          this._ui = () => {
            const containmentEl = this.el.parentElement;
            const containmentRect = containmentEl.getBoundingClientRect();
            const newRect = {
              width: this.originalRect.width,
              height: this.originalRect.height + this.scrolled,
              left: this.originalRect.left,
              top: this.originalRect.top - this.scrolled
            };
            const rect = this.temporalRect || newRect;
            return {
              position: {
                left: rect.left - containmentRect.left,
                top: rect.top - containmentRect.top
              },
              size: {
                width: rect.width,
                height: rect.height
              }
              /* Gridstack ONLY needs position set above... keep around in case.
              element: [this.el], // The object representing the element to be resized
              helper: [], // TODO: not support yet - The object representing the helper that's being resized
              originalElement: [this.el],// we don't wrap here, so simplify as this.el //The object representing the original element before it is wrapped
              originalPosition: { // The position represented as { left, top } before the resizable is resized
                left: this.originalRect.left - containmentRect.left,
                top: this.originalRect.top - containmentRect.top
              },
              originalSize: { // The size represented as { width, height } before the resizable is resized
                width: this.originalRect.width,
                height: this.originalRect.height
              }
              */
            };
          };
          this.el = el;
          this.option = opts;
          this._mouseOver = this._mouseOver.bind(this);
          this._mouseOut = this._mouseOut.bind(this);
          this.enable();
          this._setupAutoHide(this.option.autoHide);
          this._setupHandlers();
        }
        on(event, callback) {
          super.on(event, callback);
        }
        off(event) {
          super.off(event);
        }
        enable() {
          super.enable();
          this.el.classList.add("ui-resizable");
          this.el.classList.remove("ui-resizable-disabled");
          this._setupAutoHide(this.option.autoHide);
        }
        disable() {
          super.disable();
          this.el.classList.add("ui-resizable-disabled");
          this.el.classList.remove("ui-resizable");
          this._setupAutoHide(false);
        }
        destroy() {
          this._removeHandlers();
          this._setupAutoHide(false);
          this.el.classList.remove("ui-resizable");
          delete this.el;
          super.destroy();
        }
        updateOption(opts) {
          let updateHandles = opts.handles && opts.handles !== this.option.handles;
          let updateAutoHide = opts.autoHide && opts.autoHide !== this.option.autoHide;
          Object.keys(opts).forEach((key) => this.option[key] = opts[key]);
          if (updateHandles) {
            this._removeHandlers();
            this._setupHandlers();
          }
          if (updateAutoHide) {
            this._setupAutoHide(this.option.autoHide);
          }
          return this;
        }
        /** @internal turns auto hide on/off */
        _setupAutoHide(auto) {
          if (auto) {
            this.el.classList.add("ui-resizable-autohide");
            this.el.addEventListener("mouseover", this._mouseOver);
            this.el.addEventListener("mouseout", this._mouseOut);
          } else {
            this.el.classList.remove("ui-resizable-autohide");
            this.el.removeEventListener("mouseover", this._mouseOver);
            this.el.removeEventListener("mouseout", this._mouseOut);
            if (dd_manager_1.DDManager.overResizeElement === this) {
              delete dd_manager_1.DDManager.overResizeElement;
            }
          }
          return this;
        }
        /** @internal */
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _mouseOver(e) {
          if (dd_manager_1.DDManager.overResizeElement || dd_manager_1.DDManager.dragElement)
            return;
          dd_manager_1.DDManager.overResizeElement = this;
          this.el.classList.remove("ui-resizable-autohide");
        }
        /** @internal */
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _mouseOut(e) {
          if (dd_manager_1.DDManager.overResizeElement !== this)
            return;
          delete dd_manager_1.DDManager.overResizeElement;
          this.el.classList.add("ui-resizable-autohide");
        }
        /** @internal */
        _setupHandlers() {
          let handlerDirection = this.option.handles || "e,s,se";
          if (handlerDirection === "all") {
            handlerDirection = "n,e,s,w,se,sw,ne,nw";
          }
          this.handlers = handlerDirection.split(",").map((dir) => dir.trim()).map((dir) => new dd_resizable_handle_1.DDResizableHandle(this.el, dir, {
            start: (event) => {
              this._resizeStart(event);
            },
            stop: (event) => {
              this._resizeStop(event);
            },
            move: (event) => {
              this._resizing(event, dir);
            }
          }));
          return this;
        }
        /** @internal */
        _resizeStart(event) {
          this.originalRect = this.el.getBoundingClientRect();
          this.scrollEl = utils_1.Utils.getScrollElement(this.el);
          this.scrollY = this.scrollEl.scrollTop;
          this.scrolled = 0;
          this.startEvent = event;
          this._setupHelper();
          this._applyChange();
          const ev = utils_1.Utils.initEvent(event, { type: "resizestart", target: this.el });
          if (this.option.start) {
            this.option.start(ev, this._ui());
          }
          this.el.classList.add("ui-resizable-resizing");
          this.triggerEvent("resizestart", ev);
          return this;
        }
        /** @internal */
        _resizing(event, dir) {
          this.scrolled = this.scrollEl.scrollTop - this.scrollY;
          this.temporalRect = this._getChange(event, dir);
          this._applyChange();
          const ev = utils_1.Utils.initEvent(event, { type: "resize", target: this.el });
          if (this.option.resize) {
            this.option.resize(ev, this._ui());
          }
          this.triggerEvent("resize", ev);
          return this;
        }
        /** @internal */
        _resizeStop(event) {
          const ev = utils_1.Utils.initEvent(event, { type: "resizestop", target: this.el });
          if (this.option.stop) {
            this.option.stop(ev);
          }
          this.el.classList.remove("ui-resizable-resizing");
          this.triggerEvent("resizestop", ev);
          this._cleanHelper();
          delete this.startEvent;
          delete this.originalRect;
          delete this.temporalRect;
          delete this.scrollY;
          delete this.scrolled;
          return this;
        }
        /** @internal */
        _setupHelper() {
          this.elOriginStyleVal = _DDResizable._originStyleProp.map((prop) => this.el.style[prop]);
          this.parentOriginStylePosition = this.el.parentElement.style.position;
          if (window.getComputedStyle(this.el.parentElement).position.match(/static/)) {
            this.el.parentElement.style.position = "relative";
          }
          this.el.style.position = "absolute";
          this.el.style.opacity = "0.8";
          return this;
        }
        /** @internal */
        _cleanHelper() {
          _DDResizable._originStyleProp.forEach((prop, i) => {
            this.el.style[prop] = this.elOriginStyleVal[i] || null;
          });
          this.el.parentElement.style.position = this.parentOriginStylePosition || null;
          return this;
        }
        /** @internal */
        _getChange(event, dir) {
          const oEvent = this.startEvent;
          const newRect = {
            width: this.originalRect.width,
            height: this.originalRect.height + this.scrolled,
            left: this.originalRect.left,
            top: this.originalRect.top - this.scrolled
          };
          const offsetX = event.clientX - oEvent.clientX;
          const offsetY = event.clientY - oEvent.clientY;
          if (dir.indexOf("e") > -1) {
            newRect.width += offsetX;
          } else if (dir.indexOf("w") > -1) {
            newRect.width -= offsetX;
            newRect.left += offsetX;
          }
          if (dir.indexOf("s") > -1) {
            newRect.height += offsetY;
          } else if (dir.indexOf("n") > -1) {
            newRect.height -= offsetY;
            newRect.top += offsetY;
          }
          const constrain = this._constrainSize(newRect.width, newRect.height);
          if (Math.round(newRect.width) !== Math.round(constrain.width)) {
            if (dir.indexOf("w") > -1) {
              newRect.left += newRect.width - constrain.width;
            }
            newRect.width = constrain.width;
          }
          if (Math.round(newRect.height) !== Math.round(constrain.height)) {
            if (dir.indexOf("n") > -1) {
              newRect.top += newRect.height - constrain.height;
            }
            newRect.height = constrain.height;
          }
          return newRect;
        }
        /** @internal constrain the size to the set min/max values */
        _constrainSize(oWidth, oHeight) {
          const maxWidth = this.option.maxWidth || Number.MAX_SAFE_INTEGER;
          const minWidth = this.option.minWidth || oWidth;
          const maxHeight = this.option.maxHeight || Number.MAX_SAFE_INTEGER;
          const minHeight = this.option.minHeight || oHeight;
          const width = Math.min(maxWidth, Math.max(minWidth, oWidth));
          const height = Math.min(maxHeight, Math.max(minHeight, oHeight));
          return { width, height };
        }
        /** @internal */
        _applyChange() {
          let containmentRect = { left: 0, top: 0, width: 0, height: 0 };
          if (this.el.style.position === "absolute") {
            const containmentEl = this.el.parentElement;
            const { left, top } = containmentEl.getBoundingClientRect();
            containmentRect = { left, top, width: 0, height: 0 };
          }
          if (!this.temporalRect)
            return this;
          Object.keys(this.temporalRect).forEach((key) => {
            const value = this.temporalRect[key];
            this.el.style[key] = value - containmentRect[key] + "px";
          });
          return this;
        }
        /** @internal */
        _removeHandlers() {
          this.handlers.forEach((handle) => handle.destroy());
          delete this.handlers;
          return this;
        }
      };
      exports.DDResizable = DDResizable;
      DDResizable._originStyleProp = ["width", "height", "position", "left", "top", "opacity", "zIndex"];
    }
  });

  // node_modules/gridstack/dist/dd-draggable.js
  var require_dd_draggable = __commonJS({
    "node_modules/gridstack/dist/dd-draggable.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.DDDraggable = void 0;
      var dd_manager_1 = require_dd_manager();
      var utils_1 = require_utils();
      var dd_base_impl_1 = require_dd_base_impl();
      var dd_touch_1 = require_dd_touch();
      var DDDraggable = class _DDDraggable extends dd_base_impl_1.DDBaseImplement {
        constructor(el, option = {}) {
          super();
          this.el = el;
          this.option = option;
          let handleName = option.handle.substring(1);
          this.dragEl = el.classList.contains(handleName) ? el : el.querySelector(option.handle) || el;
          this._mouseDown = this._mouseDown.bind(this);
          this._mouseMove = this._mouseMove.bind(this);
          this._mouseUp = this._mouseUp.bind(this);
          this.enable();
        }
        on(event, callback) {
          super.on(event, callback);
        }
        off(event) {
          super.off(event);
        }
        enable() {
          if (this.disabled === false)
            return;
          super.enable();
          this.dragEl.addEventListener("mousedown", this._mouseDown);
          if (dd_touch_1.isTouch) {
            this.dragEl.addEventListener("touchstart", dd_touch_1.touchstart);
            this.dragEl.addEventListener("pointerdown", dd_touch_1.pointerdown);
          }
          this.el.classList.remove("ui-draggable-disabled");
          this.el.classList.add("ui-draggable");
        }
        disable(forDestroy = false) {
          if (this.disabled === true)
            return;
          super.disable();
          this.dragEl.removeEventListener("mousedown", this._mouseDown);
          if (dd_touch_1.isTouch) {
            this.dragEl.removeEventListener("touchstart", dd_touch_1.touchstart);
            this.dragEl.removeEventListener("pointerdown", dd_touch_1.pointerdown);
          }
          this.el.classList.remove("ui-draggable");
          if (!forDestroy)
            this.el.classList.add("ui-draggable-disabled");
        }
        destroy() {
          if (this.dragTimeout)
            window.clearTimeout(this.dragTimeout);
          delete this.dragTimeout;
          if (this.dragging)
            this._mouseUp(this.mouseDownEvent);
          this.disable(true);
          delete this.el;
          delete this.helper;
          delete this.option;
          super.destroy();
        }
        updateOption(opts) {
          Object.keys(opts).forEach((key) => this.option[key] = opts[key]);
          return this;
        }
        /** @internal call when mouse goes down before a dragstart happens */
        _mouseDown(e) {
          if (dd_manager_1.DDManager.mouseHandled)
            return;
          if (e.button !== 0)
            return true;
          const skipMouseDown = ["input", "textarea", "button", "select", "option"];
          const name = e.target.nodeName.toLowerCase();
          if (skipMouseDown.find((skip) => skip === name))
            return true;
          if (e.target.closest('[contenteditable="true"]'))
            return true;
          this.mouseDownEvent = e;
          delete this.dragging;
          delete dd_manager_1.DDManager.dragElement;
          delete dd_manager_1.DDManager.dropElement;
          document.addEventListener("mousemove", this._mouseMove, true);
          document.addEventListener("mouseup", this._mouseUp, true);
          if (dd_touch_1.isTouch) {
            this.dragEl.addEventListener("touchmove", dd_touch_1.touchmove);
            this.dragEl.addEventListener("touchend", dd_touch_1.touchend);
          }
          e.preventDefault();
          if (document.activeElement)
            document.activeElement.blur();
          dd_manager_1.DDManager.mouseHandled = true;
          return true;
        }
        /** @internal method to call actual drag event */
        _callDrag(e) {
          if (!this.dragging)
            return;
          const ev = utils_1.Utils.initEvent(e, { target: this.el, type: "drag" });
          if (this.option.drag) {
            this.option.drag(ev, this.ui());
          }
          this.triggerEvent("drag", ev);
        }
        /** @internal called when the main page (after successful mousedown) receives a move event to drag the item around the screen */
        _mouseMove(e) {
          var _a;
          let s = this.mouseDownEvent;
          if (this.dragging) {
            this._dragFollow(e);
            if (dd_manager_1.DDManager.pauseDrag) {
              const pause = Number.isInteger(dd_manager_1.DDManager.pauseDrag) ? dd_manager_1.DDManager.pauseDrag : 100;
              if (this.dragTimeout)
                window.clearTimeout(this.dragTimeout);
              this.dragTimeout = window.setTimeout(() => this._callDrag(e), pause);
            } else {
              this._callDrag(e);
            }
          } else if (Math.abs(e.x - s.x) + Math.abs(e.y - s.y) > 3) {
            this.dragging = true;
            dd_manager_1.DDManager.dragElement = this;
            let grid = (_a = this.el.gridstackNode) === null || _a === void 0 ? void 0 : _a.grid;
            if (grid) {
              dd_manager_1.DDManager.dropElement = grid.el.ddElement.ddDroppable;
            } else {
              delete dd_manager_1.DDManager.dropElement;
            }
            this.helper = this._createHelper(e);
            this._setupHelperContainmentStyle();
            this.dragOffset = this._getDragOffset(e, this.el, this.helperContainment);
            const ev = utils_1.Utils.initEvent(e, { target: this.el, type: "dragstart" });
            this._setupHelperStyle(e);
            if (this.option.start) {
              this.option.start(ev, this.ui());
            }
            this.triggerEvent("dragstart", ev);
          }
          e.preventDefault();
          return true;
        }
        /** @internal call when the mouse gets released to drop the item at current location */
        _mouseUp(e) {
          var _a;
          document.removeEventListener("mousemove", this._mouseMove, true);
          document.removeEventListener("mouseup", this._mouseUp, true);
          if (dd_touch_1.isTouch) {
            this.dragEl.removeEventListener("touchmove", dd_touch_1.touchmove, true);
            this.dragEl.removeEventListener("touchend", dd_touch_1.touchend, true);
          }
          if (this.dragging) {
            delete this.dragging;
            if (((_a = dd_manager_1.DDManager.dropElement) === null || _a === void 0 ? void 0 : _a.el) === this.el.parentElement) {
              delete dd_manager_1.DDManager.dropElement;
            }
            this.helperContainment.style.position = this.parentOriginStylePosition || null;
            if (this.helper === this.el) {
              this._removeHelperStyle();
            } else {
              this.helper.remove();
            }
            const ev = utils_1.Utils.initEvent(e, { target: this.el, type: "dragstop" });
            if (this.option.stop) {
              this.option.stop(ev);
            }
            this.triggerEvent("dragstop", ev);
            if (dd_manager_1.DDManager.dropElement) {
              dd_manager_1.DDManager.dropElement.drop(e);
            }
          }
          delete this.helper;
          delete this.mouseDownEvent;
          delete dd_manager_1.DDManager.dragElement;
          delete dd_manager_1.DDManager.dropElement;
          delete dd_manager_1.DDManager.mouseHandled;
          e.preventDefault();
        }
        /** @internal create a clone copy (or user defined method) of the original drag item if set */
        _createHelper(event) {
          let helper = this.el;
          if (typeof this.option.helper === "function") {
            helper = this.option.helper(event);
          } else if (this.option.helper === "clone") {
            helper = utils_1.Utils.cloneNode(this.el);
          }
          if (!document.body.contains(helper)) {
            utils_1.Utils.appendTo(helper, this.option.appendTo === "parent" ? this.el.parentNode : this.option.appendTo);
          }
          if (helper === this.el) {
            this.dragElementOriginStyle = _DDDraggable.originStyleProp.map((prop) => this.el.style[prop]);
          }
          return helper;
        }
        /** @internal set the fix position of the dragged item */
        _setupHelperStyle(e) {
          this.helper.classList.add("ui-draggable-dragging");
          const style = this.helper.style;
          style.pointerEvents = "none";
          style["min-width"] = 0;
          style.width = this.dragOffset.width + "px";
          style.height = this.dragOffset.height + "px";
          style.willChange = "left, top";
          style.position = "fixed";
          this._dragFollow(e);
          style.transition = "none";
          setTimeout(() => {
            if (this.helper) {
              style.transition = null;
            }
          }, 0);
          return this;
        }
        /** @internal restore back the original style before dragging */
        _removeHelperStyle() {
          var _a;
          this.helper.classList.remove("ui-draggable-dragging");
          let node = (_a = this.helper) === null || _a === void 0 ? void 0 : _a.gridstackNode;
          if (!(node === null || node === void 0 ? void 0 : node._isAboutToRemove) && this.dragElementOriginStyle) {
            let helper = this.helper;
            let transition = this.dragElementOriginStyle["transition"] || null;
            helper.style.transition = this.dragElementOriginStyle["transition"] = "none";
            _DDDraggable.originStyleProp.forEach((prop) => helper.style[prop] = this.dragElementOriginStyle[prop] || null);
            setTimeout(() => helper.style.transition = transition, 50);
          }
          delete this.dragElementOriginStyle;
          return this;
        }
        /** @internal updates the top/left position to follow the mouse */
        _dragFollow(e) {
          let containmentRect = { left: 0, top: 0 };
          const style = this.helper.style;
          const offset = this.dragOffset;
          style.left = e.clientX + offset.offsetLeft - containmentRect.left + "px";
          style.top = e.clientY + offset.offsetTop - containmentRect.top + "px";
        }
        /** @internal */
        _setupHelperContainmentStyle() {
          this.helperContainment = this.helper.parentElement;
          if (this.helper.style.position !== "fixed") {
            this.parentOriginStylePosition = this.helperContainment.style.position;
            if (window.getComputedStyle(this.helperContainment).position.match(/static/)) {
              this.helperContainment.style.position = "relative";
            }
          }
          return this;
        }
        /** @internal */
        _getDragOffset(event, el, parent) {
          let xformOffsetX = 0;
          let xformOffsetY = 0;
          if (parent) {
            const testEl = document.createElement("div");
            utils_1.Utils.addElStyles(testEl, {
              opacity: "0",
              position: "fixed",
              top: "0px",
              left: "0px",
              width: "1px",
              height: "1px",
              zIndex: "-999999"
            });
            parent.appendChild(testEl);
            const testElPosition = testEl.getBoundingClientRect();
            parent.removeChild(testEl);
            xformOffsetX = testElPosition.left;
            xformOffsetY = testElPosition.top;
          }
          const targetOffset = el.getBoundingClientRect();
          return {
            left: targetOffset.left,
            top: targetOffset.top,
            offsetLeft: -event.clientX + targetOffset.left - xformOffsetX,
            offsetTop: -event.clientY + targetOffset.top - xformOffsetY,
            width: targetOffset.width,
            height: targetOffset.height
          };
        }
        /** @internal TODO: set to public as called by DDDroppable! */
        ui() {
          const containmentEl = this.el.parentElement;
          const containmentRect = containmentEl.getBoundingClientRect();
          const offset = this.helper.getBoundingClientRect();
          return {
            position: {
              top: offset.top - containmentRect.top,
              left: offset.left - containmentRect.left
            }
            /* not used by GridStack for now...
            helper: [this.helper], //The object arr representing the helper that's being dragged.
            offset: { top: offset.top, left: offset.left } // Current offset position of the helper as { top, left } object.
            */
          };
        }
      };
      exports.DDDraggable = DDDraggable;
      DDDraggable.originStyleProp = ["transition", "pointerEvents", "position", "left", "top", "minWidth", "willChange"];
    }
  });

  // node_modules/gridstack/dist/dd-droppable.js
  var require_dd_droppable = __commonJS({
    "node_modules/gridstack/dist/dd-droppable.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.DDDroppable = void 0;
      var dd_manager_1 = require_dd_manager();
      var dd_base_impl_1 = require_dd_base_impl();
      var utils_1 = require_utils();
      var dd_touch_1 = require_dd_touch();
      var DDDroppable = class extends dd_base_impl_1.DDBaseImplement {
        constructor(el, opts = {}) {
          super();
          this.el = el;
          this.option = opts;
          this._mouseEnter = this._mouseEnter.bind(this);
          this._mouseLeave = this._mouseLeave.bind(this);
          this.enable();
          this._setupAccept();
        }
        on(event, callback) {
          super.on(event, callback);
        }
        off(event) {
          super.off(event);
        }
        enable() {
          if (this.disabled === false)
            return;
          super.enable();
          this.el.classList.add("ui-droppable");
          this.el.classList.remove("ui-droppable-disabled");
          this.el.addEventListener("mouseenter", this._mouseEnter);
          this.el.addEventListener("mouseleave", this._mouseLeave);
          if (dd_touch_1.isTouch) {
            this.el.addEventListener("pointerenter", dd_touch_1.pointerenter);
            this.el.addEventListener("pointerleave", dd_touch_1.pointerleave);
          }
        }
        disable(forDestroy = false) {
          if (this.disabled === true)
            return;
          super.disable();
          this.el.classList.remove("ui-droppable");
          if (!forDestroy)
            this.el.classList.add("ui-droppable-disabled");
          this.el.removeEventListener("mouseenter", this._mouseEnter);
          this.el.removeEventListener("mouseleave", this._mouseLeave);
          if (dd_touch_1.isTouch) {
            this.el.removeEventListener("pointerenter", dd_touch_1.pointerenter);
            this.el.removeEventListener("pointerleave", dd_touch_1.pointerleave);
          }
        }
        destroy() {
          this.disable(true);
          this.el.classList.remove("ui-droppable");
          this.el.classList.remove("ui-droppable-disabled");
          super.destroy();
        }
        updateOption(opts) {
          Object.keys(opts).forEach((key) => this.option[key] = opts[key]);
          this._setupAccept();
          return this;
        }
        /** @internal called when the cursor enters our area - prepare for a possible drop and track leaving */
        _mouseEnter(e) {
          if (!dd_manager_1.DDManager.dragElement)
            return;
          if (!this._canDrop(dd_manager_1.DDManager.dragElement.el))
            return;
          e.preventDefault();
          e.stopPropagation();
          if (dd_manager_1.DDManager.dropElement && dd_manager_1.DDManager.dropElement !== this) {
            dd_manager_1.DDManager.dropElement._mouseLeave(e);
          }
          dd_manager_1.DDManager.dropElement = this;
          const ev = utils_1.Utils.initEvent(e, { target: this.el, type: "dropover" });
          if (this.option.over) {
            this.option.over(ev, this._ui(dd_manager_1.DDManager.dragElement));
          }
          this.triggerEvent("dropover", ev);
          this.el.classList.add("ui-droppable-over");
        }
        /** @internal called when the item is leaving our area, stop tracking if we had moving item */
        _mouseLeave(e) {
          var _a;
          if (!dd_manager_1.DDManager.dragElement || dd_manager_1.DDManager.dropElement !== this)
            return;
          e.preventDefault();
          e.stopPropagation();
          const ev = utils_1.Utils.initEvent(e, { target: this.el, type: "dropout" });
          if (this.option.out) {
            this.option.out(ev, this._ui(dd_manager_1.DDManager.dragElement));
          }
          this.triggerEvent("dropout", ev);
          if (dd_manager_1.DDManager.dropElement === this) {
            delete dd_manager_1.DDManager.dropElement;
            let parentDrop;
            let parent = this.el.parentElement;
            while (!parentDrop && parent) {
              parentDrop = (_a = parent.ddElement) === null || _a === void 0 ? void 0 : _a.ddDroppable;
              parent = parent.parentElement;
            }
            if (parentDrop) {
              parentDrop._mouseEnter(e);
            }
          }
        }
        /** item is being dropped on us - called by the drag mouseup handler - this calls the client drop event */
        drop(e) {
          e.preventDefault();
          const ev = utils_1.Utils.initEvent(e, { target: this.el, type: "drop" });
          if (this.option.drop) {
            this.option.drop(ev, this._ui(dd_manager_1.DDManager.dragElement));
          }
          this.triggerEvent("drop", ev);
        }
        /** @internal true if element matches the string/method accept option */
        _canDrop(el) {
          return el && (!this.accept || this.accept(el));
        }
        /** @internal */
        _setupAccept() {
          if (!this.option.accept)
            return this;
          if (typeof this.option.accept === "string") {
            this.accept = (el) => el.matches(this.option.accept);
          } else {
            this.accept = this.option.accept;
          }
          return this;
        }
        /** @internal */
        _ui(drag) {
          return Object.assign({ draggable: drag.el }, drag.ui());
        }
      };
      exports.DDDroppable = DDDroppable;
    }
  });

  // node_modules/gridstack/dist/dd-element.js
  var require_dd_element = __commonJS({
    "node_modules/gridstack/dist/dd-element.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.DDElement = void 0;
      var dd_resizable_1 = require_dd_resizable();
      var dd_draggable_1 = require_dd_draggable();
      var dd_droppable_1 = require_dd_droppable();
      var DDElement = class _DDElement {
        constructor(el) {
          this.el = el;
        }
        static init(el) {
          if (!el.ddElement) {
            el.ddElement = new _DDElement(el);
          }
          return el.ddElement;
        }
        on(eventName, callback) {
          if (this.ddDraggable && ["drag", "dragstart", "dragstop"].indexOf(eventName) > -1) {
            this.ddDraggable.on(eventName, callback);
          } else if (this.ddDroppable && ["drop", "dropover", "dropout"].indexOf(eventName) > -1) {
            this.ddDroppable.on(eventName, callback);
          } else if (this.ddResizable && ["resizestart", "resize", "resizestop"].indexOf(eventName) > -1) {
            this.ddResizable.on(eventName, callback);
          }
          return this;
        }
        off(eventName) {
          if (this.ddDraggable && ["drag", "dragstart", "dragstop"].indexOf(eventName) > -1) {
            this.ddDraggable.off(eventName);
          } else if (this.ddDroppable && ["drop", "dropover", "dropout"].indexOf(eventName) > -1) {
            this.ddDroppable.off(eventName);
          } else if (this.ddResizable && ["resizestart", "resize", "resizestop"].indexOf(eventName) > -1) {
            this.ddResizable.off(eventName);
          }
          return this;
        }
        setupDraggable(opts) {
          if (!this.ddDraggable) {
            this.ddDraggable = new dd_draggable_1.DDDraggable(this.el, opts);
          } else {
            this.ddDraggable.updateOption(opts);
          }
          return this;
        }
        cleanDraggable() {
          if (this.ddDraggable) {
            this.ddDraggable.destroy();
            delete this.ddDraggable;
          }
          return this;
        }
        setupResizable(opts) {
          if (!this.ddResizable) {
            this.ddResizable = new dd_resizable_1.DDResizable(this.el, opts);
          } else {
            this.ddResizable.updateOption(opts);
          }
          return this;
        }
        cleanResizable() {
          if (this.ddResizable) {
            this.ddResizable.destroy();
            delete this.ddResizable;
          }
          return this;
        }
        setupDroppable(opts) {
          if (!this.ddDroppable) {
            this.ddDroppable = new dd_droppable_1.DDDroppable(this.el, opts);
          } else {
            this.ddDroppable.updateOption(opts);
          }
          return this;
        }
        cleanDroppable() {
          if (this.ddDroppable) {
            this.ddDroppable.destroy();
            delete this.ddDroppable;
          }
          return this;
        }
      };
      exports.DDElement = DDElement;
    }
  });

  // node_modules/gridstack/dist/dd-gridstack.js
  var require_dd_gridstack = __commonJS({
    "node_modules/gridstack/dist/dd-gridstack.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.DDGridStack = void 0;
      var utils_1 = require_utils();
      var dd_manager_1 = require_dd_manager();
      var dd_element_1 = require_dd_element();
      var DDGridStack = class {
        resizable(el, opts, key, value) {
          this._getDDElements(el).forEach((dEl) => {
            if (opts === "disable" || opts === "enable") {
              dEl.ddResizable && dEl.ddResizable[opts]();
            } else if (opts === "destroy") {
              dEl.ddResizable && dEl.cleanResizable();
            } else if (opts === "option") {
              dEl.setupResizable({ [key]: value });
            } else {
              const grid = dEl.el.gridstackNode.grid;
              let handles = dEl.el.getAttribute("gs-resize-handles") ? dEl.el.getAttribute("gs-resize-handles") : grid.opts.resizable.handles;
              let autoHide = !grid.opts.alwaysShowResizeHandle;
              dEl.setupResizable(Object.assign(Object.assign(Object.assign({}, grid.opts.resizable), { handles, autoHide }), {
                start: opts.start,
                stop: opts.stop,
                resize: opts.resize
              }));
            }
          });
          return this;
        }
        draggable(el, opts, key, value) {
          this._getDDElements(el).forEach((dEl) => {
            if (opts === "disable" || opts === "enable") {
              dEl.ddDraggable && dEl.ddDraggable[opts]();
            } else if (opts === "destroy") {
              dEl.ddDraggable && dEl.cleanDraggable();
            } else if (opts === "option") {
              dEl.setupDraggable({ [key]: value });
            } else {
              const grid = dEl.el.gridstackNode.grid;
              dEl.setupDraggable(Object.assign(Object.assign({}, grid.opts.draggable), {
                // containment: (grid.parentGridItem && !grid.opts.dragOut) ? grid.el.parentElement : (grid.opts.draggable.containment || null),
                start: opts.start,
                stop: opts.stop,
                drag: opts.drag
              }));
            }
          });
          return this;
        }
        dragIn(el, opts) {
          this._getDDElements(el).forEach((dEl) => dEl.setupDraggable(opts));
          return this;
        }
        droppable(el, opts, key, value) {
          if (typeof opts.accept === "function" && !opts._accept) {
            opts._accept = opts.accept;
            opts.accept = (el2) => opts._accept(el2);
          }
          this._getDDElements(el).forEach((dEl) => {
            if (opts === "disable" || opts === "enable") {
              dEl.ddDroppable && dEl.ddDroppable[opts]();
            } else if (opts === "destroy") {
              if (dEl.ddDroppable) {
                dEl.cleanDroppable();
              }
            } else if (opts === "option") {
              dEl.setupDroppable({ [key]: value });
            } else {
              dEl.setupDroppable(opts);
            }
          });
          return this;
        }
        /** true if element is droppable */
        isDroppable(el) {
          return !!(el && el.ddElement && el.ddElement.ddDroppable && !el.ddElement.ddDroppable.disabled);
        }
        /** true if element is draggable */
        isDraggable(el) {
          return !!(el && el.ddElement && el.ddElement.ddDraggable && !el.ddElement.ddDraggable.disabled);
        }
        /** true if element is draggable */
        isResizable(el) {
          return !!(el && el.ddElement && el.ddElement.ddResizable && !el.ddElement.ddResizable.disabled);
        }
        on(el, name, callback) {
          this._getDDElements(el).forEach((dEl) => dEl.on(name, (event) => {
            callback(event, dd_manager_1.DDManager.dragElement ? dd_manager_1.DDManager.dragElement.el : event.target, dd_manager_1.DDManager.dragElement ? dd_manager_1.DDManager.dragElement.helper : null);
          }));
          return this;
        }
        off(el, name) {
          this._getDDElements(el).forEach((dEl) => dEl.off(name));
          return this;
        }
        /** @internal returns a list of DD elements, creating them on the fly by default */
        _getDDElements(els, create = true) {
          let hosts = utils_1.Utils.getElements(els);
          if (!hosts.length)
            return [];
          let list = hosts.map((e) => e.ddElement || (create ? dd_element_1.DDElement.init(e) : null));
          if (!create) {
            list.filter((d) => d);
          }
          return list;
        }
      };
      exports.DDGridStack = DDGridStack;
    }
  });

  // node_modules/gridstack/dist/gridstack.js
  var require_gridstack = __commonJS({
    "node_modules/gridstack/dist/gridstack.js"(exports) {
      "use strict";
      var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        Object.defineProperty(o, k2, { enumerable: true, get: function() {
          return m[k];
        } });
      } : function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        o[k2] = m[k];
      });
      var __exportStar = exports && exports.__exportStar || function(m, exports2) {
        for (var p in m)
          if (p !== "default" && !exports2.hasOwnProperty(p))
            __createBinding(exports2, m, p);
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.GridStack = void 0;
      var gridstack_engine_1 = require_gridstack_engine();
      var utils_1 = require_utils();
      var types_1 = require_types();
      var dd_gridstack_1 = require_dd_gridstack();
      var dd_touch_1 = require_dd_touch();
      var dd_manager_1 = require_dd_manager();
      var dd = new dd_gridstack_1.DDGridStack();
      __exportStar(require_types(), exports);
      __exportStar(require_utils(), exports);
      __exportStar(require_gridstack_engine(), exports);
      __exportStar(require_dd_gridstack(), exports);
      var GridStack2 = class _GridStack {
        /**
         * Construct a grid item from the given element and options
         * @param el
         * @param opts
         */
        constructor(el, opts = {}) {
          var _a, _b;
          this._gsEventHandler = {};
          this._extraDragRow = 0;
          this.el = el;
          opts = opts || {};
          if (!el.classList.contains("grid-stack")) {
            this.el.classList.add("grid-stack");
          }
          if (opts.row) {
            opts.minRow = opts.maxRow = opts.row;
            delete opts.row;
          }
          let rowAttr = utils_1.Utils.toNumber(el.getAttribute("gs-row"));
          if (opts.column === "auto") {
            delete opts.column;
          }
          let anyOpts = opts;
          if (anyOpts.minWidth !== void 0) {
            opts.oneColumnSize = opts.oneColumnSize || anyOpts.minWidth;
            delete anyOpts.minWidth;
          }
          if (opts.alwaysShowResizeHandle !== void 0) {
            opts._alwaysShowResizeHandle = opts.alwaysShowResizeHandle;
          }
          let defaults = Object.assign(Object.assign({}, utils_1.Utils.cloneDeep(types_1.gridDefaults)), { column: utils_1.Utils.toNumber(el.getAttribute("gs-column")) || types_1.gridDefaults.column, minRow: rowAttr ? rowAttr : utils_1.Utils.toNumber(el.getAttribute("gs-min-row")) || types_1.gridDefaults.minRow, maxRow: rowAttr ? rowAttr : utils_1.Utils.toNumber(el.getAttribute("gs-max-row")) || types_1.gridDefaults.maxRow, staticGrid: utils_1.Utils.toBool(el.getAttribute("gs-static")) || types_1.gridDefaults.staticGrid, draggable: {
            handle: (opts.handleClass ? "." + opts.handleClass : opts.handle ? opts.handle : "") || types_1.gridDefaults.draggable.handle
          }, removableOptions: {
            accept: opts.itemClass ? "." + opts.itemClass : types_1.gridDefaults.removableOptions.accept
          } });
          if (el.getAttribute("gs-animate")) {
            defaults.animate = utils_1.Utils.toBool(el.getAttribute("gs-animate"));
          }
          this.opts = utils_1.Utils.defaults(opts, defaults);
          opts = null;
          this._initMargin();
          if (this.opts.column !== 1 && !this.opts.disableOneColumnMode && this._widthOrContainer() <= this.opts.oneColumnSize) {
            this._prevColumn = this.getColumn();
            this.opts.column = 1;
          }
          if (this.opts.rtl === "auto") {
            this.opts.rtl = el.style.direction === "rtl";
          }
          if (this.opts.rtl) {
            this.el.classList.add("grid-stack-rtl");
          }
          let parentGridItem = (_a = utils_1.Utils.closestUpByClass(this.el, types_1.gridDefaults.itemClass)) === null || _a === void 0 ? void 0 : _a.gridstackNode;
          if (parentGridItem) {
            parentGridItem.subGrid = this;
            this.parentGridItem = parentGridItem;
            this.el.classList.add("grid-stack-nested");
            parentGridItem.el.classList.add("grid-stack-sub-grid");
          }
          this._isAutoCellHeight = this.opts.cellHeight === "auto";
          if (this._isAutoCellHeight || this.opts.cellHeight === "initial") {
            this.cellHeight(void 0, false);
          } else {
            if (typeof this.opts.cellHeight == "number" && this.opts.cellHeightUnit && this.opts.cellHeightUnit !== types_1.gridDefaults.cellHeightUnit) {
              this.opts.cellHeight = this.opts.cellHeight + this.opts.cellHeightUnit;
              delete this.opts.cellHeightUnit;
            }
            this.cellHeight(this.opts.cellHeight, false);
          }
          if (this.opts.alwaysShowResizeHandle === "mobile") {
            this.opts.alwaysShowResizeHandle = dd_touch_1.isTouch;
          }
          this._styleSheetClass = "grid-stack-instance-" + gridstack_engine_1.GridStackEngine._idSeq++;
          this.el.classList.add(this._styleSheetClass);
          this._setStaticClass();
          let engineClass = this.opts.engineClass || _GridStack.engineClass || gridstack_engine_1.GridStackEngine;
          this.engine = new engineClass({
            column: this.getColumn(),
            float: this.opts.float,
            maxRow: this.opts.maxRow,
            onChange: (cbNodes) => {
              let maxH = 0;
              this.engine.nodes.forEach((n) => {
                maxH = Math.max(maxH, n.y + n.h);
              });
              cbNodes.forEach((n) => {
                let el2 = n.el;
                if (!el2)
                  return;
                if (n._removeDOM) {
                  if (el2)
                    el2.remove();
                  delete n._removeDOM;
                } else {
                  this._writePosAttr(el2, n);
                }
              });
              this._updateStyles(false, maxH);
            }
          });
          if (this.opts.auto) {
            this.batchUpdate();
            this.getGridItems().forEach((el2) => this._prepareElement(el2));
            this.batchUpdate(false);
          }
          if (this.opts.children) {
            let children = this.opts.children;
            delete this.opts.children;
            if (children.length)
              this.load(children);
          }
          this.setAnimation(this.opts.animate);
          this._updateStyles();
          if (this.opts.column != 12) {
            this.el.classList.add("grid-stack-" + this.opts.column);
          }
          if (this.opts.dragIn)
            _GridStack.setupDragIn(this.opts.dragIn, this.opts.dragInOptions);
          delete this.opts.dragIn;
          delete this.opts.dragInOptions;
          if (this.opts.subGridDynamic && !dd_manager_1.DDManager.pauseDrag)
            dd_manager_1.DDManager.pauseDrag = true;
          if (((_b = this.opts.draggable) === null || _b === void 0 ? void 0 : _b.pause) !== void 0)
            dd_manager_1.DDManager.pauseDrag = this.opts.draggable.pause;
          this._setupRemoveDrop();
          this._setupAcceptWidget();
          this._updateWindowResizeEvent();
        }
        /**
         * initializing the HTML element, or selector string, into a grid will return the grid. Calling it again will
         * simply return the existing instance (ignore any passed options). There is also an initAll() version that support
         * multiple grids initialization at once. Or you can use addGrid() to create the entire grid from JSON.
         * @param options grid options (optional)
         * @param elOrString element or CSS selector (first one used) to convert to a grid (default to '.grid-stack' class selector)
         *
         * @example
         * let grid = GridStack.init();
         *
         * Note: the HTMLElement (of type GridHTMLElement) will store a `gridstack: GridStack` value that can be retrieve later
         * let grid = document.querySelector('.grid-stack').gridstack;
         */
        static init(options2 = {}, elOrString = ".grid-stack") {
          let el = _GridStack.getGridElement(elOrString);
          if (!el) {
            if (typeof elOrString === "string") {
              console.error('GridStack.initAll() no grid was found with selector "' + elOrString + '" - element missing or wrong selector ?\nNote: ".grid-stack" is required for proper CSS styling and drag/drop, and is the default selector.');
            } else {
              console.error("GridStack.init() no grid element was passed.");
            }
            return null;
          }
          if (!el.gridstack) {
            el.gridstack = new _GridStack(el, utils_1.Utils.cloneDeep(options2));
          }
          return el.gridstack;
        }
        /**
         * Will initialize a list of elements (given a selector) and return an array of grids.
         * @param options grid options (optional)
         * @param selector elements selector to convert to grids (default to '.grid-stack' class selector)
         *
         * @example
         * let grids = GridStack.initAll();
         * grids.forEach(...)
         */
        static initAll(options2 = {}, selector = ".grid-stack") {
          let grids2 = [];
          _GridStack.getGridElements(selector).forEach((el) => {
            if (!el.gridstack) {
              el.gridstack = new _GridStack(el, utils_1.Utils.cloneDeep(options2));
              delete options2.dragIn;
              delete options2.dragInOptions;
            }
            grids2.push(el.gridstack);
          });
          if (grids2.length === 0) {
            console.error('GridStack.initAll() no grid was found with selector "' + selector + '" - element missing or wrong selector ?\nNote: ".grid-stack" is required for proper CSS styling and drag/drop, and is the default selector.');
          }
          return grids2;
        }
        /**
         * call to create a grid with the given options, including loading any children from JSON structure. This will call GridStack.init(), then
         * grid.load() on any passed children (recursively). Great alternative to calling init() if you want entire grid to come from
         * JSON serialized data, including options.
         * @param parent HTML element parent to the grid
         * @param opt grids options used to initialize the grid, and list of children
         */
        static addGrid(parent, opt = {}) {
          if (!parent)
            return null;
          let el = parent;
          const parentIsGrid = parent.classList.contains("grid-stack");
          if (!parentIsGrid || opt.addRemoveCB) {
            if (opt.addRemoveCB) {
              el = opt.addRemoveCB(parent, opt, true, true);
            } else {
              let doc = document.implementation.createHTMLDocument("");
              doc.body.innerHTML = `<div class="grid-stack ${opt.class || ""}"></div>`;
              el = doc.body.children[0];
              parent.appendChild(el);
            }
          }
          let grid = _GridStack.init(opt, el);
          return grid;
        }
        /** call this method to register your engine instead of the default one.
         * See instead `GridStackOptions.engineClass` if you only need to
         * replace just one instance.
         */
        static registerEngine(engineClass) {
          _GridStack.engineClass = engineClass;
        }
        /** @internal create placeholder DIV as needed */
        get placeholder() {
          if (!this._placeholder) {
            let placeholderChild = document.createElement("div");
            placeholderChild.className = "placeholder-content";
            if (this.opts.placeholderText) {
              placeholderChild.innerHTML = this.opts.placeholderText;
            }
            this._placeholder = document.createElement("div");
            this._placeholder.classList.add(this.opts.placeholderClass, types_1.gridDefaults.itemClass, this.opts.itemClass);
            this.placeholder.appendChild(placeholderChild);
          }
          return this._placeholder;
        }
        /**
         * add a new widget and returns it.
         *
         * Widget will be always placed even if result height is more than actual grid height.
         * You need to use `willItFit()` before calling addWidget for additional check.
         * See also `makeWidget()`.
         *
         * @example
         * let grid = GridStack.init();
         * grid.addWidget({w: 3, content: 'hello'});
         * grid.addWidget('<div class="grid-stack-item"><div class="grid-stack-item-content">hello</div></div>', {w: 3});
         *
         * @param el  GridStackWidget (which can have content string as well), html element, or string definition to add
         * @param options widget position/size options (optional, and ignore if first param is already option) - see GridStackWidget
         */
        addWidget(els, options2) {
          function isGridStackWidget(w) {
            return w.el !== void 0 || w.x !== void 0 || w.y !== void 0 || w.w !== void 0 || w.h !== void 0 || w.content !== void 0 ? true : false;
          }
          let el;
          let node;
          if (typeof els === "string") {
            let doc = document.implementation.createHTMLDocument("");
            doc.body.innerHTML = els;
            el = doc.body.children[0];
          } else if (arguments.length === 0 || arguments.length === 1 && isGridStackWidget(els)) {
            node = options2 = els;
            if (node === null || node === void 0 ? void 0 : node.el) {
              el = node.el;
            } else if (this.opts.addRemoveCB) {
              el = this.opts.addRemoveCB(this.el, options2, true, false);
            } else {
              let content = (options2 === null || options2 === void 0 ? void 0 : options2.content) || "";
              let doc = document.implementation.createHTMLDocument("");
              doc.body.innerHTML = `<div class="grid-stack-item ${this.opts.itemClass || ""}"><div class="grid-stack-item-content">${content}</div></div>`;
              el = doc.body.children[0];
            }
          } else {
            el = els;
          }
          if (!el)
            return;
          let domAttr = this._readAttr(el);
          options2 = utils_1.Utils.cloneDeep(options2) || {};
          utils_1.Utils.defaults(options2, domAttr);
          node = this.engine.prepareNode(options2);
          this._writeAttr(el, options2);
          if (this._insertNotAppend) {
            this.el.prepend(el);
          } else {
            this.el.appendChild(el);
          }
          this._prepareElement(el, true, options2);
          this._updateContainerHeight();
          if (node.subGrid) {
            this.makeSubGrid(node.el, void 0, void 0, false);
          }
          if (this._prevColumn && this.opts.column === 1) {
            this._ignoreLayoutsNodeChange = true;
          }
          this._triggerAddEvent();
          this._triggerChangeEvent();
          delete this._ignoreLayoutsNodeChange;
          return el;
        }
        /**
         * Convert an existing gridItem element into a sub-grid with the given (optional) options, else inherit them
         * from the parent's subGrid options.
         * @param el gridItem element to convert
         * @param ops (optional) sub-grid options, else default to node, then parent settings, else defaults
         * @param nodeToAdd (optional) node to add to the newly created sub grid (used when dragging over existing regular item)
         * @returns newly created grid
         */
        makeSubGrid(el, ops, nodeToAdd, saveContent = true) {
          var _a, _b, _c;
          let node = el.gridstackNode;
          if (!node) {
            node = this.makeWidget(el).gridstackNode;
          }
          if ((_a = node.subGrid) === null || _a === void 0 ? void 0 : _a.el)
            return node.subGrid;
          let subGridTemplate;
          let grid = this;
          while (grid && !subGridTemplate) {
            subGridTemplate = (_b = grid.opts) === null || _b === void 0 ? void 0 : _b.subGrid;
            grid = (_c = grid.parentGridItem) === null || _c === void 0 ? void 0 : _c.grid;
          }
          ops = utils_1.Utils.cloneDeep(Object.assign(Object.assign(Object.assign({}, subGridTemplate || {}), { children: void 0 }), ops || node.subGrid));
          node.subGrid = ops;
          let autoColumn;
          if (ops.column === "auto") {
            autoColumn = true;
            ops.column = Math.max(node.w || 1, (nodeToAdd === null || nodeToAdd === void 0 ? void 0 : nodeToAdd.w) || 1);
            ops.disableOneColumnMode = true;
          }
          let content = node.el.querySelector(".grid-stack-item-content");
          let newItem;
          let newItemOpt;
          if (saveContent) {
            this._removeDD(node.el);
            newItemOpt = Object.assign(Object.assign({}, node), { x: 0, y: 0 });
            utils_1.Utils.removeInternalForSave(newItemOpt);
            delete newItemOpt.subGrid;
            if (node.content) {
              newItemOpt.content = node.content;
              delete node.content;
            }
            if (this.opts.addRemoveCB) {
              newItem = this.opts.addRemoveCB(this.el, newItemOpt, true, false);
            } else {
              let doc = document.implementation.createHTMLDocument("");
              doc.body.innerHTML = `<div class="grid-stack-item"></div>`;
              newItem = doc.body.children[0];
              newItem.appendChild(content);
              doc.body.innerHTML = `<div class="grid-stack-item-content"></div>`;
              content = doc.body.children[0];
              node.el.appendChild(content);
            }
            this._prepareDragDropByNode(node);
          }
          if (nodeToAdd) {
            let w = autoColumn ? ops.column : node.w;
            let h = node.h + nodeToAdd.h;
            let style = node.el.style;
            style.transition = "none";
            this.update(node.el, { w, h });
            setTimeout(() => style.transition = null);
          }
          if (this.opts.addRemoveCB) {
            ops.addRemoveCB = ops.addRemoveCB || this.opts.addRemoveCB;
          }
          let subGrid = node.subGrid = _GridStack.addGrid(content, ops);
          if (nodeToAdd === null || nodeToAdd === void 0 ? void 0 : nodeToAdd._moving)
            subGrid._isTemp = true;
          if (autoColumn)
            subGrid._autoColumn = true;
          if (saveContent) {
            subGrid.addWidget(newItem, newItemOpt);
          }
          if (nodeToAdd) {
            if (nodeToAdd._moving) {
              window.setTimeout(() => utils_1.Utils.simulateMouseEvent(nodeToAdd._event, "mouseenter", subGrid.el), 0);
            } else {
              subGrid.addWidget(node.el, node);
            }
          }
          return subGrid;
        }
        /**
         * called when an item was converted into a nested grid to accommodate a dragged over item, but then item leaves - return back
         * to the original grid-item. Also called to remove empty sub-grids when last item is dragged out (since re-creating is simple)
         */
        removeAsSubGrid(nodeThatRemoved) {
          var _a;
          let pGrid = (_a = this.parentGridItem) === null || _a === void 0 ? void 0 : _a.grid;
          if (!pGrid)
            return;
          pGrid.batchUpdate();
          pGrid.removeWidget(this.parentGridItem.el, true, true);
          this.engine.nodes.forEach((n) => {
            n.x += this.parentGridItem.x;
            n.y += this.parentGridItem.y;
            pGrid.addWidget(n.el, n);
          });
          pGrid.batchUpdate(false);
          if (this.parentGridItem)
            delete this.parentGridItem.subGrid;
          delete this.parentGridItem;
          if (nodeThatRemoved) {
            window.setTimeout(() => utils_1.Utils.simulateMouseEvent(nodeThatRemoved._event, "mouseenter", pGrid.el), 0);
          }
        }
        /**
        /**
         * saves the current layout returning a list of widgets for serialization which might include any nested grids.
         * @param saveContent if true (default) the latest html inside .grid-stack-content will be saved to GridStackWidget.content field, else it will
         * be removed.
         * @param saveGridOpt if true (default false), save the grid options itself, so you can call the new GridStack.addGrid()
         * to recreate everything from scratch. GridStackOptions.children would then contain the widget list instead.
         * @returns list of widgets or full grid option, including .children list of widgets
         */
        save(saveContent = true, saveGridOpt = false) {
          let list = this.engine.save(saveContent);
          list.forEach((n) => {
            var _a;
            if (saveContent && n.el && !n.subGrid) {
              let sub = n.el.querySelector(".grid-stack-item-content");
              n.content = sub ? sub.innerHTML : void 0;
              if (!n.content)
                delete n.content;
            } else {
              if (!saveContent) {
                delete n.content;
              }
              if ((_a = n.subGrid) === null || _a === void 0 ? void 0 : _a.el) {
                const listOrOpt = n.subGrid.save(saveContent, saveGridOpt);
                n.subGrid = saveGridOpt ? listOrOpt : { children: listOrOpt };
              }
            }
            delete n.el;
          });
          if (saveGridOpt) {
            let o = utils_1.Utils.cloneDeep(this.opts);
            if (o.marginBottom === o.marginTop && o.marginRight === o.marginLeft && o.marginTop === o.marginRight) {
              o.margin = o.marginTop;
              delete o.marginTop;
              delete o.marginRight;
              delete o.marginBottom;
              delete o.marginLeft;
            }
            if (o.rtl === (this.el.style.direction === "rtl")) {
              o.rtl = "auto";
            }
            if (this._isAutoCellHeight) {
              o.cellHeight = "auto";
            }
            if (this._autoColumn) {
              o.column = "auto";
              delete o.disableOneColumnMode;
            }
            const origShow = o._alwaysShowResizeHandle;
            delete o._alwaysShowResizeHandle;
            if (origShow !== void 0) {
              o.alwaysShowResizeHandle = origShow;
            } else {
              delete o.alwaysShowResizeHandle;
            }
            utils_1.Utils.removeInternalAndSame(o, types_1.gridDefaults);
            o.children = list;
            return o;
          }
          return list;
        }
        /**
         * load the widgets from a list. This will call update() on each (matching by id) or add/remove widgets that are not there.
         *
         * @param layout list of widgets definition to update/create
         * @param addAndRemove boolean (default true) or callback method can be passed to control if and how missing widgets can be added/removed, giving
         * the user control of insertion.
         *
         * @example
         * see http://gridstackjs.com/demo/serialization.html
         **/
        load(layout, addRemove = this.opts.addRemoveCB || true) {
          let items = _GridStack.Utils.sort([...layout], -1, this._prevColumn || this.getColumn());
          this._insertNotAppend = true;
          if (this._prevColumn && this._prevColumn !== this.opts.column && items.some((n) => n.x + n.w > this.opts.column)) {
            this._ignoreLayoutsNodeChange = true;
            this.engine.cacheLayout(items, this._prevColumn, true);
          }
          const prevCB = this.opts.addRemoveCB;
          if (typeof addRemove === "function")
            this.opts.addRemoveCB = addRemove;
          let removed = [];
          this.batchUpdate();
          if (addRemove) {
            let copyNodes = [...this.engine.nodes];
            copyNodes.forEach((n) => {
              let item = items.find((w) => n.id === w.id);
              if (!item) {
                if (this.opts.addRemoveCB)
                  this.opts.addRemoveCB(this.el, n, false, false);
                removed.push(n);
                this.removeWidget(n.el, true, false);
              }
            });
          }
          items.forEach((w) => {
            let item = w.id || w.id === 0 ? this.engine.nodes.find((n) => n.id === w.id) : void 0;
            if (item) {
              this.update(item.el, w);
              if (w.subGrid && w.subGrid.children) {
                let sub = item.el.querySelector(".grid-stack");
                if (sub && sub.gridstack) {
                  sub.gridstack.load(w.subGrid.children);
                  this._insertNotAppend = true;
                }
              }
            } else if (addRemove) {
              this.addWidget(w);
            }
          });
          this.engine.removedNodes = removed;
          this.batchUpdate(false);
          delete this._ignoreLayoutsNodeChange;
          delete this._insertNotAppend;
          prevCB ? this.opts.addRemoveCB = prevCB : delete this.opts.addRemoveCB;
          return this;
        }
        /**
         * use before calling a bunch of `addWidget()` to prevent un-necessary relayouts in between (more efficient)
         * and get a single event callback. You will see no changes until `batchUpdate(false)` is called.
         */
        batchUpdate(flag = true) {
          this.engine.batchUpdate(flag);
          if (!flag) {
            this._triggerRemoveEvent();
            this._triggerAddEvent();
            this._triggerChangeEvent();
          }
          return this;
        }
        /**
         * Gets current cell height.
         */
        getCellHeight(forcePixel = false) {
          if (this.opts.cellHeight && this.opts.cellHeight !== "auto" && (!forcePixel || !this.opts.cellHeightUnit || this.opts.cellHeightUnit === "px")) {
            return this.opts.cellHeight;
          }
          let el = this.el.querySelector("." + this.opts.itemClass);
          if (el) {
            let height = utils_1.Utils.toNumber(el.getAttribute("gs-h"));
            return Math.round(el.offsetHeight / height);
          }
          let rows = parseInt(this.el.getAttribute("gs-current-row"));
          return rows ? Math.round(this.el.getBoundingClientRect().height / rows) : this.opts.cellHeight;
        }
        /**
         * Update current cell height - see `GridStackOptions.cellHeight` for format.
         * This method rebuilds an internal CSS style sheet.
         * Note: You can expect performance issues if call this method too often.
         *
         * @param val the cell height. If not passed (undefined), cells content will be made square (match width minus margin),
         * if pass 0 the CSS will be generated by the application instead.
         * @param update (Optional) if false, styles will not be updated
         *
         * @example
         * grid.cellHeight(100); // same as 100px
         * grid.cellHeight('70px');
         * grid.cellHeight(grid.cellWidth() * 1.2);
         */
        cellHeight(val, update = true) {
          if (update && val !== void 0) {
            if (this._isAutoCellHeight !== (val === "auto")) {
              this._isAutoCellHeight = val === "auto";
              this._updateWindowResizeEvent();
            }
          }
          if (val === "initial" || val === "auto") {
            val = void 0;
          }
          if (val === void 0) {
            let marginDiff = -this.opts.marginRight - this.opts.marginLeft + this.opts.marginTop + this.opts.marginBottom;
            val = this.cellWidth() + marginDiff;
          }
          let data = utils_1.Utils.parseHeight(val);
          if (this.opts.cellHeightUnit === data.unit && this.opts.cellHeight === data.h) {
            return this;
          }
          this.opts.cellHeightUnit = data.unit;
          this.opts.cellHeight = data.h;
          if (update) {
            this._updateStyles(true);
          }
          return this;
        }
        /** Gets current cell width. */
        cellWidth() {
          return this._widthOrContainer() / this.getColumn();
        }
        /** return our expected width (or parent) for 1 column check */
        _widthOrContainer() {
          return this.el.clientWidth || this.el.parentElement.clientWidth || window.innerWidth;
        }
        /** re-layout grid items to reclaim any empty space */
        compact() {
          this.engine.compact();
          this._triggerChangeEvent();
          return this;
        }
        /**
         * set the number of columns in the grid. Will update existing widgets to conform to new number of columns,
         * as well as cache the original layout so you can revert back to previous positions without loss.
         * Requires `gridstack-extra.css` or `gridstack-extra.min.css` for [2-11],
         * else you will need to generate correct CSS (see https://github.com/gridstack/gridstack.js#change-grid-columns)
         * @param column - Integer > 0 (default 12).
         * @param layout specify the type of re-layout that will happen (position, size, etc...).
         * Note: items will never be outside of the current column boundaries. default (moveScale). Ignored for 1 column
         */
        column(column, layout = "moveScale") {
          if (column < 1 || this.opts.column === column)
            return this;
          let oldColumn = this.getColumn();
          if (column === 1) {
            this._prevColumn = oldColumn;
          } else {
            delete this._prevColumn;
          }
          this.el.classList.remove("grid-stack-" + oldColumn);
          this.el.classList.add("grid-stack-" + column);
          this.opts.column = this.engine.column = column;
          let domNodes;
          if (column === 1 && this.opts.oneColumnModeDomSort) {
            domNodes = [];
            this.getGridItems().forEach((el) => {
              if (el.gridstackNode) {
                domNodes.push(el.gridstackNode);
              }
            });
            if (!domNodes.length) {
              domNodes = void 0;
            }
          }
          this.engine.updateNodeWidths(oldColumn, column, domNodes, layout);
          if (this._isAutoCellHeight)
            this.cellHeight();
          this._ignoreLayoutsNodeChange = true;
          this._triggerChangeEvent();
          delete this._ignoreLayoutsNodeChange;
          return this;
        }
        /**
         * get the number of columns in the grid (default 12)
         */
        getColumn() {
          return this.opts.column;
        }
        /** returns an array of grid HTML elements (no placeholder) - used to iterate through our children in DOM order */
        getGridItems() {
          return Array.from(this.el.children).filter((el) => el.matches("." + this.opts.itemClass) && !el.matches("." + this.opts.placeholderClass));
        }
        /**
         * Destroys a grid instance. DO NOT CALL any methods or access any vars after this as it will free up members.
         * @param removeDOM if `false` grid and items HTML elements will not be removed from the DOM (Optional. Default `true`).
         */
        destroy(removeDOM = true) {
          if (!this.el)
            return;
          this._updateWindowResizeEvent(true);
          this.setStatic(true, false);
          this.setAnimation(false);
          if (!removeDOM) {
            this.removeAll(removeDOM);
            this.el.classList.remove(this._styleSheetClass);
          } else {
            this.el.parentNode.removeChild(this.el);
          }
          this._removeStylesheet();
          this.el.removeAttribute("gs-current-row");
          if (this.parentGridItem)
            delete this.parentGridItem.subGrid;
          delete this.parentGridItem;
          delete this.opts;
          delete this._placeholder;
          delete this.engine;
          delete this.el.gridstack;
          delete this.el;
          return this;
        }
        /**
         * enable/disable floating widgets (default: `false`) See [example](http://gridstackjs.com/demo/float.html)
         */
        float(val) {
          if (this.opts.float !== val) {
            this.opts.float = this.engine.float = val;
            this._triggerChangeEvent();
          }
          return this;
        }
        /**
         * get the current float mode
         */
        getFloat() {
          return this.engine.float;
        }
        /**
         * Get the position of the cell under a pixel on screen.
         * @param position the position of the pixel to resolve in
         * absolute coordinates, as an object with top and left properties
         * @param useDocRelative if true, value will be based on document position vs parent position (Optional. Default false).
         * Useful when grid is within `position: relative` element
         *
         * Returns an object with properties `x` and `y` i.e. the column and row in the grid.
         */
        getCellFromPixel(position, useDocRelative = false) {
          let box = this.el.getBoundingClientRect();
          let containerPos;
          if (useDocRelative) {
            containerPos = { top: box.top + document.documentElement.scrollTop, left: box.left };
          } else {
            containerPos = { top: this.el.offsetTop, left: this.el.offsetLeft };
          }
          let relativeLeft = position.left - containerPos.left;
          let relativeTop = position.top - containerPos.top;
          let columnWidth = box.width / this.getColumn();
          let rowHeight = box.height / parseInt(this.el.getAttribute("gs-current-row"));
          return { x: Math.floor(relativeLeft / columnWidth), y: Math.floor(relativeTop / rowHeight) };
        }
        /** returns the current number of rows, which will be at least `minRow` if set */
        getRow() {
          return Math.max(this.engine.getRow(), this.opts.minRow);
        }
        /**
         * Checks if specified area is empty.
         * @param x the position x.
         * @param y the position y.
         * @param w the width of to check
         * @param h the height of to check
         */
        isAreaEmpty(x, y, w, h) {
          return this.engine.isAreaEmpty(x, y, w, h);
        }
        /**
         * If you add elements to your grid by hand, you have to tell gridstack afterwards to make them widgets.
         * If you want gridstack to add the elements for you, use `addWidget()` instead.
         * Makes the given element a widget and returns it.
         * @param els widget or single selector to convert.
         *
         * @example
         * let grid = GridStack.init();
         * grid.el.appendChild('<div id="gsi-1" gs-w="3"></div>');
         * grid.makeWidget('#gsi-1');
         */
        makeWidget(els) {
          let el = _GridStack.getElement(els);
          this._prepareElement(el, true);
          this._updateContainerHeight();
          this._triggerAddEvent();
          this._triggerChangeEvent();
          return el;
        }
        /**
         * Event handler that extracts our CustomEvent data out automatically for receiving custom
         * notifications (see doc for supported events)
         * @param name of the event (see possible values) or list of names space separated
         * @param callback function called with event and optional second/third param
         * (see README documentation for each signature).
         *
         * @example
         * grid.on('added', function(e, items) { log('added ', items)} );
         * or
         * grid.on('added removed change', function(e, items) { log(e.type, items)} );
         *
         * Note: in some cases it is the same as calling native handler and parsing the event.
         * grid.el.addEventListener('added', function(event) { log('added ', event.detail)} );
         *
         */
        on(name, callback) {
          if (name.indexOf(" ") !== -1) {
            let names2 = name.split(" ");
            names2.forEach((name2) => this.on(name2, callback));
            return this;
          }
          if (name === "change" || name === "added" || name === "removed" || name === "enable" || name === "disable") {
            let noData = name === "enable" || name === "disable";
            if (noData) {
              this._gsEventHandler[name] = (event) => callback(event);
            } else {
              this._gsEventHandler[name] = (event) => callback(event, event.detail);
            }
            this.el.addEventListener(name, this._gsEventHandler[name]);
          } else if (name === "drag" || name === "dragstart" || name === "dragstop" || name === "resizestart" || name === "resize" || name === "resizestop" || name === "dropped") {
            this._gsEventHandler[name] = callback;
          } else {
            console.log("GridStack.on(" + name + ') event not supported, but you can still use $(".grid-stack").on(...) while jquery-ui is still used internally.');
          }
          return this;
        }
        /**
         * unsubscribe from the 'on' event below
         * @param name of the event (see possible values)
         */
        off(name) {
          if (name.indexOf(" ") !== -1) {
            let names2 = name.split(" ");
            names2.forEach((name2) => this.off(name2));
            return this;
          }
          if (name === "change" || name === "added" || name === "removed" || name === "enable" || name === "disable") {
            if (this._gsEventHandler[name]) {
              this.el.removeEventListener(name, this._gsEventHandler[name]);
            }
          }
          delete this._gsEventHandler[name];
          return this;
        }
        /**
         * Removes widget from the grid.
         * @param el  widget or selector to modify
         * @param removeDOM if `false` DOM element won't be removed from the tree (Default? true).
         * @param triggerEvent if `false` (quiet mode) element will not be added to removed list and no 'removed' callbacks will be called (Default? true).
         */
        removeWidget(els, removeDOM = true, triggerEvent = true) {
          _GridStack.getElements(els).forEach((el) => {
            if (el.parentElement && el.parentElement !== this.el)
              return;
            let node = el.gridstackNode;
            if (!node) {
              node = this.engine.nodes.find((n) => el === n.el);
            }
            if (!node)
              return;
            delete el.gridstackNode;
            this._removeDD(el);
            this.engine.removeNode(node, removeDOM, triggerEvent);
            if (removeDOM && el.parentElement) {
              el.remove();
            }
          });
          if (triggerEvent) {
            this._triggerRemoveEvent();
            this._triggerChangeEvent();
          }
          return this;
        }
        /**
         * Removes all widgets from the grid.
         * @param removeDOM if `false` DOM elements won't be removed from the tree (Default? `true`).
         */
        removeAll(removeDOM = true) {
          this.engine.nodes.forEach((n) => {
            delete n.el.gridstackNode;
            this._removeDD(n.el);
          });
          this.engine.removeAll(removeDOM);
          this._triggerRemoveEvent();
          return this;
        }
        /**
         * Toggle the grid animation state.  Toggles the `grid-stack-animate` class.
         * @param doAnimate if true the grid will animate.
         */
        setAnimation(doAnimate) {
          if (doAnimate) {
            this.el.classList.add("grid-stack-animate");
          } else {
            this.el.classList.remove("grid-stack-animate");
          }
          return this;
        }
        /**
         * Toggle the grid static state, which permanently removes/add Drag&Drop support, unlike disable()/enable() that just turns it off/on.
         * Also toggle the grid-stack-static class.
         * @param val if true the grid become static.
         * @param updateClass true (default) if css class gets updated
         * @param recurse true (default) if sub-grids also get updated
         */
        setStatic(val, updateClass = true, recurse = true) {
          if (this.opts.staticGrid === val)
            return this;
          this.opts.staticGrid = val;
          this._setupRemoveDrop();
          this._setupAcceptWidget();
          this.engine.nodes.forEach((n) => {
            this._prepareDragDropByNode(n);
            if (n.subGrid && recurse)
              n.subGrid.setStatic(val, updateClass, recurse);
          });
          if (updateClass) {
            this._setStaticClass();
          }
          return this;
        }
        /**
         * Updates widget position/size and other info. Note: if you need to call this on all nodes, use load() instead which will update what changed.
         * @param els  widget or selector of objects to modify (note: setting the same x,y for multiple items will be indeterministic and likely unwanted)
         * @param opt new widget options (x,y,w,h, etc..). Only those set will be updated.
         */
        update(els, opt) {
          if (arguments.length > 2) {
            console.warn("gridstack.ts: `update(el, x, y, w, h)` is deprecated. Use `update(el, {x, w, content, ...})`. It will be removed soon");
            let a = arguments, i = 1;
            opt = { x: a[i++], y: a[i++], w: a[i++], h: a[i++] };
            return this.update(els, opt);
          }
          _GridStack.getElements(els).forEach((el) => {
            if (!el || !el.gridstackNode)
              return;
            let n = el.gridstackNode;
            let w = utils_1.Utils.cloneDeep(opt);
            delete w.autoPosition;
            let keys = ["x", "y", "w", "h"];
            let m;
            if (keys.some((k) => w[k] !== void 0 && w[k] !== n[k])) {
              m = {};
              keys.forEach((k) => {
                m[k] = w[k] !== void 0 ? w[k] : n[k];
                delete w[k];
              });
            }
            if (!m && (w.minW || w.minH || w.maxW || w.maxH)) {
              m = {};
            }
            if (w.content) {
              let sub = el.querySelector(".grid-stack-item-content");
              if (sub && sub.innerHTML !== w.content) {
                sub.innerHTML = w.content;
              }
              delete w.content;
            }
            let changed = false;
            let ddChanged = false;
            for (const key in w) {
              if (key[0] !== "_" && n[key] !== w[key]) {
                n[key] = w[key];
                changed = true;
                ddChanged = ddChanged || !this.opts.staticGrid && (key === "noResize" || key === "noMove" || key === "locked");
              }
            }
            if (m) {
              this.engine.cleanNodes().beginUpdate(n).moveNode(n, m);
              this._updateContainerHeight();
              this._triggerChangeEvent();
              this.engine.endUpdate();
            }
            if (changed) {
              this._writeAttr(el, n);
            }
            if (ddChanged) {
              this._prepareDragDropByNode(n);
            }
          });
          return this;
        }
        /**
         * Updates the margins which will set all 4 sides at once - see `GridStackOptions.margin` for format options (CSS string format of 1,2,4 values or single number).
         * @param value margin value
         */
        margin(value) {
          let isMultiValue = typeof value === "string" && value.split(" ").length > 1;
          if (!isMultiValue) {
            let data = utils_1.Utils.parseHeight(value);
            if (this.opts.marginUnit === data.unit && this.opts.margin === data.h)
              return;
          }
          this.opts.margin = value;
          this.opts.marginTop = this.opts.marginBottom = this.opts.marginLeft = this.opts.marginRight = void 0;
          this._initMargin();
          this._updateStyles(true);
          return this;
        }
        /** returns current margin number value (undefined if 4 sides don't match) */
        getMargin() {
          return this.opts.margin;
        }
        /**
         * Returns true if the height of the grid will be less than the vertical
         * constraint. Always returns true if grid doesn't have height constraint.
         * @param node contains x,y,w,h,auto-position options
         *
         * @example
         * if (grid.willItFit(newWidget)) {
         *   grid.addWidget(newWidget);
         * } else {
         *   alert('Not enough free space to place the widget');
         * }
         */
        willItFit(node) {
          if (arguments.length > 1) {
            console.warn("gridstack.ts: `willItFit(x,y,w,h,autoPosition)` is deprecated. Use `willItFit({x, y,...})`. It will be removed soon");
            let a = arguments, i = 0, w = { x: a[i++], y: a[i++], w: a[i++], h: a[i++], autoPosition: a[i++] };
            return this.willItFit(w);
          }
          return this.engine.willItFit(node);
        }
        /** @internal */
        _triggerChangeEvent() {
          if (this.engine.batchMode)
            return this;
          let elements = this.engine.getDirtyNodes(true);
          if (elements && elements.length) {
            if (!this._ignoreLayoutsNodeChange) {
              this.engine.layoutsNodesChange(elements);
            }
            this._triggerEvent("change", elements);
          }
          this.engine.saveInitial();
          return this;
        }
        /** @internal */
        _triggerAddEvent() {
          if (this.engine.batchMode)
            return this;
          if (this.engine.addedNodes && this.engine.addedNodes.length > 0) {
            if (!this._ignoreLayoutsNodeChange) {
              this.engine.layoutsNodesChange(this.engine.addedNodes);
            }
            this.engine.addedNodes.forEach((n) => {
              delete n._dirty;
            });
            this._triggerEvent("added", this.engine.addedNodes);
            this.engine.addedNodes = [];
          }
          return this;
        }
        /** @internal */
        _triggerRemoveEvent() {
          if (this.engine.batchMode)
            return this;
          if (this.engine.removedNodes && this.engine.removedNodes.length > 0) {
            this._triggerEvent("removed", this.engine.removedNodes);
            this.engine.removedNodes = [];
          }
          return this;
        }
        /** @internal */
        _triggerEvent(type, data) {
          let event = data ? new CustomEvent(type, { bubbles: false, detail: data }) : new Event(type);
          this.el.dispatchEvent(event);
          return this;
        }
        /** @internal called to delete the current dynamic style sheet used for our layout */
        _removeStylesheet() {
          if (this._styles) {
            utils_1.Utils.removeStylesheet(this._styleSheetClass);
            delete this._styles;
          }
          return this;
        }
        /** @internal updated/create the CSS styles for row based layout and initial margin setting */
        _updateStyles(forceUpdate = false, maxH) {
          if (forceUpdate) {
            this._removeStylesheet();
          }
          if (!maxH)
            maxH = this.getRow();
          this._updateContainerHeight();
          if (this.opts.cellHeight === 0) {
            return this;
          }
          let cellHeight = this.opts.cellHeight;
          let cellHeightUnit = this.opts.cellHeightUnit;
          let prefix = `.${this._styleSheetClass} > .${this.opts.itemClass}`;
          if (!this._styles) {
            let styleLocation = this.opts.styleInHead ? void 0 : this.el.parentNode;
            this._styles = utils_1.Utils.createStylesheet(this._styleSheetClass, styleLocation, {
              nonce: this.opts.nonce
            });
            if (!this._styles)
              return this;
            this._styles._max = 0;
            utils_1.Utils.addCSSRule(this._styles, prefix, `min-height: ${cellHeight}${cellHeightUnit}`);
            let top = this.opts.marginTop + this.opts.marginUnit;
            let bottom = this.opts.marginBottom + this.opts.marginUnit;
            let right = this.opts.marginRight + this.opts.marginUnit;
            let left = this.opts.marginLeft + this.opts.marginUnit;
            let content = `${prefix} > .grid-stack-item-content`;
            let placeholder = `.${this._styleSheetClass} > .grid-stack-placeholder > .placeholder-content`;
            utils_1.Utils.addCSSRule(this._styles, content, `top: ${top}; right: ${right}; bottom: ${bottom}; left: ${left};`);
            utils_1.Utils.addCSSRule(this._styles, placeholder, `top: ${top}; right: ${right}; bottom: ${bottom}; left: ${left};`);
            utils_1.Utils.addCSSRule(this._styles, `${prefix} > .ui-resizable-ne`, `right: ${right}`);
            utils_1.Utils.addCSSRule(this._styles, `${prefix} > .ui-resizable-e`, `right: ${right}`);
            utils_1.Utils.addCSSRule(this._styles, `${prefix} > .ui-resizable-se`, `right: ${right}; bottom: ${bottom}`);
            utils_1.Utils.addCSSRule(this._styles, `${prefix} > .ui-resizable-nw`, `left: ${left}`);
            utils_1.Utils.addCSSRule(this._styles, `${prefix} > .ui-resizable-w`, `left: ${left}`);
            utils_1.Utils.addCSSRule(this._styles, `${prefix} > .ui-resizable-sw`, `left: ${left}; bottom: ${bottom}`);
          }
          maxH = maxH || this._styles._max;
          if (maxH > this._styles._max) {
            let getHeight = (rows) => cellHeight * rows + cellHeightUnit;
            for (let i = this._styles._max + 1; i <= maxH; i++) {
              let h = getHeight(i);
              utils_1.Utils.addCSSRule(this._styles, `${prefix}[gs-y="${i - 1}"]`, `top: ${getHeight(i - 1)}`);
              utils_1.Utils.addCSSRule(this._styles, `${prefix}[gs-h="${i}"]`, `height: ${h}`);
              utils_1.Utils.addCSSRule(this._styles, `${prefix}[gs-min-h="${i}"]`, `min-height: ${h}`);
              utils_1.Utils.addCSSRule(this._styles, `${prefix}[gs-max-h="${i}"]`, `max-height: ${h}`);
            }
            this._styles._max = maxH;
          }
          return this;
        }
        /** @internal */
        _updateContainerHeight() {
          if (!this.engine || this.engine.batchMode)
            return this;
          let row = this.getRow() + this._extraDragRow;
          this.el.setAttribute("gs-current-row", String(row));
          if (row === 0) {
            this.el.style.removeProperty("min-height");
            return this;
          }
          let cellHeight = this.opts.cellHeight;
          let unit = this.opts.cellHeightUnit;
          if (!cellHeight)
            return this;
          this.el.style.minHeight = row * cellHeight + unit;
          return this;
        }
        /** @internal */
        _prepareElement(el, triggerAddEvent = false, node) {
          el.classList.add(this.opts.itemClass);
          node = node || this._readAttr(el);
          el.gridstackNode = node;
          node.el = el;
          node.grid = this;
          let copy = Object.assign({}, node);
          node = this.engine.addNode(node, triggerAddEvent);
          if (!utils_1.Utils.same(node, copy)) {
            this._writeAttr(el, node);
          }
          this._prepareDragDropByNode(node);
          return this;
        }
        /** @internal call to write position x,y,w,h attributes back to element */
        _writePosAttr(el, n) {
          if (n.x !== void 0 && n.x !== null) {
            el.setAttribute("gs-x", String(n.x));
          }
          if (n.y !== void 0 && n.y !== null) {
            el.setAttribute("gs-y", String(n.y));
          }
          if (n.w) {
            el.setAttribute("gs-w", String(n.w));
          }
          if (n.h) {
            el.setAttribute("gs-h", String(n.h));
          }
          return this;
        }
        /** @internal call to write any default attributes back to element */
        _writeAttr(el, node) {
          if (!node)
            return this;
          this._writePosAttr(el, node);
          let attrs = {
            autoPosition: "gs-auto-position",
            minW: "gs-min-w",
            minH: "gs-min-h",
            maxW: "gs-max-w",
            maxH: "gs-max-h",
            noResize: "gs-no-resize",
            noMove: "gs-no-move",
            locked: "gs-locked",
            id: "gs-id"
          };
          for (const key in attrs) {
            if (node[key]) {
              el.setAttribute(attrs[key], String(node[key]));
            } else {
              el.removeAttribute(attrs[key]);
            }
          }
          return this;
        }
        /** @internal call to read any default attributes from element */
        _readAttr(el) {
          let node = {};
          node.x = utils_1.Utils.toNumber(el.getAttribute("gs-x"));
          node.y = utils_1.Utils.toNumber(el.getAttribute("gs-y"));
          node.w = utils_1.Utils.toNumber(el.getAttribute("gs-w"));
          node.h = utils_1.Utils.toNumber(el.getAttribute("gs-h"));
          node.maxW = utils_1.Utils.toNumber(el.getAttribute("gs-max-w"));
          node.minW = utils_1.Utils.toNumber(el.getAttribute("gs-min-w"));
          node.maxH = utils_1.Utils.toNumber(el.getAttribute("gs-max-h"));
          node.minH = utils_1.Utils.toNumber(el.getAttribute("gs-min-h"));
          node.autoPosition = utils_1.Utils.toBool(el.getAttribute("gs-auto-position"));
          node.noResize = utils_1.Utils.toBool(el.getAttribute("gs-no-resize"));
          node.noMove = utils_1.Utils.toBool(el.getAttribute("gs-no-move"));
          node.locked = utils_1.Utils.toBool(el.getAttribute("gs-locked"));
          node.id = el.getAttribute("gs-id");
          for (const key in node) {
            if (!node.hasOwnProperty(key))
              return;
            if (!node[key] && node[key] !== 0) {
              delete node[key];
            }
          }
          return node;
        }
        /** @internal */
        _setStaticClass() {
          let classes = ["grid-stack-static"];
          if (this.opts.staticGrid) {
            this.el.classList.add(...classes);
            this.el.setAttribute("gs-static", "true");
          } else {
            this.el.classList.remove(...classes);
            this.el.removeAttribute("gs-static");
          }
          return this;
        }
        /**
         * called when we are being resized by the window - check if the one Column Mode needs to be turned on/off
         * and remember the prev columns we used, or get our count from parent, as well as check for auto cell height (square)
         */
        onParentResize() {
          if (!this.el || !this.el.clientWidth)
            return;
          let changedColumn = false;
          if (this._autoColumn && this.parentGridItem) {
            if (this.opts.column !== this.parentGridItem.w) {
              changedColumn = true;
              this.column(this.parentGridItem.w, "none");
            }
          } else {
            let oneColumn = !this.opts.disableOneColumnMode && this.el.clientWidth <= this.opts.oneColumnSize;
            if (this.opts.column === 1 !== oneColumn) {
              changedColumn = true;
              if (this.opts.animate) {
                this.setAnimation(false);
              }
              this.column(oneColumn ? 1 : this._prevColumn);
              if (this.opts.animate) {
                this.setAnimation(true);
              }
            }
          }
          if (this._isAutoCellHeight) {
            if (!changedColumn && this.opts.cellHeightThrottle) {
              if (!this._cellHeightThrottle) {
                this._cellHeightThrottle = utils_1.Utils.throttle(() => this.cellHeight(), this.opts.cellHeightThrottle);
              }
              this._cellHeightThrottle();
            } else {
              this.cellHeight();
            }
          }
          this.engine.nodes.forEach((n) => {
            if (n.subGrid) {
              n.subGrid.onParentResize();
            }
          });
          return this;
        }
        /** add or remove the window size event handler */
        _updateWindowResizeEvent(forceRemove = false) {
          const workTodo = (this._isAutoCellHeight || !this.opts.disableOneColumnMode) && !this.parentGridItem;
          if (!forceRemove && workTodo && !this._windowResizeBind) {
            this._windowResizeBind = this.onParentResize.bind(this);
            window.addEventListener("resize", this._windowResizeBind);
          } else if ((forceRemove || !workTodo) && this._windowResizeBind) {
            window.removeEventListener("resize", this._windowResizeBind);
            delete this._windowResizeBind;
          }
          return this;
        }
        /** @internal convert a potential selector into actual element */
        static getElement(els = ".grid-stack-item") {
          return utils_1.Utils.getElement(els);
        }
        /** @internal */
        static getElements(els = ".grid-stack-item") {
          return utils_1.Utils.getElements(els);
        }
        /** @internal */
        static getGridElement(els) {
          return _GridStack.getElement(els);
        }
        /** @internal */
        static getGridElements(els) {
          return utils_1.Utils.getElements(els);
        }
        /** @internal initialize margin top/bottom/left/right and units */
        _initMargin() {
          let data;
          let margin = 0;
          let margins = [];
          if (typeof this.opts.margin === "string") {
            margins = this.opts.margin.split(" ");
          }
          if (margins.length === 2) {
            this.opts.marginTop = this.opts.marginBottom = margins[0];
            this.opts.marginLeft = this.opts.marginRight = margins[1];
          } else if (margins.length === 4) {
            this.opts.marginTop = margins[0];
            this.opts.marginRight = margins[1];
            this.opts.marginBottom = margins[2];
            this.opts.marginLeft = margins[3];
          } else {
            data = utils_1.Utils.parseHeight(this.opts.margin);
            this.opts.marginUnit = data.unit;
            margin = this.opts.margin = data.h;
          }
          if (this.opts.marginTop === void 0) {
            this.opts.marginTop = margin;
          } else {
            data = utils_1.Utils.parseHeight(this.opts.marginTop);
            this.opts.marginTop = data.h;
            delete this.opts.margin;
          }
          if (this.opts.marginBottom === void 0) {
            this.opts.marginBottom = margin;
          } else {
            data = utils_1.Utils.parseHeight(this.opts.marginBottom);
            this.opts.marginBottom = data.h;
            delete this.opts.margin;
          }
          if (this.opts.marginRight === void 0) {
            this.opts.marginRight = margin;
          } else {
            data = utils_1.Utils.parseHeight(this.opts.marginRight);
            this.opts.marginRight = data.h;
            delete this.opts.margin;
          }
          if (this.opts.marginLeft === void 0) {
            this.opts.marginLeft = margin;
          } else {
            data = utils_1.Utils.parseHeight(this.opts.marginLeft);
            this.opts.marginLeft = data.h;
            delete this.opts.margin;
          }
          this.opts.marginUnit = data.unit;
          if (this.opts.marginTop === this.opts.marginBottom && this.opts.marginLeft === this.opts.marginRight && this.opts.marginTop === this.opts.marginRight) {
            this.opts.margin = this.opts.marginTop;
          }
          return this;
        }
        /* ===========================================================================================
         * drag&drop methods that used to be stubbed out and implemented in dd-gridstack.ts
         * but caused loading issues in prod - see https://github.com/gridstack/gridstack.js/issues/2039
         * ===========================================================================================
         */
        /** get the global (but static to this code) DD implementation */
        static getDD() {
          return dd;
        }
        /**
         * call to setup dragging in from the outside (say toolbar), by specifying the class selection and options.
         * Called during GridStack.init() as options, but can also be called directly (last param are used) in case the toolbar
         * is dynamically create and needs to be set later.
         * @param dragIn string selector (ex: '.sidebar .grid-stack-item')
         * @param dragInOptions options - see DDDragInOpt. (default: {handle: '.grid-stack-item-content', appendTo: 'body'}
         **/
        static setupDragIn(dragIn, dragInOptions) {
          if ((dragInOptions === null || dragInOptions === void 0 ? void 0 : dragInOptions.pause) !== void 0) {
            dd_manager_1.DDManager.pauseDrag = dragInOptions.pause;
          }
          if (typeof dragIn === "string") {
            dragInOptions = Object.assign(Object.assign({}, types_1.dragInDefaultOptions), dragInOptions || {});
            utils_1.Utils.getElements(dragIn).forEach((el) => {
              if (!dd.isDraggable(el))
                dd.dragIn(el, dragInOptions);
            });
          }
        }
        /**
         * Enables/Disables dragging by the user of specific grid element. If you want all items, and have it affect future items, use enableMove() instead. No-op for static grids.
         * IF you are looking to prevent an item from moving (due to being pushed around by another during collision) use locked property instead.
         * @param els widget or selector to modify.
         * @param val if true widget will be draggable.
         */
        movable(els, val) {
          if (this.opts.staticGrid)
            return this;
          _GridStack.getElements(els).forEach((el) => {
            let node = el.gridstackNode;
            if (!node)
              return;
            if (val)
              delete node.noMove;
            else
              node.noMove = true;
            this._prepareDragDropByNode(node);
          });
          return this;
        }
        /**
         * Enables/Disables user resizing of specific grid element. If you want all items, and have it affect future items, use enableResize() instead. No-op for static grids.
         * @param els  widget or selector to modify
         * @param val  if true widget will be resizable.
         */
        resizable(els, val) {
          if (this.opts.staticGrid)
            return this;
          _GridStack.getElements(els).forEach((el) => {
            let node = el.gridstackNode;
            if (!node)
              return;
            if (val)
              delete node.noResize;
            else
              node.noResize = true;
            this._prepareDragDropByNode(node);
          });
          return this;
        }
        /**
         * Temporarily disables widgets moving/resizing.
         * If you want a more permanent way (which freezes up resources) use `setStatic(true)` instead.
         * Note: no-op for static grid
         * This is a shortcut for:
         * @example
         *  grid.enableMove(false);
         *  grid.enableResize(false);
         * @param recurse true (default) if sub-grids also get updated
         */
        disable(recurse = true) {
          if (this.opts.staticGrid)
            return;
          this.enableMove(false, recurse);
          this.enableResize(false, recurse);
          this._triggerEvent("disable");
          return this;
        }
        /**
         * Re-enables widgets moving/resizing - see disable().
         * Note: no-op for static grid.
         * This is a shortcut for:
         * @example
         *  grid.enableMove(true);
         *  grid.enableResize(true);
         * @param recurse true (default) if sub-grids also get updated
         */
        enable(recurse = true) {
          if (this.opts.staticGrid)
            return;
          this.enableMove(true, recurse);
          this.enableResize(true, recurse);
          this._triggerEvent("enable");
          return this;
        }
        /**
         * Enables/disables widget moving. No-op for static grids.
         * @param recurse true (default) if sub-grids also get updated
         */
        enableMove(doEnable, recurse = true) {
          if (this.opts.staticGrid)
            return this;
          this.opts.disableDrag = !doEnable;
          this.engine.nodes.forEach((n) => {
            this.movable(n.el, doEnable);
            if (n.subGrid && recurse)
              n.subGrid.enableMove(doEnable, recurse);
          });
          return this;
        }
        /**
         * Enables/disables widget resizing. No-op for static grids.
         * @param recurse true (default) if sub-grids also get updated
         */
        enableResize(doEnable, recurse = true) {
          if (this.opts.staticGrid)
            return this;
          this.opts.disableResize = !doEnable;
          this.engine.nodes.forEach((n) => {
            this.resizable(n.el, doEnable);
            if (n.subGrid && recurse)
              n.subGrid.enableResize(doEnable, recurse);
          });
          return this;
        }
        /** @internal removes any drag&drop present (called during destroy) */
        _removeDD(el) {
          dd.draggable(el, "destroy").resizable(el, "destroy");
          if (el.gridstackNode) {
            delete el.gridstackNode._initDD;
          }
          delete el.ddElement;
          return this;
        }
        /** @internal called to add drag over to support widgets being added externally */
        _setupAcceptWidget() {
          if (this.opts.staticGrid || !this.opts.acceptWidgets && !this.opts.removable) {
            dd.droppable(this.el, "destroy");
            return this;
          }
          let cellHeight, cellWidth;
          let onDrag = (event, el, helper) => {
            let node = el.gridstackNode;
            if (!node)
              return;
            helper = helper || el;
            let parent = this.el.getBoundingClientRect();
            let { top, left } = helper.getBoundingClientRect();
            left -= parent.left;
            top -= parent.top;
            let ui = { position: { top, left } };
            if (node._temporaryRemoved) {
              node.x = Math.max(0, Math.round(left / cellWidth));
              node.y = Math.max(0, Math.round(top / cellHeight));
              delete node.autoPosition;
              this.engine.nodeBoundFix(node);
              if (!this.engine.willItFit(node)) {
                node.autoPosition = true;
                if (!this.engine.willItFit(node)) {
                  dd.off(el, "drag");
                  return;
                }
                if (node._willFitPos) {
                  utils_1.Utils.copyPos(node, node._willFitPos);
                  delete node._willFitPos;
                }
              }
              this._onStartMoving(helper, event, ui, node, cellWidth, cellHeight);
            } else {
              this._dragOrResize(helper, event, ui, node, cellWidth, cellHeight);
            }
          };
          dd.droppable(this.el, {
            accept: (el) => {
              let node = el.gridstackNode;
              if ((node === null || node === void 0 ? void 0 : node.grid) === this)
                return true;
              if (!this.opts.acceptWidgets)
                return false;
              let canAccept = true;
              if (typeof this.opts.acceptWidgets === "function") {
                canAccept = this.opts.acceptWidgets(el);
              } else {
                let selector = this.opts.acceptWidgets === true ? ".grid-stack-item" : this.opts.acceptWidgets;
                canAccept = el.matches(selector);
              }
              if (canAccept && node && this.opts.maxRow) {
                let n = { w: node.w, h: node.h, minW: node.minW, minH: node.minH };
                canAccept = this.engine.willItFit(n);
              }
              return canAccept;
            }
          }).on(this.el, "dropover", (event, el, helper) => {
            let node = el.gridstackNode;
            if ((node === null || node === void 0 ? void 0 : node.grid) === this && !node._temporaryRemoved) {
              return false;
            }
            if ((node === null || node === void 0 ? void 0 : node.grid) && node.grid !== this && !node._temporaryRemoved) {
              let otherGrid = node.grid;
              otherGrid._leave(el, helper);
            }
            cellWidth = this.cellWidth();
            cellHeight = this.getCellHeight(true);
            if (!node) {
              node = this._readAttr(el);
            }
            if (!node.grid) {
              node._isExternal = true;
              el.gridstackNode = node;
            }
            helper = helper || el;
            let w = node.w || Math.round(helper.offsetWidth / cellWidth) || 1;
            let h = node.h || Math.round(helper.offsetHeight / cellHeight) || 1;
            if (node.grid && node.grid !== this) {
              if (!el._gridstackNodeOrig)
                el._gridstackNodeOrig = node;
              el.gridstackNode = node = Object.assign(Object.assign({}, node), { w, h, grid: this });
              this.engine.cleanupNode(node).nodeBoundFix(node);
              node._initDD = node._isExternal = // DOM needs to be re-parented on a drop
              node._temporaryRemoved = true;
            } else {
              node.w = w;
              node.h = h;
              node._temporaryRemoved = true;
            }
            this._itemRemoving(node.el, false);
            dd.on(el, "drag", onDrag);
            onDrag(event, el, helper);
            return false;
          }).on(this.el, "dropout", (event, el, helper) => {
            let node = el.gridstackNode;
            if (!node)
              return false;
            if (!node.grid || node.grid === this) {
              this._leave(el, helper);
              if (this._isTemp) {
                this.removeAsSubGrid(node);
              }
            }
            return false;
          }).on(this.el, "drop", (event, el, helper) => {
            var _a, _b;
            let node = el.gridstackNode;
            if ((node === null || node === void 0 ? void 0 : node.grid) === this && !node._isExternal)
              return false;
            let wasAdded = !!this.placeholder.parentElement;
            this.placeholder.remove();
            let origNode = el._gridstackNodeOrig;
            delete el._gridstackNodeOrig;
            if (wasAdded && (origNode === null || origNode === void 0 ? void 0 : origNode.grid) && origNode.grid !== this) {
              let oGrid = origNode.grid;
              oGrid.engine.removedNodes.push(origNode);
              oGrid._triggerRemoveEvent()._triggerChangeEvent();
              if (oGrid.parentGridItem && !oGrid.engine.nodes.length && oGrid.opts.subGridDynamic) {
                oGrid.removeAsSubGrid();
              }
            }
            if (!node)
              return false;
            if (wasAdded) {
              this.engine.cleanupNode(node);
              node.grid = this;
            }
            dd.off(el, "drag");
            if (helper !== el) {
              helper.remove();
              el.gridstackNode = origNode;
              if (wasAdded) {
                el = el.cloneNode(true);
              }
            } else {
              el.remove();
              this._removeDD(el);
            }
            if (!wasAdded)
              return false;
            el.gridstackNode = node;
            node.el = el;
            let subGrid = (_b = (_a = node.subGrid) === null || _a === void 0 ? void 0 : _a.el) === null || _b === void 0 ? void 0 : _b.gridstack;
            utils_1.Utils.copyPos(node, this._readAttr(this.placeholder));
            utils_1.Utils.removePositioningStyles(el);
            this._writeAttr(el, node);
            el.classList.add(types_1.gridDefaults.itemClass, this.opts.itemClass);
            this.el.appendChild(el);
            if (subGrid) {
              subGrid.parentGridItem = node;
              if (!subGrid.opts.styleInHead)
                subGrid._updateStyles(true);
            }
            this._updateContainerHeight();
            this.engine.addedNodes.push(node);
            this._triggerAddEvent();
            this._triggerChangeEvent();
            this.engine.endUpdate();
            if (this._gsEventHandler["dropped"]) {
              this._gsEventHandler["dropped"](Object.assign(Object.assign({}, event), { type: "dropped" }), origNode && origNode.grid ? origNode : void 0, node);
            }
            window.setTimeout(() => {
              if (node.el && node.el.parentElement) {
                this._prepareDragDropByNode(node);
              } else {
                this.engine.removeNode(node);
              }
              delete node.grid._isTemp;
            });
            return false;
          });
          return this;
        }
        /** @internal mark item for removal */
        _itemRemoving(el, remove) {
          let node = el ? el.gridstackNode : void 0;
          if (!node || !node.grid)
            return;
          remove ? node._isAboutToRemove = true : delete node._isAboutToRemove;
          remove ? el.classList.add("grid-stack-item-removing") : el.classList.remove("grid-stack-item-removing");
        }
        /** @internal called to setup a trash drop zone if the user specifies it */
        _setupRemoveDrop() {
          if (!this.opts.staticGrid && typeof this.opts.removable === "string") {
            let trashEl = document.querySelector(this.opts.removable);
            if (!trashEl)
              return this;
            if (!dd.isDroppable(trashEl)) {
              dd.droppable(trashEl, this.opts.removableOptions).on(trashEl, "dropover", (event, el) => this._itemRemoving(el, true)).on(trashEl, "dropout", (event, el) => this._itemRemoving(el, false));
            }
          }
          return this;
        }
        /** @internal prepares the element for drag&drop **/
        _prepareDragDropByNode(node) {
          let el = node.el;
          const noMove = node.noMove || this.opts.disableDrag;
          const noResize = node.noResize || this.opts.disableResize;
          if (this.opts.staticGrid || noMove && noResize) {
            if (node._initDD) {
              this._removeDD(el);
              delete node._initDD;
            }
            el.classList.add("ui-draggable-disabled", "ui-resizable-disabled");
            return this;
          }
          if (!node._initDD) {
            let cellWidth;
            let cellHeight;
            let onStartMoving = (event, ui) => {
              if (this._gsEventHandler[event.type]) {
                this._gsEventHandler[event.type](event, event.target);
              }
              cellWidth = this.cellWidth();
              cellHeight = this.getCellHeight(true);
              this._onStartMoving(el, event, ui, node, cellWidth, cellHeight);
            };
            let dragOrResize = (event, ui) => {
              this._dragOrResize(el, event, ui, node, cellWidth, cellHeight);
            };
            let onEndMoving = (event) => {
              this.placeholder.remove();
              delete node._moving;
              delete node._event;
              delete node._lastTried;
              let target = event.target;
              if (!target.gridstackNode || target.gridstackNode.grid !== this)
                return;
              node.el = target;
              if (node._isAboutToRemove) {
                let gridToNotify = el.gridstackNode.grid;
                if (gridToNotify._gsEventHandler[event.type]) {
                  gridToNotify._gsEventHandler[event.type](event, target);
                }
                this._removeDD(el);
                gridToNotify.engine.removedNodes.push(node);
                gridToNotify._triggerRemoveEvent();
                delete el.gridstackNode;
                delete node.el;
                el.remove();
              } else {
                utils_1.Utils.removePositioningStyles(target);
                if (node._temporaryRemoved) {
                  utils_1.Utils.copyPos(node, node._orig);
                  this._writePosAttr(target, node);
                  this.engine.addNode(node);
                } else {
                  this._writePosAttr(target, node);
                }
                if (this._gsEventHandler[event.type]) {
                  this._gsEventHandler[event.type](event, target);
                }
              }
              this._extraDragRow = 0;
              this._updateContainerHeight();
              this._triggerChangeEvent();
              this.engine.endUpdate();
            };
            dd.draggable(el, {
              start: onStartMoving,
              stop: onEndMoving,
              drag: dragOrResize
            }).resizable(el, {
              start: onStartMoving,
              stop: onEndMoving,
              resize: dragOrResize
            });
            node._initDD = true;
          }
          dd.draggable(el, noMove ? "disable" : "enable").resizable(el, noResize ? "disable" : "enable");
          return this;
        }
        /** @internal handles actual drag/resize start **/
        _onStartMoving(el, event, ui, node, cellWidth, cellHeight) {
          this.engine.cleanNodes().beginUpdate(node);
          this._writePosAttr(this.placeholder, node);
          this.el.appendChild(this.placeholder);
          node.el = this.placeholder;
          node._lastUiPosition = ui.position;
          node._prevYPix = ui.position.top;
          node._moving = event.type === "dragstart";
          delete node._lastTried;
          if (event.type === "dropover" && node._temporaryRemoved) {
            this.engine.addNode(node);
            node._moving = true;
          }
          this.engine.cacheRects(cellWidth, cellHeight, this.opts.marginTop, this.opts.marginRight, this.opts.marginBottom, this.opts.marginLeft);
          if (event.type === "resizestart") {
            dd.resizable(el, "option", "minWidth", cellWidth * (node.minW || 1)).resizable(el, "option", "minHeight", cellHeight * (node.minH || 1));
            if (node.maxW) {
              dd.resizable(el, "option", "maxWidth", cellWidth * node.maxW);
            }
            if (node.maxH) {
              dd.resizable(el, "option", "maxHeight", cellHeight * node.maxH);
            }
          }
        }
        /** @internal handles actual drag/resize **/
        _dragOrResize(el, event, ui, node, cellWidth, cellHeight) {
          let p = Object.assign({}, node._orig);
          let resizing;
          let mLeft = this.opts.marginLeft, mRight = this.opts.marginRight, mTop = this.opts.marginTop, mBottom = this.opts.marginBottom;
          let mHeight = Math.round(cellHeight * 0.1), mWidth = Math.round(cellWidth * 0.1);
          mLeft = Math.min(mLeft, mWidth);
          mRight = Math.min(mRight, mWidth);
          mTop = Math.min(mTop, mHeight);
          mBottom = Math.min(mBottom, mHeight);
          if (event.type === "drag") {
            if (node._temporaryRemoved)
              return;
            let distance = ui.position.top - node._prevYPix;
            node._prevYPix = ui.position.top;
            if (this.opts.draggable.scroll !== false) {
              utils_1.Utils.updateScrollPosition(el, ui.position, distance);
            }
            let left = ui.position.left + (ui.position.left > node._lastUiPosition.left ? -mRight : mLeft);
            let top = ui.position.top + (ui.position.top > node._lastUiPosition.top ? -mBottom : mTop);
            p.x = Math.round(left / cellWidth);
            p.y = Math.round(top / cellHeight);
            let prev = this._extraDragRow;
            if (this.engine.collide(node, p)) {
              let row = this.getRow();
              let extra = Math.max(0, p.y + node.h - row);
              if (this.opts.maxRow && row + extra > this.opts.maxRow) {
                extra = Math.max(0, this.opts.maxRow - row);
              }
              this._extraDragRow = extra;
            } else
              this._extraDragRow = 0;
            if (this._extraDragRow !== prev)
              this._updateContainerHeight();
            if (node.x === p.x && node.y === p.y)
              return;
          } else if (event.type === "resize") {
            if (p.x < 0)
              return;
            utils_1.Utils.updateScrollResize(event, el, cellHeight);
            p.w = Math.round((ui.size.width - mLeft) / cellWidth);
            p.h = Math.round((ui.size.height - mTop) / cellHeight);
            if (node.w === p.w && node.h === p.h)
              return;
            if (node._lastTried && node._lastTried.w === p.w && node._lastTried.h === p.h)
              return;
            let left = ui.position.left + mLeft;
            let top = ui.position.top + mTop;
            p.x = Math.round(left / cellWidth);
            p.y = Math.round(top / cellHeight);
            resizing = true;
          }
          node._event = event;
          node._lastTried = p;
          let rect = {
            x: ui.position.left + mLeft,
            y: ui.position.top + mTop,
            w: (ui.size ? ui.size.width : node.w * cellWidth) - mLeft - mRight,
            h: (ui.size ? ui.size.height : node.h * cellHeight) - mTop - mBottom
          };
          if (this.engine.moveNodeCheck(node, Object.assign(Object.assign({}, p), { cellWidth, cellHeight, rect, resizing }))) {
            node._lastUiPosition = ui.position;
            this.engine.cacheRects(cellWidth, cellHeight, mTop, mRight, mBottom, mLeft);
            delete node._skipDown;
            if (resizing && node.subGrid) {
              node.subGrid.onParentResize();
            }
            this._extraDragRow = 0;
            this._updateContainerHeight();
            let target = event.target;
            this._writePosAttr(target, node);
            if (this._gsEventHandler[event.type]) {
              this._gsEventHandler[event.type](event, target);
            }
          }
        }
        /** @internal called when item leaving our area by either cursor dropout event
         * or shape is outside our boundaries. remove it from us, and mark temporary if this was
         * our item to start with else restore prev node values from prev grid it came from.
         **/
        _leave(el, helper) {
          let node = el.gridstackNode;
          if (!node)
            return;
          dd.off(el, "drag");
          if (node._temporaryRemoved)
            return;
          node._temporaryRemoved = true;
          this.engine.removeNode(node);
          node.el = node._isExternal && helper ? helper : el;
          if (this.opts.removable === true) {
            this._itemRemoving(el, true);
          }
          if (el._gridstackNodeOrig) {
            el.gridstackNode = el._gridstackNodeOrig;
            delete el._gridstackNodeOrig;
          } else if (node._isExternal) {
            delete node.el;
            delete el.gridstackNode;
            this.engine.restoreInitial();
          }
        }
        // legacy method removed
        commit() {
          utils_1.obsolete(this, this.batchUpdate(false), "commit", "batchUpdate", "5.2");
          return this;
        }
      };
      exports.GridStack = GridStack2;
      GridStack2.Utils = utils_1.Utils;
      GridStack2.Engine = gridstack_engine_1.GridStackEngine;
      GridStack2.GDRev = "7.3.0";
    }
  });

  // js/rack.js
  var import_gridstack = __toESM(require_gridstack());
  var changesMade = false;
  var gridItemsMap = [];
  var grids = [];
  function getItems(grids2) {
    grids2.forEach(function(grid, gridIndex) {
      var gridItems = grid.getGridItems();
      gridItemsMap[gridIndex] = {};
      gridItems.forEach(function(item) {
        gridItemsMap[gridIndex][item.gridstackNode.id] = item;
      });
    });
  }
  function acceptWidgets(el) {
    var gridId = el.gridstackNode.grid.el.getAttribute("data-grid-id");
    if (gridId === "2") {
      return true;
    } else if (el.getAttribute("data-full-depth") === "False") {
      return true;
    }
    return false;
  }
  function acceptOtherWidgets(e) {
    return true;
  }
  function initializeGrid(element, acceptWidgets2) {
    return import_gridstack.GridStack.init(options = {
      cellHeight: 11,
      margin: 0,
      marginBottom: 1,
      float: true,
      disableOneColumnMode: true,
      animate: true,
      removeTimeout: 100,
      disableResize: true,
      acceptWidgets: acceptWidgets2
    }, element);
  }
  function saveRack(rack_id, desc_units) {
    getItems(grids);
    console.log(desc_units);
    var data = {};
    gridItemsMap.forEach((grid, gridIndex) => {
      let gridData = [];
      for (let key in grid) {
        let item = grid[key];
        if (item.getAttribute("data-item-face") !== "back") {
          let y = parseInt(item.getAttribute("gs-y")) / 2;
          let u_height = parseInt(item.getAttribute("gs-h")) / 2;
          let rack_height = item.gridstackNode.grid.el.getAttribute("gs-max-row") / 2;
          let u_position;
          if (desc_units) {
            u_position = y + 1;
          } else {
            u_position = u_height > 1 ? rack_height - y - u_height + 1 : rack_height - y;
          }
          gridData.push({
            "id": parseInt(item.getAttribute("gs-id")),
            "x": parseInt(item.getAttribute("gs-x")),
            "y": u_position,
            "is_full_depth": item.getAttribute("data-full-depth"),
            "face": item.getAttribute("data-item-face")
          });
        }
      }
      names = {
        0: "front",
        1: "rear",
        2: "other"
      };
      data[names[gridIndex]] = gridData;
      data["rack_id"] = rack_id;
    });
    try {
      const res = fetch("/" + basePath + "api/plugins/reorder/save/" + rack_id + "/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": netbox_csrf_token
        },
        body: JSON.stringify(data)
      });
      res.then((response) => {
        if (response.ok) {
          changesMade = false;
          var button = document.getElementById("saveButton");
          button.setAttribute("disabled", "disabled");
          response.json().then((jsonData) => {
            console.log(jsonData);
          });
          window.location.href = returnUrl;
        }
      });
    } catch (error) {
      console.error("Error:", error);
    }
  }
  var frontGrid = initializeGrid("#grid-front", acceptWidgets);
  var rearGrid = initializeGrid("#grid-rear", acceptWidgets);
  var nonRackedGrid = initializeGrid("#grid-other", acceptOtherWidgets);
  grids = [frontGrid, rearGrid, nonRackedGrid];
  getItems(grids);
  grids.forEach(function(grid, gridIndex) {
    grid.on("change", function(event, items) {
      changesMade = true;
      var button = document.getElementById("saveButton");
      button.removeAttribute("disabled");
      items.forEach(function(item) {
        var otherGridIndex = gridIndex === 0 ? 1 : 0;
        var otherGridItemsMap = gridItemsMap[otherGridIndex];
        if (otherGridItemsMap && otherGridItemsMap[item.id]) {
          var otherItem = otherGridItemsMap[item.id];
          var otherGrid = grids[otherGridIndex];
          otherGrid.update(otherItem, {
            "x": item.x,
            "y": item.y
          });
        }
      });
    });
    grid.on("dropped", function(event, previousWidget, newWidget) {
      changesMade = true;
      var button = document.getElementById("saveButton");
      button.removeAttribute("disabled");
      var originGrid = grids.indexOf(previousWidget.grid);
      if (gridIndex === 0) {
        newWidget.el.setAttribute("data-item-face", "front");
      } else if (gridIndex === 1) {
        newWidget.el.setAttribute("data-item-face", "rear");
      }
      if (originGrid === 2) {
        var otherGridIndex = gridIndex === 0 ? 1 : 0;
        var otherGrid = grids[otherGridIndex];
        if (otherGrid) {
          if (newWidget.el.getAttribute("data-full-depth") === "True") {
            var itemContent = newWidget.el.cloneNode(true);
            var subDiv = itemContent.querySelector(".grid-stack-item-content");
            subDiv.removeAttribute("style");
            subDiv.classList.add("device_rear");
            itemContent.setAttribute("data-item-face", "back");
            otherGrid.addWidget(itemContent);
          }
        }
        getItems(grids);
      } else if ((originGrid === 0 || originGrid === 1) && gridIndex === 2) {
        if (newWidget.el.getAttribute("data-full-depth") === "True") {
          var itemContent = newWidget.el.querySelector(".grid-stack-item-content");
          itemContent.removeAttribute("style");
          itemContent.classList.remove("device_rear");
          itemContent.setAttribute("data-item-face", "front");
          var backgroundColor = newWidget.el.getAttribute("data-item-color");
          var textColor = newWidget.el.getAttribute("data-item-text-color");
          itemContent.style = "background-color: #" + backgroundColor + "; color: #" + textColor + ";";
          var otherGridIndex = originGrid === 0 ? 1 : 0;
          var otherGrid = grids[otherGridIndex];
          var widget = gridItemsMap[otherGridIndex][previousWidget.el.getAttribute("gs-id")];
          otherGrid.removeWidget(widget);
        }
        getItems(grids);
      }
    });
  });
  var saveButton = document.getElementById("saveButton");
  saveButton.addEventListener("click", function(event) {
    saveRack(rackId, descUnits);
  });
  window.addEventListener("beforeunload", function(event) {
    if (changesMade) {
      event.returnValue = "Are you sure you want to leave? Changes you made may not be saved.";
    }
  });
})();
/*! Bundled license information:

gridstack/dist/gridstack.js:
  (*!
   * GridStack 7.3.0
   * https://gridstackjs.com/
   *
   * Copyright (c) 2021-2022 Alain Dumesny
   * see root license https://github.com/gridstack/gridstack.js/tree/master/LICENSE
   *)
*/
