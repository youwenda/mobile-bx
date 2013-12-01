define("brix/app", ["brix/brick", "brix/base"], function (require) {
	// body...
	var $ = Zepto;
	var EMPTY = "";
	var Base = require("brix/base");
	var Brick = require("brix/brick");

	var Mix = Base.mix;

	var Has = function(owner, prop) {
	    return owner ? Object.hasOwnProperty.call(owner, prop) : owner; //false 0 null '' undefined
	};

	var Cfg = {};

	var GSObj = function(o) {
	    return function(k, v, r, f) {
	        switch (arguments.length) {
	            case 0:
	                r = o;
	                break;
	            case 1:
	                if ($.isPlainObject(k)) {
	                    r = Mix(o, k);
	                    f = 1;
	                } else {
	                    r = Has(o, k) ? o[k] : null;
	                }
	                break;
	            case 2:
	                if (v === null) {
	                    delete o[k];
	                    r = v;
	                } else {
	                    o[k] = r = v;
	                    f = 1;
	                }
	                break;
	        }
	        if (f) {
	        	// 目前支持简单的components配置即可
	        	if (Has(o, 'components')) {
	        		Mix(seajs.data.paths, o);
	        	}
	        }
	        return r;
	    };
	};

    function returnJSON(s) {
        if (s) {
            return (new Function('return ' + s))();
        } else {
            return {};
        }
    }

	function stamp(el) {
        if (!el.attr('id')) {
            var id;
            //判断页面id是否存在，如果存在继续随机。
            while ((id = Base.guid('brix_brick_')) && $('#' + id)) {}
            el.attr('id', id);
        }
        return el.attr('id');
    }

	function addBehavior(callback) {
		var self = this;
		var el = self.get('el');
		var useList = [];
		var brickNodes = $('[bx-name]', el);

        //如果el本身也是tpl，则加上自己
        if (el.attr('bx-name')) {
            $.add(el, brickNodes);
        }

        brickNodes.forEach(function(brickNode) {
        	brickNode = $(brickNode);
			if (brickNode.attr('bx-behavior') != 'true') {
			    var id = stamp(brickNode),
			        name = brickNode.attr('bx-name'),
			        config = returnJSON(brickNode.attr('bx-config'));

			    brickNode.attr('bx-behavior', 'true');
			    self.__bricks.push({
			        id: id,
			        name: name,
			        config: config
			    });
			    useList.push(name);
			}
        });

        if (self.__bricks.length) {

        	// 此处加载css
        	// 通过配置来判断是否加载css, 调试的时候加载css, 线上的时候直接通过外链来进行引入

        	console.info(self.__bricks);

        	// seajs.use(useList.join(','), function() {
        	// 	if (self.__destroyed) {
        	// 		return;
        	// 	}

        	// 	$.each(self.__bricks, function(i, v) {

        	// 	});

        	// });

        } else {
        	if (callback) {
        		callback.call(self);
        	}
        }
	}

	var App;

	(function() {
		var instance;

		App = function App() {
			var self = this;
			if (instance) {
				return instance;
			}

			instance = self;

			App.superclass.constructor.apply(self, arguments);

		};

		Base.extend(App, Brick, {
			initialize: function() {
				var self = this;
				self.__isReady = false;
				self.__readyList = [];
				self.__bricks = [];
				self.__isAddBehavior = false;
				self.__destroyed = false;
				self.__counter = 0;

				if (self.__rendered && !self.__isAddBehavior) {
					self.__isAddBehavior = true;
					addBehavior.call(self);
				}
			}
		});

		Mix(App, {
			config: GSObj(Cfg),
			boot: function(el, data) {
				if ($.isString(el)) {
					el = $(el);
				}
				var app = new App({
					tpl: el.html(),
					data: data
				});
			}
		});


	})();

	return App;
})