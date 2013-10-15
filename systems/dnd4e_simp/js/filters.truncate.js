//----------------------------------------------------------------------------------------------------------------------
// Truncates a string to a specific number of characters
//
// @module filters.truncate.js
//----------------------------------------------------------------------------------------------------------------------

module.filter('truncate', function()
{
    return function(string, limit)
    {
        if (!limit || string.length <= limit)
        {
            return string;
        }
        else
        {
            console.log('limit:', limit);
            return string.slice(0, limit - 3) + '...'
        } // end if
    }
});

//----------------------------------------------------------------------------------------------------------------------