//------------------------------------------------------------------------------
// Persona Controller
//------------------------------------------------------------------------------

function PersonaServiceFactory($http, $location, $timeout)
{
	function PersonaService()
	{
        var self = this;
		this.userUrl = '/user';
        this.loginUrl = '/auth/login-persona';
		this.logoutUrl = '/auth/logout-persona';

        this._getUser()
            .then(function()
            {
                // Register for the Persona events
                navigator.id.watch({
                    loggedInUser: self.email,
                    onlogin: self._onLogIn.bind(self),
                    onlogout: self._onLogOut.bind(self)
                });
            })
            .catch(function()
            {
                // Register for the Persona events
                navigator.id.watch({
                    loggedInUser: self.email,
                    onlogin: self._onLogIn.bind(self),
                    onlogout: self._onLogOut.bind(self)
                });
            });
	} // end PersonaService

    PersonaService.prototype = {
        get email(){ return (this.currentUser || {}).email; }
    }; // end prototype

    PersonaService.prototype._getUser = function()
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

	PersonaService.prototype._onLogIn = function(assertion)
	{
		var self = this;
		$http.post(this.loginUrl, { assertion: assertion })
			.success(function(data)
			{
				self.currentUser = data.user;
                location.reload();
			})
			.error(function(err)
			{
				console.error('Logout Failed:', err);
				self.signout();
			});
	}; // end _onLogIn

	PersonaService.prototype._onLogOut = function()
	{
		var self = this;
		$http.post(this.logoutUrl, {})
			.success(function()
			{
				self.signout();
				self.currentUser = null;
				$location.path('/');
			})
			.error(function(err)
			{
				console.error('Logout Failed:', err);
			});
	}; // end _onLogOut

	PersonaService.prototype.signin = function()
	{
		// Easy form of a safe $apply.
		$timeout(function()
		{
			navigator.id.request();
		});
	}; // end signin

	PersonaService.prototype.signout = function()
	{
		// Easy form of a safe $apply.
		$timeout(function()
		{
			navigator.id.logout();
		});
	}; // end signout

	return new PersonaService();
} // end PersonaServiceFactory

//------------------------------------------------------------------------------

angular.module('rpgkeeper.systems').service('PersonaService', [
	'$http',
	'$location',
	'$timeout',
	PersonaServiceFactory
]);


//------------------------------------------------------------------------------
