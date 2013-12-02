KISSY.add("brix/brick", function (S, Node, Base, Tmpler, BxEvent) {
    // body...
    var $ = Node.all;
    var EMPTY = "";
    var Noop = function() {}
    var start;
    function Brick() {
        start = (+new Date());
        Brick.superclass.constructor.apply(this, arguments);
        initializer.call(this);
        console.info((+new Date) - start)
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
        if (tmpler.tpl && !tmpler.inDom) {
            var container = self.get("container");
            var el = self.get("el");
            // hack render Tmpl Engine
            var html = tmpler.tpl;
            var node;

            if (!el || el.length == 0) {
                var elID = S.guid("brix_"); //'brix_' + S.guid(); 
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

}, {
    requires: ["node", "brix/base", "brix/tmpler", "brix/bx-event"]
});