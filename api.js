var ajax_transport = new XMLHttpRequest();
var tabID;
var pageURL

function getSummary(url)
{
	chrome.tabs.getSelected(null, function(tab) 
	{
		request("http://www.too-long-didnt-read.com/api/summaries?url=" + tab.url, process_popup);
	});
}

function request(url, handler)
{
	ajax_transport.open("GET", url, true);
	ajax_transport.onreadystatechange = handler;
	ajax_transport.send(null);
}

function process_popup()
{
	if (ajax_transport.readyState != 4)
	{
		return;
	}
	
	var response = ajax_transport.responseText;
	var json = JSON.parse(response);
	
	var _summaries = json.summaries;
	var _webpage   = json.webpage;
	
	for (var i = 0; i < _summaries.length; i++)
	{
		// Container
		var container = document.createElement('div');
		container.setAttribute('class', 'box');
		
		// Content
		var content = document.createElement('p');
		content.innerText = _summaries[i].content;
		
		// Authorship
		var about = document.createElement('p');
		about.setAttribute('class', 'about');
		about.innerText = "by " + 
			(_summaries[i].author == null ? "Anonymous" : _summaries[i].author);
		
		// Add items to container
		container.appendChild(content);
		container.appendChild(about);
		
		// Add container to body
		document.body.appendChild(container);
	}
}

function process_background()
{
	if (ajax_transport.readyState != 4)
	{
		return;
	}
	
	var response = ajax_transport.responseText;
	var json = JSON.parse(response);
	
	var _summaries = json.summaries;
	var _webpage   = json.webpage;
	
	if (_summaries.length > 0)
	{
		chrome.pageAction.show(tabID);
	}
}






















