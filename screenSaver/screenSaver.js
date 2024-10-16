import * as path from 'node:path';
import { exec } from 'node:child_process';
import fs from 'fs-extra';
import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

// internal
let Locale;
let periphInfo = []; 
const widgetFolder = path.resolve(__dirname, 'assets/widget');
const widgetImgFolder = path.resolve(__dirname, 'assets/images/widget');

export async function onClose (widgets) {
	if (Config.modules.screenSaver.widget.display === true) {
		// Save widget positions
		await Avatar.Widget.initVar(widgetFolder, widgetImgFolder, null, Config.modules.screenSaver);
		if (widgets) await Avatar.Widget.saveWidgets(widgets)
	}
}


export async function init () {
    if (!await Avatar.lang.addPluginPak("screenSaver")) {
        return error('screenSaver: unable to load language pak files');
    }

	Locale = await Avatar.lang.getPak("screenSaver", Config.language);
    if (!Locale) {
        return error(`screenSaver: Unable to find the '${Config.language}' language pak.`);
    }
}


export async function getWidgetsOnLoad () {

	periphInfo.push({
		Buttons: [
			{
				creation_date: "2024-05-01 10:00:00",
				name: "screenSaver",
				notes: "Ecran de veille pour A.V.A.T.A.R",
				periph_id: "808221198",
				usage_name: "screen saver",
				value_type: "button"
			}
		]
	});
	
	if (Config.modules.screenSaver.widget.display === true) {
		await Avatar.Widget.initVar(widgetFolder, widgetImgFolder, null, Config.modules.screenSaver);
		let widgets = await Avatar.Widget.getWidgets();
		return {plugin: "screenSaver", widgets: widgets, Config: Config.modules.screenSaver};
	} 
}


export async function getPeriphInfo () {
	return periphInfo;
}


export async function widgetAction () {

	// Uses the A.V.A.T.A.R server or client screenSaver
	if ((process.platform === 'win32' && Config.screenSaver.exec) || process.platform !== 'win32') {
		// Returns the script depending platform
		const script = process.platform === 'win32'
		? path.join(__dirname, "../../..", "lib", "screensaver", "win32", "screensaver.vbs").concat(" \"" + Config.screenSaver.exec + "\"")
		: path.join(__dirname, "../../..", "lib", "screensaver", process.platform, "screensaver.sh").concat(" \"" + Config.screenSaver.exec + "\"");
	  
		// exec screensaver
		exec(script, err => {
			if (err) error(Locale.get(["error.msg", err]));
		})
	}
}


export async function action (...args) {
	for (let n of args) {
		if (typeof n === 'function') callback();
	}
}
