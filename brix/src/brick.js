define("brix/brick", ["brix/base", "brix/tmpler", "brix/bx-event"], function (require) {
	// body...
    var $ = Zepto;
	var EMPTY = "";
	var Base = require("brix/base");
	var Tmpler = require("brix/tmpler");
    var BxEvent = require("brix/bx-event");
	var Mix = Base.mix;
    var Noop = function() {}

	function Brick() {
		Brick.superclass.constructor.apply(this, arguments);
		initializer.call(this);
	}

    function initializer() {
        var self = this;
        var tpl = self.get("tpl");
        var data = self.get("data");

        if (!self.__tmpler) {
            var tmpler = new Tmpler(tpl, data);
            self.__tmpler = tmpler;
            if (tmpler.inDom) {
                self.set("el", tmpler.tpl);
            }
        }
        
        // if (!self.__cache) {
        //     var cache = new Cache();
        //     self.__cache = cache;
        //     cache.add(self);
        // }

        if (self.get("autoRender") || tmpler.inDom) {
            render.call(self);
        }
    }

    function render() {
        var self = this;
        if (!self.__rendered) {
            doRender.call(this);
            self.__rendered = true;

            BxEvent.bxDelegate(self);

            // 组件的初始化方法
            self.initialize();
        }
    }

    function doRender() {
        var self = this;
        var tmpler = self.__tmpler;
        debugger
        if (tmpler.tpl && !tmpler.inDom) {
            var container = self.get("container");
            var el = self.get("el");
            // hack render Tmpl Engine
            var html = tmpler.tpl;
            var node;

            if (!el || el.length == 0) {
                var elID = Base.guid("brix_"); //'brix_' + S.guid(); 
                node = $(html);

                if (node.length > 1) {
                    node = $("<div id='" + elID + "'></div>").append(node);
                } else {
                    elID = node.attr("id") || elID;
                    node.attr("id", elID);
                }
                container.append(node);
                self.set("el", "#" + elID);
            } else {
                container.append(html);
            }

        }
    }


	Brick.ATTRS = {
        /**
         * 组件根节点
         * @type {Node}
         */
        el: {
            getter: function(s) {
                if (typeof s === "string") {
                    s = $(s);
                }
                return s;
            }
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
         * 容器节点
         * @cfg {String}
         */
        container: {
            value: "body",
            getter: function(s) {
                if (typeof s === "string") {
                    s = $(s);
                }
                return s;
            }
        },
        /**
         * 模板代码，如果是已经渲染的html元素，则提供渲染html容器节点选择器
         * @cfg {String}
         */
        tpl: {
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
         * 模板数据
         * @cfg {Object}
         */
        data: {
            value: false
        }
    };

	Base.extend(Brick, Base, {

        initialize: Noop,
        destructor: Noop,

        setChunkData: function(data) {
            var self = this;
            var tmpler = self.__tmpler;
            var k, bxData;
            if (tmpler) {
                bxData = tmpler.bxData;
                for (k in data) {
                    if (bxData.hasOwnProperty(k)) {
                        bxData.key = data[k];
                    }
                }
            }
        },

        destroy: function() {
            var self = this;
            self.__tmpler = null;
            self.__rendered = null;
        }

	});

    // 要尽量减少原型上的函数
    // Mix(Brick.prototype, BxEvent);
	
	return Brick;
	
});