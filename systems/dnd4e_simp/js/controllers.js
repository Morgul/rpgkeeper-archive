//----------------------------------------------------------------------------------------------------------------------
// Controllers for the simple DnD4e System
//
// @module controllers.js
//----------------------------------------------------------------------------------------------------------------------

module.controller('SimpDnD4eCtrl', function($scope)
{
    $scope.updatePending = false;

    // Watch for changes on the character, and send updates.
    $scope.$watch('sysChar', function(oldChar, newChar)
    {
        if(oldChar != newChar)
        {
            updateChar($scope);
        } // end if
    }, true);

    $scope.calcAbilityMod = function(abilityScore)
    {
        abilityScore = abilityScore || 0;
        return Math.floor((abilityScore - 10) / 2);
    };

    $scope.calcSkill = function(skill)
    {
        var character = $scope.sysChar;
        return character.halfLevel + character[skill.ability + 'Mod'] +
                + (skill.trained ? 2 : 0) + skill.racial + skill.misc - skill.armorPenalty;
    };

    $scope.chooseDropboxImage = function()
    {
        Dropbox.choose({
            linkType: "preview",
            extensions: ["images"],
            success: function(files)
            {
                $scope.$apply(function()
                {
                    // This is a little obnoxious. Dropbox does not support non-expiring direct links from their
                    // chooser api, however, any file in dropbox can be directly linked to. The solution? Rewrite
                    // the url. Thankfully their 'preview' url is almost exactly the same format as url we need.
                    var link = files[0].link.replace('https://www.', 'https://dl.');
                    $scope.character.portrait = link;
                    $scope.socket.emit('update_character', $scope.character, function(error)
                    {
                        if(error)
                        {
                            console.error(error);
                        } // end if
                    });
                });
            } // end success
        });
    }; // end chooseDropboxImage
}); // end SimpDnD4eCtrl

// We do a few tricky things here; basically, once we get called once, we set a timer, and wait until people stop
// calling `updateChar` before we send out the update. Not only does this help with rate limiting, but it also prevents
// odd behavior where we update the model while the user is still trying to type, stomping on their changes.
function updateChar($scope)
{
    function doUpdate()
    {
        $scope.systemSocket.emit("update_character", $scope.sysChar, function(error, character)
        {
            $scope.$apply(function()
            {
                if(error)
                {
                    $scope.alerts.push(error);
                }
                else
                {
                    if(character)
                    {
                        $scope.sysChar = character;
                    } // end if
                } // end if
            });
        });
    } // end doUpdate

    function waitForUpdatesToStop()
    {
        if(!$scope.timerID)
        {
            $scope.timerID = setInterval(function()
            {
                if($scope.updatesIncoming)
                {
                    $scope.$apply(function()
                    {
                        // Set this to false, so we can detect if we're called again.
                        $scope.updatesIncoming = false;
                    });
                }
                else
                {
                    clearInterval($scope.timerID);
                    $scope.timerID = undefined;
                    doUpdate();
                } // end if
            }, 500);
        } // end if
    } // end wait


    $scope.updatesIncoming = true;
    waitForUpdatesToStop();
} // end updateChar


//----------------------------------------------------------------------------------------------------------------------