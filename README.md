<main>

<style type="text/css">
            footer > div {
                border-top: 1px solid black;
                margin-top: 3vh;
                padding-top: 3vh;
            }
            h1 { font-family: monospace; }
            h2 { font-family: monospace; }
            .bold { font-weight: bolder; }
            .italic { font-style: italic; }
            .mono { font-family: monospace; }
            .sub { vertical-align: sub; }
            .sup { vertical-align: super; }
        </style>
<header>

# podbot

</header> <section>

## <span class="italic super sub">notices your bot</span>

## OwO What's this?

<div>
<span class="bold mono">podbot</span> is a [Discord](https://discordapp.com/) bot written in [TypeScript](https://www.typescriptlang.org/) designed to transpile to [ECMAScript 6](http://es6-features.org/) code and to run on [Node.js](https://nodejs.org/). It currently supports running multiple bots concurrently through relatively simple configuration (this may become easier in the future). It leverages the [discord.js](https://discord.js.org/) API.

</div>
</section> <section>

## Why?

<div>
I created this bot initially just to provide some basic commands for the [PFC Discord server](http://discord.pfc.moe/). Simultaneously, I created a seperate bot to provide other custom commands to the Plush Degenerates Discord server. Eventually I merged both into the same codebase.

</div>
</section> <section>

## What can it do?

<div>
### Current global commands (`Command.Default.ts`)

`4chan [ random | search ]`
:   Searches the catalog of a [4chan](https://www.4chan.org/) board; by default this is [/mlp/](http://boards.4chan.org/mlp/) (configurable in `FourChan.ts`). If no argument or `random` given, then a random thread is returned; otherwise, the first thread that matches the `search` argument is returned along with a random image from that thread.
`db [ random | search ]`
:   Searches [Derpibooru](https://www.derpibooru.org/). If no argument or `random` given, then a random image is returned; otherwise, a random image based on the `search` argument is returned. The best searches on Derpibooru are tag searches and commas (`,`) can be used to "and" tags together.
`google search`
:   Searches [Google](https://www.google.com/) and returns the top three results bsaed on the `search` argument.
`ping`
:   Will show the current and average ping times to the bot's server. The current ping time is based on the timestamp value attached to the command's message and the server's timestamp. The average is directly from the discord.js API. This command can only be used either via DM or in a channel which contains the word "bot" in its name.
`say message`
:   Will force the bot to say <var>message</var> in the current channel. This is exposed primarily for testing and likely won't stay that way for long.
`uptime`
:   Will show the current uptime for the bot according to the discord.js API. This command can only be used either via DM or in a channel which contains the word "bot" in its name.

### Current custom commands for PFC (`pfc.ts`)

`topic topic`
:   This command will reformat and re-state <var>topic</var>, pin that new message to the active channel, and remove the original message. This is intended to making pinning topics to the `#podcast` channel on PFC easier and, as such, will only work if the channel's name is either `#podcast` or `#bot-fuckery`.

### Current custom commands for Plush Degenerates (`plush.ts`)

`thread`
:   This will attempt to search for and then display the most likely candidate for the plush thread on the current [4chan](https://www.4chan.org/) board (by default this is [/mlp/](http://boards.4chan.org/mlp/)). This is accomplished first by searching the catalog for a thread with "plush thread" in either the subject or comment and, if nothing is found, then searching for just the word "plush".

### Other notes

-   Commands can be issued either in a channel, a group DM, or a direct DM. If in a channel or a group DM, then the command must be prefixed by the trigger string (as configured in both `pfc.ts` and `plush.ts` this is `!`). In a DM, the command should not contain the prefix.
-   As configured, the bot is set to log all commands to a local mongodb instance. If you wish to disable this, simply unhook the `any` command from the corresponding bot file (see `pfc.ts` or `plush.ts`). If you wish to configure the logging, see `CommandLogger.ts`.
-   All commands are aliasable, renameable, and overrideable. Additionally, new commands can be added easily. See the files `pfc.ts` and `plush.ts` for examples.

</div>
</section> <section>

## How can I set it up?

<div>
I mean, this really isn't meant for distribution, but if you insist:

1.  Get a Discord API key for a bot by following [these instructions](https://discordapp.com/developers/applications/me).
2.  Configure a `bot.ts` file like I have done for `pfc.ts` and `plush.ts`.
3.  Modify the `Crypt.ts` file.
    -   Set the `secretsDirectory` Path to the top level directory.
    -   Add or remove entries from `botFiles` object to correspond with your bot names.
    -   Set the `keyFile` Path to a file that contains a key that will be used for encryption/decryption.
    -   Modify the `Bots` type to match the bot(s) you are configuring

4.  Create a `.secrets_all.json` file in the top directory with a structure as defined by the `SecretsAll` interface in `Crypt.ts`.
    -   This file will contain the Discord API key for your bot(s).
    -   If you want to access the Google search API, then get a [Custom Search API](https://console.developers.google.com/) key from Google and place it and the CX in this file. If you don't wish to use Google, then set these to empty strings.

5.  Modify `index.ts` file.
    -   Set the `botDirectory` Path to the top level directory.
    -   Follow the example of how `pfcFile` and `pfc` and `plushFile` and `plush` are initialized and then ensure the `configure()` method is executed.

6.  Transpile the project by running `tsc`.
7.  Run `node encrypt.js` to encrypt the bot API key(s) and/or the Google API/CX. This will generate corresponding `.secrets_thing` files. Your `.secrets_all.json` file will be wiped of all sensitive information. This command should only be executed one time, during setup.
8.  Run `node index.js` to start up your bot(s).

I've yet to test any of this outside of my current bot configurations, but if you run into problems, feel free to open an issue on [GitHub](https://github.com/CorpulentBrony/podbot). I'm not really planning on providing much support of this outside of my associates, but if I can answer any inquiries I will try.

</div>
</section> <footer>

<div>
<div>
[![Creative Commons License](https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png)](http://creativecommons.org/licenses/by-nc-sa/4.0/)

</div>
<div>
podbot by Corpulent Brony is licensed under a [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License](http://creativecommons.org/licenses/by-nc-sa/4.0/).

</div>
</div>
</footer> </main>
