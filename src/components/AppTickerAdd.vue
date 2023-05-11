<script>
import { validateTokenQuery, getAllTokens } from '../api.js';

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
      availableTokens: [],
    };
  },
  computed: {
    filteredTokens() {
      return this.tokenQuery
        ? this.availableTokens
            .filter(
              (data) =>
                data.name
                  .toLowerCase()
                  .includes(this.tokenQuery.toLowerCase()) ||
                data.symbol
                  .toLowerCase()
                  .includes(this.tokenQuery.toLowerCase())
            )
            .slice(0, 5)
        : [];
    },
  },
  methods: {
    async addToken(t) {
      const query = t ? t : this.tokenQuery;
      if (!query) return;

      const token = await validateTokenQuery(query);
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
    async fetchAvailableTokens() {
      this.availableTokens = await getAllTokens();
    },
  },
  created() {
    this.fetchAvailableTokens();
  },
};
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="inline-flex gap-2">
      <input
        v-model="tokenQuery"
        @keydown.enter="addToken()"
        class="px-4 py-2 rounded-full border border-slate-700 outline-none ring-slate-200 focus:ring-4"
        type="text"
        placeholder="Enter token name..."
      />
      <button
        @click="addToken()"
        class="px-8 py-2 rounded-full text-white bg-slate-700 font-bold outline-none ring-slate-200 focus:ring-4"
      >
        Add
      </button>
    </div>
    <div v-if="filteredTokens" class="inline-flex gap-2">
      <div
        v-for="token in filteredTokens"
        @click="addToken(token.symbol)"
        class="bg-slate-700 text-white px-2 py-1 rounded-lg cursor-pointer"
      >
        {{ token.symbol }}
      </div>
    </div>
  </div>
</template>
