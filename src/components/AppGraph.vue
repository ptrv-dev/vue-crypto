<script>
export default {
  name: 'AppGraph',
  props: {
    tokenSymbol: {
      type: String,
      required: true,
    },
    data: {
      type: Array,
      required: true,
    },
  },
  emits: {
    close: null,
  },
  data() {
    return {
      maxGraphElements: 20,
    };
  },
  computed: {
    GRAPH_BAR_WIDTH: () => 20,
    normalizedGraph() {
      const dataToDisplay = this.data.slice(
        Math.max(0, this.data.length - this.maxGraphElements)
      );
      const minValue = Math.min(...dataToDisplay);
      const maxValue = Math.max(...dataToDisplay);
      return dataToDisplay.map(
        (p) => ((p - minValue) / (maxValue - minValue)) * 95 + 5
      );
    },
  },
  methods: {
    calculateMaxGraphElements() {
      this.maxGraphElements = Math.round(
        this.$refs.graphRef.clientWidth / this.GRAPH_BAR_WIDTH
      );
    },
  },
  mounted() {
    this.calculateMaxGraphElements();
    window.addEventListener('resize', this.calculateMaxGraphElements);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.calculateMaxGraphElements);
  },
};
</script>

<template>
  <div class="container flex flex-col">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl">Selected token graphic:</h1>
      <button
        @click="$emit('close')"
        class="inline-flex ml-auto text-slate-700"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-8 h-8"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>
    </div>
    <div
      ref="graphRef"
      class="flex items-end h-64 border-b border-slate-700 gap-[1px] relative"
    >
      <strong
        class="absolute text-8xl opacity-10 top-1/2 -translate-y-1/2 text-center w-full pointer-events-none"
        >{{ this.tokenSymbol }} / USD</strong
      >
      <div
        v-for="(bar, idx) in normalizedGraph"
        class="bg-slate-700 hover:bg-slate-500"
        :title="this.data.slice(-this.maxGraphElements)[idx]"
        :style="{ height: `${bar}%`, width: `${this.GRAPH_BAR_WIDTH}px` }"
      ></div>
    </div>
  </div>
</template>
