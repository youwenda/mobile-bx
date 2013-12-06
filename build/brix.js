KISSY.add("brix/app", function (S, Node, Brick) {
	// body...
	var $ = Node.all;
	var EMPTY = "";
	var Slice = [].slice;

    function returnJSON(s) {
        if (s) {
            return (new Function("return " + s))();
        } else {
            return {};
        }
    }

    function indexMapStr(s) {
        // 'x/' 'x/y/z/'
        if (s.charAt(s.length - 1) == "/") {
            s += "index";
        }
        return s;
    }

	function stamp(el) {
        var id;
        if (!(id = el.attr("id"))) {
            //判断页面id是否存在，如果存在继续随机。
            while ((id = S.guid("brix_brick_")) && $("#" + id).length) {}
            el.attr("id", id);
        }
        return id;
    }

	function addBehavior(callback) {
		var self = this;
		var el = self.get("el");
		var brickNodes = $("[bx-name]", el);

        //如果el本身也是tpl，则加上自己
        if (el.attr("bx-name")) {
            brickNodes = el.add(brickNodes);
        }

        doAddBehavior.call(self, brickNodes, callback);

	}

	function doAddBehavior(brickNodes, callback) {
		var self = this;
        var useList = [];
        var useListMap = {};
        var bricks = self.__bricks;
        var bricksMap = self.__bricksMap;
        var o, id, name, config;
		brickNodes.each(function(brickNode) {
			if (brickNode.attr("bx-behavior") != "true") {
			    id = stamp(brickNode);
                name = brickNode.attr("bx-name");
                config = returnJSON(brickNode.attr("bx-config"));
			    name = indexMapStr(name);
                brickNode.attr("bx-behavior", "true");
                
                o = {
                    id: id,
                    index: bricks.length,
                    name: name,
                    config: config
                };

                bricks.push(o);
                bricksMap[id] = o;

			    if (!useListMap.hasOwnProperty(name)) {
			    	useListMap[name] = 1;
			    	useList.push(name);
			    }
			}
        });

        if (useList.length) {

        	// 此处加载css
        	// 通过配置来判断是否加载css, 调试的时候加载css, 线上的时候直接通过外链来进行引入
        	
        	S.use(useList.join(","), function(S) {
        		if (self.__destroyed) {
        			return;
        		}

        		var useClassList = Slice.call(arguments, 1);

        		S.each(bricks, function(o) {
        			if (!o.destroyed && !o.brick) {
                        var config = S.merge({
                            el: "#" + o.id,
                            pagelet: self
                        }, o.config);
                        var TheBrick = useClassList[S.indexOf(o.name, useList)];
                        var myBrick = new TheBrick(config);
                        o.brick = myBrick;
        			}
        		});

        		useList = null;
        		useListMap = null;
                useClassList = null;
                callback && callback.call(self);

        	});

        } else {
        	if (callback) {
        		callback.call(self);
        	}
        }
	}

    /**
     * 销毁组件
     * @param {String} id 组件id
     */
    function destroyBrick(id) {
        var self = this;
        var bricks = self.__bricks;
        var bricksMap = self.__bricksMap;
        var o;

        if (o = bricksMap[id]) {
            o.destroyed = true;
            if (o.brick) {
                o.brick.destroy && o.brick.destroy();
                bricks.splice(o.index, 1);
                o.brick = null;
                o = null;
            }
        }
    }

    /**
     * 触发ready添加的方法
     * @private
     */
    function fireReady() {
        var self = this;
        if (self.__isReady) {
            return;
        }
        self.__isReady = true;
        //局部变量，保证所有注册方法只执行一次
        var readyList = self.__readyList;
        self.__readyList = [];
        if (readyList.length > 0) {
            var fn, i = 0;
            while (fn = readyList[i++]) {
                fn.call(self);
            }
        }
        readyList = null;
    }

	function App() {
		App.superclass.constructor.apply(this, arguments);
	}

	S.extend(App, Brick, {
		initialize: function() {
			var self = this;
			self.__isReady = false;
			self.__readyList = [];
			self.__bricks = [];
			self.__bricksMap = {};
            self.__isAddBehavior = false;
			self.__destroyed = false;
			self.__counter = 0;

			if (self.__rendered && !self.__isAddBehavior) {
				self.__isAddBehavior = true;
				addBehavior.call(self, function() {
					self.on("beforeRefreshTpl", function(e) {
                        self.__counter++;
						var node = e.node;
						S.each(self.__unBubbleEvents, function(v, k) {
		                    var ns = node.all(k)
		                    S.each(v, function(o) {
		                        ns.detach(o.type, o.fn, self)
		                    })
		                })
		                if (e.renderType === "html") {
                            node.all("[bx-name]").each(function(node) {
                                destroyBrick.call(self, node.attr("id"));
                            });
                        }
					});


					self.on("afterRefreshTpl", function(e) {

						var node = e.node;
						S.each(self.__unBubbleEvents, function(v, k) {
		                    var ns = node.all(k)
		                    S.each(v, function(o) {
		                        ns.on(o.type, o.fn, self)
		                    })
		                })

						doAddBehavior.call(self, node.all("[bx-name]"), function() {
                            self.__counter--;
                            if (self.__counter === 0) {
                                fireReady.call(self);
                            }
                        });
                    });

                    fireReady.call(self);
				});
			}
		},
        destructor: function() {
            var self = this;
            var bricks = self.__bricks;
            S.each(bricks, function(o) {
                destroyBrick.call(self, o.id);
            });

            self.__isReady = null;
            self.__readyList = null;
            self.__bricks = null;
            self.__bricksMap = null;
            self.__isAddBehavior = null;
            self.__destroyed = true;
            self.__counter = 0;
        },
		/**
         * 渲染完成后需要执行的函数
         * @param {Function} fn 执行的函数
         */
        ready: function(fn) {
            if (this.__isReady) {
                fn.call(window, this);
            } else {
                this.__readyList.push(fn);
            }
        },
        /**
         * 查找组件
         * @param #id | brick name
         */
        one: function(selector) {
            var self = this;
            var bricksMap = self.__bricksMap;
            var result;
            if (selector.charAt(0) === "#") {
                selector = selector.substr(1);
                if (result = bricksMap[selector]) {
                    result = result.brick;
                }
            } else {
                selector = indexMapStr(selector);
                S.each(bricksMap, function(o) {
                    if (o.name == selector) {
                        result = o.brick;
                        return false;
                    }
                });
            }
            return result;
        },
        all: function(selector) {
            var self = this;
            var bricksMap = self.__bricksMap;
            var result;

            if (selector.charAt(0) === "#") {
                selector = selector.substr(1);
                if (result = bricksMap[selector]) {
                    result = [result.brick];
                }
            } else {
                result = [];
                selector = indexMapStr(selector);
                S.each(bricksMap, function(o) {
                    if (o.name == selector) {
                        result.push(o.brick);
                    }
                });
            }
            return result;
        },
        on: function(name, fn, insert) {
            var self = this;
            var sign = "@";
            var args = arguments;
            self.ready(function() {
                if (!~name.indexOf(sign)) {
                    Brick.superclass.on.apply(self, args);
                } else {
                    var tempArrs = name.split(sign);
                    if (tempArrs.length == 2) {
                        name = indexMapStr(tempArrs[0]) + "@" + tempArrs[1];
                    }
                    Brick.superclass.on.call(self, name, fn, insert);
                }
            });
        }
	});

	S.mix(App, {
		boot: function(el, cfg) {
			if (S.isPlainObject(el)) {
				cfg = el;
			} else {
				cfg = cfg || {};
				cfg.el = el;
			}

			var app = new App(cfg);

			console.info(app);

			return app;
		}
	});

	return App;
}, {
	requires: ["node", "brix/brick"]
})
KISSY.add("brix/base", function (S, Event) {
    // body...
    var EMPTY = "";

    function Base(config) {
        var self = this,
            c = self.constructor;

        // save attrs key and attrs value
        self.__attrs = {};
        self.__attrVals = {};
        // define
        while (c) {
            addAttrs.call(self, c["ATTRS"]);
            c = c.superclass ? c.superclass.constructor : null;
        }
        // initial
        initAttrs.call(self, config);
    }

    function normalFn(method) {
        var self = this;
        if (typeof method == "string") {
            return self[method];
        }
        return method;
    }

    function addAttrs(attrs) {
        var self = this;
        if (attrs) {
            for (var attr in attrs) {
                // 子类上的 ATTRS 配置优先
                // 父类后加，父类不覆盖子类的相同设置
                addAttr.call(self, attr, attrs[attr], false);
            }
        }
    }

    function addAttr(name, value, override) {
        var self = this;
        var attrs = self.__attrs;
        var attr;
        if (attr = attrs[name]) {
            S.mix(attr, value, override);
        } else {
            attrs[name] = value;
        }
    }

    function initAttrs(config) {
        var self = this;
        if (config) {
            for (var attr in config) {
                setInternal.call(self, attr, config[attr]);
            }
        }
    }

    function setInternal(name, value) {
        var self = this,
            setValue = undefined,
            attrConfig = self.__attrs[name] || (self.__attrs[name] = {});
            setter = attrConfig["setter"];

        // if setter has effect
        if (setter && (setter = normalFn.call(self, setter))) {
            setValue = setter.call(self, value, name);
        }

        if (setValue !== undefined) {
            value = setValue;
        }

        // finally set
        self.__attrVals[name] = value;
    }

    // get default attribute value from valueFn/value
    function getDefAttrVal(name) {
        var self = this,
            attrs = self.__attrs,
            attrConfig = self.__attrs[name] || (self.__attrs[name] || {}),
            valFn = attrConfig.valueFn,
            val;

        if (valFn && (valFn = normalFn.call(self, valFn))) {
            val = valFn.call(self);
            if (val !== undefined) {
                attrConfig.value = val;
            }
            delete attrConfig.valueFn;
            attrs[name] = attrConfig;
        }

        return attrConfig.value;
    }
    
    S.augment(Base, Event);

    S.augment(Base, {
        /**
         * Sets the value of an attribute.
         * @param {String|Object} name attribute "s name or attribute name and value map
         * @param [value] attribute "s value
         */
        set: function(name, value) {
            var self = this;
            if (S.isPlainObject(name)) {
                var k;
                for (k in name) {
                    setInternal.call(self, k, name[k]);
                }
            } else {
                setInternal.call(self, name, value);
            }
        },
        /**
         * Gets the current value of the attribute.
         * @param {String} name attribute "s name
         * @return {*}
         */
        get: function (name) {
            var self = this,
                attrVals = self.__attrVals,
                attrConfig,
                getter, ret;

            attrConfig = self.__attrs[name] || (self.__attrs[name] = {});
            getter = attrConfig["getter"];

            // get user-set value or default value
            //user-set value takes privilege
            ret = name in attrVals ?
                attrVals[name] :
                getDefAttrVal.call(self, name);

            // invoke getter for this attribute
            if (getter && (getter = normalFn.call(self, getter))) {
                ret = getter.call(self, ret, name);
            }

            if (!(name in attrVals) && ret !== undefined) {
                attrVals[name] = ret;
            }

            return ret;
        }
    });

    return Base;

}, {
    requires: ["brix/event"]
});
KISSY.add("brix/brick", function (S, Node, Base, Tmpler, BxEvent) {
    // body...
    var $ = Node.all;
    var EMPTY = "";
    var Noop = function() {};
    var DEATROY_ACTION = ["remove", "empty"];
    var start;
    function indexMapStr(s) {
        // 'x/' 'x/y/z/'
        if (s.charAt(s.length - 1) == "/") {
            s += "index";
        }
        return s;
    }

    function Brick() {
        start = (+new Date);
        Brick.superclass.constructor.apply(this, arguments);
        initializer.call(this);
        console.info((+new Date) - start);
    }

    function initializer() {
        var self = this;
        var el = self.get("el");
        var tpl = self.get("tpl");
        var data = self.get("data");

        if (!tpl) {
            tpl = el.html();
        }

        if (!self.__tmpler) {
            self.__tmpler = new Tmpler(tpl, data);
        }

        self.set("tpl", self.__tmpler.tpl);

        if (self.get("autoRender")) {
            render.call(self);
        }

        //对原有pagelet的兼容
        self.__pagelet = self.get("pagelet");
    }

    function render() {
        var self = this;
        if (!self.__rendered) {
            self.__rendered = true;
            doRender.call(self);
            
            BxEvent.bxDelegate(self);

            // 组件的初始化方法
            self.initialize();
        }
    }

    function doRender() {
        var self = this;
        var el = self.get("el");
        var tpl = self.get("tpl");
        var data = self.get("data");
        var tmpler = self.__tmpler;
        if (tmpler) {
            // hack render Tmpl Engine
            var html = tmpler.bxRenderTpl(tpl, data);
            el.html(html);
        }
    }

    Brick.ATTRS = {
        /**
         * 组件根节点, 必填选项
         * @type {Node}
         */
        el: {
            getter: function(s) {
                if (typeof s === "string") {
                    s = $(s);
                }
                if (!s || !s.length) {
                    throw new Error('el is removed')
                }
                return s;
            }
        },
        /**
         * 模板
         * @cfg {String}
         */
        tpl: {
            value: false
        },
        /**
         * 模板数据
         * @cfg {Object}
         */
        data: {
            value: false
        },
        /**
         * 是否自动渲染
         * @cfg {Boolean}
         */
        autoRender: {
            value: true
        },
        /**
         * 销毁操作时候的动作，默认remove。
         * 可选none:什么都不做，empty:清空内部html
         * @cfg {String}
         */
        destroyAction: {
            value: "remove"
        },
        /**
         * 记录每个组件的parent属性，如果存在的话
         * @type {Object}
         */
        pagelet: {
            value: null
        }
    };

    S.extend(Brick, Base, {

        initialize: Noop,
        destructor: Noop,

        setChunkData: function(data) {
            var self = this;
            var tmpler = self.__tmpler;
            var k, bxData;
            if (tmpler) {
                bxData = tmpler.bxData;
                for (k in data) {
                    bxData[k] = data[k];
                }

                // 设置局部渲染
                if (tmpler.bxRefresh) {
                    tmpler.bxIRefreshTpl(tmpler.bxSubTpls, tmpler.bxRefreshKeys, tmpler.data, self)
                    tmpler.bxRefreshKeys = []
                }
                tmpler.bxRefresh = true
            }
        },

        /**
         * 触发事件
         * @param {String} name 事件名称
         * @param {Object} data 事件对象
         * @param {Boolean} remove 事件触发完成后是否移除这个事件的所有监听
         * @param {Boolean} lastToFirst 是否从后向前触发事件的监听列表
         */
        fire: function(name, data, remove, lastToFirst) {
            var self = this;
            var pagelet = self.__pagelet;
            var evName;

            if (pagelet) {
                evName = indexMapStr(self.get("el").attr("bx-name")) + "@" + name;
                pagelet.fire(evName, data, remove, lastToFirst);
            } else {
                Brick.superclass.fire.apply(this, arguments);
            }
        },
        /**
         * 绑定事件
         * @param {String} name 事件名称
         * @param {Function} fn 事件回调
         * @param {Interger} insert 事件监听插入的位置
         */
        on: function(name, fn, insert) {
            var self = this;
            var pagelet = self.__pagelet;
            var evName;

            if (pagelet) {
                evName = indexMapStr(self.get("el").attr("bx-name")) + "@" + name;
                pagelet.on(evName, fn, insert);
            } else {
                Brick.superclass.on.apply(self, arguments);
            }
        },

        destroy: function() {
            var self = this;
            var el = self.get("el");
            // 调用每个brick实例的destructor方法
            self.destructor();
            
            if (self.__rendered) {
                BxEvent.bxUndelegate(self);
                var action = self.get("destroyAction");
                if (S.inArray(action, DEATROY_ACTION)) {
                    el[action]();
                }
            }
            self.detach();
            self.__tmpler = null;
            self.__rendered = null;
            self.__pagelet = null;
            self.set("pagelet", null);
        }

    });
    
    return Brick;

}, {
    requires: ["node", "brix/base", "brix/tmpler", "brix/bx-event"]
});
KISSY.add("brix/bx-event", function (S, Event) {
	// body...
	var unSupportBubbleEvents = ['change', 'valuechange']
	
    var BxEvent = (function() {

        var METHODS = {
            bxDelegate: function(host) {

                var c = host.constructor
                while (c) {
                    this.bxDelegateMap(host, c.EVENTS)
                    c = c.superclass ? c.superclass.constructor : null
                }

                //外部动态传入的事件代理
                var events = host.get('events')
                if (events) {
                    this.bxDelegateMap(host, events)
                }
            },

            bxDelegateMap: function(host, eventsMap) {

                var self = this
                var el = host.get('el')
                var fn
                host.__unBubbleEvents = {}

                for (var sel in eventsMap) {
                    var events = eventsMap[sel]
                    for (var type in events) {
                        fn = events[type]

                        if (sel === 'self') {
                            el.on(type, fn, host)
                        } else if (sel === 'window') {
                            Event.on(window, type, fn, host)
                        } else if (sel === 'body') {
                           Event.on('body', type, fn, host)
                        } else if (sel === 'document') {
                            Event.on(document, type, fn, host)
                        } else {
                            if (S.inArray(type, unSupportBubbleEvents)) {
                                //将不冒泡事件做记录
                                host.__unBubbleEvents[sel] = host.__unBubbleEvents[sel] || []
                                host.__unBubbleEvents[sel].push({
                                    type: type,
                                    fn: fn
                                })
                                el.all(sel).on(type, fn, host)
                            } else {
                                el.delegate(type, sel, fn, host)
                            }

                        }
                    }

                }
            },

            bxUndelegate: function(host) {
                var c = host.constructor

                while (c) {
                    this.bxUndelegateMap(host, c.EVENTS)
                    c = c.superclass ? c.superclass.constructor : null
                }
                //外部动态传入的事件代理
                var events = host.get('events')
                if (events) {
                    this.bxUndelegateMap(host, events)
                }
            },

            bxUndelegateMap: function(host, eventsMap) {
                var el = host.get('el')
                var fn

                for (var sel in eventsMap) {
                    var events = eventsMap[sel]
                    for (var type in events) {
                        fn = events[type]

                        if (sel === 'self') {
                            el.detach(type, fn, host)
                        } else if (sel === 'window') {
                            Event.detach(window, type, fn, host)
                        } else if (sel === 'body') {
                            Event.detach('body', type, fn, host)
                        } else if (sel === 'document') {
                            Event.detach(document, type, fn, host)
                        } else {
                            if (S.inArray(type, unSupportBubbleEvents)) {
                                el.all(sel).detach(type, fn, host)
                            } else {
                                el.undelegate(type, sel, fn, host)
                            }
                        }
                    }
                }
            }
        };

        return METHODS;

    })();

    return BxEvent;
}, {
	requires: ['event']
});
KISSY.add("brix/event", function (S) {
	// ref Magix Event
	/**
	 * 根据名称生成事件数组的key
	 * @param {Strig} name 事件名称
	 * @return {String} 包装后的key
	 */
	var GenKey = function(name) {
	    return '~' + name;
	};

	/**
	 * 多播事件对象
	 * @name Event
	 * @namespace
	 */
	
	var Event = {
	    /**
	     * @lends Event
	     */
	    /**
	     * 触发事件
	     * @param {String} name 事件名称
	     * @param {Object} data 事件对象
	     * @param {Boolean} remove 事件触发完成后是否移除这个事件的所有监听
	     * @param {Boolean} lastToFirst 是否从后向前触发事件的监听列表
	     */
	    fire: function(name, data, remove, lastToFirst) {
	        var me = this,
	        	key = GenKey(name),
	            events, list;

	        if (!(events = me.__events)) {
	        	return;
	        }
	        list = events[key];

	        if (list) {
	        	if (!data) data = {};
	        	if (!data.type) data.type = name;

	        	var end = list.length,
	                len = end - 1,
	                idx, f;
	            while (end--) {
	                idx = lastToFirst ? end : len - end;
	                f = list[idx];
	                if (f.d) {
	                    list.splice(idx, 1);
	                    len--;
	                }
	                if (!f.d) f.f.call(me, data);
	            }
	        }

	        if (remove) {
	            delete events[key];
	        }
	    },
	    /**
	     * 绑定事件
	     * @param {String} name 事件名称
	     * @param {Function} fn 事件回调
	     * @param {Interger} insert 事件监听插入的位置
	     */
	    on: function(name, fn, insert) {
	        var key = GenKey(name);
	        var events, list;
	        if (!this.__events) {
	        	this.__events = {};
	        }
	        events = this.__events;
	        list = events[key] || (events[key] = []);
	        if (!isNaN(insert)) {
	        	list.splice(insert, 0, {
	        		f: fn
	        	});
	        } else {
	        	list.push({
	        		f: fn
	        	});
	        }
	    },
	    /**
	     * 解除事件绑定
	     * @param {String} name 事件名称
	     * @param {Function} fn 事件回调
	     */
	    detach: function(name, fn) {
	    	var key, list, events;
	    	events = this.__events || {};
	    	if (name == undefined) {
	    		for (var i in events) {
	    			delete events[i];
	    		}
	    	} else {
	    		key = GenKey(name);
		        list = events[key];
		        if (list) {
		            if (fn) {
		                for (var i = list.length - 1, f; i >= 0; i--) {
		                    f = list[i];
		                    if (f.f == fn && !f.d) {
		                        f.d = 1;
		                        break;
		                    }
		                }
		            } else {
		                delete events[key];
		            }
		        }
	    	}
	    },
	    /**
	     * 绑定事件，触发一次后即解绑
	     * @param {String} name 事件名称
	     * @param {Function} fn 事件回调
	     */
	    once: function(name, fn) {
	    	var me = this;
	    	var wrap = function() {
	    		me.detach(name, wrap);
	    		fn.apply(me, arguments);
	    	};
	        me.on(name, wrap);
	    }
	};

	return Event;
})
KISSY.add("brix/tmpler", function (S, Node) {
	// body...
	var $ = Node.all;
	var EMPTY = "";

    var defineProperty = Object.defineProperty;
    var defineProperties = Object.defineProperties;

    try {
        defineProperty({}, "_", {});
    } catch (e) {
        if ("__defineGetter__" in {}) {
            defineProperty = function(obj, prop, desc) {
                if ("get" in desc) {
                    obj.__defineGetter__(prop, desc.get);
                }
                if ("set" in desc) {
                    obj.__defineSetter__(prop, desc.set);
                }
            }
            defineProperties = function(obj, props) {
                for (var prop in props) {
                    defineProperty(obj, prop, props[prop]);
                }
                return obj
            }
        }
    }

    function Tmpler(tpl, data) {
    	var self = this;
    	self.tpl = tpl || EMPTY;
    	self.data = data || {};
		self.cache = {};
        //延迟刷新存储的key
        self.bxRefreshKeys = [];
        //子模板数组
        self.bxSubTpls = [];
        // 开始解析
        self.bxIParse();
    }

    Tmpler.prototype = {
    	constructor: Tmpler,
        bxIParse: function() {
            var self = this;
            var tpl = self.tpl;
            var data = self.data;
            var node;

            if (typeof tpl === 'string') {
                if (tpl.charAt(0) === '.' || tpl.charAt(0) === '#' || tpl === 'body') {
                    node = $(tpl);
                }
            } else {
                node = tpl;
            }

            if (node && node.length) {
                tpl = node.html();
            }

            // tpl直接是innerHTML
            // brix3 方式编译模版
            self.tpl = self.bxIBuildTpl(tpl);
            self.bxData = self.bxIBuildData(data);
        },
         /**
         * 编译模板
         * @private
         */
        bxIBuildTpl: function(tpl) {
        	var self = this;
        	var tempTpl;
        	if (tpl) {
        		tpl = self.bxISubTpl(tpl);
        		self.bxIBuildSubTpls(tpl, self.bxSubTpls);
        	}
        	return tpl;
        },
       /**
         * 为bx-datakey自动生成bx-subtpl
         * @param  {String} tpl 模板
         * @return {String}     替换后的模板
         * @private
         */
        bxISubTpl: function(tpl) {
            return tpl.replace(/(bx-subtpl=["'][^"']+["'])/ig, EMPTY)
                .replace(/(bx-datakey=["'][^"']+["'])/ig, function(match) {
                    return 'bx-subtpl="brix_subtpl_' + S.guid() + '" ' + match
                })
        },
       /**
         * 获取模板中的innerHTML
         * @param  {String} tpl    模板字符串
         * @param  {String} tag    节点的tag，如：div
         * @param  {Number} s_pos  开始查找的位置
         * @param  {Number} offset 偏移量
         * @return {Object}        {html:'',e_pos:12}
         * @private
         */
        bxIInnerHTML: function(tpl, tag, s_pos, offset) {
            var s_tag = '<' + tag
            var e_tag = '</' + tag + '>'

            var s_or_pos = s_pos

            var e_pos = s_pos
            var e_next_pos = s_pos

            s_pos = s_pos - offset
            s_pos = tpl.indexOf(s_tag, s_pos)
            var s_next_pos = s_pos + 1

            while (true) {
                s_pos = tpl.indexOf(s_tag, s_next_pos);
                e_pos = tpl.indexOf(e_tag, e_next_pos);

                if (s_pos == -1 || s_pos > e_pos) {
                    break
                }
                s_next_pos = s_pos + 1
                e_next_pos = e_pos + 1
            }
            return {
                html: tpl.substring(s_or_pos, e_pos),
                e_pos: e_pos + e_tag.length
            }
        },
       /**
         * 对节点中的bx-datakey解析，构建模板和数据配置
         * @param {String} tpl  需要解析的模板
         * @param {Array} subTpls 子模板集合
         * @private
         */
        bxIBuildSubTpls: function(tpl, subTpls) {
            var self = this
            var r = '<([\\w]+)\\s+[^>]*?bx-subtpl=["\']([^"\']+)["\']\\s+bx-datakey=["\']([^"\']+)["\']\\s*[^>]*?>'

            // r += '(<\\1[\\s\\S]*>[\\s\\S]*</\\1>)*'

            // r += '</\\1>'

            var reg = new RegExp(r, "ig")
            var m = reg.exec(tpl)

            if (m) {
                var datakey = m[3]
                var offset = m[0].length
                var obj = self.bxIInnerHTML(tpl, m[1], reg.lastIndex, offset)

                var subTpl = {
                    name: m[2],
                    datakey: datakey,
                    tpl: obj.html,
                    subTpls: []
                }
                subTpls.push(subTpl)
                //递归编译子模板的子模板
                self.bxIBuildSubTpls(obj.html, subTpl.subTpls)
                //递归编译子模板
                self.bxIBuildSubTpls(tpl.substring(0, reg.lastIndex - offset) + tpl.substr(obj.e_pos), subTpls)
            }
        },

       /**
         * 编译数据，设置bxData对象
         * @private
         */
        bxIBuildData: function(data) {
            var self = this
            var props = {}
            var fn = function(k) {
                props[k] = {
                    get: function() {
                        return data[k]
                    },
                    set: function(v) {
                        data[k] = v
                        if (!S.inArray(k, self.bxRefreshKeys)) {
                            self.bxRefreshKeys.push(k)
                        }

                        // 每次改变属性，都会进行更新操作，那么当属性很多时，会不会影响性能，两种方法
                        // 1. 设置timer
                        // 2. 控制权移出，即将重新渲染方法交给setChunkData方法
                    }
                }
            }
            if (data) {
                self.bxRefresh = true //数否刷新
                for (var prop in data) {
                    fn(prop)
                }
                return defineProperties({}, props)
            }
        },

        /**
         * 局部刷新
         * @param {Node} el 模板根节点
         * @param {Array} subTpls 子模板集合
         * @param {Array} keys 更新的key
         * @param {Object} data 数据
         * @param {Object} 当前brix实例 
         * @private
         */
        bxIRefreshTpl: function(subTpls, keys, data, host) {
            var self = this
            var el = host.get('el')
            var bxRefreshTpl = function(name) {

                var cache = self.cache[name]
                
                if (!cache || !cache.bxRefresh) {
                    return
                }

                var nodes = cache.bxRefreshNodes

                if (nodes) {
                    // fire events
                    //S.each(nodes, function(node) {
                    nodes.each(function(node) {
                        if (cache.subTpl.tpl) {
                            //渲染方式，目前支持html，append，prepend
                            var renderType = node.attr('bx-rendertype') || 'html'
                            host.fire('beforeRefreshTpl', {
                                node: node,
                                renderType: renderType
                            })

                            //重新设置局部内容

                            if (renderType == 'html') {
                                node.empty();
                            }
                            //TODO  这里遇到自定义标签貌似会有问题。等以后再说吧
                            node[renderType](S.trim(self.bxRenderTpl(cache.subTpl.tpl, data)))

                            /**
                             * @event afterRefreshTpl
                             * 局部刷新后触发
                             * @param {KISSY.Event.CustomEventObject} e
                             */
                            host.fire('afterRefreshTpl', {
                                node: node,
                                renderType: renderType
                            })
                        }
                    });
                }
            }


            S.each(subTpls, function(v) {
                var cache
                // 先从缓存进行处理
                if (cache = self.cache[v.name]) {
                    if (cache.bxRefresh) {
                        bxRefreshTpl(v.name)
                    }
                    return
                }

                cache = self.cache[v.name] = {}

                var datakeys = S.map(v.datakey.split(','), function(str) {
                    return S.trim(str)
                })

                //是否包含的表示符
                var flg = false

                for (var i = 0; i < datakeys.length; i++) {
                    if (flg) {
                        break
                    }
                    for (var j = 0; j < keys.length; j++) {
                        if (datakeys[i] == keys[j]) {
                            flg = true
                            break
                        }
                    }
                }

                if (flg) {
                    var nodes = $('[bx-subtpl=' + v.name + ']')

                    //如果el本身也是tpl，则加上自己
                    if (el.attr('bx-subtpl') == v.name) {
                        //$.add(el, nodes);
                        nodes = el.add(nodes)
                    }

                    cache.bxRefreshNodes = nodes
                    cache.bxRefresh = true
                    cache.subTpl = v
                    bxRefreshTpl(v.name)

                } else if (v.subTpls && v.subTpls.length) {
                    cache.bxRefresh = true
                    self.bxIRefreshTpl(v.subTpls, keys, data, host)
                }

            });
        },

        /**
         * 模板和数据渲染成字符串
         * @param  {Object} data 数据
         * @return {String} html片段
         * @private
         */
        bxRenderTpl: function(tpl, data) {
            var self = this
            var f = crox_js(tpl)
            return f(data)
        }
    };

    return Tmpler

}, {
	requires: ["node"]
})