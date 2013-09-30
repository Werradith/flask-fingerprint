function showAlert(title, msg, onOKcb, width) {
    $('body').append('<div id="dialogWindow" title="'+title+'">'+msg+'</div>');
    $('#dialogWindow').dialog({
        modal: true,
        close: function() {
            $('#dialogWindow').remove();
        },
        buttons: {
            "OK": function() {
                $('#dialogWindow').dialog('close');
                if (typeof onOKcb == "function") onOKcb();
            }
        },
        width: typeof width == 'number' ? width : 300
    });
}

function showPrompt(title, msg, onOKcb) {
    $('body').append('<div id="dialogWindow" title="'+title+'"><p>'+msg+'</p>'+
        '<input type="text" id="promptInput" class="text ui-widget-content ui-corner-all" /></div>');
    $('#dialogWindow').dialog({
        modal: true,
        close: function() {
            $('#dialogWindow').remove();
        },
        buttons: {
            "OK": function() {
                var input = $('#promptInput').val();
                $('#dialogWindow').dialog('close');
                if (typeof onOKcb == "function") onOKcb(input);
            }
            /*,
            "Skip": function() {
                $('#dialogWindow').dialog('close');
                if (typeof onOKcb == "function") onOKcb('');
            }*/
        }
    });
}