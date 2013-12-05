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