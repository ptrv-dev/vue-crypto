<script>
import { validateTokenQuery } from '../api.js';

export default {
  name: 'AppTickerAdd',
  props: {
    tokens: {
      type: Array,
      required: true,
    },
  },
  emits: {
    add: null,
  },
  data() {
    return {
      tokenQuery: '',
    };
  },
  methods: {
    async addToken() {
      if (!this.tokenQuery) return;

      const token = await validateTokenQuery(this.tokenQuery);
      if (!token) return alert('Incorrect token to add!');
      this.tokenQuery = '';
      if (this.tokens.findIndex((t) => t.id === token.id) !== -1)
        return alert('This token already in your watch list!');

      this.$emit('add', {
        id: token.id,
        name: token.name,
        symbol: token.symbol,
        price: null,
      });
    },
  },
};
</script>

<template>
  <div class="inline-flex gap-2">
    <input
      v-model="tokenQuery"
      @keydown.enter="addToken"
      class="px-4 py-2 rounded-full border border-slate-700 outline-none ring-slate-200 focus:ring-4"
      type="text"
      placeholder="Enter token name..."
    />
    <button
      @click="addToken"
      class="px-8 py-2 rounded-full text-white bg-slate-700 font-bold outline-none ring-slate-200 focus:ring-4"
    >
      Add
    </button>
  </div>
</template>
