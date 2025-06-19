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
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import {Extension, gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';
import {QuickToggle, SystemIndicator} from 'resource:///org/gnome/shell/ui/quickSettings.js';

const HotspotToggle = GObject.registerClass(
class HotspotToggle extends QuickToggle {
    constructor() {
        super({
            title: 'Hotspot',
            iconName: 'network-wireless-hotspot-symbolic',
            toggleMode: true,
        });

        this._updateState();

        this.connect('clicked', () => {
            if (this.checked){
                this._enableHotspot();
            }
            else{
                this._disableHotspot();                
            }
        });
    }

        

    _updateState() {
        try{
            let [ok, stdout] = GLib.spawn_command_line_sync(`nmcli -t -f NAME,TYPE connection show --active`);
            if (!ok || !stdout) {
                throw new Error("Error while getting state of hotspot");
            }

            let output = importScripts.byArray.toString(stdout);
            output = output.trim();
            this.checked = output.includes('Hotspot:');     

        } catch (e){
            logError(e);
        }
    }

    _enableHotspot() {
        GLib.spawn_command_line_async('nmcli connection up Hotspot');
        this.checked = true;
    }

    _disableHotspot() {
        GLib.spawn_command_line_async('nmcli connection down Hotspot');
        this.checked = false;
    }
    
});

const HotspotIndicator = GObject.registerClass(
class HotspotIndicator extends SystemIndicator {
    constructor() {
        super();
        
        this.toggle = new HotspotToggle();
        this.quickSettingsItems.push(this.toggle);
    }
});

//main
export default class QuickSettingsExampleExtension extends Extension {

    enable() {
        this._indicator = new HotspotIndicator();
        Main.panel.statusArea.quickSettings.addExternalIndicator(this._indicator);
    }

    disable() {
        this._indicator.quickSettingsItems.forEach(item => item.destroy());
        this._indicator.destroy();
    }
}
