Class JIRA.Forwarder Extends %CSP.REST
{

Parameter SETTINGSGLOBAL [ Internal ] = "^JIRA.settings";

Parameter DEBUGGLOBAL [ Internal ] = "^JIRA.debug";

Parameter CHARSET = "utf-8";

Parameter CONTENTTYPE = "application/json";

Parameter HandleCorsRequest = 1;

XData UrlMap [ XMLNamespace = "http://www.intersystems.com/urlmap" ]
{
<Routes>
<Route Url="/settings" Method="GET" Call="GetSettings" />
<Route Url="/settings" Method="POST" Call="SaveSettings" />
<Route Url="/suggestion" Method="POST" Call="GetSuggestionPost" Cors="true" />
</Routes>
}

ClassMethod OnPreHTTP() As %Boolean [ ServerOnly = 1 ]
{
    Do %response.SetHeader("Access-Control-Allow-Origin",..GetOrigins())
    Do %response.SetHeader("Access-Control-Allow-Credentials","true")
    Do %response.SetHeader("Access-Control-Allow-Methods","GET, PUT, POST, DELETE, OPTIONS")
    Do %response.SetHeader("Access-Control-Max-Age","10000")
    Do %response.SetHeader("Access-Control-Allow-Headers","Content-Type, Authorization, Accept-Language, X-Requested-With")
    quit 1
}

ClassMethod GetOrigins() As %String
{
    set url = %request.GetCgiEnv("HTTP_REFERER")
    return $p(url,"/",1,3) // get http(s)://origin.com:port
}

ClassMethod ParseRequest(Output json As %DynamicObject) As %Status
{
    set sc = $$$OK, json = {}
    try {
        if %request.Content="" {
        } elseif '$isobject(%request.Content) {
			set json = ##class(%DynamicObject).%FromJSON(%request.Content)
		} else {
			do %request.Content.Rewind()
			if %request.Content.AtEnd {
				set json = {}
			} else {
				set json = ##class(%DynamicObject).%FromJSON(%request.Content)
			}
		}
    } catch (ex) {
        set sc = ex.AsStatus()
    }
    quit sc
}

ClassMethod GetSettings() As %Status
{
    if '$d(@..#SETTINGSGLOBAL, settings) || (settings="") {
        write "{}"
    } else {
        write settings
    }
    quit $$$OK
}

ClassMethod SaveSettings() As %Status
{
    set sc = ..ParseRequest(.json)
    set:$$$ISOK(sc)&&$isobject($g(json)) @..#SETTINGSGLOBAL = json.%ToJSON()
    quit sc
}

ClassMethod GetSuggestionPost() As %Status
{
    set sc = $$$OK
    try {
        
        set sc = ..ParseRequest(.json)
        quit:$$$ISERR(sc)
        
        set req = ##class(%Net.HttpRequest).%New()
        set req.Server = "usjira.iscinternal.com"
		set req.Https = 1
		set req.SSLConfiguration = "ISC.FeatureTracker.SSL.Config"

        set req.Authorization = json.auth

        set sc = req.Get("/rest/api/2/jql/autocompletedata/suggestions?fieldName="_json.field_"&fieldValue="_$zcvt(json.string,"O","URI"))
        quit:$$$ISERR(sc)

        while 'req.HttpResponse.Data.AtEnd {
            write req.HttpResponse.Data.ReadLine()
        }

    } catch (ex) {
        set sc = ex.AsStatus()
    }
	quit $$$OK //..%ProcessResult(sc, $g(result))
}

}
