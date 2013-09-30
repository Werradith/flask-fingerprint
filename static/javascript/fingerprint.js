var runtime = 
{
    start : null, attribs : null, jsfonts : null, flashfonts : null, plugins : null, evercookie : null, 
    post : null,
    now : function ()
    {
        return (new Date()).getTime();
    }
};
function fontList(fonts) {}
function userNamePrompt(onAccept)
{
	$.get('/get-nickname', function (res) {
			onAccept(res)
		});
    /* showPrompt(lt.userNamePromptTitle, lt.userNamePromptText, function (user_name)
    {
        if (user_name.length > 0)
        {
            if (!/[A-Za-z0-9]{6}/.test(user_name))
            {
                showAlert(lt.error, lt.userNamePromptWrongUsername, function ()
                {
                    userNamePrompt(onAccept)
                });
                return
            }
            else
            {
                $.get('?controller=fingerprint&action=ajax&namecheck=' + user_name + '&tid=' + test_id, 
                function (res)
                {
                    if (res != 'OK')
                    {
                        showAlert(lt.error, lt.userNamePromptUsernameInUse, function () 
                        {
                            userNamePrompt(onAccept) 
                        });
                    }
                    else {
                        onAccept(user_name);
                    }
                })
            }
        }
        else {
            user_name = default_name;
            onAccept(user_name)
        }
    })*/
}
function start_test()
{
    runtime.start = runtime.now();
    //setProgbar(56, lt.progbar1);
    var fp = 
    {
        locality : "", os : "", screen : "", timezone : "", fonts_all : "", fontlist : "", plugins_univ : "", 
        plugins_nonu : "", plugins_all : "", mimetypes : "", navigator_hash : "", screen_avail : "", build_id : "", 
        dnt : "", user_name : "", fire_gloves : ""
    };
    try
    {
        fp.locality = window.navigator.userLanguage || window.navigator.language;
        if (navigator.appVersion.indexOf("Win") !=- 1) {
            fp.os = "Windows";
        }
        if (navigator.appVersion.indexOf("Mac") !=- 1) {
            fp.os = "MacOS";
        }
        if (navigator.appVersion.indexOf("X11") !=- 1) {
            fp.os = "UNIX";
        }
        if (navigator.appVersion.indexOf("Linux") !=- 1) {
            fp.os = "Linux";
        }
        fp.screen = screen.width + "x" + screen.height;
        fp.screen_avail = screen.availWidth + "x" + screen.availHeight;
        fp.timezone = new Date().getTimezoneOffset();
        fp.build_id = navigator.buildID ? navigator.buildID : "undefined";
        fp.dnt = navigator.doNotTrack ? navigator.doNotTrack : "undefined";
        fp.fire_gloves = ((typeof (ntrn) == "function" && typeof (ntra) == "function") || (typeof (FireGlovesStats) == "object")) ? 'on' : 'off'
    }
    catch (e) {}
    runtime.attribs = runtime.now() - runtime.start;
    //setProgbar(72, lt.progbar2);
    var det = new Detector();
    for (i = 0; i < fonts_db.length; i++) {
        fonts_db.push(det.detailedTest(fonts_db.shift()));
    }
    for (i = 0; i < fonts_db.length; i++) {
        fp.fonts_all += fonts_db[i][3] ? '1' : '0';
    }
    runtime.jsfonts = runtime.now() - runtime.start;
    fp.fontlist = getFullFontList();
    runtime.flashfonts = runtime.now() - runtime.start;
    //setProgbar(76, lt.progbar3);
    try
    {
        fp.plugins_univ = detectPlugins();
        fp.plugins_nonu = detectPluginsNonUniv();
        fp.plugins_all = detectPluginsAll();
        fp.mimetypes = getMimeTypes();
        fp.navigator_hash = hex_sha1(serialize(navigator))
    }
    catch (e) {}
    runtime.plugins = runtime.now() - runtime.start;
    //setProgbar(80, lt.progbar4);
    if (typeof ec == 'undefined') {
        ec = new evercookie();
    }
    function getcookie()
    {
        ec.get('user_name', function (value, all)
        {
            runtime.evercookie = runtime.now() - runtime.start;
            if (value != undefined) {
                fp.user_name = value;
                postResults(fp)
            }
            else
            {
                userNamePrompt(function (un)
                {
                    if (un.length > 0) {
                        ec.set('user_name', un)
                    }
                    fp.user_name = un;
                    postResults(fp)
                })
            }
        }, 1)
    }
    getcookie()
}
function postResults(fp)
{
    //setProgbar(96, lt.progbar5);
    // $.post('?controller=fingerprint&action=ajax&senddata=1&tid=' + test_id, 'data=' + $.toJSON(fp), function (data)
	$.ajax({
	  type: "POST",
	  contentType: "application/json; charset=utf-8",
	  url: "/",
	  controller: 'fingerprint',
	  action: 'ajax',
	  senddata: 1,
	  tid: test_id,
	  data: $.toJSON(fp),
	  success: function (data)
    {
        /* runtime.post = runtime.now() - runtime.start;
        //setProgbar(99);
        if (data == "FAIL")
        {
            showAlert(lt.resultsAlertTitle, "Corrupted data or detection error! Administrators have been informed!");
            //setProgbar(0);
            return
        }
        var results = $.parseJSON(data);
        var idTable = '<table class="resultsId">' + '<tr><th>' + lt.resultsIdDatetime + '</th><th>' + lt.resultsIdColor + '</th><th>' + lt.resultsIdFruit + '</th><th>' + lt.resultsIdName + '</th><th>' + lt.resultsIdDrink + '</th><th>' + lt.resultsIdCity + '</th><th>' + lt.resultsIdCode + '</th></tr>' + '<tr><td>' + results.user_id_names.replace(/@/g, 
        '</td><td>') + '</td></tr>' + '</table>';
        var progpackList = '<table class="progpackList">' + '<tr><td>' + (results.software_pkgs.replace(/:/g, 
        '</td><td>')).replace(/@/g, '</td></tr><tr><td>') + '</td></tr>' + '</table>';
        var tabResults = '<h3>' + lt.resultsInfoName + '</h3>' + results.user_name + '<h3>' + lt.resultsInfoHash + '</h3>' + results.user_id_hash + '<h3>' + lt.resultsInfoId + '</h3>' + lt.resultsInfoIdHint + idTable + '<h3>' + lt.resultsInfoAnalysis + '</h3>' + results.analysis_text + '<h3>' + lt.resultsInfoPrograms + '</h3>' + progpackList;
        var fontlistHTML = "";
        for (var i = 0; i < fp.fonts_all.length; i++)
        {
            if (i >= fonts_db.length) {
                break;
            }
            if (fp.fonts_all.charAt(i) == '1')
            {
                fontlistHTML += '<span style="font-family: ' + fonts_db[i][0] + '; font-size: 12px;">' + fonts_db[i][0] + "</span>, "
            }
        }
        var tabDetails = '<table>' + '<tr><td>' + lt.detailsLocality + '</td><td>' + fp.locality + '</td></tr>' + '<tr><td>' + lt.detailsOS + '</td><td>' + fp.os + '</td></tr>' + '<tr><td>' + lt.detailsScreen + '</td><td>' + fp.screen + '</td></tr>' + '<tr><td>' + lt.detailsTimezone + '</td><td>' + fp.timezone + '</td></tr>' + '<tr><td>' + lt.detailsUAS + '</td><td>' + results.uas + '</td></tr>' + '<tr><td>' + lt.detailsAcceptHdrs + '</td><td>' + results.accept_header + '</td></tr>' + '<tr><td>' + lt.detailsPlugins + '</td><td>' + fp.plugins_all + '</td></tr>' + '<tr><td>' + lt.detailsFonts + '</td><td>' + fontlistHTML + '</td></tr>' + '</table>';
        var tabs = '<div id="tabs">' + '<ul><li><a href="#tabs-1">' + lt.resultsTab + '</a></li><li><a href="#tabs-2">' + lt.detailsTab + '</a></li></ul>' + '<div id="tabs-1">' + tabResults + '</div>' + '<div id="tabs-2">' + tabDetails + '</div>' + '</div>';
        progbar_cb = function ()
        {
            showAlert(lt.resultsAlertTitle, tabs, false, 750);
            $('#tabs').tabs()
        };
        //setProgbar(100, lt.progbar6);
        start_test_clicked = false;*/
        $('body').append(data.result);
		// $('a#fp-result').text(data.fp_hash);
	  },
	  dataType: "json"
	});
	
}
function detectPlugins()
{
    var pName = ['Silverlight', 'VLC', 'Java', 'Shockwave', 'QuickTime'];
    var pAv = [];
    var pVer = [];
    var plugins = [];
    PluginDetect.getVersion('.');
    for (var i in pName)
    {
        pAv[i] = PluginDetect.isMinVersion(pName[i], '0') >= 0;
        pVer[i] = PluginDetect.getVersion(pName[i])
    }
    for (var i in pName) {
        plugins[i] = pName[i] + ": " + (pAv[i] ? pVer[i] : 'none');
    }
    return plugins.join(', ')
}
function detectPluginsNonUniv()
{
    var pName = ['Flash', 'AdobeReader', ];
    var pAv = [];
    var pVer = [];
    var plugins = [];
    PluginDetect.getVersion('.');
    for (var i in pName)
    {
        pAv[i] = PluginDetect.isMinVersion(pName[i], '0') >= 0;
        pVer[i] = PluginDetect.getVersion(pName[i])
    }
    var ari = pName.indexOf('AdobeReader');
    if (pVer[ari] != null) {
        pVer[ari] = pVer[ari].match(/\d+\.\d+/);
    }
    var fli = pName.indexOf('Flash');
    if (pVer[fli] != null) {
        pVer[fli] = pVer[fli].match(/\d+\.\d+\.\d+/);
    }
    for (var i in pName) {
        plugins[i] = pName[i] + ": " + (pAv[i] ? pVer[i] : 'none');
    }
    return plugins.join(', ')
}
function detectPluginsAll()
{
    var pName = ['Silverlight', 'VLC', 'Java', 'Shockwave', 'QuickTime', 'Flash', 'AdobeReader', 'WindowsMediaPlayer'];
    var pAv = [];
    var pVer = [];
    var plugins = [];
    var ji = null;
    PluginDetect.getVersion('.');
    for (var i in pName)
    {
        pAv[i] = PluginDetect.isMinVersion(pName[i], '0') >= 0;
        pVer[i] = PluginDetect.getVersion(pName[i])
    }
    ji = PluginDetect.getInfo('Java', '/javascript/plugindetect/getJavaInfo.jar');
    var jitext = typeof ji == "object" ? (ji.DeployTK_versions.toString() + "-" + ji.description + "-" + ji.isPlugin2 + "-" + ji.name + "-" + ji.vendor) : null;
    for (var i in pName) {
        plugins[i] = pName[i] + ": " + (pAv[i] ? pVer[i] : 'none');
    }
    return plugins.join(', ') + ', javainfo: ' + jitext
}
function getMimeTypes()
{
    var mimes = [];
    if (navigator.mimeTypes)
    {
        for (var i in navigator.mimeTypes) 
        {
            var m = navigator.mimeTypes[i];
            var p = m.enabledPlugin;
            mimes.push(m.description + "#" + m.suffixes + "#" + m.type + "#" + (p == null ? '' : (p.filename + "#" + p.name + "#" + p.version))) 
        }
        return mimes.join('|');
    }
}
function getFullFontList()
{
    var fonts = "";
    var obj = document.getElementById("flashfontshelper");
    try
    {
        if (obj && typeof (obj.GetVariable) != "undefined") {
            fonts = obj.GetVariable("/:user_fonts");
            fonts = fonts.replace(/,/g, ", ");
        }
    }
    catch (e) {}
    return fonts ? fonts : ""
}
function serialize(obj, tabs, rec)
{
    if (typeof (objs) == 'undefined') {
        objs = [];
    }
    if (typeof (tabs) == 'undefined') {
        tabs = "";
    }
    if (typeof (rec) == 'undefined') {
        rec = 0;
        objs = []
    }
    if (rec > 4) {
        return "tmr";
    }
    var res = "";
    var nl = "|";
    for (var i in obj)
    {
        try
        {
            res += tabs + i + ":";
            if (typeof obj[i] == 'function')
            {
                res += 'func' + nl
            }
            else if (obj[i]instanceof Array) {
                res += "[" + nl + serialize(obj[i], tabs + "#", rec + 1) + nl + "]" + nl
            }
            else if (typeof obj[i] == 'object' && obj[i] != null)
            {
                if (objs.indexOf(obj[i]) ==- 1) {
                    objs.push(obj[i]);
                    res += "{" + nl + serialize(obj[i], tabs + "#", rec + 1) + nl + tabs + "}" + nl
                }
                else {
                    res += "ref" + nl;
                }
            }
            else {
                res += obj[i] + nl;
            }
        }
        catch (e) {
            res += tabs + "E:" + e.message + nl
        }
    }
    return res
}
$('body').append('<div id="flashcontent"></div>');
$('#flashcontent').flash(
{
    src : "javascript/fonts2.swf", width : "1", height : "1", swliveconnect : "true", id : "flashfontshelper", 
    name : "flashfontshelper"
},
{
    update : false
});
setTimeout(start_test, 250);