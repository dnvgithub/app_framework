/* tslint:disable */

import { Injectable } from '@angular/core';

// see https://stackoverflow.com/questions/45294322/angular-2-4-loading-scripts-dynamically
// and https://stackoverflow.com/questions/37729896/how-to-load-a-3rd-party-script-from-web-dynamically-into-angular2-component


// @dynamic
@Injectable()
export class ScriptService {

  static doc = document;
  static head = ScriptService.doc.getElementsByTagName('head')[0];
  static s = 'string';
  static push = 'push';
  static readyState = 'readyState';
  static onreadystatechange = 'onreadystatechange';
  static list = {};
  static ids = {};
  static delay = {};
  static scripts = {};
  static scriptpath: string = '';
  static _urlArgs: string = '';

  private static every(ar: any, fn: any): boolean {
    for (var i = 0, j = ar.length; i < j; ++i) if (!fn(ar[i])) return false;
    return true;
  }
  private static each(ar: any, fn: any): boolean {
    return ScriptService.every(ar, function (el: any) {
      fn(el)
      return true;
    })
  }

  public static script(paths: any, idOrDone: any = null, optDone: any = null) {
    paths = paths[ScriptService.push] ? paths : [paths]
    var idOrDoneIsDone = idOrDone && idOrDone.call
      , done = idOrDoneIsDone ? idOrDone : optDone
      , id = idOrDoneIsDone ? paths.join('') : idOrDone
      , queue = paths.length
    function loopFn(item: any) {
      return item.call ? item() : ScriptService.list[item]
    }
    function callback() {
      if (!--queue) {
        ScriptService.list[id] = 1
        done && done()
        for (var dset in ScriptService.delay) {
          ScriptService.every(dset.split('|'), loopFn) && !ScriptService.each(ScriptService.delay[dset], loopFn) && (ScriptService.delay[dset] = [])
        }
      }
    }
    setTimeout(function () {
      ScriptService.each(paths, function loading(path: any, force: any) {
        if (path === null) return callback()

        if (!force && !/^https?:\/\//.test(path) && ScriptService.scriptpath) {
          path = (path.indexOf('.js') === -1) ? ScriptService.scriptpath + path + '.js' : ScriptService.scriptpath + path;
        }

        if (ScriptService.scripts[path]) {
          if (id) ScriptService.ids[id] = 1
          return (ScriptService.scripts[path] == 2) ? callback() : setTimeout(function () { loading(path, true) }, 0)
        }

        ScriptService.scripts[path] = 1
        if (id) ScriptService.ids[id] = 1
        ScriptService.create(path, callback)
      })
    }, 0)
    return ScriptService.script;
  }

  private static create(path: any, fn: any) {
    var el = ScriptService.doc.createElement('script'), loaded: any
    el.onload = el.onerror = el[ScriptService.onreadystatechange] = function () {
      if ((el[ScriptService.readyState] && !(/^c|loade/.test(el[ScriptService.readyState]))) || loaded) return;
      el.onload = el[ScriptService.onreadystatechange] = null!;
      loaded = 1;
      ScriptService.scripts[path] = 2;
      fn();
    }
    el.async = true;
    el.src = ScriptService._urlArgs ? path + (path.indexOf('?') === -1 ? '?' : '&') + ScriptService._urlArgs : path;
    ScriptService.head.insertBefore(el, ScriptService.head.lastChild)
  }


  public static path(p: string) {
    ScriptService.scriptpath = p
  }
  public static urlArgs(str: string) {
    ScriptService._urlArgs = str;
  }

  public static ready(deps: any, ready: any, req: any = null) {
    deps = deps[ScriptService.push] ? deps : [deps]
    var missing: any = [];
    !ScriptService.each(deps, function (dep: any) {
      ScriptService.list[dep] || missing[ScriptService.push](dep);
    }) && ScriptService.every(deps, function (dep: any) { return ScriptService.list[dep] }) ?
      ready() : !function (key) {
        ScriptService.delay[key] = ScriptService.delay[key] || []
        ScriptService.delay[key][ScriptService.push](ready)
        return req && req(missing)
      }(deps.join('|'))
    return ScriptService.script;
  }

}
