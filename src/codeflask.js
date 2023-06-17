
 /**
  * EditorJsCodeFlask Block for the Editor.js.
  *
  * @author Calum Knott (calum@calumk.com)
  * @license The MIT License (MIT)
  */

 /**
  * @typedef {object} EditorJsCodeFlaskConfig
  * @property {string} placeholder - placeholder for the empty EditorJsCodeFlask
  * @property {boolean} preserveBlank - Whether or not to keep blank EditorJsCodeFlasks when saving editor data
  */

 /**
  * @typedef {Object} EditorJsCodeFlaskData
  * @description Tool's input and output data format
  * @property {String} text — EditorJsCodeFlask's content. Can include HTML tags: <a><b><i>
  */

  import style from './codeflask.css'
  import icon from './codeflask.svg';

  import Prism from 'prismjs';

  // Additional languages
  import "prismjs/components/prism-java"
  import "prismjs/components/prism-go"
  import "prismjs/components/prism-typescript"

  // import "prismjs-components-importer/esm"; // ALL - Massivly Increases Bundle size!

  import "prismjs-components-importer/esm/prism-iecst"; // Structured Text
  import "prismjs-components-importer/esm/prism-markdown";
  import "prismjs-components-importer/esm/prism-json";
  import "prismjs-components-importer/esm/prism-python";
  import "prismjs-components-importer/esm/prism-bash";


  import CodeFlask from 'codeflask';

  import NiceSelect from "nice-select2/dist/js/nice-select2";
  import NiceSelectStyle from "nice-select2/dist/css/nice-select2.css";
  import { EXCLUDED_LANGUAGES } from "./vars";

 class EditorJsCodeFlask {
   /**
    * Default placeholder for EditorJsCodeFlask Tool
    *
    * @return {string}
    * @constructor
    */
   static get DEFAULT_PLACEHOLDER() {
     return '// Hello';
   }

   static get enableLineBreaks() {
    return true;
  }

   /**
    * Render plugin`s main Element and fill it with saved data
    *
    * @param {object} params - constructor params
    * @param {EditorJsCodeFlaskData} params.data - previously saved data
    * @param {EditorJsCodeFlaskConfig} params.config - user config for Tool
    * @param {object} params.api - editor.js api
    * @param {boolean} readOnly - read only mode flag
    */
   constructor({data, config, api, readOnly}) {
    //  console.log(data)
     this.api = api;
     this.readOnly = readOnly;

     this._CSS = {
       block: this.api.styles.block,
       wrapper: 'ce-EditorJsCodeFlask',
       settingsButton: this.api.styles.settingsButton,
       settingsButtonActive: this.api.styles.settingsButtonActive,
     };

     if (!this.readOnly) {
       this.onKeyUp = this.onKeyUp.bind(this);
     }

     /**
      * Placeholder for EditorJsCodeFlask if it is first Block
      * @type {string}
      */
     this._placeholder = config.placeholder ? config.placeholder : EditorJsCodeFlask.DEFAULT_PLACEHOLDER;

     this._preserveBlank = config.preserveBlank !== undefined ? config.preserveBlank : false;

     this._element; // used to hold the wrapper div, as a point of reference
     this._copySvg='<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>'


     // let x = (x === undefined) ? your_default_value : x;
     this.data = {}
     this.data.code = (data.code === undefined) ? '// Hello World' : data.code;
     this.data.language = (data.language === undefined) ? 'plain' : data.language;
     this.data.showlinenumbers = (data.showlinenumbers === undefined) ? true : data.showlinenumbers;
     this.data.editorInstance = {}

    //  console.log(this.data)

   }

   /**
    * Check if text content is empty and set empty string to inner html.
    * We need this because some browsers (e.g. Safari) insert <br> into empty contenteditanle elements
    *
    * @param {KeyboardEvent} e - key up event
    */
   onKeyUp(e) {
     if (e.code !== 'Backspace' && e.code !== 'Delete') {
       return;
     }

     const {textContent} = this._element;

     if (textContent === '') {
       this._element.innerHTML = '';
     }
   }


   /**
    * Return Tool's view
    *
    * @returns {HTMLDivElement}
    */
   render() {

    this._element = document.createElement('div');
    this._element.classList.add('editorjs-codeFlask_Wrapper')
    let editorElem = document.createElement('div');
    editorElem.classList.add('editorjs-codeFlask_Editor')
    let langdisplay = document.createElement('div');
    langdisplay.classList.add('editorjs-codeFlask_LangDisplay')
    let coppyButton = document.createElement('button')
    coppyButton.classList.add("editorjs-codeFlask_CopyButton");
    coppyButton.innerHTML = this._copySvg;

    langdisplay.innerHTML = this.data.language
    coppyButton.addEventListener("click",async () => {
      coppyButton.innerHTML =
        '<svg fill="#000000" height="1em" width="1em" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512.42 512.42" xml:space="preserve"><g><g><path d="M509.313,67.45c-4.16-4.16-10.88-4.267-15.04-0.107L134.06,422.33l-115.2-121.6c-3.733-4.48-10.453-5.12-15.04-1.387 c-4.48,3.733-5.12,10.453-1.387,15.04c0.32,0.32,0.533,0.64,0.853,0.96l122.667,129.493c1.92,2.133,4.693,3.307,7.573,3.307h0.213 c2.773,0,5.44-1.067,7.467-3.093l368-362.667C513.473,78.33,513.473,71.61,509.313,67.45z"/></g></g></svg>';
      try {
       await navigator.clipboard.writeText(this.data.editorInstance.code);
      } finally {
        setTimeout(()=>{
           coppyButton.innerHTML = this._copySvg;
        },1000)
      }
    });
    this._element.appendChild(editorElem)
    this._element.appendChild(langdisplay)
    this._element.appendChild(coppyButton);
    this.data.editorInstance = new CodeFlask(editorElem, {
      language: this.data.language,
      lineNumbers : this.data.showlinenumbers,
      readonly : this.readOnly
    });

    this.data.editorInstance.onUpdate((code) => {

      let _length = code.split('\n').length
      this._debounce(this._updateEditorHeight(_length))

    });

    this.data.editorInstance.addLanguage(this.data.language, Prism.languages[this.data.language]);
    this.data.editorInstance.updateCode(this.data.code);

    return this._element
   }

  _updateEditorHeight(length){

    let _height = (length * 21) + 10
    if (_height < 60){ _height = 60 }

    this._element.style.height = _height + 'px';
  }


  _debounce(func, timeout = 500){
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
  }

   renderSettings() {
    const settingsContainer = document.createElement('div');




    let languagesSelect = document.createElement("select");
    languagesSelect.classList.add("small");

    //sort available languages alphabetically (ignore case)
    let languages = Object.keys(Prism.languages).sort(function (a, b) {
        return a.toLowerCase().localeCompare(b.toLowerCase());
    });

    //Create and append the options
    for (var i = 0; i < languages.length; i++) {
        // Weirdly PrismJS doesnt expose a list of installed languages, or rather it does, but it is mixed with helper functions, which i have to clear here.
        if (EXCLUDED_LANGUAGES.includes(languages[i])) {
          continue;
        }

        var option = document.createElement("option");
        option.value = languages[i];
        option.text = languages[i];
        if(languages[i] === this.data.language){
          option.selected = "selected"
        }
        languagesSelect.appendChild(option);
    }

    languagesSelect.addEventListener('change', (event) => {
      this._updateLanguage(event.target.value)
    });


    // Disabled until codeflask supports toggle of line numbers
    // const settingsButton = document.createElement('div');
    // settingsButton.classList.add(this._CSS.settingsButton);
    // settingsButton.innerHTML = '<small>123</small>'


    // settingsButton.addEventListener('click', (e) => {
    //   console.log(e)
    //   e.target.classList.toggle(this._CSS.settingsButtonActive)
    //   this._toggleLineNumbers()
    // });



    settingsContainer.appendChild(languagesSelect);
    new NiceSelect(languagesSelect, {searchable : true, placeholder : "Language..."});

    // settingsContainer.appendChild(settingsButton);

    return settingsContainer;
  }

  _toggleLineNumbers = (thing) => {
    this.data.showlinenumbers = !this.data.showlinenumbers

    // replace this with a native method for codeflask, if it gets implemented.
    // for now, we will completely destroy the codeflask instance, and rebuild it - lazy but effective


  }

  _updateLanguage = (lang) => {
    this.data.language = lang
    this._element.querySelector('.editorjs-codeFlask_LangDisplay').innerHTML = lang
    this.data.editorInstance.addLanguage(lang, Prism.languages[lang])
    this.data.editorInstance.updateLanguage(lang)
  }



   /**
    * Extract Tool's data from the view
    * @param {HTMLDivElement} toolsContent - EditorJsCodeFlask tools rendered view
    * @returns {EditorJsCodeFlaskData} - saved data
    * @public
    */
   save(toolsContent) {
    let resp = {
      code : this.data.editorInstance.getCode(),
      language : this.data.language,
      showlinenumbers : this.data.showlinenumbers
    };

    return resp
   }

   /**
    * Returns true to notify the core that read-only mode is supported
    *
    * @return {boolean}
    */
   static get isReadOnlySupported() {
     return true;
   }


   /**
    * Icon and title for displaying at the Toolbox
    *
    * @return {{icon: string, title: string}}
    */
   static get toolbox() {
     return {
       icon: icon,
       title: 'CodeFlask'
     };
   }
 }

export { EditorJsCodeFlask as default }
