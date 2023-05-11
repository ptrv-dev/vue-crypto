<script>
import { validateTokenQuery } from './api.js';
export default {
  name: 'App',
  data() {
    return {
      tokenQuery: '',
      tokens: [],
      selectedToken: null,
      socket: null,
    };
  },
  methods: {
    async addToken() {
      if (!this.tokenQuery)
        return alert('Please enter the token name or symbol');

      const token = await validateTokenQuery(this.tokenQuery);
      if (!token) return alert('Incorrect token to add!');

      this.tokens.push({
        id: token.id,
        name: token.name,
        symbol: token.symbol,
        price: null,
      });

      this.tokenQuery = '';
    },
    removeToken(token) {
      if (
        !window.confirm(
          `Do you really want to remove ${token.symbol} from your watch list?`
        )
      )
        return;

      if (this.selectedToken === token) this.selectedToken = null;
      this.tokens = this.tokens.filter((t) => t !== token);
    },
    pricesSubscribe() {
      const assets = this.tokens.map((t) => t.id);

      if (!assets.length) {
        if (this.socket !== null) this.socket.close();
        return;
      }

      if (this.socket !== null) this.socket.close();
      this.socket = new WebSocket(
        `wss://ws.coincap.io/prices?assets=${assets.join(',')}`
      );

      this.socket.onmessage = (msg) => {
        const pricesData = JSON.parse(msg.data); // { ethereum: '1920.56', bitcoin: '27840.12' }
        Object.entries(pricesData).forEach(([id, price]) => {
          const currentToken = this.tokens.find((t) => t.id === id);
          if (!currentToken) return;
          currentToken.price = Number(price);
        });
      };
    },
    saveToLS() {
      window.localStorage.setItem(
        'tokens',
        JSON.stringify(this.tokens.map((t) => ({ ...t, price: null })))
      );
    },
    loadFromLS() {
      const localTokens = window.localStorage.getItem('tokens');
      if (!localTokens) return;
      this.tokens = JSON.parse(localTokens);
    },
  },
  watch: {
    tokens: {
      handler() {
        this.pricesSubscribe();
        this.saveToLS();
      },
      deep: true,
    },
  },
  mounted() {
    this.loadFromLS();
  },
};
</script>

<template>
  <div class="container mt-4">
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
  </div>
  <hr class="container border-slate-200 my-4" />
  <div class="container">
    <h1 class="text-2xl mb-4">
      {{
        tokens.length
          ? 'Your watch list:'
          : 'Your watch list is empty right now...'
      }}
    </h1>
    <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
      <div
        v-for="tokenData in tokens"
        @click="selectedToken = tokenData"
        class="flex flex-col border-2 border-dashed rounded-2xl border-slate-700 p-4 items-center gap-2 cursor-pointer"
      >
        <p class="text-lg">{{ tokenData.symbol }} / USD</p>
        <strong class="text-2xl">
          {{ tokenData.price ? `$${tokenData.price}` : '–' }}
        </strong>
        <button
          @click.stop="removeToken(tokenData)"
          class="flex items-center gap-1 opacity-50 hover:opacity-100 outline-none ring-slate-200 focus:ring-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="w-5 h-5"
          >
            <path
              fill-rule="evenodd"
              d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
              clip-rule="evenodd"
            />
          </svg>
          Remove
        </button>
      </div>
    </div>
  </div>
  <template v-if="selectedToken">
    <hr class="container border-slate-200 my-8" />
    <div class="container flex flex-col">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl">Selected token graphic:</h1>
        <button
          @click="selectedToken = null"
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
        class="flex items-end h-64 border-b border-slate-700 gap-[1px] relative"
      >
        <strong
          class="absolute text-8xl opacity-10 top-1/2 -translate-y-1/2 text-center w-full pointer-events-none"
          >{{ selectedToken.symbol }} / USD</strong
        >
        <div class="h-32 w-5 bg-slate-700"></div>
        <div class="h-28 w-5 bg-slate-700"></div>
        <div class="h-36 w-5 bg-slate-700"></div>
        <div class="h-40 w-5 bg-slate-700"></div>
        <div class="h-44 w-5 bg-slate-700"></div>
        <div class="h-32 w-5 bg-slate-700"></div>
      </div>
    </div>
  </template>
</template>
