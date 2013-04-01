(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([
            'jquery',
            'json.edit',
            'couchr',
            'text!./form.html'
        ],factory);
    } else {
        // browser global
        $.get('./form.html', function(form_t){
            root.couchapp_settings = factory(
                root.jQuery,
                root.JsonEdit,
                root.couchr,
                form_t
            );
        });

    }
}(this, function ($, jsonEdit, couchr, form_t) {


    function settings($elem, ddoc_url, schema_property, settings_property, callback) {

        if ($.isFunction(schema_property) && !callback) {
            callback = schema_property;
            schema_property = null;
        } else if ($.isFunction(settings_property) && !callback) {
            callback = settings_property;
            schema_property = null;
        }

        if (!settings_property) settings_property = 'app_settings';
        if (!schema_property) {
            schema_property = 'couchapp.config.settings_schema';
        }

        $elem.html(form_t);

        get_ddoc(ddoc_url, function(err, doc){
            var schema = simple_path(schema_property, doc);
            try {
                var current_values = simple_path(settings_property, doc);
                if (current_values) schema['default'] = current_values;
            } catch(e) {}


            editor = JsonEdit('app_settings_schema', schema);

            $elem.find('form').on('submit', function(){
                try {
                    submit($elem, editor, doc, ddoc_url);
                } catch (e) {}
                return false;
            });

        });
    }

    function submit($elem, editor, doc, ddoc_url) {

        var btn = $elem.find('button.save');
        //btn.button('saving');
        var err_alert = $elem.find('.alert');
        err_alert.hide(10);

        var form = editor.collect();
        if (!form.result.ok) {

           err_alert.show(200)
               .find('button.close')
               .on('click', function () { err_alert.hide(); });
           err_alert.find('h4')
                .text(form.result.msg);
           return false;
        }
        doc.app_settings = form.data;
        couchr.put(ddoc_url, doc, function(err, results){
            if (err) return alert('could not save');
            if (!callback) return;
            callback(err, {
                app_settings: doc.app_settings
            });
        });

    }


    function simple_path(path, json) {
        var parts = path.split('.');
        var obj = json;
        for (var i=0; i < parts.length; i++) {
            obj = obj[parts[i]];
        }
        return obj;
    }



    function get_ddoc(ddoc_url, callback) {
        couchr.get(ddoc_url, callback);
    }

    return settings;
}));