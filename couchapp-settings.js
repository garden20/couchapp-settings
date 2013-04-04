(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([
            'jquery',
            'json.edit',
            'couchr',
            'events',
            'text!./form.html'
        ],factory);
    } else {
        // browser global
        $.get('./form.html', function(form_t){
            root.couchapp_settings = factory(
                root.jQuery,
                root.JsonEdit,
                root.couchr,
                root.events,
                form_t
            );
        });

    }
}(this, function ($, jsonEdit, couchr, events, form_t) {


    function settings_doc($elem, ddoc_url, schema_property, settings_doc_url) {
        var emitter = new events.EventEmitter();

        get_doc(doc_url, function(err, doc){

            // I guess we should check if its just a 404
            // if (err) return emitter.emit('error', err);

            get_doc(ddoc_url, function(err, ddoc){
                if (err) return emitter.emit('error', err);

                var schema = load_schema(ddoc, schema_property, emitter);

                render($elem, emitter, schema, current_values, function(err, new_settings){

                    if (doc && doc._id)  new_settings._id = doc._id;
                    if (doc && doc._rev) new_settings._rev = doc._rev;

                    couchr.put(settings_doc_url, doc, function(err, results){
                        if (err) return render_err($elem, 'Could not save');

                        emitter.emit('saved', {
                            app_settings: doc
                        });

                    });
                });

            });
        });

        return emitter;
    }




    function settings_ddoc($elem, ddoc_url, schema_property, settings_property) {

        if (!settings_property) settings_property = 'app_settings';

        get_doc(ddoc_url, function(err, doc){
            if (err) return emitter.emit('error', err);

            var schema = load_schema(doc, schema_property, emitter),
                current_values = null;
            try {
                current_values = simple_path(settings_property, doc);
            } catch(e) {}

            render($elem, emitter, schema, current_values, function(err, new_settings){
                doc.app_settings = new_settings;
                couchr.put(ddoc_url, doc, function(err, results){
                    if (err) return render_err($elem, 'Could not save');

                    emitter.emit('saved', {
                        app_settings: new_settings
                    });

                });
            });
        });
        return emitter;
    }

    function load_schema(ddoc, schema_property, emitter) {
        if (!schema_property) {
            schema_property = 'couchapp.config.settings_schema';
        }
        var schema = simple_path(schema_property, doc);
        emitter.emit('schema', schema);
    }


    function render($elem, emitter,  schema, current_values, on_submit) {

        if (current_values) schema['default'] = current_values;
        $elem.html(form_t);
        var editor = JsonEdit('app_settings_schema', schema);
        emitter.emit('rendered');

        $('form.schema_form').on('submit', function() {
            return false;
        });
        $('form.schema_form button.save').on('click', function(){
            emitter.emit('beforeSubmit');
            try {
                submit($elem, editor, emitter, on_submit);
            } catch (e) {}
            return false;
        });
    }

    function submit($elem, editor, emitter, cb) {

        clear_err($elem);

        var form = editor.collect();
        if (!form.result.ok) {
            emitter.emit('error', form);
            render_err($elem, form.result.msg);
            cb(err);
        } else {
            cb(null, form.data);
        }
    }

    function render_err($elem, msg) {
        var err_alert = $elem.find('.alert');
        var btn = $elem.find('button.save');
        err_alert.show(200)
                .find('button.close')
                .on('click', function () {
                    err_alert.hide();
                });
            err_alert.find('h4')
                .text(msg);
    }

    function clear_err($elem) {
        $elem.find('.alert').hide(10);
    }


    function simple_path(path, json) {
        var parts = path.split('.');
        var obj = json;
        for (var i=0; i < parts.length; i++) {
            obj = obj[parts[i]];
        }
        return obj;
    }



    function get_doc(doc_url, callback) {
        couchr.get(doc_url, callback);
    }

    return {
        doc: settings_doc,
        ddoc: settings_ddoc
    };
}));