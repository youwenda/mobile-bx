KISSY.add("brix/base", function (S, Event) {
    // body...
    var EMPTY = "";

    function Base(config) {
        var self = this,
            c = self.constructor;
        // save user config
        // self.userConfig = config;

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
        if (typeof method == 'string') {
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
                // 属性对象会 merge
                // a: {y: {getter: fn}}, b: {y: {value: 3}}
                // b extends a
                // =>
                // b {y: {value: 3, getter: fn}}
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
                // 用户设置会调用 setter/validator 的，但不会触发属性变化事件
                setInternal.call(self, attr, config[attr]);
            }
        }
    }

    function setInternal(name, value) {
        var self = this,
            setValue = undefined,
        // if host does not have meta info corresponding to (name,value)
        // then register on demand in order to collect all data meta info
        // 一定要注册属性元数据，否则其他模块通过 _attrs 不能枚举到所有有效属性
        // 因为属性在声明注册前可以直接设置值
            attrConfig = self.__attrs[name] || (self.__attrs[name] = {});
            setter = attrConfig['setter'];

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

    // kissy 1.4的写法，要支持么

    // Base.extend = function (px, sx) {

    //     var F = function() {
    //         F.superclass.constructor.apply(this, arguments);
    //     };

    //     return extend(F, Base, px, sx);

    // };
    
    // 还是要支持简单实用的extend主义
    
    S.augment(Base, Event);

    S.augment(Base, {
        /**
         * Sets the value of an attribute.
         * @param {String|Object} name attribute 's name or attribute name and value map
         * @param [value] attribute 's value
         * @param {Object} [opts] some options
         * @param {Boolean} [opts.silent] whether fire change event
         * @param {Function} [opts.error] error handler
         * @return {Boolean} whether pass validator
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
         * @param {String} name attribute 's name
         * @return {*}
         */
        get: function (name) {
            var self = this,
                attrVals = self.__attrVals,
                attrConfig,
                getter, ret;

            attrConfig = self.__attrs[name] || (self.__attrs[name] = {});
            getter = attrConfig['getter'];

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