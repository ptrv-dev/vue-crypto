<script>
import AppTickerAdd from './components/AppTickerAdd.vue';
import AppToken from './components/AppToken.vue';
import AppGraph from './components/AppGraph.vue';

export default {
  name: 'App',
  components: { AppTickerAdd, AppToken, AppGraph },
  data() {
    return {
      tokenQuery: '',
      tokens: [],
      selectedToken: null,
      socket: null,
      graph: [],
      maxGraphElements: null,
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
    <h1 class="text-2xl mb-4">
      {{
        tokens.length
          ? 'Your watch list:'
          : 'Your watch list is empty right now...'
      }}
    </h1>
    <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
      <app-token
        v-for="token in tokens"
        :token="token"
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
