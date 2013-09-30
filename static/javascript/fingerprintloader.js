var script_loaded = false;
var progbar_cb = false;
var start_test_clicked = false;

function setProgbar(val, info) {
    var $pbar = $('#progressbar');
    if ($pbar.length == 0) {
        $('#start_test').after('<div id="progressbar"></div><ol id="progressbar-info"></ol>');
        $('#progressbar').progressbar({value: 0});
    } else if (val == 0) {
        clearProgbarInfo();
        $('#progressbar').progressbar({value: 0});
    }
    if (typeof info == "string") addProgbarInfo(info);
    animateProgbarTo(val);
}

function clearProgbarInfo() {
    $('#progressbar-info').text('');
}

function addProgbarInfo(info) {
    $('#progressbar-info').append('<li>'+info+'</li>');
}

function animateProgbarTo(val) {
    var aval = $('#progressbar').progressbar("value");
    if (aval < val) {
        $('#progressbar').progressbar("value", aval+1);
        setTimeout('animateProgbarTo('+val+')', 10);
    } else if (typeof progbar_cb == "function" && val == 100) {
        progbar_cb();
    }
}

$(function() {
    if (typeof ec == 'undefined') ec = new evercookie();
    
    $('#start_test').click(function() {
        start_test_clicked = true;
        if (typeof(script_loaded) == "bool" && script_loaded) {
            try {
                start_test();
            } catch (e) {
            }
        } else {
            setProgbar(0);
            $.get("?controller=fingerprint&t="+(new Date().getTime()), function(data) {
                $('body').append(data);
            });
        }
        return false;
    });
    $('#remove_cookie').click(function() {
        try {
            ec.set('user_name', 'undefined');
        } catch (e) {
        }
        $(this).after('<span id="remove_cookie_ok">OK</span>');
        setTimeout(
            function() {
                $('#remove_cookie_ok').fadeOut('slow', function() { $(this).remove(); });
            }, 1000);
        return false;
    });
    $('#send_bugreport').click(function() {
        if (!start_test_clicked) {
            showAlert(lt.bugreportInfoTitle, lt.bugreportInfoNoErr);
            return false;
        }
        start_test_clicked = false; // tesztenként 1 bugreport küldhető
        var report = "progbar: " + $('#progressbar').progressbar("value");
        $.post('?controller=fingerprint&action=ajax&bugreport=1&t='+(new Date().getTime()), 'data='+report, function(data) {
            showAlert(lt.bugreportInfoTitle, lt.bugreportInfoSent);
        });
        return false;
    });
});