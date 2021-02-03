DEFAULTJIRASERVER = "https://usjira.iscinternal.com";

function getRESTEndpoint() {
    return window.location.origin + '/jira/fwd';
} 

// initialize settings
settings = {};
$.ajax(getRESTEndpoint()+'/settings')
    .done(function(response) {
        console.log("Fetched settings from "+getRESTEndpoint(), response)

        settings = response;
        $("#modal-cfg").modal("show");

        $("#cfg-server").val(settings.jiraServer ? settings.jiraServer : DEFAULTJIRASERVER);
        $("#cfg-user").val(settings.jiraUser);

        // pick up most recent search
        if (settings.lastSearch) {
            search = settings.lastSearch;

            // and apply
            console.log("restoring previous search:", search);
            for (field in search) {
                if (search[field]=="") continue;
                el = $("#jira-"+field);
                if (el.hasClass("auto-select")) {
                    el.autoComplete("set", { "id": search[field], "text": search[field] } );
                } else if (el.hasClass("form-control")) {
                    el.val(search[field]);
                }
            }
        }
    });

$("#cfg-pwd").keypress(function(event) {
    if ( event.which == 13 ) {
        doConfig();
    }
});

function doConfig() {
    settings.jiraServer = $("#cfg-server").val();
    settings.jiraUser = $("#cfg-user").val();
    saveSettings();
    
    settings.auth = "Basic "+btoa(settings.jiraUser+":"+$("#cfg-pwd").val());

    $("#modal-cfg").modal("hide");
}

function doSearch() {
    console.log("Current search object:", search);
    
    jql = ""
    for (field in search) {
        if (search[field]=="") continue;
        if (jql != "") jql += " AND ";
        switch (field) {
            case 'created':
            case 'updated':
                jql += search[field];
                break;
            case 'text':
                jql += field + " ~ " + quote(search[field]);
                break;
            default:
                jql += field + " = " + quote(search[field]);
                break;
        }
    }
    jql += " ORDER BY updated DESC"
    console.log("JQL sent to server: "+jql);
    
    window.open(settings.jiraServer+"/issues/?jql="+encodeURIComponent(jql), "jira");

    settings.lastSearch = search;
    saveSettings();
}

function quote(str) {
    return str.includes(' ') ? "\""+str+"\"" : str;
}

function doClear() {
    search = {
        project: "DP",
        issuetype: "Dev Task"
    };
    $(".auto-select").autoComplete('clear');
    $(".jira-search-text").val("")
    $("#jira-issuetype").val("Dev Task");
}

function saveSettings() {
    cleared = settings;
    cleared.auth = "MASKED";
    $.ajax(getRESTEndpoint()+'/settings', { 
        method: 'POST', 
        contentType: 'application/json; charset=UTF-8',
        data: JSON.stringify(settings)
    }).done(console.log("Wrote settings back to server: ", settings));
}

$('.auto-select').autoComplete({
    resolver: 'custom',
    events: {
        search: function (qry, callback, element) {
            fieldName = element[0].id.substr(5);
            $.ajax(
                getRESTEndpoint()+'/suggestion',
                {
                    method: 'POST',
                    contentType: 'application/json; charset=UTF-8',
                    data: JSON.stringify({
                        server: settings.jiraServer,
                        auth: settings.auth,
                        field: fieldName,
                        string: qry
                    })
                }
            ).done(function(response) {
                list = response.results.map(row => {
                    return { "id": row.value, "text": row.displayName.replace(/<\/?b>/gi, "") };
                });
                callback(list);
            })
        }
    }
});

$(".jira-search-select").on("autocomplete.select", function(evt, item) {
    search[evt.target.id.substr(5)] = item ? item.id : '';
});

$(".jira-search-text").change(function() {
    search[this.id.substr(5)] = this.value;
});