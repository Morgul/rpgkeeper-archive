//------------------------------------------------------------------------------
// User Service
//------------------------------------------------------------------------------

function UserServiceFactory($http, $location, $timeout)
{
	function UserService()
	{
        var self = this;
		this.userUrl = '/user';

        this._getUser();
	} // end UserService

    UserService.prototype = {
        get email(){ return (this.currentUser || {}).email; }
    }; // end prototype

    UserService.prototype._getUser = function()
    {
        var self = this;
        return $http.get(this.userUrl)
            .success(function(user)
            {
                self.currentUser = user;
            })
            .error(function(error)
            {
                console.error('Failure to get user:', error);
                self.currentUser = undefined;
            });
    }; // end _getUser

	return new UserService();
} // end UserServiceFactory

//------------------------------------------------------------------------------

angular.module('rpgkeeper.systems').service('UserService', [
	'$http',
	'$location',
	'$timeout',
	UserServiceFactory
]);

//------------------------------------------------------------------------------
