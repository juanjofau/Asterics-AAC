<template>
    <div :style="Object.assign({}, cssProps, { '--grid-columns': effectiveColumns, '--grid-rows': effectiveRows })" :class="['grid-parent', myId, { 'grid-parent--indexed': editable }]">
        <div v-if="editable" class="grid-index-corner" role="button" tabindex="0" aria-label="Select all cells" @click.stop="$emit('select-all')" @keydown.enter.stop="$emit('select-all')" @keydown.space.prevent.stop="$emit('select-all')"></div>
        <div v-if="editable" class="grid-column-labels" :style="{ gridTemplateColumns: getGridTemplateTracks('grid-template-columns') }">
            <span v-for="column in effectiveColumns" :key="'column-' + column" role="button" tabindex="0" :aria-label="'Select column ' + column" @click.stop="$emit('select-column', column - 1)" @keydown.enter.stop="$emit('select-column', column - 1)" @keydown.space.prevent.stop="$emit('select-column', column - 1)">{{ column }}</span>
        </div>
        <div v-if="editable" class="grid-row-labels" :style="{ gridTemplateRows: getGridTemplateTracks('grid-template-rows') }">
            <span v-for="row in effectiveRows" :key="'row-' + row" role="button" tabindex="0" :aria-label="'Select row ' + row" @click.stop="$emit('select-row', row - 1)" @keydown.enter.stop="$emit('select-row', row - 1)" @keydown.space.prevent.stop="$emit('select-row', row - 1)">{{ row }}</span>
        </div>
        <div class="grid-content">
            <div v-if="backgroundLines">
                <div class="grid-bg-lines" :style="`margin-left: ${getRasterX()}px; margin-right: 1px; background-size: ${getRasterX()}px ${getRasterX()}px; background-image: linear-gradient(to right, grey 1px, transparent 1px)`"/>
                <div class="grid-bg-lines" :style="`margin-top: ${getRasterY()}px; margin-bottom: 1px; background-size: ${getRasterY()}px ${getRasterY()}px; background-image: linear-gradient(to bottom, grey 1px, transparent 1px);`"/>
            </div>
            <transition-group ref="gridComponent" :name="editable ? 'grid-transition' : ''" :tag="baseTag" class="grid-layout" :style="`grid-template-columns: repeat(${effectiveColumns}, minmax(0, 1fr)); grid-template-rows: repeat(${effectiveRows}, minmax(0, 1fr)); background-color: ${backgroundColor}`">
                <grid-element v-for="elem in elements" :key="getKey(elem)" :data-id="elem.id" :x="elem.x" :y="elem.y" :width="elem.width" :height="elem.height" :tag="elementTag" :class="elem.id + '' === noMoveId ? 'nomove' : ''" :element="elem" :elem-css-fn="elemCssFn">
                    <component :id="elem.id" :is="renderComponent" :element="elem" :editable="editable" v-bind="$attrs"/>
                </grid-element>
            </transition-group>
            <div v-if="editable" class="grid-minimum-bounds" :style="minimumGridBoundsStyle" aria-hidden="true"></div>
        </div>
    </div>
</template>

<script>

import GridElement from './grid-element.vue';
import { gridLayoutUtil } from '../utils/gridLayoutUtil';

export default {
    components: { GridElement },
    props: {
        rows: Number,
        columns: Number,
        elements: Array,
        keyFunction: Function,
        renderComponent: {
            type: [Object, String],
            default: null
        },
        backgroundColor: {
            type: String,
            default: 'white'
        },
        baseTag: {
            type: String,
            default: 'ol'
        },
        elementTag: {
            type: String,
            default: 'li'
        },
        editable: {
            type: Boolean,
            default: false
        },
        resizeHandleSelector: {
            type: String,
            default: '.ui-resizable-handle'
        },
        backgroundLines: {
            type: Boolean,
            default: false
        },
        animationDurationMs: {
            type: Number,
            default: 200
        },
        elemCssFn: {
            type: Function,
            default: () => ''
        }
    },
    data() {
        return {
            interact: null,
            timeoutHandler: null,
            noMoveId: null,
            myId: "grid-parent-" + new Date().getTime(),
            elementClassSelector: '.grid-layout-element'
        }
    },
    watch: {
        editable() {
            this.reinit();
        },
        rows() {
            this.reinit();
        },
        columns() {
            this.reinit();
        }
    },
    computed: {
        // The configured counts are minimums. Elements may extend the grid with implicit tracks.
        // Count those tracks too, so the index labels cover the whole rendered grid.
        effectiveColumns() {
            return Math.max(this.columns || 1, ...(this.elements || []).map(elem => (elem.x || 0) + (elem.width || 1)));
        },
        effectiveRows() {
            return Math.max(this.rows || 1, ...(this.elements || []).map(elem => (elem.y || 0) + (elem.height || 1)));
        },
        // Outline the configured minimum area while allowing elements to extend beyond it.
        minimumGridBoundsStyle() {
            const minColumns = Math.min(this.columns || 1, this.effectiveColumns);
            const minRows = Math.min(this.rows || 1, this.effectiveRows);
            return {
                width: (minColumns / this.effectiveColumns * 100) + '%',
                height: (minRows / this.effectiveRows * 100) + '%'
            };
        },
        cssProps() {
            return {
                '--animation-duration': this.animationDurationMs + "ms"
            }
        },
        totalElementClassSelector() {
            return `.${this.myId} ${this.elementClassSelector}`;
        }
    },
    methods: {
        getKey(elem) {
            if (this.keyFunction) {
                return this.keyFunction(elem);
            } else {
                return elem.id;
            }
        },
        getRasterX() {
            return this.getSizeFromStyle("grid-template-columns");
        },
        getRasterY() {
            return this.getSizeFromStyle("grid-template-rows");
        },
        getSizeFromStyle(property) {
            // see https://stackoverflow.com/a/66186894/9219743
            if (!this.$refs.gridComponent) {
                return 0;
            }
            let style = getComputedStyle(this.$refs.gridComponent.$el).getPropertyValue(property);
            let first = style.split(" ")[0];
            return parseFloat(first);
        },
        getGridTemplateTracks(property) {
            if (!this.$refs.gridComponent) {
                return '';
            }
            // Reuse the browser's resolved tracks so labels match the real grid,
            // including fractional pixel widths and uneven rounding.
            return getComputedStyle(this.$refs.gridComponent.$el).getPropertyValue(property);
        },
        handleMove(movedElement, diff) {
            if (diff.x === 0 && diff.y === 0) {
                return;
            }
            let id = movedElement.children[0].id;
            let element = this.getElement(id);
            let updatedElements = gridLayoutUtil.resolveCollisions(this.elements, element, {
                diff: diff,
                gridWidth: this.columns,
                gridHeight: this.rows,
                calcNewPos: true
            });
            this.$emit("changed", updatedElements);
            this.reinit();
        },
        handleResize(resizedElement, newSize) {
            let id = resizedElement.children[0].id;
            let element = this.getElement(id);
            if (!element || !newSize ||
                (newSize.width === resizedElement.width && newSize.height === resizedElement.height)) {
                return;
            }
            element.width = newSize.width;
            element.height = newSize.height;
            let updatedElements = gridLayoutUtil.resolveCollisions(this.elements, element, {
                gridWidth: this.columns,
                gridHeight: this.rows,
            });
            this.$emit('changed', updatedElements);
            this.reinit();
        },
        getElement(id) {
            return this.elements.find(el => el.id + '' === id + '');
        },
        reinit() {
            this.$nextTick(() => {
                this.initInteract();
            });
        },
        async initInteract() {
            this.destroyInteract();
            if (!this.editable) {
                return;
            }
            let thiz = this;
            this.interact = this.interact || (await import('interactjs')).default;

            let position = { x: 0, y: 0 };
            this.interact(this.totalElementClassSelector).draggable({
                listeners: {
                    start(event) {
                        thiz.$emit('movestart');
                        thiz.$emit('interactstart');
                    },
                    move(event) {
                        position.x += event.dx;
                        position.y += event.dy;
                        event.target.style.transform = `translate(${position.x}px, ${position.y}px)`;
                        event.target.style.zIndex = 100;
                    },
                    end(event) {
                        let movedElement = event.target;
                        let diffX = position.x / thiz.getRasterX();
                        let diffY = position.y / thiz.getRasterY();
                        let diffXRound = Math.round(diffX);
                        let exact = Math.abs(diffXRound - diffX) < 0.25;
                        let diff = {
                            x: diffXRound,
                            y: Math.round(diffY),
                            exact: exact,
                            xExact: diffX,
                            yExact: diffY
                        }
                        thiz.handleMove(movedElement, diff);
                        event.target.style.transform = '';
                        thiz.noMoveId = event.target.getAttribute("data-id");
                        thiz.$emit('moveend');
                        thiz.$emit('interactend');
                        setTimeout(() => {
                            event.target.style.zIndex = 'unset';
                            thiz.noMoveId = null;
                        }, thiz.animationDurationMs + 100);
                    }
                }
            }).resizable({
                edges: { left: false, right: true, bottom: this.resizeHandleSelector, top: false },
                listeners: {
                    start(event) {
                        thiz.$emit('resizestart');
                        thiz.$emit('interactstart');
                    },
                    move(event) {
                        event.target.style.width = event.rect.width + 'px';
                        event.target.style.height = event.rect.height + 'px';
                        event.target.style.zIndex = 100;
                    },
                    end(event) {
                        event.target.style.width = '';
                        event.target.style.height = '';
                        event.target.style.zIndex = 0;
                        let resizedElement = event.target;
                        thiz.handleResize(resizedElement, {
                            width: Math.round(event.rect.width / thiz.getRasterX()),
                            height: Math.round(event.rect.height / thiz.getRasterY())
                        });
                        thiz.$emit('resizeend');
                        thiz.$emit('interactend');
                    }
                },
                modifiers: [
                    // minimum size
                    this.interact.modifiers.restrictSize({
                        min: { width: this.getRasterX(), height: this.getRasterY() }
                    })
                ]
            });
        },
        destroyInteract() {
            if (this.interact) {
                this.interact(this.totalElementClassSelector).unset();
            }
        },
        onResize() {
            clearTimeout(this.timeoutHandler);
            this.timeoutHandler = setTimeout(() => {
                this.$forceUpdate();
            }, 50);
        },
        pointerEventListener(event) {
            let element = event.target;
            let wasWithinMyParent = false;
            while (element) {
                if (element.className.includes(this.myId)) {
                    wasWithinMyParent = true;
                    break;
                }
                element = element.parentElement;
            }
            if (wasWithinMyParent) {
                let gridPos = this.$refs.gridComponent.$el.getBoundingClientRect();
                let touch = event.changedTouches ? event.changedTouches[0] : null;
                let clientX = touch ? touch.clientX : event.clientX;
                let clientY = touch ? touch.clientY : event.clientY;
                let x = clientX - gridPos.x;
                let y = clientY - gridPos.y;
                this.$emit('interacted', Math.floor(x / this.getRasterX()), Math.floor(y / this.getRasterY()), event);
            }
        }
    },
    created() {
        window.addEventListener("resize", this.onResize);
        document.addEventListener('click', this.pointerEventListener);
        document.addEventListener('touchend', this.pointerEventListener);
        document.addEventListener('contextmenu', this.pointerEventListener);
        document.addEventListener('mousedown', this.pointerEventListener);
    },
    beforeDestroy() {
        this.destroyInteract();
        window.removeEventListener("resize", this.onResize);
        document.removeEventListener('click', this.pointerEventListener);
        document.removeEventListener('touchend', this.pointerEventListener);
        document.removeEventListener('contextmenu', this.pointerEventListener);
        document.removeEventListener('mousedown', this.pointerEventListener);
    },
    async mounted() {
        this.initInteract();
        this.$forceUpdate();
    },
}
</script>

<style scoped>
.grid-parent {
    width: 100%;
    height: 100%;
    position: relative;
}

.grid-parent--indexed {
    display: grid;
    grid-template-columns: 22px minmax(0, 1fr);
    grid-template-rows: 22px minmax(0, 1fr);
    gap: 0;
}

.grid-index-corner {
    grid-column: 1;
    grid-row: 1;
    border: 1px solid rgba(70, 85, 110, 0.42);
    border-radius: 3px;
    background: linear-gradient(145deg, rgba(100, 125, 165, 0.16), rgba(145, 155, 175, 0.08));
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.55), 0 1px 1px rgba(35, 50, 75, 0.12);
    cursor: pointer;
}

.grid-column-labels,
.grid-row-labels {
    display: grid;
    min-width: 0;
    min-height: 0;
    color: var(--grid-index-color, rgba(85, 95, 115, 0.95));
    background: transparent;
    font-size: clamp(9px, 1.1vw, 12px);
    line-height: 1;
    user-select: none;
    pointer-events: auto;
}

.grid-column-labels {
    grid-column: 2;
    grid-row: 1;
    grid-template-columns: repeat(var(--grid-columns, 1), minmax(0, 1fr));
    border-bottom: 1px solid rgba(90, 100, 115, 0.35);
}

.grid-row-labels {
    grid-column: 1;
    grid-row: 2;
    grid-template-rows: repeat(var(--grid-rows, 1), minmax(0, 1fr));
    border-right: 1px solid rgba(90, 100, 115, 0.35);
}

.grid-column-labels span,
.grid-row-labels span {
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border: 1px solid rgba(70, 85, 110, 0.3);
    border-radius: 3px;
    background: linear-gradient(145deg, rgba(110, 130, 165, 0.15), rgba(145, 155, 175, 0.07));
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 1px 1px rgba(35, 50, 75, 0.1);
    font-variant-numeric: tabular-nums;
    font-weight: 600;
    cursor: pointer;
    pointer-events: auto;
    transition: background-color 120ms ease, box-shadow 120ms ease, border-color 120ms ease;
}

.grid-column-labels span:hover,
.grid-row-labels span:hover,
.grid-index-corner:hover {
    border-color: rgba(45, 70, 110, 0.65);
    background: linear-gradient(145deg, rgba(100, 130, 180, 0.28), rgba(145, 160, 190, 0.16));
}

.grid-column-labels span:focus-visible,
.grid-row-labels span:focus-visible,
.grid-index-corner:focus-visible {
    outline: 2px solid rgba(35, 75, 135, 0.85);
    outline-offset: 0;
    z-index: 1;
}

.grid-column-labels span:not(:last-child) {
    border-right: 1px solid rgba(128, 128, 128, 0.12);
}

.grid-row-labels span:not(:last-child) {
    border-bottom: 1px solid rgba(128, 128, 128, 0.14);
}

.grid-content {
    position: relative;
    grid-column: 2;
    grid-row: 2;
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
}

.grid-minimum-bounds {
    position: absolute;
    top: 0;
    left: 0;
    box-sizing: border-box;
    background:
        repeating-linear-gradient(90deg, #173b70 0 7px, #d4d9e2 7px 14px) top / 100% 3px repeat-x,
        repeating-linear-gradient(90deg, #173b70 0 7px, #d4d9e2 7px 14px) bottom / 100% 3px repeat-x,
        repeating-linear-gradient(0deg, #173b70 0 7px, #d4d9e2 7px 14px) left / 3px 100% repeat-y,
        repeating-linear-gradient(0deg, #173b70 0 7px, #d4d9e2 7px 14px) right / 3px 100% repeat-y;
    pointer-events: none;
    z-index: 10;
}

.grid-layout {
    display: grid;
    height: 100%;
    grid-auto-columns: minmax(0, 1fr);
    grid-auto-rows: minmax(0, 1fr);
    margin: 0;
    padding: 0;
    -webkit-user-select: none; /* Safari */
    -ms-user-select: none; /* IE 10 and IE 11 */
    user-select: none; /* Standard syntax */
    -webkit-touch-callout: none;
}

.grid-bg-lines {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    overflow-y: hidden;
}

.grid-transition-move:not(.nomove) {
    transition: transform var(--animation-duration);
}
</style>