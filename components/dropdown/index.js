define("components/dropdown/index", function (require, exports, module) {
    // body...
    
    var Base = require("brix/base");
    var Brick = require("brix/brick");

    function DropDown() {
        DropDown.superclass.constructor.apply(this, arguments);
    }

    Base.extend(DropDown, Brick, {
        initialize: function() {

        }
    });

    return DropDown;

})