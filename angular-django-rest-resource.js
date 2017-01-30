'use strict';

//Portions of this file:
//Copyright (c) 2010-2012 Google, Inc. http://angularjs.org
//Those portions modified, used, or copied under permissions granted by the MIT license. See:
// https://raw.github.com/angular/angular.js/9480136d9f062ec4b8df0a35914b48c0d61e0002/LICENSE

/**
 * @ngdoc overview
 * @name djangoRESTResources
 * @description
 */

/**
 * @ngdoc object
 * @name djangoRESTResources.djResource
 * @requires $http
 *
 * @description
 * A factory for generating classes that interact with a Django REST Framework backend.
 *
 * Identical in operation to AngularJS' ngResource module's $resource object except for the following:
 *  - If an isArray=True request receives a JSON _object_ containing a `count` field (instead of a JS array), assume
 *  that the REST endpoint has `paginate_by` set. The results are then streamed a page at a time into the promise object
 *  and any success callbacks are deferred until the last page returns successfully.
 *  - URLs are assumed to have the trailing slashes, as is the Django way of doing things.
 *
 * # Installation
 * Include `angular-django-rest-resource.js`
 *
 * Load the module:
 *
 *        angular.module('app', ['djangoRESTResources']);
 *
 * now you inject djResource into any of your Angular things.
 *
 * @param {string} url A parametrized URL template with parameters prefixed by `:` as in
 *   `/user/:username`. If you are using a URL with a port number (e.g.
 *   `http://example.com:8080/api`), it will be respected.
 *
 * @param {Object=} paramDefaults Default values for `url` parameters. These can be overridden in
 *   `actions` methods. If any of the parameter value is a function, it will be executed every time
 *   when a param value needs to be obtained for a request (unless the param was overridden).
 *
 *   Each key value in the parameter object is first bound to url template if present and then any
 *   excess keys are appended to the url search query after the `?`.
 *
 *   Given a template `/path/:verb` and parameter `{verb:'greet', salutation:'Hello'}` results in
 *   URL `/path/greet?salutation=Hello`.
 *
 *   If the parameter value is prefixed with `@` then the value of that parameter is extracted from
 *   the data object (useful for non-GET operations).
 *
 * @param {Object.<Object>=} actions Hash with declaration of custom action that should extend the
 *   default set of resource actions. The declaration should be created in the format of $http.config
 *
 *       {action1: {method:?, params:?, isArray:?, headers:?, ...},
 *        action2: {method:?, params:?, isArray:?, headers:?, ...},
 *        ...}
 *
 *   Where:
 *
 *   - **`action`** – {string} – The name of action. This name becomes the name of the method on your
 *     resource object.
 *   - **`method`** – {string} – HTTP request method. Valid methods are: `GET`, `POST`, `PUT`, `DELETE`,
 *     and `JSONP`.
 *   - **`params`** – {Object=} – Optional set of pre-bound parameters for this action. If any of the
 *     parameter value is a function, it will be executed every time when a param value needs to be
 *     obtained for a request (unless the param was overridden).
 *   - **`url`** – {string} – action specific `url` override. The url templating is supported just like
 *     for the resource-level urls.
 *   - **`isArray`** – {boolean=} – If true then the returned object for this action is an array, see
 *     `returns` section.
 *   - **`transformRequest`** – `{function(data, headersGetter)|Array.<function(data, headersGetter)>}` –
 *     transform function or an array of such functions. The transform function takes the http
 *     request body and headers and returns its transformed (typically serialized) version.
 *   - **`transformResponse`** – `{function(data, headersGetter)|Array.<function(data, headersGetter)>}` –
 *     transform function or an array of such functions. The transform function takes the http
 *     response body and headers and returns its transformed (typically deserialized) version.
 *   - **`cache`** – `{boolean|Cache}` – If true, a default $http cache will be used to cache the
 *     GET request, otherwise if a cache instance built with
 *     {@link http://docs.angularjs.org/api/ng.$cacheFactory $cacheFactory}, this cache will be used for
 *     caching.
 *   - **`timeout`** – `{number}` – timeout in milliseconds.
 *   - **`withCredentials`** - `{boolean}` - whether to to set the `withCredentials` flag on the
 *     XHR object. See {@link https://developer.mozilla.org/en/http_access_control#section_5
 *     requests with credentials} for more information.
 *   - **`responseType`** - `{string}` - see
 *   {@link https://developer.mozilla.org/en-US/docs/DOM/XMLHttpRequest#responseType requestType}.
 *
 * @returns {Object} A resource "class" object with methods for the default set of resource actions
 *   optionally extended with custom `actions`. The default set contains these actions:
 *
 *       { 'get':    {method:'GET'},
 *         'save':   {method:'POST', method_if_field_has_value:['id', 'PUT']},
 *         'update': {method:'PUT'},
 *         'query':  {method:'GET', isArray:true},
 *         'remove': {method:'DELETE'},
 *         'delete': {method:'DELETE'} };
 *
 *   Calling these methods invoke an {@link http://docs.angularjs.org/api/ng.$http $http} with the specified http
 *   method, destination and parameters. When the data is returned from the server then the object is an
 *   instance of the resource class. The actions `save`, `remove` and `delete` are available on it
 *   as  methods with the `$` prefix. This allows you to easily perform CRUD operations (create,
 *   read, update, delete) on server-side data like this:
 *   <pre>
        var User = djResource('/user/:userId', {userId:'@id'});
        var user = User.get({userId:123}, function() {
          user.abc = true;
          user.$save();
        });
     </pre>
 *
 *   Invoking a djResource object method immediately returns an empty reference (object or array depending
 *   on `isArray`). Once the data is returned from the server the existing reference is populated with the actual data.
 *
 *   The action methods on the class object or instance object can be invoked with the following
 *   parameters:
 *
 *   - HTTP GET "class" actions: `DjangoRESTResource.action([parameters], [success], [error])`
 *   - non-GET "class" actions: `DjangoRESTResource.action([parameters], postData, [success], [error])`
 *   - non-GET instance actions:  `instance.$action([parameters], [success], [error])`
 *
 *
 *   The DjangoRESTResource instances and collection have these additional properties:
 *
 *   - `$then`: the `then` method of a {@link http://docs.angularjs.org/api/ng.$q promise} derived from the underlying
 *     {@link http://docs.angularjs.org/api/ng.$http $http} call.
 *
 *     The success callback for the `$then` method will be resolved if the underlying `$http` requests
 *     succeeds.
 *
 *     The success callback is called with a single object which is the
 *     {@link http://docs.angularjs.org/api/ng.$http http response}
 *     object extended with a new property `resource`. This `resource` property is a reference to the
 *     result of the resource action — resource object or array of resources.
 *
 *     The error callback is called with the {@link http://docs.angularjs.org/api/ng.$http http response} object when
 *     an http error occurs.
 *
 *   - `$resolved`: true if the promise has been resolved (either with success or rejection);
 *     Knowing if the DjangoRESTResource has been resolved is useful in data-binding.
 */
var djangoRESTResources = angular.module('djangoRESTResources', ['ng']).
  factory('djResource', ['$http', '$parse', function($http, $parse) {
    var DEFAULT_ACTIONS = {
      'get':    {method:'GET'},
      'save':   {method:'POST', method_if_field_has_value: ['id','PUT']},
      'update': {method:'PUT'},
      'query':  {method:'GET', isArray:true},
      'remove': {method:'DELETE'},
      'delete': {method:'DELETE'}
    };
    var noop = angular.noop,
        forEach = angular.forEach,
        extend = angular.extend,
        copy = angular.copy,
        isFunction = angular.isFunction,
        getter = function(obj, path) {
          return $parse(path)(obj);
        };

    /**
     * We need our custom method because encodeURIComponent is too aggressive and doesn't follow
     * http://www.ietf.org/rfc/rfc3986.txt with regards to the character set (pchar) allowed in path
     * segments:
     *    segment       = *pchar
     *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
     *    pct-encoded   = "%" HEXDIG HEXDIG
     *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
     *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
     *                     / "*" / "+" / "," / ";" / "="
     */
    function encodeUriSegment(val) {
      return encodeUriQuery(val, true).
        replace(/%26/gi, '&').
        replace(/%3D/gi, '=').
        replace(/%2B/gi, '+');
    }


    /**
     * This method is intended for encoding *key* or *value* parts of query component. We need a custom
     * method because encodeURIComponent is too aggressive and encodes stuff that doesn't have to be
     * encoded per http://tools.ietf.org/html/rfc3986:
     *    query       = *( pchar / "/" / "?" )
     *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
     *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
     *    pct-encoded   = "%" HEXDIG HEXDIG
     *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
     *                     / "*" / "+" / "," / ";" / "="
     */
    function encodeUriQuery(val, pctEncodeSpaces) {
      return encodeURIComponent(val).
        replace(/%40/gi, '@').
        replace(/%3A/gi, ':').
        replace(/%24/g, '$').
        replace(/%2C/gi, ',').
        replace(/%20/g, (pctEncodeSpaces ? '%20' : '+'));
    }

    function Route(template, defaults) {
      this.template = template = template + '#';
      this.defaults = defaults || {};
      this.urlParams = {};
    }

    Route.prototype = {
      setUrlParams: function(config, params, actionUrl) {
        var self = this,
            url = actionUrl || self.template,
            val,
            encodedVal;

        var urlParams = self.urlParams = {};
        forEach(url.split(/\W/), function(param){
          if (!(new RegExp("^\\d+$").test(param)) && param && (new RegExp("(^|[^\\\\]):" + param + "(\\W|$)").test(url))) {
              urlParams[param] = true;
          }
        });
        url = url.replace(/\\:/g, ':');

        params = params || {};
        forEach(self.urlParams, function(_, urlParam){
          val = params.hasOwnProperty(urlParam) ? params[urlParam] : self.defaults[urlParam];
          if (angular.isDefined(val) && val !== null) {
            encodedVal = encodeUriSegment(val);
            url = url.replace(new RegExp(":" + urlParam + "(\\W|$)", "g"), encodedVal + "$1");
          } else {
            url = url.replace(new RegExp("(\/?):" + urlParam + "(\\W|$)", "g"), function(match,
                leadingSlashes, tail) {
              if (tail.charAt(0) == '/') {
                return tail;
              } else {
                return leadingSlashes + tail;
              }
            });
          }
        });

        // set the url
        config.url = url.replace(/#$/, '');

        // set params - delegate param encoding to $http
        forEach(params, function(value, key){
          if (!self.urlParams[key]) {
            config.params = config.params || {};
            config.params[key] = value;
          }
        });
      }
    };


    function DjangoRESTResourceFactory(url, paramDefaults, actions) {
      var route = new Route(url);

      actions = extend({}, DEFAULT_ACTIONS, actions);

      function extractParams(data, actionParams){
        var ids = {};
        actionParams = extend({}, paramDefaults, actionParams);
        forEach(actionParams, function(value, key){
          if (isFunction(value)) { value = value(); }
          ids[key] = value.charAt && value.charAt(0) == '@' ? getter(data, value.substr(1)) : value;
        });
        return ids;
      }

      function DjangoRESTResource(value){
        copy(value || {}, this);
      }

      forEach(actions, function(action, name) {
        action.method = angular.uppercase(action.method);
        var hasBody = action.method == 'POST' || action.method == 'PUT' || action.method == 'PATCH';
        DjangoRESTResource[name] = function(a1, a2, a3, a4) {
          var params = {};
          var data;
          var success = noop;
          var error = null;
          var promise;

          switch(arguments.length) {
          case 4:
            error = a4;
            success = a3;
            //fallthrough
          case 3:
          case 2:
            if (isFunction(a2)) {
              if (isFunction(a1)) {
                success = a1;
                error = a2;
                break;
              }

              success = a2;
              error = a3;
              //fallthrough
            } else {
              params = a1;
              data = a2;
              success = a3;
              break;
            }
          case 1:
            if (isFunction(a1)) success = a1;
            else if (hasBody) data = a1;
            else params = a1;
            break;
          case 0: break;
          default:
            throw "Expected between 0-4 arguments [params, data, success, error], got " +
              arguments.length + " arguments.";
          }

          var paginationLimit = params.paginationLimit || null;
          params.paginationLimit = undefined;

          var value = this instanceof DjangoRESTResource ? this : (action.isArray ? [] : new DjangoRESTResource(data));
          var httpConfig = {},
              promise;

          forEach(action, function(value, key) {
            if (key == 'method' && action.hasOwnProperty('method_if_field_has_value')) {
              // Check if the action's HTTP method is dependent on a field holding a value ('id' for example)
              var field = action.method_if_field_has_value[0];
              var fieldDependentMethod = action.method_if_field_has_value[1];
              httpConfig.method =
                (data.hasOwnProperty(field) && data[field] !== null) ? fieldDependentMethod : action.method;
            } else if (key != 'params' && key != 'isArray' ) {
              httpConfig[key] = copy(value);
            }
          });
          httpConfig.data = data;
          route.setUrlParams(httpConfig, extend({}, extractParams(data, action.params || {}), params), action.url);

          function markResolved() { value.$resolved = true; }

          promise = $http(httpConfig);
          value.$resolved = false;

          promise.then(markResolved, markResolved);
          value.$then = promise.then(function(response) {
            // Success wrapper

            var data = response.data;
            var then = value.$then, resolved = value.$resolved;

            var deferSuccess = false;

            if (data) {
              if (action.isArray) {
                value.length = 0;

                // If it's an object with count and results, it's a pagination container, not an array:
                if (data.hasOwnProperty("count") && data.hasOwnProperty("results")) {
                  // Don't call success callback until the last page has been accepted:
                  deferSuccess = true;

                  var paginator = function recursivePaginator(data) {
                    // Ok, now load this page's results:
                    forEach(data.results, function(item) {
                      value.push(new DjangoRESTResource(item));
                    });
                    var morePages = paginationLimit && value.length < paginationLimit;

                    // If there is a next page, go ahead and request it before parsing our results. Less wasted time.
                    if (data.next !== null && morePages) {
                      var next_config = copy(httpConfig);
                      next_config.params = {};
                      next_config.url = data.next;
                      var http_promise = $http(next_config).then(function(next_data) { recursivePaginator(next_data); })
                      if (error) {
                        http_promise.catch(error);
                      }
                    }


                    if (data.next == null || !morePages) {
                      // We've reached the last page, call the original success callback with the concatenated pages of data.
                      (success||noop)(value, response.headers);
                    }
                  };
                  paginator(data);
                } else {
                  //Not paginated, push into array as normal.
                  forEach(data, function(item) {
                    value.push(new DjangoRESTResource(item));
                  });
                }
              } else {
                // Not an isArray action
                copy(data, value);

                // Copy operation destroys value's original properties, so restore some of the old ones:
                value.$then = then;
                value.$resolved = resolved;
                value.$promise = promise;
              }
            }

            if (!deferSuccess) {
              (success||noop)(value, response.headers);
            }

            response.resource = value;
            return response;
          }, error).then.bind(promise);

          return value;
        };


        DjangoRESTResource.prototype['$' + name] = function(a1, a2, a3) {
          var params = extractParams(this),
              success = noop,
              error;

          switch(arguments.length) {
          case 3: params = a1; success = a2; error = a3; break;
          case 2:
          case 1:
            if (isFunction(a1)) {
              success = a1;
              error = a2;
            } else {
              params = a1;
              success = a2 || noop;
            }
          case 0: break;
          default:
            throw "Expected between 1-3 arguments [params, success, error], got " +
              arguments.length + " arguments.";
          }
          var data = hasBody ? this : undefined;
          return DjangoRESTResource[name].call(this, params, data, success, error);
        };
      });

      DjangoRESTResource.bind = function(additionalParamDefaults){
        return DjangoRESTResourceFactory(url, extend({}, paramDefaults, additionalParamDefaults), actions);
      };

      return DjangoRESTResource;
    }

    return DjangoRESTResourceFactory;
  }]);

module.exports = djangoRESTResources;
