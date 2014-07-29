'use strict'
ausgabenmanager.directive('fileModel', ['$parse', function ($parse) {
	return {
		restrict: 'A',
		link: function (scope, element, attrs) {
			var model = $parse(attrs.fileModel);
			var modelSetter = model.assign;

			element.bind('change', function () {
				scope.$apply(function () {
					modelSetter(scope, element[0].files[0]);
				});
			});
		}
	};
}]);
ausgabenmanager.directive("pageInitialize", function () {
	return {
		restrict: "A",
		template: "<div class='row'><div class='col-md-12'><div class='row'><div class='loader'><div class='dot'></div><div class='dot'></div><div class='dot'></div><div class='dot'></div><div class='dot'></div><div class='dot'></div><div class='dot'></div><div class='dot'></div><div class='dot'></div><div class='dot'></div><div class='dot'></div></div></div></div></div>",
		link: function (scope, element, attrs) {
			scope.$watch('isAppLoading', function (newValue, oldValue, scope) {
				scope.isAppLoading ? element.show() : element.hide();

			});
		}
	};
});
ausgabenmanager.directive('genericLink', function () {
	return {
		transclude: true,
		restrict: 'AEC',
		replace: true,
		scope: {
			link: "@",
			name: "@",
			iconclass: "@"
		},
		template: '<div class="row"><div class="col-md-12"><div class="panel panel-success"><a class="list-group-item active menue-entry" href="{{ link }}"><b> <span class="{{ iconclass }}"></span> <span> {{ name }} {{ message }}</span></b></a><span ng-transclude></span></div></div></div>',
		link: function (scope, elem, attrs) {
			scope.name = attrs.name;
			scope.link = attrs.link;
			scope.iconclass = attrs.iconclass;
			elem.bind('click', function () {
//				elem.css('background-color', 'white !important');
			});
			elem.bind('mouseover', function () {
				//	elem.css('background-color', 'red !important');
				//	elem.css('cursor', 'pointer');
			});
		},
		controller: function ($scope) {
//			$scope.message = " XX"
//			this.setMessage = function (message) {
//				$scope.message = message;
//			}
		}
	};
});
ausgabenmanager.directive('genericLinkChild', function ($timeout) {
	return {
		replace: true,
		restrict: 'AEC',
		require: '^genericLink',
		scope: {
			link: "@",
			name: "@",
			iconclass: "@"
		},
		link: function (scope, elem, attrs, parentCtrl) {
			scope.name = attrs.name;
			scope.link = attrs.link;
			scope.iconclass = attrs.iconclass;
//			$timeout(function () {
//				parentCtrl.setMessage('I am the child!')
//			}, 1000)
		},
		template: ' <a href="{{ link }}" class="list-group-item"><span class="{{ iconclass }} sub-menue-entry"></span ><strong><span class="padding-left-10px sub-menue-entry">{{ name }}</span></strong> </a>'
	}
});
ausgabenmanager.directive('ngRightClick', function ($parse) {
	return function (scope, element, attrs) {
		var fn = $parse(attrs.ngRightClick);
		element.bind('contextmenu', function (event) {
			scope.$apply(function () {
				event.preventDefault();
				element.find("textarea").focus();
				fn(scope, {$event: event});
			});
		});
	};
});
ausgabenmanager.directive('focusOnVisibility', function () {
	return function (scope, element, attrs) {
		//Watch the showInput model
		scope.$watch('note.edit', function () {
			//If the model changes to true, focus on the element
			if (scope.note.edit) {
				//Assumes that the element has the focus method
				//If not, then you can have your own logic to focus here
				element.focus();
			}
		});
	};
});