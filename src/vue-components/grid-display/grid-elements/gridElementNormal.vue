<template>
    <div ref="content" class="grid-item-content"
         :class="{
             'text-overlay': overlayActive,
             'text-overlay-above': overlayActive && metadata.textConfig.textPosition === TextConfig.TEXT_POS_ABOVE,
             'text-overlay-below': overlayActive && metadata.textConfig.textPosition === TextConfig.TEXT_POS_BELOW
         }">
        <grid-element-image ref="imageComponent"
                            :metadata="metadata"
                            :grid-image="gridElement.image"
                            :overlay-active="overlayActive"
                            :overlay-offset-px="imageOffsetPx"
                            @image-loaded="queueOverlayPosition"/>
        <grid-element-text-container ref="textComponent" :with-image="!!imageData" :metadata="metadata" :grid-element="gridElement" v-bind="$attrs"/>
    </div>
</template>

<script>
import GridElementTextContainer from './gridElementTextContainer.vue';
import { TextConfig } from '../../../js/model/TextConfig';
import GridElementImage from './gridElementImage.vue';

export default {
    components: { GridElementImage, GridElementTextContainer },
    props: ["gridElement", "metadata"],
    data() {
        return {
            TextConfig: TextConfig,
            imageOffsetPx: 0,
            overlayResizeObserver: null
        }
    },
    computed: {
        imageData() {
            return this.gridElement.image ? this.gridElement.image.data || this.gridElement.image.url : null;
        },
        overlayActive() {
            return !!this.imageData && this.metadata.textConfig.textOverlay === true;
        },
    },
    methods: {
        queueOverlayPosition() {
            this.$nextTick(() => {
                this.updateOverlayPosition();
            });
        },

        updateOverlayPosition() {
            if (!this.overlayActive) {
                if (this.imageOffsetPx !== 0) {
                    this.imageOffsetPx = 0;
                }
                return;
            }

            const container = this.$refs.content;
            const imageComponent = this.$refs.imageComponent;
            const textComponent = this.$refs.textComponent;

            const image = imageComponent && imageComponent.$refs.imgElement;
            const text = textComponent && textComponent.$refs.txtContainer;

            if (!container || !image || !text ||
                !image.naturalWidth || !image.naturalHeight) {
                return;
            }

            const containerRect = container.getBoundingClientRect();
            const imageRect = image.getBoundingClientRect();
            const textRect = text.getBoundingClientRect();

            const height = containerRect.height;
            const imageHeight = imageRect.height;
            const textHeight = Math.min(height, textRect.height);

            if (height <= 0 || imageHeight <= 0) {
                return;
            }

            const freeHeight = Math.max(0, height - textHeight);
            const imageFits = imageHeight <= freeHeight;

            const textAbove =
                this.metadata.textConfig.textPosition === TextConfig.TEXT_POS_ABOVE;

            let targetTop;

            if (textAbove) {
                targetTop = imageFits
                    ? textHeight + (freeHeight - imageHeight) / 2
                    : Math.max(0, height - imageHeight);
            } else {
                targetTop = imageFits
                    ? (freeHeight - imageHeight) / 2
                    : 0;
            }

            const unshiftedTop =
                imageRect.top - containerRect.top - this.imageOffsetPx;

            const nextOffset = targetTop - unshiftedTop;

            if (Math.abs(nextOffset - this.imageOffsetPx) > 0.5) {
                this.imageOffsetPx = nextOffset;
            }
        }
    },
    watch: {
        overlayActive() {
            this.queueOverlayPosition();
        },

        imageData() {
            this.imageOffsetPx = 0;
            this.queueOverlayPosition();
        },

        metadata: {
            handler() {
                this.queueOverlayPosition();
            },
            deep: true
        },

        gridElement: {
            handler() {
                this.queueOverlayPosition();
            },
            deep: true
        }
    },
    mounted() {
        this.$nextTick(() => {
            this.updateOverlayPosition();

            if (typeof ResizeObserver !== 'undefined') {
                this.overlayResizeObserver = new ResizeObserver(() => {
                    this.queueOverlayPosition();
                });

                const imageComponent = this.$refs.imageComponent;
                const textComponent = this.$refs.textComponent;

                const observedElements = [
                    this.$refs.content,
                    imageComponent && imageComponent.$refs.imgElement,
                    textComponent && textComponent.$refs.txtContainer
                ];

                observedElements.forEach(element => {
                    if (element) {
                        this.overlayResizeObserver.observe(element);
                    }
                });
            }
        });
    },
    beforeDestroy() {
        if (this.overlayResizeObserver) {
            this.overlayResizeObserver.disconnect();
            this.overlayResizeObserver = null;
        }
    }
}
</script>

<style scoped>
</style>