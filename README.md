JiraIssueNavigator
==================

This is a script to make JIRA's Issue Navigator more useable by grouping issues by Project Key and saving your view settings in localStorage so next time you view the IssueNavigator your last view is saved

Installation
------------
To get it to work you will need to do the following:

Save jira-issue-navigator.js to: \atlassian-jira\includes\js

Modify header-depreciated.jsp
location: \atlassian-jira\includes\decorators\header-depreciated.jsp

Add a reference to the script file just before the </head> tag
<script src="https://[your url]/includes/js/revium-issuenavigator.js"></script>
