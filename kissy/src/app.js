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