// Define the namespace if it's not already defined

var QUALDASH = QUALDASH || {};
var $Q = QUALDASH; 

$Q.classes = {};

/**
 * Simple class inheritance.
 * Does not handle calling the superclass constructor.
 * Defines superclass on the prototype.
 * Stores in $P.classes[name of init function].
 * @param {?Function} superclass - the parent class
 * @param {!Function} init - the initialization function
 * @param {Object} prototype - the prototype methods
 */
$Q.defineClass = function(superclass, init, prototype) {
    init.prototype = Object.create(superclass && superclass.prototype);
    Object.getOwnPropertyNames(prototype).forEach(function(name) {
        Object.defineProperty(init.prototype, name, Object.getOwnPropertyDescriptor(prototype, name));});
    init.prototype.constructor = init;
    init.prototype.superclass = superclass;
    init.prototype.classname = init.name;
    $Q.classes[init.name] = init;
    return init;};


/**
 * ajax wrapper to read and write JSON data from/to file
 * @param {Object} url - the file path
 * @param {!Function} callback - the callback function once read/write finsihes
 * @param {Object} params - ajax call parameters
 */

$Q.handleJSON = function(url, callback, params) {
    var call, config, count = 0;
    config = {
        dataType: 'json',
        url: url,
        async: false,
        error: function(jqXHR, textStatus, errorThrown) {
            if ('timeout' === textStatus) {
                call();}
            else {
                console.error(errorThrown);
                console.error(textStatus);}},
        timeout: 120000,
        success: callback};
    if (params) {config = $.extend(config, params);}
    call = function call() {
                    ++count;
                    if (count < 5) {
                        $.ajax(config);}};
    call();};

/**
 * Create a function that retrieves a specific key from an object.
 * @param {string} key - the key to return
 * @returns {getter}
 */
$Q.getter = function (key) {return function(object) {return object[key];};};


$Q.Control_getDisplayVariable = function(){
	return $Q.displayVariable; 
};

$Q.getUrlVars = function() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    if(window.location.href.indexOf('audit') < 0)
      vars['audit'] = 'minap'; 
    return vars;
}; 

