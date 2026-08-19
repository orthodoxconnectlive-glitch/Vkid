/**
 * Core Polyfills and Compatibility Shim for Older Smart TV Browsers:
 * - Samsung Tizen 2.4 - 5.0 (Chrome 47 - 69)
 * - LG webOS 3.0 - 4.5 (Chrome 38 - 68)
 * - Older Android TV WebView (Chrome 49 - 70)
 */

// 1. globalThis polyfill
if (typeof (window as any).globalThis === 'undefined') {
  (window as any).globalThis = window;
}

// 2. Object.assign polyfill
if (typeof Object.assign !== 'function') {
  Object.assign = function (target: any, ...sources: any[]) {
    if (target == null) {
      throw new TypeError('Cannot convert undefined or null to object');
    }
    const to = Object(target);
    for (let index = 0; index < sources.length; index++) {
      const nextSource = sources[index];
      if (nextSource != null) {
        for (const nextKey in nextSource) {
          if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
    }
    return to;
  };
}

// 3. Array.prototype.find & findIndex polyfills
if (!Array.prototype.find) {
  Array.prototype.find = function (predicate: any, thisArg?: any) {
    if (this == null) throw new TypeError('Array.prototype.find called on null or undefined');
    if (typeof predicate !== 'function') throw new TypeError('predicate must be a function');
    const list = Object(this);
    const length = list.length >>> 0;
    for (let i = 0; i < length; i++) {
      if (i in list) {
        const value = list[i];
        if (predicate.call(thisArg, value, i, list)) return value;
      }
    }
    return undefined;
  };
}

if (!Array.prototype.findIndex) {
  Array.prototype.findIndex = function (predicate: any, thisArg?: any) {
    if (this == null) throw new TypeError('Array.prototype.findIndex called on null or undefined');
    if (typeof predicate !== 'function') throw new TypeError('predicate must be a function');
    const list = Object(this);
    const length = list.length >>> 0;
    for (let i = 0; i < length; i++) {
      if (i in list) {
        const value = list[i];
        if (predicate.call(thisArg, value, i, list)) return i;
      }
    }
    return -1;
  };
}

// 4. Array.prototype.includes polyfill
if (!Array.prototype.includes) {
  Array.prototype.includes = function (searchElement: any, fromIndex?: number) {
    if (this == null) throw new TypeError('Array.prototype.includes called on null or undefined');
    const O = Object(this);
    const len = parseInt(O.length, 10) || 0;
    if (len === 0) return false;
    const n = parseInt(fromIndex as any, 10) || 0;
    let k;
    if (n >= 0) {
      k = n;
    } else {
      k = len + n;
      if (k < 0) k = 0;
    }
    while (k < len) {
      const currentElement = O[k];
      if (
        searchElement === currentElement ||
        (searchElement !== searchElement && currentElement !== currentElement)
      ) {
        return true;
      }
      k++;
    }
    return false;
  };
}

// 5. String.prototype.includes polyfill
if (!String.prototype.includes) {
  String.prototype.includes = function (search: string, start?: number) {
    if (typeof start !== 'number') start = 0;
    if (start + search.length > this.length) return false;
    return this.indexOf(search, start) !== -1;
  };
}

// 6. String.prototype.startsWith polyfill
if (!String.prototype.startsWith) {
  String.prototype.startsWith = function (search: string, pos?: number) {
    return this.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
  };
}

// 7. String.prototype.endsWith polyfill
if (!String.prototype.endsWith) {
  String.prototype.endsWith = function (search: string, this_len?: number) {
    if (this_len === undefined || this_len > this.length) {
      this_len = this.length;
    }
    return this.substring(this_len - search.length, this_len) === search;
  };
}

// 8. CustomEvent polyfill for older Smart TVs
(function () {
  if (typeof window === 'undefined') return;
  if (typeof (window as any).CustomEvent === 'function') return;

  function CustomEvent(event: string, params: any) {
    params = params || { bubbles: false, cancelable: false, detail: null };
    const evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    return evt;
  }

  CustomEvent.prototype = (window as any).Event.prototype;
  (window as any).CustomEvent = CustomEvent;
})();

export {};
