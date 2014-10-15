//----------------------------------------------------------------------------------------------------------------------
// Persona login code.
//
// @module persona.js
//----------------------------------------------------------------------------------------------------------------------

$(function()
{
    navigator.id.watch({
        loggedInUser: angular.element('html').scope().user || null,
        onlogin: function(assertion)
        {
            $.ajax({
                type: 'POST',
                url: '/auth/login-persona',
                data: {assertion: assertion},
                success: function(res, status, xhr)
                {
                    console.log("Successfully Logged in!");
                    if(!angular.element('html').scope().user)
                    {
                        window.location.reload();
                    } // end if
                },
                error: function(xhr, status, err)
                {
                    navigator.id.logout();
                    console.error("Login failure: " + err);
                }
            });
        },
        onlogout: function()
        {
            $.ajax({
                type: 'POST',
                url: '/auth/logout-persona',
                success: function(res, status, xhr)
                {
                    // Make sure loggedInUser will get set to null on the next page load.
                    // (That's a literal JavaScript null. Not false, 0, or undefined. null.)
                    window.location.reload();
                },
                error: function(xhr, status, err)
                {
                    console.error("Logout failure: " + err);
                }
            });
        }
    });
});

//----------------------------------------------------------------------------------------------------------------------