define("brix/tmpler", ["brix/base", "brix/event"], function (require) {
	// body...	
	
	var $ = Zepto;
	var Base = require("brix/base");
    var Event = require("brix/event");
    var Mix = Base.mix;

	var defineProperty = Object.defineProperty
    var defineProperties = Object.defineProperties

    try {
        defineProperty({}, '_', {})
    } catch (e) {
    	if ('__defineGetter__' in {}) {
            defineProperty = function(obj, prop, desc) {
                if ('get' in desc) {
                    obj.__defineGetter__(prop, desc.get)
                }
                if ('set' in desc) {
                    obj.__defineSetter__(prop, desc.set)
                }
            }
            defineProperties = function(obj, props) {
                for (var prop in props) {
                    defineProperty(obj, prop, props[prop])
                }
                return obj
            }
        }
    }

	function Tmpler(tpl, data) {
		var self = this

        data = data || {}

		if (tpl) {

			self.tpl = tpl
			self.data = data
            self.cache = {}
		    //延迟刷新存储的key
	        self.bxRefreshKeys = []
	        //子模板数组
	        self.bxSubTpls = []
	        self.bxBrickTpls = {}

	        self.bxStoreTpls = {}

	        self.bxIParse();

		}
	}


    Tmpler.prototype = {
        bxIParse: function() {
            var self = this;
            var tpl = self.tpl;
            var data = self.data;
            var node, inDom = false;

            if (typeof tpl === 'string') {
                if (tpl.charAt(0) === '.' || tpl.charAt(0) === '#' || tpl === 'body') {
                    node = $(tpl);
                }
            } else {
                node = tpl;
            }

            if (node && node.length) {
				if (node[0].nodeName === 'SCRIPT') {
					tpl = node.html();
	            } else {
	            	inDom = true;
	            }

	            if (!inDom) {
	            	// brix3 方式编译模版
	            	self.tpl = self.bxIBuildTpl(tpl);
                    node = $(self.tpl);
	            }
	            self.inDom = inDom;
	            self.node = node;
	            //build data
	            self.bxData = self.bxIBuildData(data);
            }

        },
        /**
         * 编译模板
         * @private
         */
        bxIBuildTpl: function(tpl) {
            var self = this
            var tempTpl

            if (tpl) {
                tpl = self.bxIBuildStoreTpls(tpl)
                tpl = self.bxITag(tpl)
                tpl = self.bxISubTpl(tpl)
                tempTpl = self.bxIBuildBrickTpls(tpl)
            } 

            if (tempTpl) {
                tempTpl = self.bxISelfCloseTag(tempTpl)

                // fix 原来的方式对于@brix_brix_tag_\d+@brix里面含有bx-datakey的未进行处理

                $.each(self.bxBrickTpls, function(k, v) {
                    self.bxIBuildSubTpls((v.start + v.middle + v.end), self.bxSubTpls);
                })

                self.bxIBuildSubTpls(tempTpl, self.bxSubTpls)
            }

            return tpl

        },

        /**
         * 构建{{#bx-store-tpl-id}}……{{/bx-store-tpl}}的存储
         * @param  {String} tpl 需要解析的模板
         * @return {String}      替换后的模板
         * @private
         */
        bxIBuildStoreTpls: function(tpl) {
            var self = this
            var storeTplRegexp = /\{\{#bx\-store\-tpl\-([^\}]*)?\}\}([\s\S]*?)\{\{\/bx\-store\-tpl\}\}/ig

            tpl = tpl.replace(storeTplRegexp, function(g, id, html) {
                self.bxStoreTpls[id] = html
                return ''
            })
            return tpl
        },
        /**
         * 为模板中的组件打上tag标识
         * @param  {String} tpl 模板
         * @return {String}     替换后的模板
         * @private
         */
        bxITag: function(tpl) {
            return tpl.replace(/(bx-tag=["'][^"']+["'])/ig, '')
                .replace(/(bx-name=["'][^"']+["'])/ig, function(match) {
                    return match + ' bx-tag="brix_tag_' + Base.guid() + '"'
                })
        },
        /**
         * 为bx-datakey自动生成bx-subtpl
         * @param  {String} tpl 模板
         * @return {String}     替换后的模板
         * @private
         */
        bxISubTpl: function(tpl) {
            return tpl.replace(/(bx-subtpl=["'][^"']+["'])/ig, '')
                .replace(/(bx-datakey=["'][^"']+["'])/ig, function(match) {
                    return 'bx-subtpl="brix_subtpl_' + Base.guid() + '" ' + match
                })
        },
        /**
         * 获取模板中的innerHTML，替换原来的构建正则
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
         * 编译子组件模板
         * @param  {String} tpl 模板
         * @return {String}     替换后的模板
         * @private
         */
        bxIBuildBrickTpls: function(tpl) {
            var self = this
            var r = '<([\\w]+)\\s+[^>]*?bx-name=["\']([^"\']+)["\']\\s+bx-tag=["\']([^"\']+)["\']\\s*[^>]*?>'
            var reg = new RegExp(r, "ig")

            var m = reg.exec(tpl)
            if (m) {
                var offset = m[0].length
                var obj = self.bxIInnerHTML(tpl, m[1], reg.lastIndex, offset)
                self.bxBrickTpls[m[3]] = {
                    start: m[0],
                    middle: obj.html,
                    end: '</' + m[1] + '>'
                }

                tpl = tpl.substring(0, reg.lastIndex - offset) + '@brix@' + m[3] + '@brix@' + tpl.substr(obj.e_pos)
                return self.bxIBuildBrickTpls(tpl)
            }
            return tpl
        },
        /**
         * 获取属性模板
         * @param  {String} tpl 模板
         * @return {Object}   存储对象
         * @private
         */
        bxIStoreAttrs: function(tpl) {
            var attrs = {}
            var storeAttr = function(all, attr, str) {
                if (str.indexOf('{{') > -1 && str.indexOf('}}') > 0) {
                    attrs[attr] = str
                }
            }
            tpl.replace(/([^\s]+)?=["']([^'"]+)["']/ig, storeAttr)
            return attrs;
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

            var reg = new RegExp(r, "ig")
            var m = reg.exec(tpl)
            var replacer = function(all, bx) {
                var o = self.bxBrickTpls[bx]
                return o.start + o.middle + o.end
            }

            if (m) {
                var datakey = m[3]
                var offset = m[0].length
                var obj = self.bxIInnerHTML(tpl, m[1], reg.lastIndex, offset)

                var subTpl = {
                    name: m[2],
                    datakey: datakey,
                    tpl: obj.html.replace(/@brix@(brix_tag_\d+)@brix@/ig, replacer),
                    attrs: self.bxIStoreAttrs(m[0]),
                    subTpls: []
                }
                subTpls.push(subTpl)
                //self.bxIAddWatch(datakey)
                //递归编译子模板的子模板
                self.bxIBuildSubTpls(obj.html, subTpl.subTpls)
                //递归编译子模板
                self.bxIBuildSubTpls(tpl.substring(0, reg.lastIndex - offset) + tpl.substr(obj.e_pos), subTpls)
            }
        },
        /**
         * 自闭合标签处理
         * @param  {String} tpl 模板
         * @private
         */
        bxISelfCloseTag: function(tpl) {
            var self = this
            var r = '<(input|img)\\s+[^>]*?bx-subtpl=["\']([^"\']+)["\']\\s+bx-datakey=["\']([^"\']+)["\']\\s*[^>]*?/?>'
            var reg = new RegExp(r, "ig")

            tpl = tpl.replace(reg, function(all, tag, name, datakey) {
                self.bxSubTpls.push({
                    name: name,
                    datakey: datakey,
                    attrs: self.bxIStoreAttrs(all)
                })
                return ''
            })
            return tpl
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
                        if (!~$.inArray(k, self.bxRefreshKeys)) {
                            self.bxRefreshKeys.push(k)
                        }

                        // 每次改变属性，都会进行更新操作，那么当属性很多时，会不会影响性能，两种方法
                        // 1. 设置timer
                        // 2. 控制权移出，即将重新渲染方法交给setChunkData方法
                        
                        if (self.timer) {
                            clearTimeout(self.timer)
                        }
                        self.timer = setTimeout(function() {
                            if (self.bxRefresh) {
                                self.bxIRefreshTpl(self.bxSubTpls, self.bxRefreshKeys, data)
                                self.bxRefreshKeys = []
                            }
                            self.bxRefresh = true
                        }, 100)
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
         * @private
         */
        bxIRefreshTpl: function(subTpls, keys, data) {
            var self = this
            var el = self.node
            
            var bxRefreshTpl = function(name) {

                var cache = self.cache[name]
                
                if (!cache || !cache.bxRefresh) {
                    return
                }

                var nodes = cache.bxRefreshNodes

                if (nodes) {
                    // fire events
                    nodes.forEach(function(node) {
                        node = $(node)
                        if (cache.subTpl.tpl) {
                            //渲染方式，目前支持html，append，prepend
                            var renderType = node.attr('bx-rendertype') || 'html'
                            self.fire('beforeRefreshTpl', {
                                node: node,
                                renderType: renderType
                            })

                            //重新设置局部内容

                            if (renderType == 'html') {
                                node.empty();
                            }
                            //TODO  这里遇到自定义标签貌似会有问题。等以后再说吧
                            node[renderType]($.trim(self.bxRenderTpl(cache.subTpl.tpl, data)))

                            /**
                             * @event afterRefreshTpl
                             * 局部刷新后触发
                             * @param {KISSY.Event.CustomEventObject} e
                             */
                            self.fire('afterRefreshTpl', {
                                node: node,
                                renderType: renderType
                            })
                        }

                        $.each(cache.subTpl.attrs, function(k, v) {
                            var val = $.trim(self.bxRenderTpl(v, data))
                            if (node[0].nodeName == 'INPUT' && k == 'value') {
                                node.val(val)
                            } else if(k == 'class'){
                                node[0].className = val
                            } 
                            else {
                                node.attr(k, val)
                            }
                        })

                    });
                }
            }


            $.each(subTpls, function(i, v) {
                var cache
                // 先从缓存进行处理
                if (cache = self.cache[v.name]) {
                    if (cache.bxRefresh) {
                        bxRefreshTpl(v.name)
                    }
                    return
                }

                cache = self.cache[v.name] = {}

                var datakeys = $.map(v.datakey.split(','), function(str) {
                    return $.trim(str);
                });

                //是否包含的表示符
                var flg = false

                for (var i = 0; i < datakeys.length; i++) {
                    for (var j = 0; j < keys.length; j++) {
                        if (datakeys[i] == keys[j]) {
                            flg = true;
                            break;
                        }
                    }
                }

                if (flg) {
                    var nodes = $('[bx-subtpl=' + v.name + ']');

                    //如果el本身也是tpl，则加上自己
                    if (el.attr('bx-subtpl') == v.name) {
                        $.add(el, nodes);
                    }

                    cache.bxRefreshNodes = nodes
                    cache.bxRefresh = true
                    cache.subTpl = v
                    bxRefreshTpl(v.name)

                } else if (v.subTpls && v.subTpls.length) {
                    cache.bxRefresh = true
                    self.bxIRefreshTpl(v.subTpls, keys, data)
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
            return tpl + ' for refreshRender Tpl' + Base.guid()
        }
    }

    Mix(Tmpler.prototype, Event)

    return Tmpler;

});