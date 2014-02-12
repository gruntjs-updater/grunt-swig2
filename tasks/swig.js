module.exports = function( grunt ) {
    "use strict";

    // _ has been deprecated and will be removed in the future.
    // Ideally move to lodash itself whenever possible
    var _ = grunt.util._;
    var swig = require( "swig" );
    var loaders = swig.loaders;
    var Swig = swig.Swig;

    grunt.registerMultiTask( "swig", "Render Swig templates to HTML", function() {
        var options = this.options({
            data: {},
            tags: {},
            swigOptions: {}
        });
        var data = options.data;

        // Until the fix with paularmstrong/swig#419 gets released, we'll do this way.
        var swigOpts = _.extend( options.swigOptions, {
            loader: loaders.fs( process.cwd() )
        });
        var swig = new Swig( swigOpts );

        // Add custom filters
        _.forEach( options.filters, function( callback, name ) {
            swig.setFilter( name, callback );
        });

        // Add custom tags
        _.forEach( options.tags, function( tag, name ) {
            swig.setTag( name, tag.parse, tag.compile, tag.ends, tag.blockLevel );

            if ( tag.ext ) {
                swig.setExtension( name, tag.ext );
            }
        });

        // If we have dynamic locals, let's do this
        if ( typeof data === "function" ) {
            data = data();
            data = grunt.config.process( data );
        }

        // Iterate thru sources and create them
        this.files.forEach(function( file ) {
            var contents = "";

            file.src.forEach(function( src ) {
                contents += swig.renderFile( src, _.clone( data ) );
            });

            grunt.file.write( file.dest, contents, {
                // swig only reads in utf8.
                // if this ever change in swig, we'll need to do it here as well
                encoding: "utf8"
            });
            grunt.log.writeln( "File " + file.dest.cyan + " created." );
        });
    });
};