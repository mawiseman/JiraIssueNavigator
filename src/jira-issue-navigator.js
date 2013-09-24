/**
 * jira-issue-navigator.js
 *
 * Enhance the Jira Issue Navigator by grouping projects
 *
 * (C) 2012 Mark Wiseman
 *
 */
 
 var jiraIssueNavigator = {
	
	IsGrouped: false,

	HideText: '< Hide',
	ShowText: 'Show >',
	
	/**
 	* Store Project Visibility in localStorage
 	*
 	* @param {String} the project code
	* @param {bool} the new visibile status
 	*/
	SetProjectVisibility : function (projectCode, isVisible)
	{
		if( typeof(Storage) !== "undefined" )
		{
			var allJsonProjectVisibility = new Array();
			
			if(window.localStorage.getItem('ProjectVisibility') != null && window.localStorage.getItem('ProjectVisibility') != "")
				allJsonProjectVisibility = JSON.parse(window.localStorage.getItem('ProjectVisibility'));
			
			var isNew = true;
			
			for(var i = 0; i < allJsonProjectVisibility.length; i++)
			{
				if(allJsonProjectVisibility[i].projectCode == projectCode)
				{
					allJsonProjectVisibility[i].isVisible = isVisible;
					isNew = false;
				}
			}
			
			if(isNew)
			{
				var jsonProjectVisibility = { 
					projectCode : projectCode, 
					isVisible : isVisible 
				};
				
				allJsonProjectVisibility.push(jsonProjectVisibility);
			}
			
			window.localStorage.setItem('ProjectVisibility', JSON.stringify(allJsonProjectVisibility));
		}
	},

	/**
 	* Get the Project Visibility from localStorage
 	*
 	* @param {String} the project code
	* @return {bool} visibility status
 	*/
	GetProjectVisibility : function (projectCode)
	{
		if(typeof(Storage)!=="undefined")
		{
			var allJsonProjectVisibility = new Array();
			
			if(window.localStorage.getItem('ProjectVisibility') != null && window.localStorage.getItem('ProjectVisibility') != "")
				allJsonProjectVisibility = JSON.parse(window.localStorage.getItem('ProjectVisibility'));
			
			if(allJsonProjectVisibility != "")
			{
			
				for(var i = 0; i < allJsonProjectVisibility.length; i++)
				{
					if(allJsonProjectVisibility[i].projectCode == projectCode)
					{
						return allJsonProjectVisibility[i].isVisible;
					}
				}
			}			
		}
		
		return false;
	},

	/**
 	* Set weather Grouping is turned on or off
 	*
 	* @param {bool} grouping status
 	*/
	SetIsGrouped : function (isGrouped)
	{
		jiraIssueNavigator.IsGrouped = isGrouped;
		
		if( typeof(Storage) !== "undefined" )
		{
			window.localStorage.setItem('IsGrouped', isGrouped);
		}
	},

	/**
 	* Find out if Grouping is turned on or off
 	*
 	* @return {bool} grouping status
 	*/
	GetIsGrouped : function ()
	{
		if( typeof(Storage) !== "undefined" )
		{
			if(window.localStorage.getItem('IsGrouped') != null)
				jiraIssueNavigator.IsGrouped = window.localStorage.getItem('IsGrouped');
		}
		
		return jiraIssueNavigator.IsGrouped;
	},

	/**
 	* Group all issues on the screen
 	* If Grouping is already enabled, clear it and re-group
 	*/
	GroupIssues : function ()
	{
		if(jiraIssueNavigator.GetIsGrouped())
			jiraIssueNavigator.UnGroupIssues();
			
		jiraIssueNavigator.SetIsGrouped(true);
		
		var lastProject = '';
		var columns = $("#issuetable tr:first td").length;

		$(".issuetable-wrap tr td.issuekey a").each(function()
		{
			var currentProject = $(this).text().substring(0, $(this).text().indexOf('-'));
			
			if(currentProject != lastProject)
			{
				var headerRow = "<tr class='my_groups' projectCode='" + currentProject + "'>";
				headerRow += "<td colspan='" + (columns - 1) + "'><h3>" + currentProject + "</h3><h4></h4></td>";		
				headerRow += "<td align='right'><a class='smallgrey showhide' href=''>" + jiraIssueNavigator.HideText + "</a></td>";		
				headerRow += "</tr>";
				
				$(this).parents('tr:first').before(headerRow);
				lastProject = currentProject;
			}
		});

		$("tr.my_groups").each(function(){
			var issues = 0;
			var isGroup = false;
			
			var tr = $(this);

			//Update the Group Titles with Totals
			
			while(!isGroup)
			{
				var tr = tr.next();
				
				if(tr.length == 0){
					isGroup = true; //there are no more issues
				}
				
				if(tr.hasClass('my_groups')) {
					isGroup = true;
				}
				else {
					issues += 1;
				}
			}
			
			$(this).find('h4').append(issues);
			
			//Show or hide this group
			
			var isVisible = jiraIssueNavigator.GetProjectVisibility($(this).attr('projectCode'));
			
			if(isVisible == false)
			{
				$(this).find("a.showhide").click();
			}
		});

		$("tr.my_groups h3")
			.width(80)
			.css({ float: "left" });

		$("tr.my_groups h4")
			.width(20)
			.css({ float: "left", "text-align": "right" });
		
		$("tr a.showhide")
			.css({ "white-space": "nowrap" });
			
		$("tr.my_groups").mouseenter(function(){
			$(this).css({ "background-color": "#C0C0C0" });
		});
		
		$("tr.my_groups").mouseleave(function(){
			$(this).css({ "background-color": "#D2D2D2" });
		});
	},

	/**
 	* Remove all Grouping rows
 	*/
	UnGroupIssues : function ()
	{
		$("tr.my_groups").remove();
		$("tr").show();
		
		jiraIssueNavigator.SetIsGrouped(false)
	},

	/**
 	* Remove / Reset all settings from localStorage
 	*/
	ResetSettings : function ()
	{
		if( typeof(Storage) !== "undefined" )
		{
			var allJsonProjectVisibility = new Array();
			window.localStorage.setItem('ProjectVisibility', allJsonProjectVisibility);			
			window.localStorage.setItem('IsGrouped', false);
		}
	},

	/**
 	* Show or Hide a groups child rows
 	*
 	* @param {element} the a element clicked
 	*/
	ShowHideGroup : function (link)
	{
		var isVisible = false;

		$(link).closest("tr").nextAll().each(function() {
			if ($(this).hasClass('my_groups')) 
				return false;
			
			$(this).toggle();
			
			isVisible = $(this).is(":visible");
		});
		
		var projectCode = $(link).parents('tr:first').attr('projectCode');
		
		jiraIssueNavigator.SetProjectVisibility(projectCode, isVisible);
		
		if($(link).text() == jiraIssueNavigator.ShowText)
			$(link).text(jiraIssueNavigator.HideText);
		else
			$(link).text(jiraIssueNavigator.ShowText);
	},
	
	CreateMenu : function ()
	{
		
		var menuHtml = ''
			+ '<li class="aui-dd-parent">'
			+ '	<a class="lnk aui-dd-link standard icon-tools" id="viewJinGroupItems" href="#"><span>Grouping</span></a>'
			+ '	<div class="aui-dropdown standard hidden" id="viewJinGroupItems-dropdown">'
			+ '		<ul id="viewJinGroupItems-dropdown" class="last">'
			+ '			<li class="dropdown-item"><a id="jinGroupItems" rel="nofollow" href="#">Group Issues</a></li>'
			+ '			<li class="dropdown-item"><a id="jinUnGroupItems" rel="nofollow" href="#">Ungroup Issues</a></li>'
			+ '			<li class="dropdown-item"><a id="jinResetGroup" rel="nofollow" href="#">Reset</a></li>'
			+ '		</ul>'
			+ '	</div>'
			+ '</li>';
		
		$("#navigator-options ul:first").append(menuHtml);
		
		AJS.$("#navigator-options .aui-dd-parent").dropDown("Standard", {
			trigger: ".aui-dd-link"
		});
		
		$("#jinGroupItems").click(function()
		{
			jiraIssueNavigator.GroupIssues();
			return false;
		});
		
		$("#jinUnGroupItems").click(function()
		{
			jiraIssueNavigator.UnGroupIssues();
			return false;
		});
		
		$("#jinResetGroup").click(function()
		{
			jiraIssueNavigator.ResetSettings();
			jiraIssueNavigator.UnGroupIssues();
			return false;
		});
	}
 };
 

$(document).ready(function() {
	
	jiraIssueNavigator.CreateMenu();
	
	if(jiraIssueNavigator.GetIsGrouped() == "true")
		jiraIssueNavigator.GroupIssues();
});


$(".issuetable-wrap tr.my_groups a").live("click", function(event)
{
	jiraIssueNavigator.ShowHideGroup(this);
	return false;
});