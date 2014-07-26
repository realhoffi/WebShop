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