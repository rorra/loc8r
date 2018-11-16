angular.module('loc8rApp', []);

const _isNumeric = function (n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
};

const formatDistance = function () {
  return function (distance) {
    let numDistance, unit;
    if (distance && _isNumeric(distance)) {
      if (distance > 1) {
        numDistance = parseFloat(distance).toFixed(1);
        unit = 'km';
      } else {
        numDistance = parseInt(distance * 1000,10);
        unit = 'm';
      }
      return numDistance + unit;
    } else {
      return "?";
    }
  };
};

const ratingStars = function() {
  return {
    scope: {
      thisRating: '=rating'
    },
    templateUrl: '/angular/rating-stars.html'
  };
};

const geolocation = function() {
  const getPosition = function(cbSuccess, cbError, cbNoGeo) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(cbSuccess, cbError);
    } else {
      cbNoGeo();
    }
  };
  return {
    getPosition: getPosition
  };
}

const locationListCtrl = function($scope, loc8rData, geolocation) {
  $scope.message = "Checking your location";

  $scope.getData = function(position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    $scope.message = "Searching for nearby places";
    loc8rData.locationByCoords(lat, lng)
      .success(data => {
        $scope.message = data.length > 0 ? "" : "No locations found";
        $scope.data = { locations: data };
      })
      .error(e => {
        $scope.message = "Sorry, something's gone wrong ";
      });
  };

  $scope.showError = function(error) {
    $scope.$apply(function() {
      $scope.message = error.message;
    });
  };

  $scope.noGeo = function() {
    $scope.$apply(function() {
      $scope.message = "Geolocation not supported for this browser";
    });
  }

  geolocation.getPosition($scope.getData, $scope.showError, $scope.noGeo);
};

const loc8rData = function($http) {
  const locationByCoords = function(lat, lng) {
    return $http.get(`/api/locations?lng=${lng}&lat=${lat}&maxDistance=100000000`);
  };
  return {
    locationByCoords: locationByCoords
  };
};

angular
  .module('loc8rApp')
  .controller('locationListCtrl', locationListCtrl)
  .filter('formatDistance', formatDistance)
  .directive('ratingStars', ratingStars)
  .service('loc8rData', loc8rData)
  .service('geolocation', geolocation);