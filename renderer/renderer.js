const cryptoRandomString = require('crypto-random-string');
const { clipboard, ipcRenderer } = require('electron');
const store = require('../datastore');

const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const lower = upper.toLowerCase();
const numbers = "0123456789";
const symbols = "!@#$%^&*";

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const getChars = (settings) => {
    let chars = "";
    if (settings.upper)
        chars += upper;
    if (settings.ambigousRm)
        chars = chars.replace(/[IO]/g, '')
    if (settings.lower)
        chars += lower;
    if (settings.ambigousRm)
        chars = chars.replace(/[l]/g, '');
    if (settings.numbers)
        chars += numbers;
    if (settings.ambigousRm)
        chars = chars.replace(/[01]/g, '');
    if (settings.symbols)
        chars += symbols;
    return chars;
}

const getNumber = (selector) => {
    let num = $(selector).val();
    if (isNaN(num))
        return;
    return parseInt(num);
}

const metConditons = (generatedPass, settings) => {
    if (settings.numbers) {
        let numCount = generatedPass.replace(/[^0-9]/g, "").length;
        console.log("numCount: ", numCount);
        if (numCount < settings.minNum)
            return false;
    }
    if (settings.symbols) {
        let symbolRegex = new RegExp("[^" + escapeRegExp(symbols) + "]", 'g');
        let symbolCount = generatedPass.replace(symbolRegex, "").length;
        console.log("symbolCount: ", symbolCount);
        if (symbolCount < settings.minSym)
            return false;
    }
    return true;
}

const genPass = () => {
    let settings = getSettings();
    let searching = true;
    let generatedPass = "";
    while (searching) {
        generatedPass = cryptoRandomString({ length: settings.length, characters: getChars(settings) });
        searching = !metConditons(generatedPass, settings);
    }
    $('#displayPass').val(generatedPass);
    ipcRenderer.send('save-settings', getSettings());
}

$('#laengeSlider').slider({
    min: 5,
    max: 128,
    step: 1,
    value: 25,
    slide: (event, ui) => {
        let settings = getSettings();
        if (settings.numbers) {
            if (ui.value < settings.minNum) {
                ui.value = settings.minNum;
            }
            ui.min = settings.minNum;
        }
        if (settings.symbols) {
            if (ui.value < settings.minSymbols) {
                ui.value = settings.minSymbols;
            }
            ui.min = settings.minSymbols;
        }
        $('#laengeCheck').val(ui.value);
        genPass();
    }
});

$('input[type=checkbox]').on('change', () => {
    let checkedCount = $("input[type=checkbox]:checked").length;
    if (!checkedCount)
        e.target.checked = true;
    genPass();
});

$('#genPass').on('click', () => genPass());

$('#copyPass').on('click', () => clipboard.writeText($('#displayPass').val()));

$('input[type=number]').on('change', () => genPass());

$('#ambigousRm').on('change', () => genPass());

$('#minNum').on('change', () => {
    $('#numberCheck').prop('checked', true);
    genPass();
});

$('#minSym').on('change', () => {
    $('#symbolCheck').prop('checked', true);
    genPass();
});

$('#laengeCheck').on('change', () => {
    $('#laengeSlider').slider('value', e.target.value);
    genPass();
});

$('.list-group-item').on('click', e => {
    let checkBox = $(e.target).find('input[type=checkbox]');
    if (checkBox)
        $(checkBox).prop('checked', !$(checkBox).is(':checked'));
});

const getSettings = () => {
    let upper = $('#upperCheck').is(":checked");
    let lower = $('#lowerCheck').is(":checked");
    let numbers = $('#numberCheck').is(":checked");
    let symbols = $('#symbolCheck').is(":checked");
    let minNum = getNumber('#minNum');
    let minSym = getNumber('#minSym');
    let length = getNumber('#laengeCheck');
    let ambigousRm = $('#ambigousRm').is(":checked");
    let args = { upper: upper, lower: lower, numbers: numbers, symbols: symbols, minNum: minNum, minSym: minSym, length: length, ambigousRm: ambigousRm };
    return args;
}

const setSettings = (settings) => {
    console.log('loaded settings', JSON.stringify(settings));
    $('#upperCheck').prop('checked', settings.upper);
    $('#lowerCheck').prop('checked', settings.lower);
    $('#numberCheck').prop('checked', settings.numberCheck);
    $('#symbolCheck').prop('checked', settings.symbolCheck);
    $('#minNum').val(settings.minNum);
    $('#minSym').val(settings.minSym);
    $('#laengeCheck').val(settings.length);
    $('#laengeSlider').slider('value', settings.length);
    $('#ambigousRm').prop('checked', settings.ambigousRm);
}

ipcRenderer.on('get-settings', () => ipcRenderer.send('save-settings', getSettings()));

ipcRenderer.on('save-success', () => console.log("save successfull"));

// load settings on start
setSettings(store.store);
genPass();