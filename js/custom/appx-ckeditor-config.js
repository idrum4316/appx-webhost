CKEDITOR.editorConfig = function( config ) {

    config.toolbarGroups = [
        { name: 'document', groups: [ 'document', 'mode', 'doctools' ] },
        { name: 'clipboard', groups: ['selection', 'clipboard', 'undo' ] },
        { name: 'editing', groups: [ 'find', 'editing' ] },
        { name: 'forms', groups: [ 'forms' ] },
        { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
        { name: 'colors', groups: [ 'colors' ] },
        { name: 'paragraph', groups: [ 'list', 'indent', 'blocks', 'align', 'bidi', 'paragraph' ] },
        { name: 'links', groups: [ 'links' ] },
        { name: 'insert', groups: [ 'insert' ] },
        { name: 'styles', groups: [ 'styles' ] },
    ];

    config.removeButtons = 'Form,Checkbox,Radio,TextField,Textarea,Select,Button,ImageButton,HiddenField,BidiLtr,BidiRtl,Iframe,Smiley,CreateDiv,ShowBlocks,Anchor,Code';
    config.disableNativeSpellChecker = false;
    config.fillEmptyBlocks = false;
    config.allowedContent = true;
};
