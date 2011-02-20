var ajax_transport = new XMLHttpRequest();
var pageURL;

function getSummary(url)
{
	chrome.tabs.getSelected(null, function(tab) 
	{
		pageURL = tab.url;
		request("http://www.too-long-didnt-read.com/api/summaries?url=" + tab.url, process_popup);
	});
}

function request(url, handler)
{
	ajax_transport.open("GET", url, true);
	ajax_transport.onreadystatechange = handler;
	ajax_transport.send(null);
}

function post(url, data)
{
	ajax_transport.open("POST", url, true);
	ajax_transport.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	ajax_transport.setRequestHeader("Content-length", data.length);
	ajax_transport.setRequestHeader("Connection", "close");
	
	ajax_transport.send(data);
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
	
	// Add your own summary
	var container = document.createElement('div');
	container.setAttribute('class', 'box');
	container.setAttribute('id', 'add_box');
	
	container.innerHTML = "";
	container.innerHTML += "<h1>Submit your own summary:</h1>";
	container.innerHTML += "<form>";
	container.innerHTML += "	<textarea name='summary[content]' value='' id='summary'></textarea>";
	container.innerHTML += "	<input type='hidden' name='webpage[url]' id='' value='" + pageURL + "' />";
	container.innerHTML += "	<input type='hidden' name='summary[author]' id='author' value='Anonymous' />";
	container.innerHTML += "	<input type='button' value='Add' onclick='submit_summary()' />";
	container.innerHTML += "</form>";
	
	document.body.appendChild(container);
	
	document.getElementById('loading').style.display = 'none';
}

function submit_summary()
{
	var summary = document.getElementById('summary').value;
	var author  = document.getElementById('author').value;
	
	var data = "summary[content]=" + encodeURIComponent(summary)
		+ "&webpage[url]=" + encodeURIComponent(pageURL)
		+ "&summary[author]=" + encodeURIComponent(author);
		
	document.getElementById('add_box').style.display = 'none';
		
	post("http://www.too-long-didnt-read.com/api/summaries", data);
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






















