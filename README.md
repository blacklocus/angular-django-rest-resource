angular-django-rest-resource
============================

An AngularJS module that provides a resource-generation service similar to ngResource, but optimized for the
Django REST Framework. The biggest features:

* Trailing slashes allowed in the resource URLs per the Django community norm.
* The `isArray` methods like `query` allow for paginated responses. The pages will be streamed into the promise object.

Installation
-----
Download angular-django-rest-resource.js and put it in your project. You may also do it the bower way:

    bower install angular-django-rest-resource

Usage
-----
Do this somewhere in your application HTML:

    <script src="angular-django-rest-resource.js"></script>

Add this AngularJS module as a dependency to your AngularJS application:

    angular.module('app', [..., 'djangoRESTResources']);

(where 'app' is whatever you've named your AngularJS application).


In your controllers and anything that needs to interact with the Django REST Framework services, inject the `djResource`
service. Then you can create class-like objects that represent (and interact with) your Django REST Framework resources:

    var Poll = djResource('/polls/:pollId/', {pollId:'@id'});

    var myPoll = Poll.get({pollId:86}, function() {
        myPoll.readByUser = true;
        myPoll.$save();
    });

For complete API, consider the documentation for [$resource](http://docs.angularjs.org/api/ngResource.$resource), as
this module follows the API quite closely.