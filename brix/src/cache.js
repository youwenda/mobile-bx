define("brix/cache", function  (require) {
	// body...
	var Cache = function() {
        this.list = [];
    };
    Cache.prototype.add = function(entity) {
        var list = this.list;
        if (!list.length) {
            var events = entity.events;
            var el = entity.get('el');
            for (var p in events) {
                Body.act(el, p, false, VOM);
            }
        }
        list['e' + entity.id] = entity;
        list.push(entity);
    };

    Cache.prototype.remove = function(entity) {
        var list = this.list;
        for (var i = list.length - 1; i >= 0; i--) {
            if (list[i] == entity) {
                list.splice(i, 1);
                delete list['e' + entity.id];
                break;
            }
        }
        if (!list.length) {
            var events = entity.events;
            var el = entity.get('el');
            for (var p in events) {
                Body.act(el, p, true, VOM);
            }
        }
    };

    Cache.prototype.get = function(id) {
        var list = this.list;
        return list['e' + id];
    };

    return Cache;
})