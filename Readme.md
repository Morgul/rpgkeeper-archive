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

Install node, checkout the code, do `npm install` and then `npm start`. Oh, you will want to have MongoDB running, and
will most likely want to import the json files in `/db/`.

## Contributions

Feel free to fork and make improvements. I'm pretty much open to anything.
