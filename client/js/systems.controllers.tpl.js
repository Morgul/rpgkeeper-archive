<%
var getFiles = function(prop) {return grunt.file.expand({cwd:'.'},grunt.config.get(prop));};
%>//----------------------------------------------------------------------------------------------------------------------
// This is an autogenerated file containing the contents of all the controller javascript for all the systems.
//
// @module systems.controllers.js
//----------------------------------------------------------------------------------------------------------------------

var module = angular.module('rpgkeeper.systems.controllers', []);

<% _.forEach(getFiles('project.systems.controllers'), function(src) { var file = grunt.file.read(src); %>
/* ====================== Begin: <%= src %> ====================== */

<%= file %>

/* ======================  End: <%= src %>  ====================== */
<% }); %>

//----------------------------------------------------------------------------------------------------------------------