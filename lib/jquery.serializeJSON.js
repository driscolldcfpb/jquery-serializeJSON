(function($) {

    'use strict';

    $.fn.serializeJSON = function(options) {

        var counters = {},
            serialized = {};

        options = $.extend({
            excludeEmpty: false
        }, options || {});

        //new
        var f, $form;
        f = $.serializeJSON;
        $form = this;

        //setup  parse options
        var parOpts = f.setupOpts(options);

        this.serializeArray().forEach(function(input) {
            if (options.excludeEmpty && !$.trim(input.value)) {
                return;
            }
            var ob = serialized;
            // Split name into tokens, fixing numeric indexes where neccessary
            input.name.split('[').map(function(token) {
                token = token.replace(']', '');
                if (token === '') {
                    if (typeof counters[input.name] === 'undefined') {
                        counters[input.name] = 0;
                    }
                    token = counters[input.name]++;
                }
                else if (token.match(/^[0-9]+$/)) {
                    token = parseInt(token, 10);
                }
                return token;
            }).
            // Add to serialized object
            forEach(function(value, index, arr) {

                if (index === arr.length-1) {

                    var type;
                    //if html 5 input type of number then gets converted to number if string
                    //<input  type="number" />
                    if (!input.type) {
                        type = f.attrFromInputWithName($form, input.name, 'type');
                    }
                    ob[value] = f.parseValue(input.value,"",type,parOpts);
                    return;
                }
                if (typeof ob[value] === 'undefined') {
                    ob[value] = (typeof arr[index + 1] === 'number' ? [] : {});
                }
                ob = ob[value];
            });
        });

        return serialized;
    };

    $.serializeJSON = {

        defaultOptions: {

            defaultTypes: {
                "string":  function(str) { return String(str); },
                "number":  function(str) { return Number(str); }
            }
        },

        setupOpts: function(options) {
            var opt, validOpts, defaultOptions, optWithDefault, parseAll, f;
            f = $.serializeJSON;

            if (options == null) { options = {}; }   // options ||= {}
            defaultOptions = f.defaultOptions || {}; // defaultOptions

            // Helper to get the default value for this option if none is specified by the user
            optWithDefault = function(key) { return (options[key] !== false) && (options[key] !== '') && (options[key] || defaultOptions[key]); };

            return {
                typeFunctions: $.extend({}, optWithDefault('defaultTypes'))
            };
        },

        parseValue: function(valStr, inputName, type, opts) {
            //currently support <input  type="number" in HTML 5
            //will convert value string to number if input type is number
            var f, parsedVal;
            f = $.serializeJSON;
            parsedVal = valStr; // if no parsing is needed, the returned value will be the same

            if (opts.typeFunctions && type && opts.typeFunctions[type]) { // use a type if available
                parsedVal = opts.typeFunctions[type](valStr);

            } else if (opts.typeFunctions && opts.typeFunctions["string"]) { // make sure to apply :string type if it was re-defined
                parsedVal = opts.typeFunctions["string"](valStr);
            }


            return parsedVal;
        },

        attrFromInputWithName: function($form, name, attrName) {
            var escapedName, selector, $input, attrValue;
            escapedName = name.replace(/(:|\.|\[|\]|\s)/g,'\\$1'); // every non-standard character need to be escaped by \\
            selector = '[name="' + escapedName + '"]';
            $input = $form.find(selector).add($form.filter(selector)); // NOTE: this returns only the first $input element if multiple are matched with the same name (i.e. an "array[]"). So, arrays with different element types specified through the data-value-type attr is not supported.
            return $input.attr(attrName);
        },
        isObject:          function(obj) { return obj === Object(obj); }, // is it an Object?
        isUndefined:       function(obj) { return obj === void 0; }, // safe check for undefined values
        isValidArrayIndex: function(val) { return /^[0-9]+$/.test(String(val)); }, // 1,2,3,4 ... are valid array indexes
        isNumeric:         function(obj) { return obj - parseFloat(obj) >= 0; }, // taken from jQuery.isNumeric implementation. Not using jQuery.isNumeric to support old jQuery and Zepto versions

    };

})(jQuery);
