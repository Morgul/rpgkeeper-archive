# About This Branch (`final`)

This branch represents the most complete and functional version of the RPGKeeper v1.x codebase. It consolidates work
from several unmerged feature branches and includes modifications to make the application runnable without the defunct
Mozilla Persona authentication service.

## What's Changed

- **Authentication Bypass**: Mozilla Persona (the original auth provider) was shut down in 2016. The "Sign In" button is
  now a dropdown that lists all existing users and allows creating new users - no external authentication required.
- **Dashboard Improvements**: Merged from `ccase-dashboard-redesign` - improved character list with thumbnails, favorites,
  and action buttons.
- **Equipment System**: Merged from `feature-ccase-new-equipment` - full magic item management including add/edit modals
  and inventory tracking.
- **Bug Fixes**: Various fixes for powers, feats, alerts, and other UI components.

## Other Branches

- **`on-production`**: The last deployed production version. Requires Persona authentication (no longer functional).
- **`master`**: A rewrite that split game systems into installable npm packages. See:
  - [Morgul/rpgkeeper-archive](https://github.com/Morgul/rpgkeeper-archive) - Core application
  - [Morgul/rpgkeeper-generic](https://github.com/Morgul/rpgkeeper-generic) - Generic system
  - [Morgul/rpgkeeper-dnd4e](https://github.com/Morgul/rpgkeeper-dnd4e) - D&D 4th Edition system
  - [Morgul/rpgkeeper-eote](https://github.com/Morgul/rpgkeeper-eote) - Edge of the Empire system
- **`ccase-dashboard-redesign`**: Dashboard improvements (merged into this branch).
- **`feature-ccase-equipment`**: Early equipment work using omega-models ORM.
- **`feature-ccase-new-equipment`**: Equipment system rewrite for trivialdb (merged into this branch).

## Running This Version

1. Install Node.js (v10.x - v14.x recommended for compatibility)
2. `npm install`
3. `npm install -g grunt-cli`
4. `grunt watch`
5. Open `http://localhost:8081` and use the "Sign In" dropdown to select or create a user

-----

# RPGKeeper

I'm an avid table-top gamer. I'm also a bit forgetful, and I lose things... especially little pieces of paper. Throw
the fact that I'm a professional programmer into the mix, and you've pretty much got RPGKeeper. I wanted a site that
allowed me to store all my characters digitally. I got something that worked for DnD... but DnD is a horrible system. (
Put your +1 Mace of Troll Smiting down. I don't mean from an RPG standpoint, I mean from a computer science standpoint.
Or, more specifically, it's a system that revolves around exceptions to rules, not the rules themselves. The data model
for DnD 4th Ed is so incredibly complex, I've crashed a UML program with it. It's a horrible system to try and model.)
So I spent two month focused on that, without giving most of the UI enough love.

Then I decided to redo everything in node.js and Angular JS. Everything's going much better this time around, and slowly
but surely I'm getting this to the point where I can use it. We're still a long way off from being able to release it to
the public... but we're getting there. One new feature at a time.

## Tests

Hahahahahaha.... you're funny.

No, seriously, there are no tests. I won't claim this is "untestable", but frankly, there's not a lot of testible code,
and I want to implement features, not tests.

## Running

1. Install node 10.X
2. Checkout the code.
3. `npm install`
4. `npm install -g grunt-cli`
5. `grunt watch`

That should be it!

## Contributions

Feel free to fork and make improvements. I'm pretty much open to anything.
