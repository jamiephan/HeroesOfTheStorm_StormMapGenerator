# Heroes of the Storm - Storm Map Generator

An online Storm Map file generator for Heroes of the Storm!

Try it online: https://stormmap.herokuapp.com/


# What is this app?

This repo contains both server and client side code that allows for generating a `*.StormMap` file completely online without any editor or application installed on your computer. Simply use the web interface and you can generate your own custom map for Heroes of the Storm based on various templates.

This app is build on ExpressJS as the server and ReactJS as the front-end.


# What is a Storm Map?

Heroes of the Storm is based on a StarCraft 2 Engine, which supports modding and have a map editor. Therefore, Heroes of the Storm inherited some modding features even was not documented.

Heroes of the Storm's map file is `*.StormMap`, which is a modified, but shares a similar structure to a StarCaft 2 Map (`*.SC2Map`). However, due to its a modified engine, you cannot directly export the maps from StarCraft 2 Editor into Heroes of the Storm, which you need to do some manual tweaking.


# Features

- Custom Map Name (Shown on Loading Screen)
- Use [Try Mode 2.0](https://jamiephan.github.io/HeroesOfTheStorm_TryMode2.0/) Maps or official maps as template
- Toggle any in game boolean variables
- Edit any game integer variables
- Include various AI composition (Based on [AI Maps](https://github.com/jamiephan/HeroesOfTheStorm_AIMaps))
- Custom Welcome Message when map was loaded
- Settings are stored in `localStorage`, which persist after a `F5` refresh
- Full XML Modding Editor
  - XML Files are stored in `localStorage`, which persist after a `F5` refresh
  - Creating new file
  - Creating new file based on [various examples](./src/templates/xml.json)
  - Uploading
  - Renaming
  - Deleting
  - Downloading
  - Editing
    - Monaco Editor (Same as `VSCode`)
    - Syntax Validation
    - Toggle Light/Dark theme


# Running the App

## Docker

The easiest way to run the app is to use [Docker](https://www.docker.com/).

```bash
docker run -d -p 8080:8080 jamiephan/stormmap
```

Then open your browser and go to http://localhost:8080

## Non-Docker

### Prerequisite

- Linux
  - Currently will not work on Windows due to some hard coded path. However you can run the application with Docker in Windows.
- [Wine](https://www.winehq.org/)
- [NodeJS + npm](https://nodejs.org/en/)

After installed the prerequisites, run the following commands:

```bash
# Clone the repo and cd into it
git clone https://github.com/jamiephan/HeroesOfTheStorm_StormMapGenerator.git
cd HeroesOfTheStorm_StormMapGenerator

# Install Deps
npm install
# Build the client
npm run build
# Start the server
npm start 
```

Then open your browser and go to http://localhost:8080


# Development

1. Clone the repo:

```bash
git clone https://github.com/jamiephan/HeroesOfTheStorm_StormMapGenerator.git
cd HeroesOfTheStorm_StormMapGenerator
```

2. Install both server and client dependencies:

```bash
npm install
```

3. Starting Server:
```bash
npm start
```

>Since we have a seperate instance of client running below, it is not necessary to build the client via `npm run build`. The client (`localhost:3000`) will proxy the API request to the server (`localhost:8080`).

4. Starting Client: 

```bash
# On another terminal/CMD:
npm run start:client
```

Now you should have two servers running:

- http://localhost:8080 = The server 
- http://localhost:3000 = The react client hot reload server, which proxy request to the server above


## Server Environment Variables

All Environment Variables configuration is stored in the `.env` file.

You can either rename `.env.example` to `.env`, or by setting the environment variable from your shell:

`SET PORT=80`

Here are the used environment variable that you can configure:

| Variable | Default | Usage |
|---|---|---|
| `PORT` | `8080` | The port of the server running on |
| `API_CACHE_EXPIRE` | `1800` | Seconds until the cache expire for Github API calls. (`1800` = 30 minutes) |
| `MAP_FILE_CACHE_EXPIRE` | `3600` | Seconds until the downloaded map cache expires. (`3600` = 1 hour) |
| `LOG_LEVEL` | `info` | The logging level: `debug`, `info`, `warn`, `error` |

# Building

## Build the app

```bash
# Build the client
npm run build
# Start the server
npm start
```

## Building the Docker image

```bash
# Build a docker image with the tag name "stormmap"
docker build . -t stormmap
# Start the docker container at port 8080
docker run -d -p 8080:8080 stormmap
```
> The image name is `stormmap` and the port is 8080, which you can change to whatever you desire, e.g to `80:8080` for port `80`)

# Legal Stuff

Licence: MIT

Storm Map Generator is a personal project and is not affiliated, associated, authorized, endorsed by, or in any way officially connected with Blizzard or Heroes of the Storm.








