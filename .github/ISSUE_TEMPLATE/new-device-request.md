---
name: New Device Request
about: Request support for a Electrolux AEG device
title: 'New Device: <device name/title>'
labels: ''
assignees: ''

---

To request a new device, please run the Electrolux/AEG OCP app locally using Homey CLI.

```bash
$ git clone git@github.com:https://github.com/gslender/com.electrolux-aeg.ocp.git
$ cd com.electrolux-aeg.ocp
$ homey app run -r
```

Add your email and password to the app Configure settings.

Then add a New Device, choose the Electrolux/AEG OCP app Brand, and choose a Laundry device even if your device is not a Laundry appliance. 

Watch the logging closely for `********* appliances[...] ********` and copy-paste the JSON into this issue.

Without this information, we cannot add support for your device, and the issue will be closed.

For example:

```
2024-06-28T03:07:51.553Z [log] [ElectroluxAEGApp] [{"applianceId":"XXXXXXXX_01:xxxxxxx-xxxxxx","applianceData":{"applianceName":"Dryer","created":"2024-06-25T06:35:21.260Z","modelName":"TD"},"properties":{"desired":{},"reported":{"doorState":"OPEN","timeToEnd":-1,"networkInterfaceAlwaysOn":"ON","miscellaneous":{},"applianceUiSwVersion":"URDB0A3H","applianceTotalWorkingTime":7200,"remoteControl":"NOT_SAFETY_RELEVANT_ENABLED","dryingNominalLoadWeight":65535,

        <<SNIP WE'VE SHORTENED THIS FOR THE EXMAPLE, PLUS PLEASE KEEP THE ENTIRE JSON IN YOUR COPY/PASTE>>

"tDEconomy_Eco":false,"tDEconomy_Quick":false,"refresh":false,"dryingTime":65535,"memoryId":20,"programUID":"MACHINE_SETTINGS_HIDDEN_TEST","antiCreaseValue":255,"tDEconomy_Night":false},"cycleMemory1":{"reversePlus":false,"tDEconomy_Eco":false,"tDEconomy_Quick":false,"refresh":false,"dryingTime":65535,"memoryId":30,"programUID":"MACHINE_SETTINGS_HIDDEN_TEST","antiCreaseValue":255,"tDEconomy_Night":false}},"metadata":{}},"status":"enabled","connectionState":"connected"}]
```

Finally, please link to more information about the device, e.g. the manufacturer's website to assist with images and icons that will be needed to complete the app update and publish in the app store.
