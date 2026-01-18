# About This Branch (`final`)

This branch represents the most complete and functional version of the RPGKeeper v1.x codebase. It consolidates work
from several unmerged feature branches and includes modifications to make the application runnable as an archive site.

## What's Changed

- **Google Authentication**: Mozilla Persona (the original auth provider) was shut down in 2016. Authentication has been
  replaced with Google OAuth. Only existing users can sign in (closed to new registrations).
- **Ported Game Systems**: The Generic and Edge of the Empire (EotE) systems have been ported in and are fully functional
  alongside the original D&D 4th Edition system.
- **Dashboard Improvements**: Merged from `ccase-dashboard-redesign` - improved character list with thumbnails, favorites,
  and action buttons.
- **Equipment System**: Merged from `feature-ccase-new-equipment` - full magic item management including add/edit modals
  and inventory tracking.
- **File-based Sessions**: Sessions are now stored on disk instead of in memory for production reliability.
- **Docker Support**: Includes Dockerfile for containerized deployment.
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

1. Install Node.js 10+ (tested most recently with Node 24)
2. `npm install`
3. `npm install -g grunt-cli`
4. Create a `.env` file with your Google OAuth credentials:
   ```
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   GOOGLE_CALLBACK_URL=http://localhost:8081/auth/google/callback
   ```
5. `grunt watch`
6. Open `http://localhost:8081` and sign in with Google

## Docker

Build and run with Docker:

```bash
docker build -t rpgkeeper-archive .

docker run -d \
  -p 8081:8081 \
  -e GOOGLE_CLIENT_ID=your-client-id \
  -e GOOGLE_CLIENT_SECRET=your-client-secret \
  -e GOOGLE_CALLBACK_URL=https://your-domain.com/auth/google/callback \
  -v /path/to/server-db:/app/server/db \
  -v /path/to/sessions:/app/server/sessions \
  -v /path/to/eote-db:/app/systems/eote/db \
  -v /path/to/generic-db:/app/systems/generic/db \
  rpgkeeper-archive
```

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

## Contributions

Feel free to fork and make improvements. I'm pretty much open to anything.
