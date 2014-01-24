//----------------------------------------------------------------------------------------------------------------------
// Brief description for models.js module.
//
// @module models.js
//----------------------------------------------------------------------------------------------------------------------

var om = require('omega-models');
var fields = om.fields;
var SimpleBackend = om.backends.Simple;
var ns = om.namespace('rpgkeeper').backend(new SimpleBackend({root: './server/db'}));

//----------------------------------------------------------------------------------------------------------------------

module.exports = ns.define({
    User: {
        name: fields.Dict({ default: {} }),
        email: fields.String({ require: true }),

        fullname: fields.Property(function()
        {
            var name = "";

            if(this.name)
            {
                if(this.name.first)
                {
                    name += this.name.first;
                } // end if

                if(this.name.middle)
                {
                    var middle = " " + this.name.middle;
                    if(!name)
                    {
                        middle = this.name.middle;
                    } // end if

                    name += middle;
                } // end if

                if(this.name.last)
                {
                    var last = " " + this.name.last;
                    if(!name)
                    {
                        last = this.name.last;
                    } // end if

                    name += last;
                } // end if
            } // end if

            return name;
        }),

        nick: fields.Property(function()
        {
            var nick = this.email;

            if(this.name && this.name.nick)
            {
                nick = this.name.nick;
            } // end if

            return nick;
        })
    },

    System: {
        name: fields.String(),
        shortname: fields.String({ key: true }),
        description: fields.String()
    },

    BaseCharacter: {
        name: fields.String(),
        system: fields.Reference({ model: 'System' }),
        user: fields.Reference({ model: 'User' }),

        // This is the url to the image
        portrait: fields.String(),

        // This is the url to the image
        thumbnail: fields.String(),

        // These fields aren't currently used, but could be nice to expose.
        description: fields.String(),
        backstory: fields.String(),

        // Adds it to the favorites menu
        favorite: fields.Boolean({ default: false })
    }
}); // end exports

//----------------------------------------------------------------------------------------------------------------------