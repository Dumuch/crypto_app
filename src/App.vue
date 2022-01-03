<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <div
      v-if="isLoadCoinList"
      class="
        fixed
        w-100
        h-100
        opacity-80
        bg-purple-800
        inset-0
        z-50
        flex
        items-center
        justify-center
      "
    >
      <svg
        class="animate-spin -ml-1 mr-3 h-12 w-12 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
    <div class="container">
      <add-ticker
        @add-ticker="add"
        :isFindTiker="hasFindTicker"
        @find-tickers="postList_n"
        :findArray="findArrayHandler"
      />

      <template v-if="tickers.length !== 0">
        <p>
          Фильтрация: <input v-model="filter" />
          <button
            v-if="page > 1"
            @click="page = page - 1"
            class="
              my-4
              inline-flex
              items-center
              py-2
              px-4
              border border-transparent
              shadow-sm
              text-sm
              leading-4
              font-medium
              rounded-full
              text-white
              bg-gray-600
              hover:bg-gray-700
              transition-colors
              duration-300
              focus:outline-none
              focus:ring-2
              focus:ring-offset-2
              focus:ring-gray-500
              mx-2
            "
          >
            Назад
          </button>
          <button
            @click="page = page + 1"
            v-if="hasNextPage"
            class="
              my-4
              inline-flex
              items-center
              py-2
              px-4
              border border-transparent
              shadow-sm
              text-sm
              leading-4
              font-medium
              rounded-full
              text-white
              bg-gray-600
              hover:bg-gray-700
              transition-colors
              duration-300
              focus:outline-none
              focus:ring-2
              focus:ring-offset-2
              focus:ring-gray-500
              mx-2
            "
          >
            вперед
          </button>
        </p>
        <hr class="w-full border-t border-gray-600 my-4" />

        <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div
            v-for="t in paginatedTikers"
            :key="t.name"
            @click="select(t)"
            :class="{
              'border-4': selectedTicker === t,
              'bg-red-400': t.price === nullPrice,
            }"
            class="
              bg-white
              overflow-hidden
              shadow
              rounded-lg
              border-purple-800 border-solid
              cursor-pointer
            "
          >
            <div class="px-4 py-5 sm:p-6 text-center">
              <dt class="text-sm font-medium text-gray-500 truncate">
                {{ t.name }} - USD
              </dt>
              <dd class="mt-1 text-3xl font-semibold text-gray-900">
                {{ formatPrice(t.price) }}
              </dd>
            </div>
            <div class="w-full border-t border-gray-200"></div>
            <button
              @click.stop="handleDelete(t)"
              class="
                flex
                items-center
                justify-center
                font-medium
                w-full
                bg-gray-100
                px-4
                py-4
                sm:px-6
                text-md text-gray-500
                hover:text-gray-600 hover:bg-gray-200 hover:opacity-20
                transition-all
                focus:outline-none
              "
            >
              <svg
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="#718096"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                ></path></svg
              >Удалить
            </button>
          </div>
        </dl>
        <hr class="w-full border-t border-gray-600 my-4" />
        <graph-ticker
          @remove-selected-ticker="selectedTicker = null"
          :selectedTicker="selectedTicker"
          :normalizedGraph="normalizedGraph"
          @max-graph-elements="calculateMaxGraphElements"
        />
      </template>
    </div>
  </div>
</template>

<script>
import { loadCoinList, subscribeToTicker, unSubscribeToTicker } from "./api";
import AddTicker from "./components/AddTicker.vue";
import GraphTicker from "./components/GraphTicker.vue";

export default {
  name: "App",

  components: {
    AddTicker,
    GraphTicker,
  },

  // переменные
  data() {
    return {
      tickers: [],
      selectedTicker: null,
      graph: [],
      coinList: [],
      isLoadCoinList: true,
      isFindTiker: false,
      page: 1,
      filter: "",
      maxGraphElements: null,
      findArray: [],
      nullPrice: "-",
    };
  },

  updated() {},
  created() {
    const windowData = Object.fromEntries(
      new URL(window.location).searchParams.entries()
    );

    if (windowData.filter) {
      this.filter = windowData.filter;
    }

    if (windowData.page) {
      this.page = windowData.page;
    }
    const tikersData = localStorage.getItem("cryptoApp-list");
    if (tikersData) {
      this.tickers = JSON.parse(tikersData);
      this.tickers.forEach((ticker) => {
        subscribeToTicker(ticker.name, (newPrice) => {
          this.updateTicker(ticker.name, newPrice);
        });
      });
    }

    this.getCoinList();
  },

  computed: {
    findArrayHandler() {
      return this.findArray;
    },

    hasFindTicker() {
      return this.isFindTiker;
    },

    pageStateOptions() {
      return {
        filter: this.filter,
        page: this.page,
      };
    },

    startIndex() {
      return (this.page - 1) * 6;
    },

    endIndex() {
      return this.page * 6;
    },

    filteredTickers() {
      return this.tickers.filter((ticker) =>
        ticker.name.includes(this.filter.toUpperCase())
      );
    },

    paginatedTikers() {
      return this.filteredTickers.slice(this.startIndex, this.endIndex);
    },

    hasNextPage() {
      return this.filteredTickers.length > this.endIndex;
    },

    normalizedGraph() {
      const maxValue = Math.max(...this.graph);
      const minValue = Math.min(...this.graph);
      if (maxValue === minValue) {
        return this.graph.map(() => 50);
      }

      return this.graph.map((price) => {
        return 5 + ((price - minValue) * 95) / (maxValue - minValue);
      });
    },
  },

  watch: {
    filter() {
      this.page = 1;
    },

    pageStateOptions(value) {
      history.pushState(
        null,
        document.title,
        `${
          window.location.pathname
        }?filter=${value.filter.toUpperCase()}&page=${value.page}`
      );
    },

    paginatedTikers() {
      if (this.paginatedTikers.length === 0 && this.page > 1) {
        this.page -= 1;
      }
    },

    selectedTicker() {
      this.graph = [];
      this.$nextTick().then(this.calculateMaxGraphElements);
    },

    tickers() {
      localStorage.setItem("cryptoApp-list", JSON.stringify(this.tickers));
    },
  },

  // функции
  methods: {
    calculateMaxGraphElements(value) {
      this.calcMaxGraphElements = false;
      this.maxGraphElements = value;
    },

    updateTicker(tickerName, price) {
      this.tickers
        .filter((t) => t.name === tickerName)
        .forEach((t) => {
          if (this.selectedTicker?.name == tickerName) {
            this.graph.push(price);

            while (this.graph.length > this.maxGraphElements) {
              this.graph.shift();
            }
          }
          t.price = price;
        });
    },

    formatPrice(price) {
      if (price === "-") {
        return price;
      }
      return price > 1 ? price.toFixed(2) : price.toPrecision(2);
    },

    getCoinList() {
      (async () => {
        const data = await loadCoinList();
        this.coinList = data.Data;
        this.isLoadCoinList = false;
      })();
    },

    setTicker(tickerName) {
      this.ticker = tickerName;
      //this.add();
    },

    add(ticker) {
      const currentTicker = {
        name: ticker,
        price: "-",
      };

      if (this.tickers.find((t) => t.name === currentTicker.name)) {
        this.isFindTiker = true;
      } else {
        this.isFindTiker = false;
        if (currentTicker.name !== "") {
          this.tickers = [...this.tickers, currentTicker];
          this.filter = "";
          subscribeToTicker(currentTicker.name, (newPrice) => {
            return this.updateTicker(currentTicker.name, newPrice);
          });
        }
      }
    },

    postList_n(ticker) {
      let obj = this.coinList;
      let newArray = [];
      const search = ticker.toLowerCase();

      for (let key in obj) {
        let el = obj[key];
        if (
          el.Name.toLowerCase().indexOf(search) != -1 &&
          newArray.length < 4
        ) {
          newArray.push(el);
        }
      }
      this.findArray = newArray;
    },

    handleDelete(tickerToRemove) {
      this.tickers = this.tickers.filter((t) => t !== tickerToRemove);
      if (this.selectedTicker === tickerToRemove) {
        this.selectedTicker = null;
      }

      unSubscribeToTicker(tickerToRemove.name);
    },

    select(ticker) {
      this.selectedTicker = ticker;
    },
  },
};
</script>
