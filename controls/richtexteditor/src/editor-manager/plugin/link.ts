import { createElement, isNullOrUndefined, closest } from '@syncfusion/ej2-base';
import { EditorManager } from './../base/editor-manager';
import * as CONSTANT from './../base/constant';
import { IHtmlItem } from './../base/interface';
import { InsertHtml } from './inserthtml';
/**
 * Link internal component
 * @hidden
 */
export class LinkCommand {
    private parent: EditorManager;
    /**
     * Constructor for creating the Formats plugin
     * @hidden
     */
    constructor(parent: EditorManager) {
        this.parent = parent;
        this.addEventListener();
    }
    private addEventListener(): void {
        this.parent.observer.on(CONSTANT.LINK, this.linkCommand, this);
    }

    private linkCommand(e: IHtmlItem): void {
        switch (e.value.toString().toLocaleLowerCase()) {
            case 'createlink':
            case 'editlink':
                this.createLink(e);
                break;
            case 'openlink':
                this.openLink(e);
                break;
            case 'removelink':
                this.removeLink(e);
                break;
        }
    }

    private createLink(e: IHtmlItem): void {
        let closestAnchor: Element = (!isNullOrUndefined(e.item.selectParent) && e.item.selectParent.length > 0) &&
            closest(e.item.selectParent[0], 'a');
        closestAnchor = !isNullOrUndefined(closestAnchor) ? closestAnchor :
            (!isNullOrUndefined(e.item.selectParent) && e.item.selectParent.length > 0) ? (e.item.selectParent[0]) as Element : null;
        if (!isNullOrUndefined(closestAnchor) && (closestAnchor as HTMLElement).tagName === 'A') {
            let anchorEle: HTMLElement = closestAnchor as HTMLElement;
            anchorEle.setAttribute('href', e.item.url);
            anchorEle.setAttribute('title', e.item.title);
            anchorEle.innerHTML = e.item.text;
            if (!isNullOrUndefined(e.item.target)) {
                anchorEle.setAttribute('target', e.item.target);
            } else {
                anchorEle.removeAttribute('target');
            }
            e.item.selection.setSelectionText(this.parent.currentDocument, anchorEle, anchorEle, 1, 1);
        } else {
            let anchor: HTMLElement = createElement('a', {
                className: 'e-rte-anchor', attrs: {
                    href: e.item.url,
                    title: isNullOrUndefined(e.item.title) || e.item.title === '' ? e.item.url : e.item.title
                }
            });
            if (!isNullOrUndefined(e.item.target)) {
                anchor.setAttribute('target', e.item.target);
            }
            anchor.innerText = e.item.text === '' ? e.item.url : e.item.text;
            e.item.selection.restore();
            InsertHtml.Insert(this.parent.currentDocument, anchor, this.parent.editableElement);
            if (e.event && (e.event as KeyboardEvent).type === 'keydown' && (e.event as KeyboardEvent).keyCode === 32) {
                let startContainer: Node = e.item.selection.range.startContainer;
                startContainer.textContent = this.removeText(startContainer.textContent, e.item.url);
            } else {
                let startIndex: number = e.item.action === 'Paste' ? anchor.childNodes[0].textContent.length : 0;
                e.item.selection.setSelectionText(
                    this.parent.currentDocument, anchor.childNodes[0], anchor.childNodes[0],
                    startIndex, anchor.childNodes[0].textContent.length);
            }
        }
        if (e.callBack) {
            e.callBack({
                requestType: 'Links',
                editorMode: 'HTML',
                event: e.event,
                range: this.parent.nodeSelection.getRange(this.parent.currentDocument),
                elements: this.parent.nodeSelection.getSelectedNodes(this.parent.currentDocument) as Element[]
            });
        }
    }
    private removeText(text: string, val: string): string {
        let arr: string[] = text.split(' ');
        for (let i: number = 0; i < arr.length; i++) {
            if (arr[i] === val) {
                arr.splice(i, 1);
                i--;
            }
        }
        return arr.join(' ');
    }

    private openLink(e: IHtmlItem): void {
        document.defaultView.open(e.item.url, e.item.target);
        this.callBack(e);
    }
    private removeLink(e: IHtmlItem): void {
        this.parent.domNode.setMarker(e.item.selection);
        let closestAnchor: Node = closest(e.item.selectParent[0], 'a');
        let selectParent: Node = closestAnchor ? closestAnchor : e.item.selectParent[0];
        let parent: Node = selectParent.parentNode;
        let child: Node[] = [];
        for (; selectParent.firstChild; null) {
            child.push(parent.insertBefore(selectParent.firstChild, selectParent));
        }
        parent.removeChild(selectParent);
        if (child && child.length === 1) {
            e.item.selection.startContainer = e.item.selection.getNodeArray(child[child.length - 1], true);
            e.item.selection.endContainer = e.item.selection.startContainer;
        }
        e.item.selection = this.parent.domNode.saveMarker(e.item.selection);
        e.item.selection.restore();
        this.callBack(e);
    }
    private callBack(e: IHtmlItem): void {
        if (e.callBack) {
            e.callBack({
                requestType: e.item.subCommand,
                editorMode: 'HTML',
                event: e.event,
                range: this.parent.nodeSelection.getRange(this.parent.currentDocument),
                elements: this.parent.nodeSelection.getSelectedNodes(this.parent.currentDocument) as Element[]
            });
        }
    }
}