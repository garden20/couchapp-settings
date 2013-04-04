couchapp-settings
=================

Reusable widget to set couchapp settings based on a json-schema.

    jam install couchapp-settings


Usage 1. Use a seperate doc
----------------------------

Save settings to a doc in the db.

params

  - $elem, a jquery dom element
  - ddoc_url, the full or relative path to the design doc that holds the schema
  - schema_property, the path to the schema property. Only supports dotted notation. default: 'couchapp.config.settings_schema'
  - settings_doc_url, the full or relative path to the settings doc.

```
define(['couchapp-settings'], function(settings){

   var ui = settings.doc('#domid', 'http://me.ic.ht/db/_design/app', 'schema', 'http://me.ic.ht/db/settings');

   //events
   ui.on('schema', function(schema){  // the schema   });
   ui.on('rendered', function(){  // when the schema has been rendered to the form   });
   ui.on('beforeSubmit', function(){  // when the submit button has been clicked   });
   ui.on('error', function(err){  // any  errors that occur  });
})
```

Usage 2. Save to the design doc
--------------------------------

The advantage in this case is that the settings can be available for show, list, and views.

params

  - $elem, a jquery dom element
  - ddoc_url, the full or relative path to the design doc that holds the schema
  - schema_property, the path to the schema property. Only supports dotted notation. default: 'couchapp.config.settings_schema'
  - settings_property, the path to the current settings property. Only supports dotted notation. default: 'app_settings'

```
define(['couchapp-settings'], function(settings){

   var ui = settings.doc('#domid', 'http://me.ic.ht/db/_design/app', 'schema', 'app_settings');

   //events
   ui.on('schema', function(schema){  // the schema   });
   ui.on('rendered', function(){  // when the schema has been rendered to the form   });
   ui.on('beforeSubmit', function(){  // when the submit button has been clicked   });
   ui.on('error', function(err){  // any  errors that occur  });
})
```