Introduction
===============
WebCommander provides the simplest way ever to run and share Powershell scripts. 

It provides a user friendly and intuitive web GUI for human users to trigger a script and view its result. At the same time, it wraps the script as a web service, whose interface and result are both in the format of JSON, to be easily consumed from other applications.

It provides a workflow engine to run multiple scripts together to handle more complex tasks. The web GUI also helps users to design, run, save and reuse workflows with simple mouse clicks.  

It allows execution of scripts and workflows located anywhere on internet without any effort to clone and maintain local copies.

Script
===============
On WebCommander, users trigger a script from the web interface. Each script parameter displays as a web form field whose name, help message, necessity and value sets are all clear to the user at a glance. 

![1](https://dl.dropbox.com/s/lgutit9o6qb3dtr/2016R-01.png)

The web GUI also displays script result far more human friendly. Especially when it returns a large number of items, the paged tabular output could be easily sorted and filtered. 

![2](https://dl.dropbox.com/s/6rdij3oycnyeido/2016R-02.png)
 
Behind the user friendly GUI, WebCommander actually generates outputs in JSON format, which makes it easy to be consumed programmatically from other applications.

![3](https://dl.dropbox.com/s/jvz9fd1e3746svn/2016R-03.png)

All execution results are saved on server as JSON files or stored in MongoDB. They could be retrieved by running the built-in “History” command.

![4](https://dl.dropbox.com/s/d86semekf6rhaoj/2016R-04.png)

Workflow
===============
WebCommander allows to run multiple scripts together. This is called workflow.

![5](https://dl.dropbox.com/s/pomjyg6hw4yzby9/2016R-05.png)

A workflow could run scripts one by one (serial) or all at the same time (parallel).
* Serial workflow

![6](https://dl.dropbox.com/s/llod249ebrdlfwk/2016R-06.png)

* Parallel workflow

![7](https://dl.dropbox.com/s/6lppxx115ctd178/2016R-07.png)

On the web GUI, users could add / delete / enable / disable / move scripts simply with mouse clicks 
A workflow could be imported and exported as a JSON string, which could also be saved on WebCommander server for future reuse.

![8](https://dl.dropbox.com/s/d56ch7sudbpfp8g/2016R-08.png)

Embedded Workflow
=================
A workflow could be turned into a single command and then embedded into other workflows. Consequently it’s able to map any execution sequence, no matter how complicate it is.

![9](https://dl.dropbox.com/s/2vqnhmlx8sjsjx4/2016R-09.png)

Share scripts
=================
WebCommander could not only run scripts located on its local disk but also those stored on internet. For instance in the script definition JSON below, script location is http://bit.ly/1Rc823E.

![10](https://dl.dropbox.com/s/ruqt2061lt8fjc5/2016R-10.png)

The script definition JSON file itself could be on internet as well. To share Powershell scripts with other WebCommander users, we would simply 
* put all scripts and the definition JSON file on a public web server, such as AWS, OneDrive, Github and Dropbox
* publish the URL of the definition JSON file

To use those shared scripts, we just add the URL to sources.json

![11](https://dl.dropbox.com/s/lcslwg9k4djw5dk/2016R-11.png)

Video Tutorials
===============
1. How to execute an individual command http://youtu.be/CREkoloCOmk
2. Workflow basics http://youtu.be/ZJtU36kM2YY
3. Workflow variable http://youtu.be/i6z_HKgeiqY
4. Workflow template http://youtu.be/adXa6AHJaB8
5. Run workflow as command http://youtu.be/DAm70VO62VY
6. Save workflow on server http://youtu.be/_aEZhzk_Q2Y

Installation
============
To deploy webcommander on Windows 2008 or 2012, please follow the instructions at https://pascalswereld.nl/2017/06/02/webcommander-walnut-installation-walk-through (by Pascal)

For non server Windows (vista and newer), checkout source code from walnut branch and open www folder from WebMatrix (https://www.microsoft.com/web/webmatrix/)

Contribution
============
If you want to contribute code or get any idea to improve WebCommander,
Please contact Jian Liu Skype: whirls9@hotmail.com.

Restful API
===========
| API | Method | Payload | Description |
| --- | --- | --- | --- |
| api/v1/showCommand | Get |  | List all command definitions |
| api/v1/showCommand?script=<script path> | Get |  | List the definition of the specified command |
| api/v1/showHistory | Get |  | List all execution history records |
| api/v1/showHistory/<history ID> | Get |  | List the history record specified by ID |
| api/v1/runCommand | Post | JSON string as listed below  | List the history record specified by ID |

```javascript
{
	"script": "https:\/\/raw.githubusercontent.com\/9whirls\/webcommander_walnut_remote\/master\/windows\/interfaces.ps1",
 "method": "runScript",
	"parameters": [{
		"name": "winAddress",
		"value": "localhost"
	},
	{
		"name": "winUser",
		"value": "username"
	},
	{
		"name": "winPassword",
		"value": "password"
	},
	{
		"name": "scriptText",
		"value": "get-host"
	},
	{
		"name": "scriptType",
		"value": "Powershell"
	}
	]
}
```
Index.html could generate this JSON string. After running a command through index.html, the result JSON will show in the JSON tab. That JSON string could be used to trigger runCommand API as well.

