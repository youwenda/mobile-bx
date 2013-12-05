KISSY.add("brix/brick", function (S, Node, Base, Tmpler, BxEvent) {
    // body...
    var $ = Node.all;
    var EMPTY = "";
    var Noop = function() {};
    var DEATROY_ACTION = ["remove", "empty"];

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
            var elID;

            if (pagelet) {
                elID = self.get("el").attr("bx-name");
                pagelet.fire(elID + "_" + name, data, remove, lastToFirst);
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
            var elID;

            if (pagelet) {
                elID = self.get("el").attr("bx-name");
                pagelet.on(elID + "_" + name, fn, insert);
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