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
	     * @example
	     * var T=Magix.mix({},Event);
	        T.on('done',function(e){
	            alert(1);
	        });
	        T.on('done',function(e){
	            alert(2);
	            T.off('done',arguments.callee);
	        });
	        T.on('done',function(e){
	            alert(3);
	        });//监听插入到开始位置

	        T.once('done',function(e){
	            alert('once');
	        });

	        T.fire('done',{data:'test'});
	        T.fire('done',{data:'test2'});
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