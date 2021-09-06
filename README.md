# Nekuda
> A set of varied tools for creating your own static-site workflow.

## About

### The name
In Hebrew, the word _nekuda_ (נקודה) can be translated as "a point". This project is like the _dot_ in the letter "i", or the _period_ at the end of a sentence. It's just a bag of puzzle pieces.

## Usage

Not on NPM just yet. Install via the GitHub URL.
```sh
<npm install | yarn add> https://github.com/binyamin/nekuda
```

### Provides
- **Engine (class)** - extends `nunjucks.Environment` ([source](https://github.com/binyamin/nekuda/blob/main/lib/Engine.js))
  - Adds a "renderToFile" convenience method.
- **Server (class)** - static file server ([source](https://github.com/binyamin/nekuda/blob/main/lib/Server.js))
- **Utils.fs** - various filesystem functions ([source](https://github.com/binyamin/nekuda/blob/main/lib/common/fs.js))

## 💬 Open for comments
I'd love to hear your thoughts. If you're comfortable, share with me your initial impression [via GitHub discussions](https://github.com/binyamin/nekuda/discussions) or email (see my profile).

_Note: I'm not just blowing steam when I ask for your opinion. Discussion is part of why I love open-source._

## 🗺️ Roadmap
- Look over JSDoc comments
- Test the code somehow
- Make `index.js` a viable tool (see comments in file)
- Generate typedefs

## Legal
Any source-code is provided under the terms of [the MIT license](https://github.com/binyamin/nekuda/blob/main/LICENSE). Copyright 2021 [Binyamin Aron Green](https://binyam.in).
