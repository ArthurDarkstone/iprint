/**
 * Port of demo/hiprint/css/hiprint.css + print-lock.css.
 * Injected into document.head once on init(). minicolors-specific rules are
 * dropped (we use native color inputs); all design + print-fidelity rules retained.
 */

const HIPRINT_CSS = `
/* hiprint-pagination */
.hiprint-pagination { display: inline-block; padding-left: 0; }
.hiprint-pagination > li { border: 1px solid #bdc3c7; border-radius: 2px; display: block; float: left; padding: 5px; text-decoration: none; margin-right: 5px; margin-bottom: 5px; font-family: helvetica; font-size: 13px; cursor: pointer; }
.hiprint-pagination > li > span { padding: 0 10px; }
.hiprint-pagination > li > a { color: #bdc3c7; font-weight: bold; text-decoration: none; font-size: 11px; padding: 3px; }
.hiprint-pagination > li > a:hover { color: red; }

/* rect-printElement-type */
.rect-printElement-types .hiprint-printElement-type { display: block; padding: 0; list-style: none; }
.rect-printElement-types .hiprint-printElement-type > li > .title { display: block; padding: 4px 0; clear: both; }
.rect-printElement-types .hiprint-printElement-type > li > ul { padding: 0; display: block; list-style: none; }
.rect-printElement-types .hiprint-printElement-type > li > ul > li { display: block; width: 50%; float: left; max-width: 100px; }
.rect-printElement-types .hiprint-printElement-type > li > ul > li > a { height: 92px; padding: 12px 6px; margin-left: -1px; line-height: 1.42857143; color: #b9a5a6; text-decoration: none; background-color: #fff; border: 1px solid rgba(0,0,0,0.2); margin-right: 5px; width: 95%; max-width: 100px; display: inline-block; text-align: center; margin-bottom: 7px; box-sizing: border-box; border-radius: 3px; box-shadow: 0 1px 0 0 rgba(0,0,0,0.15); cursor: pointer; }

/* small-printElement-type */
.small-printElement-types .hiprint-printElement-type { display: block; padding: 0; list-style: none; }
.small-printElement-types .hiprint-printElement-type > li > .title { display: block; padding: 4px 0; clear: both; }
.small-printElement-types .hiprint-printElement-type > li > ul { padding: 0; display: block; list-style: none; width: 100%; }
.small-printElement-types .hiprint-printElement-type > li > ul > li { display: block; width: 50%; float: left; padding: 0 4px; }
.small-printElement-types .hiprint-printElement-type > li > ul > li > a { height: 22px; line-height: 20px; color: #b9a5a6; text-decoration: none; background-color: #fff; border: 1px solid rgba(0,0,0,0.2); margin-right: 5px; width: 100%; display: block; text-align: center; margin-bottom: 7px; box-sizing: border-box; border-radius: 3px; box-shadow: 0 1px 0 0 rgba(0,0,0,0.15); cursor: pointer; }

/* hiprint-toolbar */
.hiprint-toolbar > ul { padding: 0; margin-bottom: 5px; }
.hiprint-toolbar > ul > li { display: inline-block; }
.hiprint-toolbar > ul > li > a { position: relative; float: left; padding: 3px 10px; margin-left: -1px; line-height: 1.42857143; color: #337ab7; text-decoration: none; background-color: #fff; border: 1px solid #ddd; margin-right: 4px; cursor: pointer; }

.hiprint-printElement-type .glyphicon-class { display: block; text-align: center; word-wrap: break-word; font-family: Helvetica, sans-serif; }
.hiprint-printElement-type .glyphicon { margin-top: 5px; margin-bottom: 10px; font-size: 37px; }

/* option css */
.hiprint-option-items { font-size: .75rem; padding: 10px 5px; display: flex; flex-wrap: wrap; align-items: flex-end; box-sizing: border-box; width: 100%; }
.hiprint-option-items .hiprint-option-item { box-sizing: border-box; float: left; width: 50%; margin-bottom: 5px; padding: 0 5px; font-size: 14px; }
.hiprint-option-items .hiprint-option-item-row { width: 100%; }
.hiprint-option-item-label { margin: 5px 5px 3px 0; }
.hiprint-option-items .hiprint-option-item-field input, .hiprint-option-items .hiprint-option-item-field select, .hiprint-option-items .hiprint-option-item-field textarea { color: inherit; background-color: transparent; box-sizing: border-box; width: 100%; position: relative; padding: 3px; z-index: 1; border: 1px solid rgb(169, 169, 169); height: 19pt; }
.hiprint-option-item-settingBtn { height: 19pt; line-height: 19pt; font-size: 12px; padding: 0 24px; background: #00c1de; border-color: transparent; color: #fff; display: inline-block; margin: 5px; font-weight: 400; border: 1px solid transparent; font-family: PingFangSC, helvetica neue, hiragino sans gb, arial, microsoft yahei ui, microsoft yahei, simsun, sans-serif; vertical-align: middle; transition: .3s cubic-bezier(.4, 0, .2, 1); transform: translateZ(0); cursor: pointer; }
.hiprint-option-item-deleteBtn { background: red; }

/* hitable resizer */
.hitable .selected { background: #3e66ad; }
.hitable tr.resizerRow, .hitable .resizerRow td { border: 0pt dashed; height: 0pt; background: #fff; }
.hitable tr.resizerRow + tr, .hitable tr.resizerRow + tr td { border-top: 0px !important; }
.hitable td.resizerColumn { border: 0pt dashed; width: 0.000001px !important; background: #fff; }
.hitable td.resizerColumn + td { border-left: 0px !important; }
.columngrips { height: 0px; position: absolute; }
.columngrip { margin-left: -5px; position: absolute; z-index: 5; width: 10px; }
.columngrip .gripResizer { position: absolute; opacity: 0; width: 10px; height: 100%; cursor: col-resize; top: 0px; }
.columngripDraging { border-left: 1px dotted black; }
.rowgrips { height: 0px; width: 0px; position: absolute; }
.rowgrip { margin-top: -5px; position: absolute; z-index: 5; height: 10px; }
.rowgrip .gripResizer { position: absolute; opacity: 0; height: 10px; width: 100%; cursor: row-resize; left: 0px; }
.rowgripDraging { border-top: 1px dotted black; }
.hitable .hitable-editor-text { border: 1px solid; width: 95%; height: 80%; }

.hipanel-disable { height: 0px; display: block !important; top: 8500px; width: 0px; overflow: hidden; position: absolute; }
.hiprint_rul_wrapper { position: absolute; height: 100%; width: 100%; overflow: hidden; pointer-events: none; border: 0; border-top: 1px solid rgb(201, 190, 190); border-left: 1px solid rgb(201, 190, 190); padding-left: 15px; margin: -16px; }
.hiprint_rul_wrapper .h_img { position: absolute; top: 0px; left: 15px; width: 400mm; height: 15px; }
.hiprint_rul_wrapper .v_img { width: 400mm; transform: rotate(90deg); transform-origin: 0 100%; height: 15px; position: absolute; top: -2px; left: 0px; }

/* hiprint-option-table */
.hiprint-option-table-selected-columns { color: inherit; background-color: transparent; box-sizing: border-box; width: 100%; position: relative; padding: 0px; list-style: none; }
.hiprint-option-table-selected-columns .hiprint-option-table-selected-item { color: inherit; background-color: transparent; box-sizing: border-box; width: 100%; padding: 0 3px; border: 1px solid rgb(169, 169, 169); line-height: 19pt; margin: 3px 0; }

/* hi-pretty checkbox */
.hi-pretty * { box-sizing: border-box; }
.hi-pretty input:not([type='checkbox']):not([type='radio']) { display: none; }
.hi-pretty { position: relative; display: inline-block; margin-right: 1em; white-space: nowrap; line-height: 1; }
.hi-pretty input { position: absolute; left: 0; top: 0; min-width: 1em; width: 100%; height: 100%; z-index: 2; opacity: 0; margin: 0; padding: 0; cursor: pointer; }
.hi-pretty .state label { position: initial; display: inline-block; font-weight: normal; margin: 0; text-indent: 1.5em; min-width: calc(1em + 2px); }
.hi-pretty .state label:before, .hi-pretty .state label:after { content: ''; width: calc(1em + 2px); height: calc(1em + 2px); display: block; box-sizing: border-box; border-radius: 0; border: 1px solid transparent; z-index: 0; position: absolute; left: 0; top: calc((0% - (100% - 1em)) - 8%); background-color: transparent; }
.hi-pretty .state label:before { border-color: #bdc3c7; }
.hi-pretty .state.p-is-hover, .hi-pretty .state.p-is-indeterminate { display: none; }
.hi-pretty.p-default.p-fill .state label:after { transform: scale(1); }
.hi-pretty.p-default .state label:after { transform: scale(0.6); }
.hi-pretty.p-default input:checked ~ .state label:after { background-color: #bdc3c7 !important; }
.hi-pretty.p-default.p-thick .state label:before, .hi-pretty.p-default.p-thick .state label:after { border-width: calc(1em / 7); }
.hi-pretty.p-default.p-thick .state label:after { transform: scale(0.4) !important; }
`

const PRINT_LOCK_CSS = `
@media print { body { margin: 0px; padding: 0px; } }
@page { margin: 0; }
.hiprint-printPaper * { box-sizing: border-box; -moz-box-sizing: border-box; -webkit-box-sizing: border-box; }
.hiprint-printPaper *:focus { outline: -webkit-focus-ring-color auto 0px; }
.hiprint-page-break-avoid { page-break-after: avoid; }
.hiprint-printPaper { position: relative; padding: 0; page-break-after: always; overflow-x: hidden; overflow: hidden; }
.hiprint-printPaper .hiprint-printPaper-content { position: relative; }
.hiprint-printPaper.design { overflow: visible; }
.hiprint-printTemplate .hiprint-printPanel { page-break-after: always; }
.hiprint-printPaper, hiprint-printPanel { box-sizing: border-box; border: 0px; }
.hiprint-printPanel .hiprint-printPaper:last-child { page-break-after: avoid; }
.hiprint-printTemplate .hiprint-printPanel:last-child { page-break-after: avoid; }
.hiprint-printPaper .hideheaderLinetarget { border-top: 0px dashed rgb(201, 190, 190) !important; }
.hiprint-printPaper .hidefooterLinetarget { border-top: 0px dashed rgb(201, 190, 190) !important; }
.hiprint-printPaper.design { border: 1px dashed rgba(170,170,170,0.7); }
.design .hiprint-printElement-table-content, .design .hiprint-printElement-longText-content { overflow: hidden; box-sizing: border-box; }
.design .resize-panel { box-sizing: border-box; border: 1px dotted; }

.hiprint-printElement-text { background-color: transparent; background-repeat: repeat; padding: 0; border: 0.75pt none rgb(0,0,0); direction: ltr; font-family: 'SimSun'; font-size: 9pt; font-style: normal; font-weight: normal; text-align: left; text-decoration: none; line-height: 9.75pt; box-sizing: border-box; word-wrap: break-word; word-break: break-all; }
.design .hiprint-printElement-text-content { border: 1px dashed rgb(206, 188, 188); box-sizing: border-box; }
.hiprint-printElement-longText { background-color: transparent; background-repeat: repeat; border: 0.75pt none rgb(0,0,0); direction: ltr; font-family: 'SimSun'; font-size: 9pt; font-style: normal; font-weight: normal; text-align: left; text-decoration: none; line-height: 9.75pt; box-sizing: border-box; word-wrap: break-word; word-break: break-all; }
.hiprint-printElement-table { background-color: transparent; background-repeat: repeat; color: rgb(0,0,0); border-color: rgb(0,0,0); border-style: none; direction: ltr; font-family: 'SimSun'; font-size: 9pt; font-style: normal; font-weight: normal; text-align: left; text-decoration: none; padding: 0; box-sizing: border-box; line-height: 9.75pt; }
.hiprint-printElement-table thead { background: #e8e8e8; font-weight: 700; }
.hiprint-printElement-tableTarget, .hiprint-printElement-tableTarget tr, .hiprint-printElement-tableTarget td { border-color: rgb(0,0,0); border-style: none; border: 1px solid rgb(0,0,0); font-weight: normal; direction: ltr; padding: 0; text-decoration: none; vertical-align: middle; box-sizing: border-box; word-wrap: break-word; word-break: break-all; }
.hiprint-printElement-tableTarget td { height: 18pt; }
.hiprint-printPaper .hiprint-paperNumber { font-size: 9pt; }
.design .hiprint-printElement-table-handle { position: absolute; height: 21pt; width: 21pt; background: red; z-index: 1; }
.hiprint-printPaper .hiprint-paperNumber-disabled { float: right !important; right: 0 !important; color: gainsboro !important; }
.hiprint-printElement-vline, .hiprint-printElement-hline { border: 0px none rgb(0,0,0); }
.hiprint-printElement-vline { border-left: 0.75pt solid #000; border-right: 0px none rgb(0,0,0) !important; border-bottom: 0px none rgb(0,0,0) !important; border-top: 0px none rgb(0,0,0) !important; }
.hiprint-printElement-hline { border-top: 0.75pt solid #000; border-right: 0px none rgb(0,0,0) !important; border-bottom: 0px none rgb(0,0,0) !important; border-left: 0px none rgb(0,0,0) !important; }
.hiprint-printElement-oval, .hiprint-printElement-rect { border: 0.75pt solid #000; }
.hiprint-text-content-middle { display: table; }
.hiprint-text-content-middle > div { display: table-cell; vertical-align: middle; }
.hiprint-text-content-bottom { display: table; }
.hiprint-text-content-bottom > div { display: table-cell; vertical-align: bottom; }
.hi-grid-row { position: relative; height: auto; margin-right: 0; margin-left: 0; zoom: 1; display: block; box-sizing: border-box; }
.hi-grid-row::after, .hi-grid-row::before { display: table; content: ''; box-sizing: border-box; }
.hi-grid-col { display: block; box-sizing: border-box; position: relative; float: left; flex: 0 0 auto; }
.table-grid-row { margin-left: 0; margin-right: 0; }
.tableGridColumnsGutterRow { padding-left: 0; padding-right: 0; }
.hiprint-gridColumnsFooter { text-align: left; clear: both; }

.hibarcode_imgcode, .hibarcode_displayValue { display: block; }

.hiprint-printElement-selected { outline: 1px solid #00c1de; }
.hiprint-resize-handle { background: #00c1de; border: 1px solid #fff; }
.mouseRect { position: absolute; background: #31676f; opacity: 0.2; border: 1px dashed #000; pointer-events: none; z-index: 5; }
.hiprint-headerLine, .hiprint-footerLine { pointer-events: auto; }
.hicontextmenu { width: 215px; background: #fff; border: 1px solid #ccc; box-shadow: 0 0 10px rgba(0,0,0,0.15); padding: 0; margin: 0; list-style: none; font-size: 13px; }
.hicontextmenu .hicontextmenuitem { padding: 6px 12px; cursor: pointer; }
.hicontextmenu .hicontextmenuitem:hover { background: #f0f0f0; }
.hicontextmenu .hicontextmenuitem.disable { color: #aaa; cursor: default; }
.hicontextmenu .borderBottom { border-bottom: 1px solid #eee; }
.hicontextmenu .hicontextsubmenu > ul { display: none; position: absolute; left: 100%; background: #fff; border: 1px solid #ccc; padding: 0; list-style: none; }
.hicontextmenu .hicontextmenuitem:hover > .hicontextsubmenu > ul { display: block; }
`

let injected = false

export function injectCSS(): void {
  if (injected || typeof document === 'undefined')
    return
  injected = true
  const style = document.createElement('style')
  style.setAttribute('data-iprint', 'true')
  style.textContent = HIPRINT_CSS + PRINT_LOCK_CSS
  document.head.appendChild(style)
}

export const HIPRINT_STYLES: string = HIPRINT_CSS + PRINT_LOCK_CSS
