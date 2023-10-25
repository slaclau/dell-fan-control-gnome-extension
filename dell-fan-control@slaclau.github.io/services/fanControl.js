import * as MyShell from './shell.js';

function getValueFromString(value, key, idx) {
    if (value != null) {
        if (value.includes(key)) {
            if (idx != null) {
                return value.split(key)[idx].trim();
            } else {
                return value.split(key);
            }
        }
    }
    return null;
}

function getValueFromArray(array, key, idx) {
    if (array != null) {
        for (const value of array) {
            let rv = getValueFromString(value, key, idx);
            if (rv != null) {
                return rv;
            }
        }
    }
    return null;
}

export function getSupportedModes() {
    const result = MyShell.exec('pkexec smbios-thermal-ctl -i');
    if (result == null) {
        return null;
    }

    console.log(`getSupportedModes - ${result}`);
    let lines = result.split('\n');
    let index = lines.indexOf('Supported Thermal Modes: ');

    const modes = [];
    for (let i = index; i < lines.length; i++) {
        let line = lines[i + 1].trimStart();
        if (line === '') break;
        console.log(`Fan Mode detected - ${line}`);
        modes.push(line)
    }

    return modes;
}

export function setModeTo(mode) {
    mode = mode.toLowerCase();
    mode = mode.replace(' ', '-');
    const result = MyShell.exec('pkexec smbios-thermal-ctl --set-thermal-mode ' + mode);
    if (result == null) {
        return null;
    }

    console.log(`setModeTo(${mode}) - ${result}`);
}

export function getMode() {
    const result = MyShell.exec('pkexec smbios-thermal-ctl -g');
    if (result == null) {
        return null;
    }

    console.log(`getMode - ${result}`);
    let lines = result.split('\n');
    let index = lines.indexOf('Current Thermal Modes: ');

    const modes = [];
    for (let i = index; i < lines.length; i++) {
        let line = lines[i + 1].trimStart();
        if (line === '') break;
        console.log(`Fan Mode detected - ${line}`);
        modes.push(line)
    }

    return modes[0];
}
