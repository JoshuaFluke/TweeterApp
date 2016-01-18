'use strict';

var app = angular.module('tweeterApp', []);

app.directive('jfMainApp', function () {
  return {
    restrict: 'EA',
    templateUrl: 'partials/jfMainApp.html',
    scope: {},
    controllerAs: 'jfMainCtrl',
    controller: function (twitterService) {
      var self = this;
      twitterService.initialize();
      this.authenticated = twitterService.isReady();
      this.successfulSubmissions = [];
      this.failedSubmissions = [];

      this.authenticate = function () {
        twitterService.connectTwitter().then(function() {
          self.authenticated = twitterService.isReady();
        });
      };

      this.tweet = function (tweetMsg) {
        if (tweetMsg === undefined) {
          tweetMsg = '';
        }

        this.isValidTweet(tweetMsg, function (err) {
          if (err) {
            alert(err);
            self.failedSubmissions.push({
              tweet: tweetMsg
            });
          } else {
            twitterService.postTweet(tweetMsg)
              .then(function (tweet) {
                self.successfulSubmissions.push({
                  id_str: tweet.id_str,
                  tweet:  tweet.text
                });
              });
          }
        });
      };

      this.isValidTweet = function (tweet, callback) {
        var containsMicrosoft;
        var containsWindows;
        var containsAWS;

        if (tweet.indexOf('Microsoft') !== -1) {
          containsMicrosoft = true;
        }
        if (tweet.indexOf('Windows') !== -1) {
          containsWindows = true;
        }
        if (tweet.indexOf('AWS') !== -1) {
          containsAWS = true;
        }

        if (tweet.length > 140) {
          return callback('Tweet more than 140 characters');
        }

        if (tweet.length < 5) {
          return callback('Tweet less than 5 characters');
        }

        if (containsAWS) {
          // valid
          return callback();
        }

        if (containsMicrosoft || containsWindows) {
          return callback('Contains Microsoft or Windows');
        }

        // valid
        return callback();
      };

    },
    link: function (scope, element, attrs, ctrl) {
    }
  };
});

app.service('twitterService', function ($http, $q) {
  var applicationId = '40R_N812UhrnKamvlzBTein12hs';
  var authorizedTwitter = false;

  this.initialize = function () {
    OAuth.initialize(applicationId, {
      cache: true
    });
    authorizedTwitter = OAuth.create('twitter');
  };

  this.isReady = function () {
    return (authorizedTwitter);
  };

  this.connectTwitter = function () {
    var deferred = $q.defer();
    OAuth.popup('twitter', {
      cache: true
    }, function (error, result) {
      if (error) {
        alert('There was a problem connecting to twitter');
      } else {
        authorizedTwitter = result;
        deferred.resolve();
      }
    });
    return deferred.promise;
  };

  this.postTweet = function (newTweet) {
    var deferred = $q.defer();
    var url = '/1.1/statuses/update.json';

    authorizedTwitter.post(url, {
      data: {
        status: newTweet
      }
    })
      .done(function (data) {
        deferred.resolve(data);
      })
      .fail(function (err) {
        deferred.reject(err);
      });

    return deferred.promise;
  };

  this.clearCache = function () {
    OAuth.clearCache('twitter');
    authorizedTwitter = false;
  };

});

app.directive('jfTwitterSubmissions', function () {
  return {
    restrict: 'EA',
    template: '<div ng-repeat="item in submissions">' +
              '<div class="submission_id" ng-show="item.id_str">Submission id_str: {{ item.id_str }}</div>' +
              '<div class="submission_tweet">Submission text: {{ item.tweet }}</div>' +
              '</div>',
    scope: {
      submissions: '='
    },
    link: function (scope, element, attrs, ctrl) {
    }
  };
});


