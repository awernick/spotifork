# Spotifork - Spotify Playlist Forker

## Install
```
npm install spotifork --global
```

## Usage
```
spotifork -h

  Usage: spotifork [options] <uris ...>

  Options:

    -h, --help                  Output usage information
    -V, --version               Output the version number
    -a, --access-token <token>  Spotify Web API access token
    -p, --public                Create all forks as public

```
*Note*: Spotify URIs can be found using the Spotify desktop client for 
OSX/Windows/Linux. If you don't have access to the client, you can format
a uri by following this format:

```
spotify:user:{PLAYLIST OWNER}:playlist:{PLAYLIST ID}
```

## Purpose
1. I hate losing cool songs when playlist owners decided to remove them
2. I get to keep a snapshot of any playlist at any time I want
3. Working with API's is fun.
4. Spotify is great

## Contributions
All contributions are welcome and appreciated :) Open a PR or an issue if you
find something wrong with my implementation or if you have any suggestions about
performance / features / etc...
