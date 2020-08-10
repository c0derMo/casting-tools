var running = false;

$('#startstopcollection').on('click', () => {
    running = !running;
    if(running) {
        $('#startstopcollection').text("Stop collecting data");
    } else {
        $('#startstopcollection').text("Start collecting data");
    }
    console.log(jsonifySettings());
    window.Bridge.sendConfig(jsonifySettings());
});

$('input').on('change', () => {
    console.log(jsonifySettings());
    window.Bridge.sendConfig(jsonifySettings());
});

function jsonifySettings() {
    var settings = {
        general: {
            server: $('#server').val(),
            frequency: $('#frequency').val(),
            autostart: $('#auto-start').is(':checked'),
            running: running
        },
        lcu: {
            champselect: $('#lcu-champselect-session').is(':checked'),
            names: $('#lcu-summonernames').is(':checked')
        },
        lcd: {
            playerlist: $('#lcd-playerlist').is(':checked'),
            eventdata: $('#lcd-eventdata').is(':checked'),
            gamestats: $('#lcd-gamestats').is(':checked')
        }
    }
    return settings;
}

function setSettings(data) {
    //Status
    if(data.status.datacollection) {
        $('#status-datacollection').text('enabled').removeClass('statusdisabled').addClass('statusenabled');
    } else {
        $('#status-datacollection').text('disabled').removeClass('statusenabled').addClass('statusdisabled');
    }
    if(data.status.lcu) {
        $('#status-lcu').text('connected').removeClass('statusdisabled').addClass('statusenabled');
    } else {
        $('#status-lcu').text('disconnected').removeClass('statusenabled').addClass('statusdisabled');
    }
    if(data.status.livedata) {
        $('#status-livedata').text('connected').removeClass('statusdisabled').addClass('statusenabled');
    } else {
        $('#status-livedata').text('disconnected').removeClass('statusenabled').addClass('statusdisabled');
    }

    //General
    $('#server').val(data.general.server);
    $('#frequency').val(data.general.frequency);
    $('#auto-start').prop('checked', data.general.autostart);

    //LCU
    $('#lcu-champselect-session').prop('checked', data.lcu.champselect);
    $('#lcu-summonernames').prop('checked', data.lcu.names);

    //LCD
    $('#lcd-playerlist').prop('checked', data.lcd.playerlist);
    $('#lcd-eventdata').prop('checked', data.lcd.eventdata);
    $('#lcd-gamestats').prop('checked', data.lcd.gamestats);
}

window.Bridge.setConfigRevcievedCallback(setSettings);