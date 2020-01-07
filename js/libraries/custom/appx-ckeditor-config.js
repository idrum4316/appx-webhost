CKEDITOR.editorConfig = function( config ) {

    config.toolbar = 
	[
	    { name: 'clipboard', items : [ 'Cut','Copy','Paste','-','Undo','Redo' ] },
	    { name: 'basicstyles', items : [ 'Bold','Italic' ] },
	    { name: 'paragraph', items : [ 'NumberedList','BulletedList','-','Outdent','Indent','-','JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock', '-', 'Source' ] },
	    { name: 'links', items : [ 'Link' ] },
	    { name: 'insert', items : [ 'Table','HorizontalRule' ] },
	    '/',
	    { name: 'styles', items : [ 'Font','FontSize' ] },
	    { name: 'colors', items : [ 'TextColor','BGColor' ] },
	    { name: 'tools', items : [ 'Templates', 'WidgetTemplateMenu' ] },
	    { name: 'document', items: ['Save']}
	];

};
