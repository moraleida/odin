"use strict";

module.exports = function(grunt) {

    require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

    var odinConfig = {

        // setting folder templates
        dirs: {
            js: "../assets/js",
            sass: "../assets/sass",
            images: "../assets/images",
            fonts: "../assets/fonts",
            core: "../core",
            tmp: "tmp"
        },

        // javascript linting with jshint
        jshint: {
            options: {
                jshintrc: "../.jshintrc"
            },
            all: [
                "Gruntfile.js",
                "<%= dirs.js %>/main.js"
            ]
        },

        // uglify to concat and minify
        uglify: {
            dist: {
                files: {
                    "<%= dirs.js %>/main.min.js": [
                        "<%= dirs.js %>/jquery.fitvids.min.js", // FitVids
                        "<%= dirs.js %>/libs/*.js",             // External libs/pugins
                        "<%= dirs.js %>/main.js"                // Custom JavaScript
                    ]
                }
            },
            bootstrap: {
                files: {
                    "<%= dirs.js %>/bootstrap.min.js": [
                        '<%= dirs.js %>/bootstrap/transition.js',
                        '<%= dirs.js %>/bootstrap/alert.js',
                        '<%= dirs.js %>/bootstrap/button.js',
                        '<%= dirs.js %>/bootstrap/carousel.js',
                        '<%= dirs.js %>/bootstrap/collapse.js',
                        '<%= dirs.js %>/bootstrap/dropdown.js',
                        '<%= dirs.js %>/bootstrap/modal.js',
                        '<%= dirs.js %>/bootstrap/tooltip.js',
                        '<%= dirs.js %>/bootstrap/popover.js',
                        '<%= dirs.js %>/bootstrap/scrollspy.js',
                        '<%= dirs.js %>/bootstrap/tab.js',
                        '<%= dirs.js %>/bootstrap/affix.js'
                    ]
                }
            }
        },

        // compile scss/sass files to CSS
        compass: {
            dist: {
                options: {
                    config: "config.rb",
                    force: true,
                    outputStyle: "compressed"
                }
            }
        },

        // watch for changes and trigger compass, jshint and uglify
        watch: {
            compass: {
                files: [
                    "<%= dirs.sass %>/**"
                ],
                tasks: ["compass"]
            },
            js: {
                files: [
                    "<%= jshint.all %>"
                ],
                tasks: ["jshint", "uglify"]
            }
        },

        // image optimization
        imagemin: {
            dist: {
                options: {
                    optimizationLevel: 7,
                    progressive: true
                },
                files: [{
                    expand: true,
                    cwd: "<%= dirs.images %>/",
                    src: "**",
                    dest: "<%= dirs.images %>/"
                }]
            }
        },

        // deploy via rsync
        rsync: {
            staging: {
                src: "../",
                dest: "~/PATH/wp-content/themes/odin",
                host: "user@host.com",
                recursive: true,
                syncDest: true,
                exclude: [
                    "**.DS_Store",
                    "**Thumbs.db",
                    ".git/",
                    ".gitignore",
                    "sass/",
                    "src/",
                    "README.md"
                ]
            },
            production: {
                src: "../",
                dest: "~/PATH/wp-content/themes/odin",
                host: "user@host.com",
                recursive: true,
                syncDest: true,
                exclude: "<%= rsync.staging.exclude %>"
            }
        },

        // ftp deploy
        // ref: https://npmjs.org/package/grunt-ftp-deploy
        "ftp-deploy": {
            build: {
                auth: {
                    host: "ftp.SEU-SITE.com",
                    port: 21,
                    authKey: "key_for_deploy"
                },
                src: "../",
                dest: "/PATH/wp-content/themes/odin",
                exclusions: [
                    "../**.DS_Store",
                    "../**Thumbs.db",
                    "../.git/*",
                    "../.gitignore",
                    "../assets/sass/*",
                    "../src/*",
                    "../src/.sass-cache/*",
                    "../src/node_modules/*",
                    "../src/.ftppass",
                    "../src/Gruntfile.js",
                    "../src/config.rb",
                    "../src/package.json",
                    "../README.md",
                    "../**/README.md"
                ]
            }
        },

        // downloads dependencies
        curl: {
            bootstrap_sass: {
                src: "https://github.com/jlong/sass-bootstrap/archive/master.zip",
                dest: "<%= dirs.tmp %>/bootstrap-sass.zip"
            }
        },

        // unzip files
        unzip: {
            bootstrap_scss: {
                src: "<%= dirs.tmp %>/bootstrap-sass.zip",
                dest: "<%= dirs.tmp %>/"
            }
        },

        // renames and moves directories and files
        rename: {
            bootstrap_scss: {
                src: "<%= dirs.tmp %>/sass-bootstrap-master/lib",
                dest: "<%= dirs.sass %>/bootstrap"
            },
            bootstrap_js: {
                src: "<%= dirs.tmp %>/sass-bootstrap-master/js",
                dest: "<%= dirs.js %>/bootstrap"
            },
            bootstrap_fonts: {
                src: "<%= dirs.tmp %>/sass-bootstrap-master/fonts",
                dest: "<%= dirs.fonts %>/bootstrap"
            }
        },

        // clean directories and files
        clean: {
            prepare: [
                "<%= dirs.tmp %>",
                "<%= dirs.sass %>/bootstrap/",
                "<%= dirs.js %>/bootstrap/",
                "<%= dirs.fonts %>/bootstrap/"
            ],
            bootstrap: [
                "<%= dirs.js %>/bootstrap/tests/",
                "<%= dirs.js %>/bootstrap/.jshintrc",
                "<%= dirs.sass %>/bootstrap/bootstrap.scss",
                "<%= dirs.sass %>/bootstrap/responsive.scss",
                "<%= dirs.tmp %>"
            ]
        }
    };

    // Initialize Grunt Config
    // --------------------------
    grunt.initConfig(odinConfig);


    // Register Tasks
    // --------------------------

    // Default Task
    grunt.registerTask("default", [
        "jshint",
        "compass",
        "uglify"
    ]);

    // Optimize Images Task
    grunt.registerTask("optimize", ["imagemin"]);

    // Deploy Tasks
    grunt.registerTask("ftp", ["ftp-deploy"]);

    // Bootstrap Task
    grunt.registerTask("bootstrap", [
        "clean:prepare",
        "curl:bootstrap_sass",
        "unzip:bootstrap_scss",
        "rename:bootstrap_scss",
        "rename:bootstrap_js",
        "rename:bootstrap_fonts",
        "clean:bootstrap",
        "uglify:bootstrap",
        "compass"
    ]);

    // Short aliases
    grunt.registerTask("w", ["watch"]);
    grunt.registerTask("o", ["optimize"]);
    grunt.registerTask("f", ["ftp"]);
    grunt.registerTask("r", ["rsync"]);
};
