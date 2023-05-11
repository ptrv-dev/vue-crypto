<script>
import AppTickerAdd from './components/AppTickerAdd.vue';
import AppToken from './components/AppToken.vue';
import AppGraph from './components/AppGraph.vue';

export default {
  name: 'App',
  components: { AppTickerAdd, AppToken, AppGraph },
  data() {
    return {
      tokens: [],
      selectedToken: null,
      socket: null,
      graph: [],
    };
  },
  methods: {
    handleTokenAdd(token) {
      this.tokens.push(token);
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
    clearTokens() {
      if (!window.confirm(`Do you really want to clear your watch list?`))
        return;
      this.tokens = [];
      this.selectedToken = null;
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
          if (this.selectedToken === currentToken)
            this.graph.push(Number(price));
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
    selectedToken() {
      this.graph = [];
    },
  },
  mounted() {
    this.loadFromLS();
  },
};
</script>

<template>
  <div class="container mt-4">
    <app-ticker-add :tokens="tokens" @add="handleTokenAdd" />
  </div>
  <hr class="container border-slate-200 my-4" />
  <div class="container">
    <div class="flex items-center mb-4">
      <h1 class="text-2xl flex-1">
        {{
          tokens.length
            ? 'Your watch list:'
            : 'Your watch list is empty right now...'
        }}
      </h1>
      <button
        v-if="tokens.length"
        @click="clearTokens"
        class="px-4 py-2 rounded-full text-white bg-slate-700 font-bold outline-none ring-slate-200 focus:ring-4 inline-flex items-center gap-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-6 h-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
          />
        </svg>
        Clear watch list
      </button>
    </div>
    <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
      <app-token
        v-for="token in tokens"
        :token="token"
        :selected="token === selectedToken"
        @click="selectedToken = token"
        @remove="removeToken(token)"
      />
    </div>
  </div>
  <template v-if="selectedToken">
    <hr class="container border-slate-200 my-8" />
    <app-graph
      :tokenSymbol="selectedToken.symbol"
      :data="graph"
      @close="selectedToken = null"
    />
  </template>
</template>
