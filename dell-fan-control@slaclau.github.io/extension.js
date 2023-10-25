/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */
import GObject from 'gi://GObject';
import St from 'gi://St';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import {Extension, gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';
import {QuickMenuToggle, SystemIndicator} from 'resource:///org/gnome/shell/ui/quickSettings.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import {getSupportedModes, setModeTo, getMode} from './services/fanControl.js';

const FanSpeedToggle = GObject.registerClass(
class FanSpeedToggle extends QuickMenuToggle {
    constructor() {
        super({
            title: _('Fan mode'),
            subtitle: getMode(),
            iconName: 'temperature-symbolic',
            toggleMode: true,
        });

        this.menu.setHeader('temperature-symbolic', _('Fan Mode'));
        this._menuButton.connect('clicked', () => this._update());
        this._itemsSection = new PopupMenu.PopupMenuSection();
        this.menu.addMenuItem(this._itemsSection);
    }

    _update() {
        const modes = getSupportedModes();
        console.log(modes);
        this._itemsSection.destroy()
        this._itemsSection = new PopupMenu.PopupMenuSection();
        for (let mode of modes) {
            this._itemsSection.addAction(mode, () => {
                setModeTo(mode);
                let rtn = this._updateChecks();
                if (rtn !== mode) {
                    throw new Error(`${rtn} is not ${mode}`);
                } else {
                    console.log('Succeeded in mode change');
                }
            });
        }
        this.menu.addMenuItem(this._itemsSection);
        this._updateChecks();
    }

    _updateChecks() {
        this.subtitle = getMode();
        for (let item of this._itemsSection._getMenuItems()) {
            item.setOrnament( item.label.text === this.subtitle
               ? PopupMenu.Ornament.CHECK
               : PopupMenu.Ornament.NONE);
        }
        return this.subtitle;
    }
});

const FanSpeedIndicator = GObject.registerClass(
class FanSpeedIndicator extends SystemIndicator {
    constructor() {
        super();

        this._indicator = this._addIndicator();

        const toggle = new FanSpeedToggle();
        this.quickSettingsItems.push(toggle);
    }
});

export default class FanSpeedExtension extends Extension {
    enable() {
        this._indicator = new FanSpeedIndicator();
        Main.panel.statusArea.quickSettings.addExternalIndicator(this._indicator);
    }

    disable() {
        this._indicator.quickSettingsItems.forEach(item => item.destroy());
        this._indicator.destroy();
    }
}
