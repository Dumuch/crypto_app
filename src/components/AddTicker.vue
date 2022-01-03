<template>
  <section>
    <div class="flex">
      <div class="max-w-xs">
        <label for="wallet" class="block text-sm font-medium text-gray-700"
          >Тикер</label
        >
        <div class="mt-1 relative rounded-md shadow-md">
          <input
            v-model="ticker"
            v-on:keydown.enter="add()"
            type="text"
            name="wallet"
            id="wallet"
            class="
              block
              w-full
              pr-10
              border-gray-300
              text-gray-900
              focus:outline-none focus:ring-gray-500 focus:border-gray-500
              sm:text-sm
              rounded-md
            "
            placeholder="Например DOGE"
          />
        </div>
        <div class="flex bg-white shadow-md p-1 rounded-md shadow-md flex-wrap">
          <template v-for="item in findTickers" :key="item.id">
            <span
              @click="addTickerAtFinder(item.Name)"
              class="
                inline-flex
                items-center
                px-2
                m-1
                rounded-md
                text-xs
                font-medium
                bg-gray-300
                text-gray-800
                cursor-pointer
              "
            >
              {{ item.Name }}
            </span>
          </template>
        </div>
        <div v-if="isFindTiker" class="text-sm text-red-600">
          Такой тикер уже добавлен
        </div>
      </div>
    </div>
    <add-button @click="add" type="button" class="my-4" />
  </section>
</template>

<script>
import AddButton from "./AddButton.vue";

export default {
  components: {
    AddButton,
  },

  props: {
    isFindTiker: {
      type: Boolean,
      required: false,
      default: false,
    },
    findArray: {
      type: Array,
      required: false,
      default: () => [],
    },
  },

  emits: {
    "add-ticker": (value) => typeof value === "string",
    "find-tickers": (value) => typeof value === "string",
  },

  data() {
    return {
      ticker: "",
      findTickers: [],
    };
  },

  watch: {
    ticker() {
      this.$emit("find-tickers", this.ticker.toUpperCase());
      this.getFindTickers();
    },
  },

  computed: {},

  methods: {
    add() {
      this.$emit("add-ticker", this.ticker.toUpperCase());
      this.ticker = "";
    },
    getFindTickers() {
      return (this.findTickers = this.findArray);
    },
    addTickerAtFinder(tickerName) {
      this.ticker = tickerName;
      this.add();
    },
  },
};
</script>
