KISSY.add("brix/brick", function (S, Node, Base, Tmpler, BxEvent) {
    // body...
    var $ = Node.all;
    var EMPTY = "";
    var Noop = function() {};
    var DEATROY_ACTION = ['remove', 'empty'];

    var start;
    function Brick() {
        start = (+new Date());
        Brick.superclass.constructor.apply(this, arguments);
        initializer.call(this);
        console.info((+new Date) - start);
    }

    function initializer() {
        var self = this;
        var el = self.get("el");
        var tpl = self.get("tpl");
        var data = self.get("data");

        if (!self.__tmpler) {
            self.__tmpler = new Tmpler(tpl, data);
        }

        self.set("tpl", self.__tmpler.tpl || el.html());

        if (self.get("autoRender")) {
            render.call(self);
        }
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
            // var html = tmpler.bxRenderTpl(tpl, data);
            var html = tpl;
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

        destroy: function() {
            var self = this;
            
            // 调用每个brick实例的destructor方法
            self.destructor();
            
            if (self.__rendered) {
                BxEvent.bxUndelegate(self);
                var action = self.get("destroyAction");
                if (S.inArray(action, DEATROY_ACTION)) {
                    el[action]();
                }
            }

            self.off();
            self.__tmpler = null;
            self.__rendered = null;
        }

    });
    
    return Brick;

}, {
    requires: ["node", "brix/base", "brix/tmpler", "brix/bx-event"]
});