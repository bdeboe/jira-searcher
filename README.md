# JIRA custom search page

Custom JIRA search page with simple controls to avoid having to write all that JQL by hand.

Because of CORS restrictions, direct access to the JIRA REST API from the browser is not permitted. A simple `JIRA.Forwarder` ObjectScript class offers a REST intermediary that should be safe to query. Other than that, all logic is in plain `search.html` and `search.js` files, which load JQuery and Bootstrap libraries directly from their published locations.

## Installation

First download the repository contents:

```
git clone git@github.com:bdeboe/jira-searcher.git
```

### With ZPM

After installing [ZPM](http://github.com/intersystems-community/zpm), run the following command from your IRIS shell:

```ObjectScript
zpm "load /path/to/jira-searcher/"
```

Then open http://localhost:52773/jira/web/search.html in your browser.

### With Docker

From within the directory you cloned the repo into, launch using docker-compose:

```Shell
docker-compose up --build
```

Then open http://localhost:9092/jira/web/search.html in your browser.

:warning: Something in the networking isn't quite right and connections to the JIRA server aren't working yet.

### Configuration & Usage

You shouldn't have to override anything when using this at InterSystems, but the sole reference to our corporate JIRA server is at the top of `search.js`.

Make sure you logged on to the VPN so you have access to the JIRA server

### Why is it asking for my password?

> The tool is connecting to JIRA to fetch search suggestions for the autocompleting fields such as 
> reporter, component and assignee. If you don't need suggestions, just skip the password field. 
> Anything else should still work

Pending fancy OAuth support, we're using Basic HTTP authentication when connecting to the JIRA server. This means we need your password to build the authorization hash using base64 encoding. The value you provide in the dialog is never stored on disk and immediately encoded. That doesn't mean it's watertight, but as long as no one is snooping on the connection between your browser and the REST forwarder, it should be safe. The connection between the REST forwarder and the JIRA server is encrypted with https.