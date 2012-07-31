# Introduction
jsTrac is library providing a Javascript interface to Trac, through its XML-RPC plugin.As such, it can be integrated to any website and allow developers and/or users to directly submit ticket to it.

Moreoever, jsAnnotate is provided with jsTrac. jsAnnotate is based on [jsfeedback](http://hertzen.com/experiments/jsfeedback/) and allows the user to draw frame, mask, arrows and note on the webpage, then take a screenshot with the help of [html2canvas](http://html2canvas.hertzen.com).

Both script are designed to be independant of each other so that you may switch one of them if needed or use only one of them.


#Compatiblity

jsTrac and jsAnnotate should be compatible with most standard compliant browser.
For the screenshot part ( not annotation! ), check [html2canvas](http://html2canvas.hertzen.com) compatiblity.

**Browsers fully compatible**

* Firefox 14 ( need to be tested with older version )
* Chrome 19 ( need to be tested with older version )
* Safari 6
* Safari 5+ ( Compatibity mode in jsAnnotate )
* Opera 12.00 ( Compatibity mode in jsAnnotate )

**Browser with severe limitation**

* Internet Explorer 9

In the case of Internet Explorer, you won't be able to use jsTrac if your website is on another domain than your Trac server due to Microsoft lack of CORS implementation for xmlHttpRequest in IE9. XDomainRequest won't work either for 2 reasons:

* XDomainRequest doesn't allow credential meaning you won't be able to log on Trac
* The content-type is limited to 2 values, neither are accepted by the Trac XML-RPC plugin

IE 10 might solve these issues considering that full CORS support has been added to the xmlHttpRequest object.

jsTrac may work on the same domain as the trac server, but this need more testing.

#Dependencies

These 2 scripts have several dependencies. Some of them could certainly be removed over time, but for now, here they are:

 
* Common lib
 * jQuery 1.7.2
 * Bootstrap 2.0.4 ( Alert, Modal, Button, Tab )
* jsAnnotate lib
 * html2canvas 0.34
 * jQuery UI 1.8.21 ( Draggable )
 * canvg 1.2
  * rgbcolor
 * Mousetrap
 * Raphaël 2.1
* jsTrac lib
 * Mimic 2.2 ( Warning! This one has been modified to allow credentials )
 * jQuery Validation
 
The package provides these libraries in separate folders but do check for newer version.

#How to use

Check the provided example. At the moment, we can't provide a server for testing jsTrac feature, but the example will run a sample configuration and connect on your Trac. Here is the bare minimum for the complete workflow with images, using jQuery.



		$(document).ready(function() {
			var optsAnnotate={
					'onRendered': function(img){
						var optsTrac= { 'img' : img };
						jsTrac.initTracForm("http://trac.example.com",optsTrac);
						}
			}
			$('#reportBugButton').annotate(optsAnnotate);
		});
			

#Options
##.annotate(opts)

<table>
	<tr>
		<th>Name</th>
		<th>Type</th>
		<th>Default value</th>
		<th>Description</th>
	</tr>
	<tr>
		<td>zIndex</td>
		<td>number</td>
		<td>50000</td>
		<td>Set the z-index of all the layers. 50000 should be enough but if you have a modal popup over it, you can change the z-index of jsAnnotate here.</td>
	</tr>
	<tr>
		<td>onRendered</td>
		<td>function</td>
		<td>null</td>
		<td>Callback function executed when the sreenshot has been rendered, cropped and converted to PNG base64. The image is passed as a parameter</td>
	</tr>
	<tr>
		<td>onOut</td>
		<td>function</td>
		<td>null</td>
		<td>Callback function executed when you leave jsAnnotate, be it cancel or submit
	</td>
	<tr>
		<td>loadingDivId</td>
		<td>string</td>
		<td>null</td>
		<td>A div where we a put a little loading message. Chance are it will appear on the screenshot.</td>
	</tr>
	<tr>
		<td>kbShortcut</td>
		<td>string</td>
		<td>null</td>
		<td>A keyboard shortcut which act like you clicked on the actual button to annotate. See <a href="http://craig.is/killing/mice">Mousetrap</a> for format.</td>
	</tr>
</table>


##jsTrac.initTracForm(url,opts)

<table>
	<tr>
		<th>Name</th>
		<th>Type</th>
		<th>Default value</th>
		<th>Description</th>
	</td>
	<tr>
		<td>img</td>
		<td>string</td>
		<td>null</td>
		<td>An image in base64</td>
	</tr>
	<tr>
		<td>zIndex</td>
		<td>number</td>
		<td>50000</td>
		<td>Set the z-index of all the layers. 50000 should be enough but if you have a modal popup over it, you can change the z-index of jsTrac here.</td>
	</tr>
	<tr>
		<td>rpcPlugin</td>
		<td>string</td>
		<td>/rpc</td>
		<td>By default, the Trac XML-RPC provide 2 interfaces: /rpc and /login/rpc. See the <a href="http://trac-hacks.org/wiki/XmlRpcPlugin">plugin</a></td>
	</tr>
	<tr>
		<td>prefill</td>
		<td>string</td>
		<td>null</td>
		<td>A string containing any information you want to add to the ticket.</td>
	</tr>
	<tr>
		<td>onSubmitted</td>
		<td>function</td>
		<td>null</td>
		<td>Callback function called when the new ticket is submitted. The id of the ticket is passed as a parameter, plus a link to the ticket</td>
	</tr>
	<tr>
		<td>onUpdated</td>
		<td>function</td>
		<td>null</td>
		<td>Callback function called when a ticket is updated. The id of the ticket is passed as a parameter, plus a link to the ticket.</td>
	</tr>
	<tr>
		<td>onCancel</td>
		<td>function</td>
		<td>null</td>
		<td>Callback function called when you cancel.</td>
	</tr>
	<tr>
		<td>defaultComponent</td>
		<td>string</td>
		<td>null</td>
		<td>If the default component is found on trac, then the list will default to it or to the first of the list if not found. </td>
	</tr>
	<tr>
		<td>defaultMilestone</td>
		<td>string</td>
		<td>null</td>
		<td>If the default milestone is found on trac, then the list will default to it or to the first of the list if not found. </td>
	</tr>
	<tr>
		<td>defaultPriority</td>
		<td>string</td>
		<td>null</td>
		<td>If the default priority is found on trac, then the list will default to it or to the first of the list if not found. </td>
	</tr>
	<tr>
		<td>defaultType</td>
		<td>string</td>
		<td>null</td>
		<td>If the default type is found on trac, then the list will default to it or to the first of the list if not found. </td>
	</tr>
	<tr>
		<td>lockDefault</td>
		<td>string</td>
		<td>null</td>
		<td>Values are : 'hidden' and 'disabled'. By default, even if the default value described above are found, the user can still change it. This option either gray out the dropdown or hide it.</td>
	</tr>
	<tr>
		<td>allowUpdate</td>
		<td>boolean</td>
		<td>false</td>
		<td>Display the update tab. If true, you will need to set at least one of the following options.</td>
	</tr>
	<tr>
		<td>updateAnyId</td>
		<td>boolean</td>
		<td>false</td>
		<td>Enable an input where you can put any id.</td>
	</tr>
	<tr>
		<td>ticketQuery</td>
		<td>string</td>
		<td>null</td>
		<td>Generate a drop down list of ticket conforming to the query. See the <a href="http://trac.edgewall.org/wiki/TicketQuery">Trac query</a> for the format of the query. ( Not eveything might be supported at the moment )</td>
	</tr>
</table>


#Changelog

v1.0
* Initial release