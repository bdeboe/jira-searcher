# JIRA custom search page

Custom JIRA search page with simple controls to avoid having to write all that JQL by hand.

Because of CORS restrictions, direct access to the JIRA REST API from the browser is not permitted. A simple `JIRA.Forwarder` ObjectScript class offers a REST intermediary that should be safe to query. Other than that, all logic is in plain `search.html` and `search.js` files, which load JQuery and Bootstrap libraries directly from their published locations.

## Installation

First download the repository contents:

```
git clone git@github.com:bdeboe/jira-searcher.git
```

### With ZPM

Run the following command from your IRIS shell

```ObjectScript
zpm "load /path/to/jira-searcher/"
```

### With Docker

From within the directory you cloned the repo into, launch using docker-compose:

```
docker-compose up
```

### Configuration

You shouldn't have to override any when using this at InterSystems, but the sole reference to our corporate JIRA server is at the top of `search.js`.

## Usage

Make sure you use the full hostname instead of `localhost` to avoid further CORS trouble.

### Why is it asking for my password?

Pending fancy OAuth support, we're using Basic HTTP authentication when connecting to the JIRA server. This means we need your password to build the authorization hash using base64 encoding. The value you provide in the dialog is never stored on disk and immediately encoded. That doesn't mean it's watertight, but as long as no one is snooping on the connection between your browser and the REST forwarder, it should be safe. The connection between the REST forwarder and the JIRA server is encrypted with https.