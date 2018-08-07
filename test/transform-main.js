'use strict';
/*jshint asi: true */

var test = require('tap').test
  , transform = require('../lib/transform')
  , exec = require("child_process").exec
  , fs = require('fs')

test('\ngiven headers from other files', function (t) {
  var mainToc = [ '- [Install](issue-93.md#install)',
                  '- [Configure](issue-93.md#configure)',
                  '- [Heading One](issue-94.md#heading-one)',
                  '  - [Subheading 1](issue-94.md#subheading-1)',
                  '  - [Subheading 2](issue-94.md#subheading-2)' ];
  var headers = [ { rank: 1, name: 'Install', line: 3, path: "issue-93.md" },
                  { rank: 1, name: 'Configure', line: 14, path: "issue-93.md" },
                  { rank: 1, name: 'Heading One', line: 18, path: "issue-94.md" },
                  { rank: 2, name: 'Subheading 1', line: 22, path: "issue-94.md" },
                  { rank: 2, name: 'Subheading 2', line: 23, path: "issue-94.md" } ];
  var transformed = transform('', undefined, undefined, undefined, undefined
    , undefined, headers);

  t.deepEqual(
      transformed.toc.split('\n')
    , [ '**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*',
        '' ].concat(mainToc).concat([ '' ])
    , 'generates correct main toc'
  )

  t.end()
})

test('\ngiven a file and the --main and -s options', function (t) {
  exec('node doctoc.js test/fixtures/readme-with-custom-title.md --main test/fixtures/dummy.md -s'
    , function (error, stdout, stderr) {
      if (error) {
        console.error('exec error: ', error);
        return;
      }
      t.match(stdout
        , '- [Installation](test/fixtures/readme-with-custom-title.md#installation)\n- [API](test/fixtures/readme-with-custom-title.md#api)\n- [License](test/fixtures/readme-with-custom-title.md#license)'
        , 'spits out the correct table of contents with file paths in the anchors')

      t.end()
    }
  )
})

test('\ngiven a file with multiple header levels and --main and -s options'
  , function (t) {
      exec('node doctoc.js test/fixtures/readme-with-html.md --main test/fixtures/dummy.md -s'
        , function (error, stdout, stderr) {
          if (error) {
            console.error('exec error: ', error);
            return;
          }
          t.match(stdout
            , '- [Installation](test/fixtures/readme-with-html.md#installation)\n- [API](test/fixtures/readme-with-html.md#api)\n    - [dockops::Containers(docker) → {Object}](test/fixtures/readme-with-html.md#dockopscontainersdocker-%E2%86%92-object)\n    - [dockops::Containers::activePorts(cb)](test/fixtures/readme-with-html.md#dockopscontainersactiveportscb)\n    - [dockops::Containers::clean(id, cb)](test/fixtures/readme-with-html.md#dockopscontainerscleanid-cb)\n- [License](test/fixtures/readme-with-html.md#license)'
            , 'spits out the correct table of contents with correct header depth')

          t.end()
        }
      )
    }
)

test('\ngiven the --main option with a file path and the -s option'
  , function (t) {
      exec('node doctoc.js test/fixtures/readme-with-html.md --main test/fixtures/dummy.md -s'
        , function (error, stdout, stderr) {
          if (error) {
            console.error('exec error: ', error);
            return;
          }
          t.ok(stdout.includes('"test/fixtures/dummy.md" should be updated')
            , 'says it should modify the main toc file at the given path');
          t.notOk(
            stdout.includes(
              '"test/fixtures/readme-with-html" should be updated')
            , "doesn't say it should modify the other file");

          t.end()
        }
      )
    }
)

test('\ngiven main toc file content that already has a toc section'
  , function (t) {
    var mainToc = [ '- [Install](issue-93.md#install)',
                    '- [Configure](issue-93.md#configure)',
                    '- [Heading One](issue-94.md#heading-one)',
                    '  - [Subheading 1](issue-94.md#subheading-1)',
                    '  - [Subheading 2](issue-94.md#subheading-2)' ];
    var content = [ 'bla ba some text',
                    '<!-- START doctoc generated TOC please keep comment here to allow auto update -->',
                    "<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->",
                    'Title',
                    '<!-- END doctoc generated TOC please keep comment here to allow auto update -->',
                    'This is the main TOC file.' ];
    var headers = [ { rank: 1, name: 'Install', line: 3, path: "issue-93.md" },
                    { rank: 1, name: 'Configure', line: 14, path: "issue-93.md" },
                    { rank: 1, name: 'Heading One', line: 18, path: "issue-94.md" },
                    { rank: 2, name: 'Subheading 1', line: 22, path: "issue-94.md" },
                    { rank: 2, name: 'Subheading 2', line: 23, path: "issue-94.md" } ];
    var transformed = transform(content.join('\n'), undefined, undefined
      , undefined, undefined, undefined, headers);

    t.deepEqual(
        transformed.data.split('\n')
      , content.slice(0, 4).concat([ '' ]).concat(mainToc)
        .concat([ '' ]).concat(content.slice(4, 6))
      , 'only that section is updated'
    )

    t.end()
  }
)

test('\ngiven the --main, the -s option, and a directory to make a main toc of'
  , function (t) {
      exec('node doctoc.js test/fixtures/dir --main test/fixtures/dummy.md -s'
        , function (error, stdout, stderr) {
          var toc = [
            '- [Heading One](test/fixtures/dir/readme-nameless-table-headers.md#heading-one)',
            '  - [Subheading 2](test/fixtures/dir/readme-nameless-table-headers.md#subheading-2)',
            '- [Single Backticks](test/fixtures/dir/readme-with-code.md#single-backticks)',
            '- [Multiple Backticks](test/fixtures/dir/readme-with-code.md#multiple-backticks)',
            '- [code tag](test/fixtures/dir/readme-with-code.md#code-tag)',
            '- [pre tag](test/fixtures/dir/readme-with-code.md#pre-tag)'
          ];
          if (error) {
            console.error('exec error: ', error);
            return;
          }
          t.match(stdout
            , toc.join('\n')
            , 'there are newlines between the tocs from each file')

          t.end()
        }
      )
    }
)

test('\ngiven the --main, the -s option, and --entryprefix "*"'
  , function (t) {
      exec(
        'node doctoc.js test/fixtures/dir --main test/fixtures/dummy.md -s --entryprefix "*"'
        , function (error, stdout, stderr) {
          var toc = [
            '* [Heading One](test/fixtures/dir/readme-nameless-table-headers.md#heading-one)',
            '  * [Subheading 2](test/fixtures/dir/readme-nameless-table-headers.md#subheading-2)',
            '* [Single Backticks](test/fixtures/dir/readme-with-code.md#single-backticks)',
            '* [Multiple Backticks](test/fixtures/dir/readme-with-code.md#multiple-backticks)',
            '* [code tag](test/fixtures/dir/readme-with-code.md#code-tag)',
            '* [pre tag](test/fixtures/dir/readme-with-code.md#pre-tag)'
          ];
          if (error) {
            console.error('exec error: ', error);
            return;
          }
          t.ok(stdout.includes(toc.join('\n'))
            , 'the --entryprefix option is respected')

          t.end()
        }
      )
    }
)

test('\ngiven the --main, the -s option, and a four-space indentation mode'
  , function (t) {
      exec(
        'node doctoc.js test/fixtures/dir --main test/fixtures/dummy.md -s --gitlab'
        , function (error, stdout, stderr) {
          var toc = [
            '- [Heading One](test/fixtures/dir/readme-nameless-table-headers.md#heading-one)',
            '    - [Subheading 2](test/fixtures/dir/readme-nameless-table-headers.md#subheading-2)',
            '- [Single Backticks](test/fixtures/dir/readme-with-code.md#single-backticks)',
            '- [Multiple Backticks](test/fixtures/dir/readme-with-code.md#multiple-backticks)',
            '- [code tag](test/fixtures/dir/readme-with-code.md#code-tag)',
            '- [pre tag](test/fixtures/dir/readme-with-code.md#pre-tag)'
          ];
          if (error) {
            console.error('exec error: ', error);
            return;
          }
          t.ok(stdout.includes(toc.join('\n'))
            , 'four-space indentation is used')

          t.end()
        }
      )
    }
)
