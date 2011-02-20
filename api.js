var pageURL;
//var tldrURL = "http://www.too-long-didnt-read.com";
var tldrURL = "http://tldr.dev";

function loadAndDisplaySummaries(){
  chrome.tabs.getSelected(null, function(tab){
    pageURL = tab.url;
    var randomizer = Math.floor(Math.random()*10000); // prevents server caching issues

    $.ajax({
      url: tldrURL+"/api/summaries?url="+pageURL+"&rand="+randomizer,
      type: "GET",
      dataType: "json",
      beforeSend: function(){
        $("#summaries").html(""); // empty the current summaries
        $("#loading_box").show();
      },
      complete: function(){
        $("#loading_box").hide();
      },
      success: function(json){
        var summaries = json.summaries;
        var webpage   = json.webpage;

        if(summaries.length == 0){
          // no summaries
          $("#summaries").html("<p><em>No summaries for this URL (yet!)</em></p>");
          return true;
        }

        // run through the array to show the summaries
        for(var i = 0; i < summaries.length; i++){
          var box_summary_string = '<div class="box summary">';
          box_summary_string += '<p class="content">'+summaries[i].content+'</p>';
          if(summaries[i].author == null){
            box_summary_string += '<p class="about">Anonymous</p>';
          } else {
            box_summary_string += '<p class="about">by '+summaries[i].author+'</p>';
          }
          box_summary_string += '</div>';

          $("#summaries").append($(box_summary_string));
        }

        // if there are more summaries than those displayed
        if(webpage.summaries_count > summaries.length){

          var total_difference = webpage.summaries_count - summaries.length;
          var read_more_string = "<p><em>";
          if(total_difference == 1){
            read_more_string += "There is one more summary.";
          } else {
            read_more_string += "There are "+total_difference+" more summaries.";
          }
          read_more_string += ' <a href="'+tldrURL+'/'+webpage.handle+'" target="_blank">Read all summaries</a></em></p>';

          $("#summaries").append($(read_more_string));
        }

      },
      error: function(){
        $("#summaries").html("<p><em>An error occurred while retrieving the summaries for this URL. Please try again later.</em></p>");
      }
    });
  });
}



function submitSummary(){
  chrome.tabs.getSelected(null, function(tab){
    pageURL = tab.url;
    var randomizer = Math.floor(Math.random()*10000); // prevents server caching issues

    var summary_content = $("#summary_content").val();
    var summary_author = $("#summary_author").val();
    
    var data = "summary[content]=" + encodeURIComponent(summary_content)
      + "&webpage[url]=" + encodeURIComponent(pageURL)
      + "&summary[author]=" + encodeURIComponent(summary_author)
      + "&rand=" + randomizer;

    $.ajax({
      url: tldrURL+"/api/summaries",
      data: data,
      type: "POST",
      dataType: "json",
      beforeSend: function(){
        $("#summaries").html(""); // empty the current summaries
        $("#loading_box").show();
      },
      complete: function(){
        $("#loading_box").hide();
      },
      success: function(json){
        if(json.submit_status == "success"){

          //$.cookie("summary_author", summary_author, { expires: 30 }); // in order to remind the name
          setCookie("summary_author", summary_author, 30);

          loadAndDisplaySummaries();
          // the request is async, the following line is moot
          // $("#summaries").append("<p><em>Your summary has been successfully added.</em></p>");
        } else if(json.submit_status == "failure"){
          $("#summaries").append("<p><strong>Errors:</strong></p>");
          var errors_string = "<ul>";
          for(var i = 0; i < json.errors.length; i++){
            errors_string += "<li>"+json.errors[i]+"</li>";
          }
          errors_string += "</ul>";
          $("#summaries").append($(errors_string));
        }
      },
      error: function(){
        $("#summaries").html("<p><em>An error occurred while submitting. Please try again later.</em></p>");
      }
    });
  });
}


// copy/pasted functions to get/set cookies easily

function setCookie(c_name,value,exdays){
  var exdate=new Date();
  exdate.setDate(exdate.getDate() + exdays);
  var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
  document.cookie=c_name + "=" + c_value;
}

function getCookie(c_name){
  var i,x,y,ARRcookies=document.cookie.split(";");
  for (i=0;i<ARRcookies.length;i++){
    x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
    y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
    x=x.replace(/^\s+|\s+$/g,"");
    if (x==c_name){
      return unescape(y);
    }
  }
}
