angular-django-rest-resource
============================

An AngularJS module that provides a resource-generation service similar to ngResource, but optimized for the
Django REST Framework. The biggest features:

* Trailing slashes allowed in the resource URLs per the Django community norm.
* The `isArray` methods like `query` allow for paginated responses. The pages will be streamed into the promise object.

Installation
------------
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

Launching The Testing and Demonstration App
-------------------------------------------
This is a work in progress, but it gives some hints on usage in a real world scenario.

1. Create a Python virtualenv.
2. Install the dependencies:

        cd test
        pip install -r requirements.txt

3. Set up the database and fixtures (if first time use).

        python manage.py syncdb

4. Run the server:

        python manage.py runserver

5. Point web browser to `http://localhost:8000/`.