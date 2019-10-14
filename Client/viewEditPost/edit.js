var container = document.getElementById('editor');

var toolbarOptions = [
    ['bold', 'italic', 'underline', 'strike'], // toggled buttons
    ['blockquote', 'code-block', 'image', 'video', 'link'],

    // custom button values
    [{
        'list': 'ordered'
    }, {
        'list': 'bullet'
    }],

    [{
        'script': 'sub'
    }, {
        'script': 'super'
    }],

    // superscript/subscript
    [{
        'direction': 'rtl'
    }],

    // text direction
    [{
        'size': ['small', false, 'large', 'huge']
    }],

    // custom dropdown
    [{
        'header': [1, 2, 3, 4, 5, 6, false]
    }],

    [{
        'color': []
    }, {
        'background': []
    }],

    // dropdown with defaults from theme
    [{
        'font': ['Times New Roman']
    }],

    [{
        'align': []
    }],

    // remove formatting button
    ['clean']
];

var options = {
    debug: 'info',
    modules: {
        toolbar: toolbarOptions
    },
    placeholder: 'Let your imaginations run wild...',
    readOnly: false,
    theme: 'snow',
};

var editor = new Quill(container, options);

quill.on('text-change', update);