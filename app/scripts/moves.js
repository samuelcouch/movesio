angular.module('moves', [])
  .controller('movesController', function($scope) {
    Parse.initialize("endFPswOSsCN37MBloqoBjGvQWpmO6XsvQtV0cZ0", "lQiHSY3tM2hjdFSTEzfxV0dMfHCBT8n82zRwYDfu");
    $scope.startups = [];
    $scope.startupsArray = [];

    $scope.printStartupsArray = function () {
      console.log($scope.startupsArray);
    }

    $scope.getStorage = function(callback) {
      chrome.storage.sync.get(null, function(result) {
        return result;
      });
    }

    $scope.printStorage = function() {
      console.log('printing storage');
      chrome.storage.sync.get(null, function(result) {
        console.log(result);
      });
      // $scope.getStorage(function(result) {
      //   console.log(result);
      // });
    }

    $scope.saveToStorage = function() {
      var arr = [];
      arr = $scope.startupsArray;
      chrome.storage.sync.set({'startupsArray': ["twitter.com", "firebase.com", "parse.com"]}, function() {});
    }

    //512 max items so only grab that many from parse

    $scope.appendToStorage = function(startup) {
      chrome.storage.sync.get(null, function(result) {
        //forsome reason this prints the new results with startup pushed
        console.log(result);
        result.startupsArray.push(startup);
        chrome.storage.sync.set({'startupsArray': result.startupsArray}, function() {$scope.syncStartups()});
      });
    }

    $scope.saveStartup = function() {
      $scope.appendToStorage($scope.startupURL);
    }

    $scope.addStartupsToPageFromArray = function (newStartups, callback) {
      console.log('add startups to page from array: ')
      console.log(newStartups);
      for (var i = 0; i < newStartups.length; i++) { 
        var startup = newStartups[i];
        $scope.startupsArray.push(startup);
        $scope.startupsArray = _.uniq($scope.startupsArray, function(startup) {
          return startup;
        });
        $scope.$apply();
      }
    }

    $scope.addStartupsFromStorage = function(callback) {
      chrome.storage.sync.get(null, function(result) {
        $scope.startupsArray = result.startupsArray;
        $scope.$apply();
      });

      // console.log('adding startups from storage')
      // $scope.getStorage(function(result) {
      //   console.log(result.startupsArray);
      //   $scope.addStartupsToPageFromArray(result.startupsArray);
      // })
    }

    $scope.syncStartups = function () {
      $scope.addStartupsFromStorage();
    }
    $scope.syncStartups();

    $scope.loadStartupsFromParse = function() {
      var Startups = Parse.Object.extend("Startups");
      var startups = new Parse.Query(Startups);
      startups.find({
        success: function(startups) {
          for (var i = 0; i < startups.length; i++) { 
            var startup = startups[i];
            $scope.startupsArray.push(startup);
            $scope.startupsArray = _.uniq($scope.startupsArray, function(startup) {
              return startup.get('url');
            });
            $scope.$apply();
            //console.log($scope.startupsArray);
          }
          //console.log(startups);
          // The object was retrieved successfully.
        },
        error: function(object, error) {
          // The object was not retrieved successfully.
          // error is a Parse.Error with an error code and message.
        }
      });      
    }
    //$scope.loadStartupsFromParse();

  });








/*
angular.module('todoApp', [])
  .controller('TodoController', ['$scope', function($scope) {
    $scope.todos = [
      {text:'learn angular', done:true},
      {text:'build an angular app', done:false}];
 
    $scope.addTodo = function() {
      $scope.todos.push({text:$scope.todoText, done:false});
      $scope.todoText = '';
    };
 
    $scope.remaining = function() {
      var count = 0;
      angular.forEach($scope.todos, function(todo) {
        count += todo.done ? 0 : 1;
      });
      return count;
    };
 
    $scope.archive = function() {
      var oldTodos = $scope.todos;
      $scope.todos = [];
      angular.forEach(oldTodos, function(todo) {
        if (!todo.done) $scope.todos.push(todo);
      });
    };
  }]);
*/

/*
angular.module('project', ['ngRoute', 'firebase'])
 
.value('fbURL', 'https://angularjs-projects.firebaseio.com/')
 
.factory('Projects', function($firebase, fbURL) {
  return $firebase(new Firebase(fbURL)).$asArray();
})
 
.config(function($routeProvider) {
  $routeProvider
    .when('/', {
      controller:'ListCtrl',
      templateUrl:'list.html'
    })
    .when('/edit/:projectId', {
      controller:'EditCtrl',
      templateUrl:'detail.html'
    })
    .when('/new', {
      controller:'CreateCtrl',
      templateUrl:'detail.html'
    })
    .otherwise({
      redirectTo:'/'
    });
})
 
.controller('ListCtrl', function($scope, Projects) {
  $scope.projects = Projects;
})
 
.controller('CreateCtrl', function($scope, $location, $timeout, Projects) {
  $scope.save = function() {
      Projects.$add($scope.project).then(function(data) {
          $location.path('/');
      });
  };
})
 
.controller('EditCtrl',
  function($scope, $location, $routeParams, Projects) {
    var projectId = $routeParams.projectId,
        projectIndex;
 
    $scope.projects = Projects;
    projectIndex = $scope.projects.$indexFor(projectId);
    $scope.project = $scope.projects[projectIndex];
 
    $scope.destroy = function() {
        $scope.projects.$remove($scope.project).then(function(data) {
            $location.path('/');
        });
    };
 
    $scope.save = function() {
        $scope.projects.$save($scope.project).then(function(data) {
           $location.path('/');
        });
    };
});
*/