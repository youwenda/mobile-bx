KISSY.add("brix/app",function(e,t,n){function r(e){return e?Function("return "+e)():{}}function a(e){return"/"==e.charAt(e.length-1)&&(e+="index"),e}function i(t){var n;if(!(n=t.attr("id"))){for(;(n=e.guid("brix_brick_"))&&f("#"+n).length;);t.attr("id",n)}return n}function l(e){var t=this,n=t.get("el"),r=f("[bx-name]",n);n.attr("bx-name")&&(r=n.add(r)),s.call(t,r,e)}function s(t,n){var l,s,u,c,o=this,f=[],b={},_=o.__bricks,h=o.__bricksMap;t.each(function(e){"true"!=e.attr("bx-behavior")&&(s=i(e),u=e.attr("bx-name"),c=r(e.attr("bx-config")),u=a(u),e.attr("bx-behavior","true"),l={id:s,index:_.length,name:u,config:c},_.push(l),h[s]=l,b.hasOwnProperty(u)||(b[u]=1,f.push(u)))}),f.length?e.use(f.join(","),function(e){if(!o.__destroyed){var t=d.call(arguments,1);e.each(_,function(n){if(!n.destroyed&&!n.brick){var r=e.merge({el:"#"+n.id,pagelet:o},n.config),a=t[e.indexOf(n.name,f)],i=new a(r);n.brick=i}}),f=null,b=null,t=null,n&&n.call(o)}}):n&&n.call(o)}function u(e){var t,n=this,r=n.__bricks,a=n.__bricksMap;(t=a[e])&&(t.destroyed=!0,t.brick&&(t.brick.destroy&&t.brick.destroy(),r.splice(t.index,1),t.brick=null,t=null))}function c(){var e=this;if(!e.__isReady){e.__isReady=!0;var t=e.__readyList;if(e.__readyList=[],t.length>0)for(var n,r=0;n=t[r++];)n.call(e);t=null}}function o(){o.superclass.constructor.apply(this,arguments)}var f=t.all,d=[].slice;return e.extend(o,n,{initialize:function(){var t=this;t.__isReady=!1,t.__readyList=[],t.__bricks=[],t.__bricksMap={},t.__isAddBehavior=!1,t.__destroyed=!1,t.__counter=0,t.__rendered&&!t.__isAddBehavior&&(t.__isAddBehavior=!0,l.call(t,function(){t.on("beforeRefreshTpl",function(n){t.__counter++;var r=n.node;e.each(t.__unBubbleEvents,function(n,a){var i=r.all(a);e.each(n,function(e){i.detach(e.type,e.fn,t)})}),"html"===n.renderType&&r.all("[bx-name]").each(function(e){u.call(t,e.attr("id"))})}),t.on("afterRefreshTpl",function(n){var r=n.node;e.each(t.__unBubbleEvents,function(n,a){var i=r.all(a);e.each(n,function(e){i.on(e.type,e.fn,t)})}),s.call(t,r.all("[bx-name]"),function(){t.__counter--,0===t.__counter&&c.call(t)})}),c.call(t)}))},destructor:function(){var t=this,n=t.__bricks;e.each(n,function(e){u.call(t,e.id)}),t.__isReady=null,t.__readyList=null,t.__bricks=null,t.__bricksMap=null,t.__isAddBehavior=null,t.__destroyed=!0,t.__counter=0},ready:function(e){this.__isReady?e.call(window,this):this.__readyList.push(e)},one:function(t){var n,r=this,i=r.__bricksMap;return"#"===t.charAt(0)?(t=t.substr(1),(n=i[t])&&(n=n.brick)):(t=a(t),e.each(i,function(e){return e.name==t?(n=e.brick,!1):void 0})),n},all:function(t){var n,r=this,i=r.__bricksMap;return"#"===t.charAt(0)?(t=t.substr(1),(n=i[t])&&(n=[n.brick])):(n=[],t=a(t),e.each(i,function(e){e.name==t&&n.push(e.brick)})),n},on:function(e,t,r){var i=this,l="@",s=arguments;i.ready(function(){if(~e.indexOf(l)){var u=e.split(l);2==u.length&&(e=a(u[0])+"@"+u[1]),n.superclass.on.call(i,e,t,r)}else n.superclass.on.apply(i,s)})}}),e.mix(o,{boot:function(t,n){e.isPlainObject(t)?n=t:(n=n||{},n.el=t);var r=new o(n);return console.info(r),r}}),o},{requires:["node","brix/brick"]}),KISSY.add("brix/base",function(e,t){function n(e){var t=this,n=t.constructor;for(t.__attrs={},t.__attrVals={};n;)a.call(t,n.ATTRS),n=n.superclass?n.superclass.constructor:null;l.call(t,e)}function r(e){var t=this;return"string"==typeof e?t[e]:e}function a(e){var t=this;if(e)for(var n in e)i.call(t,n,e[n],!1)}function i(t,n,r){var a,i=this,l=i.__attrs;(a=l[t])?e.mix(a,n,r):l[t]=n}function l(e){var t=this;if(e)for(var n in e)s.call(t,n,e[n])}function s(e,t){var n=this,a=void 0,i=n.__attrs[e]||(n.__attrs[e]={});setter=i.setter,setter&&(setter=r.call(n,setter))&&(a=setter.call(n,t,e)),void 0!==a&&(t=a),n.__attrVals[e]=t}function u(e){var t,n=this,a=n.__attrs,i=n.__attrs[e]||n.__attrs[e]||{},l=i.valueFn;return l&&(l=r.call(n,l))&&(t=l.call(n),void 0!==t&&(i.value=t),delete i.valueFn,a[e]=i),i.value}return e.augment(n,t),e.augment(n,{set:function(t,n){var r=this;if(e.isPlainObject(t)){var a;for(a in t)s.call(r,a,t[a])}else s.call(r,t,n)},get:function(e){var t,n,a,i=this,l=i.__attrVals;return t=i.__attrs[e]||(i.__attrs[e]={}),n=t.getter,a=e in l?l[e]:u.call(i,e),n&&(n=r.call(i,n))&&(a=n.call(i,a,e)),e in l||void 0===a||(l[e]=a),a}}),n},{requires:["brix/event"]}),KISSY.add("brix/brick",function(e,t,n,r,a){function i(e){return"/"==e.charAt(e.length-1)&&(e+="index"),e}function l(){o=+new Date,l.superclass.constructor.apply(this,arguments),s.call(this),console.info(+new Date-o)}function s(){var e=this,t=e.get("el"),n=e.get("tpl"),a=e.get("data");n||(n=t.html()),e.__tmpler||(e.__tmpler=new r(n,a)),e.set("tpl",e.__tmpler.tpl),e.get("autoRender")&&u.call(e),e.__pagelet=e.get("pagelet")}function u(){var e=this;e.__rendered||(e.__rendered=!0,c.call(e),a.bxDelegate(e),e.initialize())}function c(){var e=this,t=e.get("el"),n=e.get("tpl"),r=e.get("data"),a=e.__tmpler;if(a){var i=a.bxRenderTpl(n,r);t.html(i)}}var o,f=t.all,d=function(){},b=["remove","empty"];return l.ATTRS={el:{getter:function(e){if("string"==typeof e&&(e=f(e)),!e||!e.length)throw Error("el is removed");return e}},tpl:{value:!1},data:{value:!1},autoRender:{value:!0},destroyAction:{value:"remove"},pagelet:{value:null}},e.extend(l,n,{initialize:d,destructor:d,setChunkData:function(e){var t,n,r=this,a=r.__tmpler;if(a){n=a.bxData;for(t in e)n[t]=e[t];a.bxRefresh&&(a.bxIRefreshTpl(a.bxSubTpls,a.bxRefreshKeys,a.data,r),a.bxRefreshKeys=[]),a.bxRefresh=!0}},fire:function(e,t,n,r){var a,s=this,u=s.__pagelet;u?(a=i(s.get("el").attr("bx-name"))+"@"+e,u.fire(a,t,n,r)):l.superclass.fire.apply(this,arguments)},on:function(e,t,n){var r,a=this,s=a.__pagelet;s?(r=i(a.get("el").attr("bx-name"))+"@"+e,s.on(r,t,n)):l.superclass.on.apply(a,arguments)},destroy:function(){var t=this,n=t.get("el");if(t.destructor(),t.__rendered){a.bxUndelegate(t);var r=t.get("destroyAction");e.inArray(r,b)&&n[r]()}t.detach(),t.__tmpler=null,t.__rendered=null,t.__pagelet=null,t.set("pagelet",null)}}),l},{requires:["node","brix/base","brix/tmpler","brix/bx-event"]}),KISSY.add("brix/bx-event",function(e,t){var n=["change","valuechange"],r=function(){var r={bxDelegate:function(e){for(var t=e.constructor;t;)this.bxDelegateMap(e,t.EVENTS),t=t.superclass?t.superclass.constructor:null;var n=e.get("events");n&&this.bxDelegateMap(e,n)},bxDelegateMap:function(r,a){var i,l=r.get("el");r.__unBubbleEvents={};for(var s in a){var u=a[s];for(var c in u)i=u[c],"self"===s?l.on(c,i,r):"window"===s?t.on(window,c,i,r):"body"===s?t.on("body",c,i,r):"document"===s?t.on(document,c,i,r):e.inArray(c,n)?(r.__unBubbleEvents[s]=r.__unBubbleEvents[s]||[],r.__unBubbleEvents[s].push({type:c,fn:i}),l.all(s).on(c,i,r)):l.delegate(c,s,i,r)}},bxUndelegate:function(e){for(var t=e.constructor;t;)this.bxUndelegateMap(e,t.EVENTS),t=t.superclass?t.superclass.constructor:null;var n=e.get("events");n&&this.bxUndelegateMap(e,n)},bxUndelegateMap:function(r,a){var i,l=r.get("el");for(var s in a){var u=a[s];for(var c in u)i=u[c],"self"===s?l.detach(c,i,r):"window"===s?t.detach(window,c,i,r):"body"===s?t.detach("body",c,i,r):"document"===s?t.detach(document,c,i,r):e.inArray(c,n)?l.all(s).detach(c,i,r):l.undelegate(c,s,i,r)}}};return r}();return r},{requires:["event"]}),KISSY.add("brix/event",function(){var e=function(e){return"~"+e},t={fire:function(t,n,r,a){var i,l,s=this,u=e(t);if(i=s.__events){if(l=i[u]){n||(n={}),n.type||(n.type=t);for(var c,o,f=l.length,d=f-1;f--;)c=a?f:d-f,o=l[c],o.d&&(l.splice(c,1),d--),o.d||o.f.call(s,n)}r&&delete i[u]}},on:function(t,n,r){var a,i,l=e(t);this.__events||(this.__events={}),a=this.__events,i=a[l]||(a[l]=[]),isNaN(r)?i.push({f:n}):i.splice(r,0,{f:n})},detach:function(t,n){var r,a,i;if(i=this.__events||{},void 0==t)for(var l in i)delete i[l];else if(r=e(t),a=i[r])if(n){for(var s,l=a.length-1;l>=0;l--)if(s=a[l],s.f==n&&!s.d){s.d=1;break}}else delete i[r]},once:function(e,t){var n=this,r=function(){n.detach(e,r),t.apply(n,arguments)};n.on(e,r)}};return t}),KISSY.add("brix/tmpler",function(e,t){function n(e,t){var n=this;n.tpl=e||a,n.data=t||{},n.cache={},n.bxRefreshKeys=[],n.bxSubTpls=[],n.bxIParse()}var r=t.all,a="",i=Object.defineProperty,l=Object.defineProperties;try{i({},"_",{})}catch(s){"__defineGetter__"in{}&&(i=function(e,t,n){"get"in n&&e.__defineGetter__(t,n.get),"set"in n&&e.__defineSetter__(t,n.set)},l=function(e,t){for(var n in t)i(e,n,t[n]);return e})}return n.prototype={constructor:n,bxIParse:function(){var e,t=this,n=t.tpl,a=t.data;"string"==typeof n?("."===n.charAt(0)||"#"===n.charAt(0)||"body"===n)&&(e=r(n)):e=n,e&&e.length&&(n=e.html()),t.tpl=t.bxIBuildTpl(n),t.bxData=t.bxIBuildData(a)},bxIBuildTpl:function(e){var t=this;return e&&(e=t.bxISubTpl(e),t.bxIBuildSubTpls(e,t.bxSubTpls)),e},bxISubTpl:function(t){return t.replace(/(bx-subtpl=["'][^"']+["'])/gi,a).replace(/(bx-datakey=["'][^"']+["'])/gi,function(t){return'bx-subtpl="brix_subtpl_'+e.guid()+'" '+t})},bxIInnerHTML:function(e,t,n,r){var a="<"+t,i="</"+t+">",l=n,s=n,u=n;n-=r,n=e.indexOf(a,n);for(var c=n+1;;){if(n=e.indexOf(a,c),s=e.indexOf(i,u),-1==n||n>s)break;c=n+1,u=s+1}return{html:e.substring(l,s),e_pos:s+i.length}},bxIBuildSubTpls:function(e,t){var n=this,r="<([\\w]+)\\s+[^>]*?bx-subtpl=[\"']([^\"']+)[\"']\\s+bx-datakey=[\"']([^\"']+)[\"']\\s*[^>]*?>",a=RegExp(r,"ig"),i=a.exec(e);if(i){var l=i[3],s=i[0].length,u=n.bxIInnerHTML(e,i[1],a.lastIndex,s),c={name:i[2],datakey:l,tpl:u.html,subTpls:[]};t.push(c),n.bxIBuildSubTpls(u.html,c.subTpls),n.bxIBuildSubTpls(e.substring(0,a.lastIndex-s)+e.substr(u.e_pos),t)}},bxIBuildData:function(t){var n=this,r={},a=function(a){r[a]={get:function(){return t[a]},set:function(r){t[a]=r,e.inArray(a,n.bxRefreshKeys)||n.bxRefreshKeys.push(a)}}};if(t){n.bxRefresh=!0;for(var i in t)a(i);return l({},r)}},bxIRefreshTpl:function(t,n,a,i){var l=this,s=i.get("el"),u=function(t){var n=l.cache[t];if(n&&n.bxRefresh){var r=n.bxRefreshNodes;r&&r.each(function(t){if(n.subTpl.tpl){var r=t.attr("bx-rendertype")||"html";i.fire("beforeRefreshTpl",{node:t,renderType:r}),"html"==r&&t.empty(),t[r](e.trim(l.bxRenderTpl(n.subTpl.tpl,a))),i.fire("afterRefreshTpl",{node:t,renderType:r})}})}};e.each(t,function(t){var c;if(c=l.cache[t.name])return c.bxRefresh&&u(t.name),void 0;c=l.cache[t.name]={};for(var o=e.map(t.datakey.split(","),function(t){return e.trim(t)}),f=!1,d=0;o.length>d&&!f;d++)for(var b=0;n.length>b;b++)if(o[d]==n[b]){f=!0;break}if(f){var _=r("[bx-subtpl="+t.name+"]");s.attr("bx-subtpl")==t.name&&(_=s.add(_)),c.bxRefreshNodes=_,c.bxRefresh=!0,c.subTpl=t,u(t.name)}else t.subTpls&&t.subTpls.length&&(c.bxRefresh=!0,l.bxIRefreshTpl(t.subTpls,n,a,i))})},bxRenderTpl:function(e,t){var n=crox_js(e);return n(t)}},n},{requires:["node"]});